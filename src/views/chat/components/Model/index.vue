<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { NSelect, NSpace } from 'naive-ui'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/store'
import { useModel } from '@/views/chat/hooks/useModel'
import { fetchModelList } from '@/api'

export default defineComponent({
  components: {
    NSelect,
    NSpace,
  },
  emits: ['update'],
  setup(props, { emit }) {
    const chatStore = useChatStore()
    const route = useRoute()
    const { getLocalModelData } = useModel()

    const { uuid } = route.params as { uuid: string }

    const selectedValue = ref('gpt-3.5-turbo')
    // TODO: 模型由接口获取
    const options = ref<Model.ModelList>([])

    const handleChange = (val: string) => {
      console.log('下拉筛选的模型', val)
      const item = options.value.filter((v: Model.Model) => v.value === val)?.[0] ?? {}
      chatStore.setModelByUuid(+uuid, item)
      emit('update', item)
    }

    const getModelList = async () => {
      // 先从本地获取
      const models = getLocalModelData()
      // 本地没有走线上
      if (!models.length) {
        const result = await fetchModelList()
        if (result.status === 'Success') {
          options.value = result.data
        }
      }
      else {
        options.value = models
      }
    }

    const setDefaultModel = () => {
      handleChange(options.value[0].value)
    }

    watch(options, (newVal) => {
      if (newVal?.length) {
        setDefaultModel()
      }
    })

    onMounted(async () => {
      await getModelList()
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
