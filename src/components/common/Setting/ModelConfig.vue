<script setup lang='ts'>
import { ref } from 'vue'
import { NButton, NInput, NTabPane, NTabs, useMessage } from 'naive-ui'
import { useModel } from '@/views/chat/hooks/useModel'
import { useWebSite } from '@/views/chat/hooks/useWebSite'

const { getLocalModelData, getOneAPI, updateModelData, setOneAPI } = useModel()
const { getLocalWebSiteData } = useWebSite()

const oneAPI = ref(getOneAPI())
const models = ref<Model.ModelList>(getLocalModelData())
const webSite = ref<any>(getLocalWebSiteData())
const ms = useMessage()

const computedUrl = (item: Partial<Model.Model>) => {
  if (item.baseUrl && item.chatAPI) {
    return item.baseUrl + item.chatAPI
  }
  return ''
}

const saveModelAuthorization = () => {
  updateModelData(models.value)
  ms.success('保存成功')
}

const saveOneAPI = () => {
  setOneAPI(oneAPI.value)
  ms.success('保存成功')
}
</script>

<template>
  <NTabs type="line" animated>
    <NTabPane name="One API" tab="One API">
      <div class="flex items-center mb-4">
        <label style="min-width: 12%;" for="baseUrl">域名: </label>
        <NInput id="baseUrl" v-model:value="oneAPI.baseUrl" placeholder="请输入域名" />
      </div>

      <div class="flex items-center mb-4">
        <label style="min-width: 12%;" for="apiKey">apiKey: </label>
        <NInput id="apiKey" v-model:value="oneAPI.apiKey" placeholder="鉴权用的 key" />
      </div>

      <div class="flex items-center mb-4">
        <label style="min-width: 12%;" for="chatAPI">chatAPI: </label>
        <NInput id="chatAPI" v-model:value="oneAPI.chatAPI" placeholder="请输入聊天的接口地址，如果你不知道就不要修改" />
      </div>

      <div v-if="oneAPI.baseUrl" class="flex items-center mb-4">
        <span style="min-width: 12%;">实际请求地址: {{ computedUrl(oneAPI) }}</span>
      </div>

      <div class="flex items-center mb-4">
        <strong style="min-width: 12%;">如果你填写了 One-API 或者 New-API 的域名和key, 那么后续的模型都不用再填写就可以用。如果您配置了，会优先使用这个凭证。
        </strong>
      </div>

      <div class="flex items-center justify-end mb-4">
        <NButton type="success" @click="saveOneAPI">
          保存
        </NButton>
      </div>
    </NTabPane>
    <NTabPane v-for="(item, index) in models" :key="index" :name="item.value" :tab="item.label">
      <div class="flex items-center mb-4">
        <label style="min-width: 12%;" for="baseUrl">域名: </label>
        <NInput id="baseUrl" v-model:value="item.baseUrl" placeholder="请输入域名" />
      </div>

      <div class="flex items-center mb-4">
        <label style="min-width: 12%;" for="apiKey">apiKey: </label>
        <NInput id="apiKey" v-model:value="item.apiKey" placeholder="鉴权用的 key" />
      </div>

      <div class="flex items-center mb-4">
        <label style="min-width: 12%;" for="chatAPI">chatAPI: </label>
        <NInput id="chatAPI" v-model:value="item.chatAPI" placeholder="请输入聊天的接口地址，如果你不知道就不要修改" />
      </div>

      <div v-if="item.baseUrl" class="flex items-center mb-4">
        <span style="min-width: 12%;">实际请求地址: {{ computedUrl(item) }}</span>
      </div>

      <div class="flex items-center justify-end mb-4">
        <NButton type="success" @click="saveModelAuthorization">
          保存
        </NButton>
      </div>
    </NTabPane>
  </NTabs>

  <div v-if="webSite.shop">
    ApiKey 购买地址： <a :href="webSite.shop" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-500">{{ webSite.shop }}</a>
  </div>
  <div v-if="webSite.description">
    联系方式： {{ webSite.description }}
  </div>
</template>
