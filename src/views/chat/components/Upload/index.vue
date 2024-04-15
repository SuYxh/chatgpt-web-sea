<script lang="ts">
import { ref } from 'vue'
import { NUpload } from 'naive-ui'
import * as qiniu from 'qiniu-js'
import { SvgIcon } from '@/components/common'
import { fetchQiniuyunToken } from '@/api'

const KEY_PREFIX = 'aigc/'
const QINIUYUN_UPLOAD_TOKEN = 'qiniuyunToken'

export default {
  components: {
    NUpload,
    SvgIcon,
  },
  emits: ['uploadComplete', 'uploadError'],
  setup(props, { emit }) {
    const fileList = ref<any[]>([])

    // 获取七牛云的上传凭证，通常需要从你的服务器端获取
    const getQiniuToken = async () => {
      const t = localStorage.getItem(QINIUYUN_UPLOAD_TOKEN)
      if (t) {
        console.log('getQiniuToken-localStorage', t)
        return t
      }
      // 这里使用伪代码表示，你需要从服务器端获取token
      const result = await fetchQiniuyunToken()
      console.log('getQiniuToken-data', result.data)
      localStorage.setItem(QINIUYUN_UPLOAD_TOKEN, result.data)
      return result.data
    }

    // TODO：文件大小限制、文件类型限制、文件数量限制
    const uploadToQiniu = async (file: File) => {
      const token = await getQiniuToken()
      console.log('token-uploadToQiniu', token)
      const key = `${KEY_PREFIX}${Date.now()}_${file.name}` // 确保使用正确的KEY_PREFI
      // @ts-expect-error
      const observable = qiniu.upload(file, key, token, null, { mimeType: null })
      const observer = {
        next(res: any) {
          console.log('next-res', res)
        },
        error(err: any) {
          console.error('error', err)
          emit('uploadError', err) // 触发上传错误事件，发送错误信息
          localStorage.removeItem(QINIUYUN_UPLOAD_TOKEN)
        },
        complete(res: any) {
          console.log('complete-res', res)
          fileList.value.push({
            name: file.name,
            type: file.type,
            // @ts-expect-error
            fullPath: file.fullPath,
            url: `https://qn.huat.xyz/${res.key}`, // 根据实际返回的key拼接URL
            status: 'finished',
          })
          emit('uploadComplete', fileList.value) // 触发上传完成事件，发送文件列表
        },
      }
      observable.subscribe(observer)
    }

    const handleFileListUpdate = (newFileList: any[]) => {
      console.log('Files updated:', newFileList)
      newFileList.forEach((file) => {
        if (file.status === 'pending') {
          uploadToQiniu(file.file)
        }
      })
    }

    const clear = () => {
      console.log('清空数据')
      fileList.value = []
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

  <!-- <div class="image-list">
    <NImage
      v-for="file in fileList"
      :key="file.name"
      :src="file.url"
      width="100"
      height="100"
      class="image-item"
    />
  </div> -->
</template>

<style>
.image-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

.image-item {
  margin-right: 10px; /* 每张图片之间的间隔 */
}
</style>
