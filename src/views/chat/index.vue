<script setup lang='ts'>
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { NAutoComplete, NButton, NInput, NPopover, useDialog, useMessage } from 'naive-ui'
import html2canvas from 'html2canvas'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useUsingContext } from './hooks/useUsingContext'
import { useUsingInternet } from './hooks/useUsingInternet'
import HeaderComponent from './components/Header/index.vue'
import { useParser } from './hooks/useParser'
import Upload from './components/Upload/index.vue'
import DisplayWall from './components/Upload/DisplayWall.vue'
import ModelSelect from './components/Model/index.vue'
import { useWebSite } from './hooks/useWebSite'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useChatStore, useModelStore, usePromptStore } from '@/store'
import { t } from '@/locales'
import { fetchWithAuth } from '@/utils/request/fetch'
import { isImage } from '@/utils/is/index'
import { findLast } from '@/utils/functions/index'

let controller = new AbortController()
let parentMessageId = ''
let conversationId = ''
// const supportConversationIdModels = [
//   // {
//   //   group: 'openai',
//   //   field: 'parent_message_id',
//   //   initialVal: 'none',
//   // },
//   {
//     group: 'moonshot',
//     field: 'conversation_id',
//     initialVal: 'none',
//   },
//   {
//     group: 'glm',
//     field: 'conversation_id',
//     initialVal: 'none',
//   },
// ]
//

// const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'

const route = useRoute()
const dialog = useDialog()
const ms = useMessage()

const chatStore = useChatStore()
const modelStore = useModelStore()

const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()
const { usingInternet, toggleUsingInternet, closeInternet } = useUsingInternet()
const { parse } = useParser()
const { getWebSite } = useWebSite()
getWebSite()

const { uuid } = route.params as { uuid: string }

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const curModel = computed(() => chatStore.getModelByUuid(+uuid))
console.log('curModel', curModel)
const isGPT = computed(() => curModel.value?.value?.includes('gpt'))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)
const uploadRef = ref<Ref | null>(null)
const fileList = ref<any[]>([])
const selectModel = ref<any>({})

// 添加PromptStore
const promptStore = usePromptStore()

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading)
    updateChatSome(+uuid, index, { loading: false })
})

function handleSubmit() {
  onConversation()
}

function buildUrlAndHeaders() {
  const modelPlatform = modelStore.models.find(v => v.group === curModel.value.group)

  const headers: any = {
    'Content-Type': 'application/json',
  }

  if (modelPlatform?.apikey) {
    headers.Authorization = `Bearer ${modelPlatform?.apikey}`
  }

  return {
    baseUrl: modelPlatform?.baseUrl,
    chatAPI: modelPlatform?.chatAPI,
    headers,
  }
}

function handleChatFile(files: any[]) {
  const imageContent: any[] = []
  const otherfileContent: any[] = []

  const imageList = files.filter(file => isImage(file.type))
  const otherfiles = files.filter(file => !isImage(file.type))
  if (imageList.length) {
    imageList.forEach((img) => {
      imageContent.push({
        type: 'image_url',
        image_url: {
          url: img.url,
        },
      })
    })
  }
  if (otherfiles.length) {
    otherfiles.forEach((img) => {
      otherfileContent.push({
        type: 'file',
        file_url: {
          url: img.url,
        },
      })
    })
  }
  return { imageContent, otherfileContent }
}

function handleMessages(files: any[]) {
  const messages: { role: string; content: string | any[] }[] = []

  if (usingContext.value) {
    dataSources.value.forEach((item) => {
      if (item.inversion) {
        messages.push({ role: 'user', content: item.text })
      }
      else {
        const thinkingText = t('chat.thinking')
        if (!item.text.startsWith(thinkingText) && !item.error) {
          messages.push({ role: 'assistant', content: item.text })
        }
      }
    })
  }
  else {
    const lastItem = findLast<Chat.Chat>(dataSources.value, v => v.inversion!) as Chat.Chat
    messages.push({ role: 'user', content: lastItem.text })
  }

  if (files.length) {
    const { imageContent, otherfileContent } = handleChatFile(files)
    const _lastMsg = messages.pop()
    const lastMsg = {
      role: 'user',
      content: [
        ...imageContent,
        ...otherfileContent,
        {
          type: 'text',
          text: _lastMsg?.content,
        },
      ],
    }

    messages.push(lastMsg)
  }

  if (!messages[messages.length - 1].content) {
    console.log('删除最后一条数据')
    messages.pop()
  }

  return messages
}

function handleBody({ baseUrl, chatAPI, messages, conversationId }: any) {
  const curSelectModel = curModel.value || selectModel.value

  const body: any = {
    model: curSelectModel.value,
    messages,
    stream: true,
    baseUrl,
    chatAPI,
  }

  // 取消使用 conversationId
  // const support = supportConversationIdModels.filter(item => item.group === curSelectModel.group)

  // if (support?.length) {
  //   const current = support[0]
  //   body[current.field] = conversationId || current.initialVal
  //   body.messages = [messages[messages?.length - 1]]
  // }

  if (!isGPT.value) {
    body.use_search = usingInternet.value
  }

  return body
}

async function onConversation() {
  const message = prompt.value
  const files = [...fileList.value]

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  controller = new AbortController()

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  scrollToBottom()

  loading.value = true
  prompt.value = ''
  fileList.value = []
  uploadRef.value?.clear()

  let options: Chat.ConversationRequest = {}
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext && usingContext.value)
    options = { ...lastContext }

  addChat(
    +uuid,
    {
      dateTime: new Date().toLocaleString(),
      text: t('chat.thinking'),
      loading: true,
      inversion: false,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )
  scrollToBottom()
  let allText = ''
  try {
    const messages = handleMessages(files)

    console.log('请求的 Messages', messages)

    const fetchChatAPIOnce = async () => {
      console.log('当前选择的模型', curModel.value)

      if (!curModel.value.value && !selectModel.value.value) {
        ms.warning('请新建回话或者重新选择一下模型')
        return
      }

      const { baseUrl, chatAPI, headers } = buildUrlAndHeaders()

      const body = handleBody({ baseUrl, chatAPI, messages, conversationId })

      const response = await fetchWithAuth('/chat-process', {
        headers,
        method: 'POST',
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      const data = response.body
      if (!data) {
        return
      }
      const reader = data.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      while (!done) {
        const { value, done: doneReadingStream } = await reader.read()
        done = doneReadingStream
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          try {
            const jsonData = JSON.parse(chunk)
            if (jsonData.status === 'Fail') {
              console.log('API Error:', jsonData.message)
              updateChat(
                +uuid,
                dataSources.value.length - 1,
                {
                  dateTime: new Date().toLocaleString(),
                  text: jsonData.message,
                  inversion: false,
                  error: true,
                  loading: false,
                  conversationOptions: null,
                  requestOptions: { prompt: message, options: { ...options } },
                },
              )
              break // 中断处理过程
            }
          }
          catch (e) {
            // console.log('JSON parsing error', e)
          }
          parse({
            chunk,
            hooks: {
              onParsing(data) {
                conversationId = data.id
                const content = data.choices[0]?.delta?.content
                if (content) {
                  allText += content
                  updateChat(
                    +uuid,
                    dataSources.value.length - 1,
                    {
                      dateTime: new Date().toLocaleString(),
                      text: allText,
                      inversion: false,
                      error: false,
                      loading: true,
                      conversationOptions: { conversationId, parentMessageId },
                      requestOptions: { prompt: message, options: { ...options } },
                      files,
                    },
                  )
                }
              },
              onParsed() {
                console.log('流解析结束')
              },
              onError(e) {
                console.log('流解析出错', e)
              },
            },
          })
        }
      }
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  }
  catch (error: any) {
    console.log('请求模型出错', error)
    const errorMessage = error?.message ?? t('common.wrong')

    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          loading: false,
        },
      )
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(
        +uuid,
        dataSources.value.length - 1,
        {
          text: `${currentChat.text}\n[${errorMessage}]`,
          error: false,
          loading: false,
        },
      )
      return
    }

    updateChat(
      +uuid,
      dataSources.value.length - 1,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
    scrollToBottomIfAtBottom()
  }
  finally {
    loading.value = false
    allText = ''
    parentMessageId = conversationId
  }
}

async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions, files } = dataSources.value[index]
  const message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    +uuid,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } },
    },
  )

  let allText = ''
  try {
    const messages = handleMessages(files as any[])

    // TODO: 还需要处理没有开启上下文的情况
    console.log('请求的 Messages', messages)

    const fetchChatAPIOnce = async () => {
      console.log('当前选择的模型', curModel.value)
      const { baseUrl, chatAPI, headers } = buildUrlAndHeaders()

      const body = handleBody({ baseUrl, chatAPI, messages, conversationId: options.conversationId })

      // fetchWithAuth
      const response = await fetchWithAuth('/chat-process', {
        headers,
        method: 'POST',
        // TODO: 需要根据不同的模型组合不同的参数
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      const data = response.body
      if (!data) {
        return
      }
      const reader = data.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      while (!done) {
        const { value, done: doneReadingStream } = await reader.read()
        done = doneReadingStream
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          try {
            const jsonData = JSON.parse(chunk)
            if (jsonData.status === 'Fail') {
              console.log('API Error:', jsonData.message)
              updateChat(
                +uuid,
                index,
                {
                  dateTime: new Date().toLocaleString(),
                  text: jsonData.message,
                  inversion: false,
                  error: true,
                  loading: false,
                  conversationOptions: null,
                  requestOptions: { prompt: message, options: { ...options } },
                },
              )
              break // 中断处理过程
            }
          }
          catch (e) {
            // console.log('JSON parsing error', e)
          }
          parse({
            chunk,
            hooks: {
              onParsing(data) {
                conversationId = data.id
                const content = data.choices[0]?.delta?.content
                if (content) {
                  allText += content
                  updateChat(
                    +uuid,
                    index,
                    {
                      dateTime: new Date().toLocaleString(),
                      text: allText,
                      inversion: false,
                      error: false,
                      loading: true,
                      conversationOptions: { conversationId, parentMessageId },
                      requestOptions: { prompt: message, options: { ...options } },
                      files,
                    },
                  )
                }
              },
              onParsed() {
                console.log('流解释结束')
              },
              onError(e) {
                console.log('流解释出错', e)
              },
            },
          })
        }
      }
      updateChatSome(+uuid, index, { loading: false })
    }
    await fetchChatAPIOnce()
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        +uuid,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      +uuid,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, options: { ...options } },
      },
    )
  }
  finally {
    loading.value = false
    allText = ''
  }
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement, {
          useCORS: true,
        })
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    },
  })
}

function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(+uuid)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
  if (prompt.value.startsWith('/')) {
    return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
      return {
        label: obj.value,
        value: obj.value,
      }
    })
  }
  else {
    return []
  }
})

// value反渲染key
const renderOption = (option: { label: string }) => {
  for (const i of promptTemplate.value) {
    if (i.value === option.label)
      return [i.key]
  }
  return []
}

const handleSelectModel = (model: any) => {
  console.log('model', model)
  selectModel.value = model
}

const uploadComplete = (files: any) => {
  console.log('文件上传完成', files)
  fileList.value.push(files)

  // 文件上传后关闭网络，确保准确性
  closeInternet()
}

const uploadError = (msg: string) => {
  ms.error(msg)
}

const fileRemoved = (file: any) => {
  fileList.value = fileList.value.filter(f => f.url !== file.url)
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
  return classes
})

onMounted(() => {
  scrollToBottom()
  if (inputRef.value && !isMobile.value)
    inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value)
    controller.abort()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <HeaderComponent
      v-if="isMobile"
      :using-context="usingContext"
      @export="handleExport"
      @handle-clear="handleClear"
    />

    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div
          id="image-wrapper"
          class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
          :class="[isMobile ? 'p-2' : 'p-4']"
        >
          <template v-if="!dataSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
              <!-- <span>{{ t('chat.newChatTitle') }}</span> -->
              <!-- TOOD: 增加模型选择下拉框，然后数据放在 当前回话中，根据 uuid 去取 -->
              <ModelSelect @update="handleSelectModel" />
            </div>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources"
                :key="index"
                :date-time="item.dateTime"
                :text="item.text"
                :inversion="item.inversion"
                :error="item.error"
                :loading="item.loading"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index)"
              />
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  {{ t('common.stopResponding') }}
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <footer :class="footerClass">
      <!-- 文件展示区域 -->
      <DisplayWall :file-list="fileList" @file-removed="fileRemoved" />

      <div class="w-full max-w-screen-xl m-auto">
        <!-- <div>nihaoya</div> -->
        <div class="flex items-center justify-between space-x-2">
          <HoverButton v-if="!isMobile && !isGPT">
            <Upload ref="uploadRef" @upload-complete="uploadComplete" @upload-error="uploadError" />
          </HoverButton>

          <HoverButton v-if="!isMobile" @click="toggleUsingContext">
            <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
              <SvgIcon icon="ri:chat-history-line" />
            </span>
          </HoverButton>

          <NPopover :trigger="isMobile ? 'click' : 'hover'">
            <template #trigger>
              <HoverButton>
                <span class="text-xl text-[#4f555e] dark:text-white">
                  <SvgIcon icon="mingcute:more-3-line" />
                </span>
              </HoverButton>
            </template>
            <div>
              <HoverButton @click="handleClear">
                <span class="text-xl text-[#4f555e] dark:text-white">
                  <SvgIcon icon="ri:delete-bin-line" />
                </span>
              </HoverButton>
              <HoverButton @click="handleExport">
                <span class="text-xl text-[#4f555e] dark:text-white">
                  <SvgIcon icon="ri:download-2-line" />
                </span>
              </HoverButton>
              <HoverButton v-if="!isGPT" @click="toggleUsingInternet">
                <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingInternet, 'text-[#a8071a]': !usingInternet }">
                  <SvgIcon icon="iconoir:internet" />
                </span>
              </HoverButton>
              <HoverButton v-if="isMobile" @click="toggleUsingContext">
                <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
                  <SvgIcon icon="ri:chat-history-line" />
                </span>
              </HoverButton>
              <HoverButton v-if="isMobile">
                <span class="text-xl text-[#4f555e] dark:text-white">
                  <SvgIcon icon="ic:round-upload" />
                </span>
              </HoverButton>
            </div>
          </NPopover>
          <NAutoComplete v-model:value="prompt" :options="searchOptions" :render-label="renderOption">
            <template #default="{ handleInput, handleBlur, handleFocus }">
              <NInput
                ref="inputRef"
                v-model:value="prompt"
                type="textarea"
                :placeholder="placeholder"
                :autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
                @input="handleInput"
                @focus="handleFocus"
                @blur="handleBlur"
                @keypress="handleEnter"
              />
            </template>
          </NAutoComplete>
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>
