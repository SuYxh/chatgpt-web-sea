<script lang="ts">
import { ref } from 'vue'
import { NUpload } from 'naive-ui'
import { SvgIcon } from '@/components/common'

export default {
  components: {
    NUpload,
    SvgIcon,
  },
  props: {
    maxFiles: {
      type: Number,
      default: 50, // 默认最多上传 50 个文件
    },
    maxFileSize: {
      type: Number,
      default: 100 * 1024 * 1024, // 默认每个文件最大 100 MB
    },
    allowedTypes: {
      type: Array,
      default: () => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png'],
    },
  },
  emits: ['uploadComplete', 'uploadError'],
  setup(props, { emit }) {
    const fileList = ref<any[]>([])

    const clear = () => {
      fileList.value = []
    }

    const uploadToQiniu = async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const result = await response.json()

        if (result.status === 'Success') {
          const fileData = {
            name: file.name,
            type: file.type,
            url: result.data, // 服务器返回的文件访问URL
            status: 'finished',
          }
          clear()
          emit('uploadComplete', fileData) // 触发上传完成事件
        }
        else {
          throw new Error(result.message)
        }
      }
      catch (error: any) {
        emit('uploadError', error.message) // 触发上传错误事件
      }
    }

    const handleFileListUpdate = (newFileList: any[]) => {
      if (newFileList.length > props.maxFiles) {
        emit('uploadError', `最多只能上传 ${props.maxFiles} 个文件。`)
        return
      }

      newFileList.forEach((file) => {
        if (file.status === 'pending') {
          if (file.file.size > props.maxFileSize) {
            emit('uploadError', `文件 ${file.file.name} 超出最大文件大小限制。最大只能上传 ${props.maxFileSize}`)
            return
          }
          if (!props.allowedTypes.includes(file.file.type)) {
            emit('uploadError', `文件 ${file.file.name} 类型不被允许。`)
            return
          }
          uploadToQiniu(file.file)
        }
      })
    }

    return {
      fileList,
      clear,
      handleFileListUpdate,
    }
  },
}
</script>

<template>
  <NUpload
    :show-file-list="false"
    :file-list="fileList"
    :on-update:file-list="handleFileListUpdate"
  >
    <span class="text-xl text-[#4f555e] dark:text-white">
      <SvgIcon class="mt-2" icon="ic:round-upload" />
    </span>
  </NUpload>
</template>
