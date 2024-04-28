<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { NSelect, NSpace } from 'naive-ui'
import { useRoute } from 'vue-router'
import { useChatStore, useModelStore } from '@/store'
import type { Model, PlatformConfig } from '@/store/modules/model/type'

export default defineComponent({
  components: {
    NSelect,
    NSpace,
  },
  emits: ['update'],
  setup(props, { emit }) {
    const chatStore = useChatStore()
    const modelStore = useModelStore()

    const route = useRoute()
    const { uuid } = route.params as { uuid: string }

    const isInit = ref(true)
    const selectedValue = ref('gpt-3.5-turbo')
    const options = ref<Model[]>([])

    const handleOptions = (modelList: PlatformConfig[]) => {
      let models: Model[] = []
      const enableModels = modelList.filter(v => v.enable)
      enableModels.forEach((item) => {
        if (item.modelList?.length) {
          const selectModel = item.modelList.filter(i => i.selected === 1)
          models = models.concat(selectModel)
        }
      })
      options.value = models
    }

    watch(() => modelStore.models, (newVal) => {
      if (newVal) {
        handleOptions(newVal)
      }
    }, {
      immediate: true,
      deep: true,
    })

    const handleChange = (val: string) => {
      console.log('下拉筛选的模型', val)
      const item = options.value.filter((v: Model) => v.value === val)?.[0] ?? {}
      chatStore.setModelByUuid(+uuid, item)
      emit('update', item)
    }

    const setDefaultModel = () => {
      handleChange(options.value[0].value)
    }

    watch(options, (newVal) => {
      if (newVal?.length && isInit.value) {
        isInit.value = false
        setDefaultModel()
      }
    }, {
      immediate: true,
      deep: true,
    })

    return {
      options,
      selectedValue,
      handleChange,
    }
  },
})
</script>

<template>
  <div class="flex justify-center">
    <NSpace vertical>
      <NSelect v-model:value="selectedValue" :options="options" style="min-width: 22vw;" @update:value="handleChange" />
    </NSpace>
  </div>
</template>

<style scoped>
.n-select-option {
  justify-content: center !important;
}

.n-select {
  text-align: center;
}

.n-select-selection {
  justify-content: center !important;
}
</style>
