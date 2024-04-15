import { ref } from 'vue'
import { useMessage } from 'naive-ui'

export function useUsingInternet() {
  const disabled = ref(false)
  const ms = useMessage()
  const usingInternet = ref(true)

  // TODO: 上传文件后，就不允许在开启网络链接了
  function toggleUsingInternet() {
    if (disabled.value) {
      ms.warning('当前状态不可开启网络链接')
      return
    }
    usingInternet.value = !usingInternet.value
    if (usingInternet.value)
      ms.success('开启网络链接')
    else
      ms.warning('关闭网络链接')
  }

  function closeInternet() {
    disabled.value = true
    usingInternet.value = false
  }

  function openInternet() {
    disabled.value = false
    usingInternet.value = true
  }

  return {
    disabled,
    usingInternet,
    toggleUsingInternet,
    closeInternet,
    openInternet,
  }
}
