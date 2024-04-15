<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, ref, watch } from 'vue'
import { NImage, NSpace, NText } from 'naive-ui'
import { SvgIcon } from '@/components/common'

interface FileDetail {
  name: string
  url: string
  type: string // 完整的 MIME 类型，如 'image/png'
}

export default defineComponent({
  components: {
    NImage,
    NSpace,
    NText,
    SvgIcon,
  },
  props: {
    fileList: {
      type: Array as PropType<FileDetail[]>,
      required: true,
    },
  },
  emits: ['fileRemoved'],
  setup(props, { emit }) {
    const imageList = ref<FileDetail[]>([])
    const otherfiles = ref<FileDetail[]>([])

    const isImage = (type: string): boolean => {
      return type.startsWith('image/')
    }

    const removeFile = (file: FileDetail) => {
      emit('fileRemoved', file)
    }

    watch(() => props.fileList, (files) => {
      imageList.value = files.filter(file => isImage(file.type))
      otherfiles.value = files.filter(file => !isImage(file.type))
    }, { immediate: true, deep: true })

    return {
      imageList,
      otherfiles,
      removeFile,
    }
  },
})
</script>

<template>
  <div>
    <div class="scroll-container">
      <NSpace class="file-item">
        <div v-for="file in imageList" :key="file.name" class="image-file">
          <NImage :src="file.url" width="100" height="100" object-fit="cover" />
          <SvgIcon class="image-close" icon="zondicons:close-outline" @click="removeFile(file)" />
        </div>
      </NSpace>
    </div>

    <div class="scroll-container">
      <NSpace class="file-item">
        <div v-for="file in otherfiles" :key="file.name" class="other-file">
          <NText>{{ file.name }}</NText>
          <SvgIcon class="file-close" icon="zondicons:close-outline" @click="removeFile(file)" />
        </div>
      </NSpace>
    </div>
  </div>
</template>

<style scoped>
.scroll-container {
  overflow-x: auto;
  white-space: nowrap;
  padding: 10px;
}
.file-item {
  display: inline-block;
  margin-right: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  vertical-align: top;
}

.other-file {
  display: flex;
  align-items: center;
}

.file-close {
  cursor: pointer;
  margin-left: 4px;
}

.image-file {
  position: relative;
}

.image-close {
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
