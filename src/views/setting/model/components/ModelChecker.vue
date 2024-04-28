<script setup lang='ts'>
import type { PropType } from 'vue'
import { defineProps, ref } from 'vue'
import { NButton } from 'naive-ui'
import type { PlatformConfig } from '@/store/modules/model/type'
import { useModelStore } from '@/store'
import { copyToClip } from '@/utils/copy'

const props = defineProps({
  modelInfo: {
    type: Object as PropType<PlatformConfig>,
    default: () => ({}),
  },
})

const errorMessage = ref('')
const loading = ref(false) // 添加一个响应式变量来控制加载状态

const modelStore = useModelStore()

const handleError = (error: any) => {
  let errorStr = JSON.stringify(error)
  if (errorStr === '{}') {
    errorStr = JSON.stringify(error?.message)
  }
  errorMessage.value = errorStr
  window.$message?.error('配置失败')
  loading.value = false
}

const handleSuccess = () => {
  window.$message?.success('配置成功')
  loading.value = false
}

const sendTestRequest = (modelInfo: PlatformConfig) => {
  try {
    // 判断填写的信息是否正确
    const defaultChatAPI = '/v1/chat/completions'

    // 定义请求的 URL, 如果是非法的 URL 会走 catch
    const urlObject = new URL(`${modelInfo.baseUrl}${defaultChatAPI}`)
    const url = urlObject.toString()

    // 创建请求的配置对象
    const options = {
      method: 'POST', // 指定请求方法为 POST
      headers: {
        'Content-Type': 'application/json', // 设置内容类型为 JSON
        'Authorization': `Bearer ${modelInfo.apikey}`, // 在这里提供认证令牌，格式通常为 Bearer token
      },
      body: JSON.stringify(
        {
          model: modelInfo.modelList[0]?.value,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.',
            },
            {
              role: 'user',
              content: 'Hello!',
            },
          ],
        },
      ),
    }
    // 使用 fetch 函数发送请求
    fetch(url, options)
      .then(response => response.json()) // 将响应转换为 JSON
      .then((data) => {
        console.log('Success:', data) // 在控制台打印成功的结果
        if (data?.error) {
          handleError(data?.error)
          return
        }
        handleSuccess()
      })
      .catch((error) => {
        handleError(error)
      })
  }
  catch (error: any) {
    handleError(error)
  }
}

const checkModel = () => {
  const modelInfo = props.modelInfo

  if (!modelInfo.apikey) {
    window.$message?.warning('请填写 apikey')
    return
  }

  if (!modelInfo.baseUrl) {
    window.$message?.warning('请填写 接口代理地址')
    return
  }

  // 清空之前的错误信息
  errorMessage.value = ''

  // 将填写的信息保存一下
  modelStore.saveCurrentModel(modelInfo)

  // 在请求开始前设置加载状态为 true
  loading.value = true

  // 延迟1s发送请求
  setTimeout(() => {
    sendTestRequest(modelInfo)
  }, 1000)
}

const handleCopy = () => {
  copyToClip(errorMessage.value).then(() => {
    window.$message?.success('错误信息 复制成功')
  }).catch(() => {
    window.$message?.error('错误信息 复制失败')
  })
}
</script>

<template>
  <div class="flex justify-center items-center">
    <div v-if="errorMessage" class="scroll-area cursor-pointer" @click="handleCopy">
      {{ errorMessage }}
    </div>

    <NButton :loading="loading" @click="checkModel">
      检查
    </NButton>
  </div>
</template>

<style>
.scroll-area {
  max-height: 70px;
  max-width: 250px;
  margin-right: 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid #ff483c;
  background-color: #eee;
  overflow: auto;
}

.scroll-area::-webkit-scrollbar {
  display: none;
}
</style>
