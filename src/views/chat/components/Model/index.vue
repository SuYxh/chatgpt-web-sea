<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { NSelect, NSpace } from 'naive-ui'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/store'
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

    const { uuid } = route.params as { uuid: string }

    const selectedValue = ref('gpt-3.5-turbo')
    // TODO: 模型由接口获取
    const options = ref([
      {
        label: 'gpt-3.5-turbo-0125',
        value: 'gpt-3.5-turbo',
      },
      {
        label: 'Kimi',
        value: 'kimi',
      },
      {
        label: '阶跃星辰',
        value: 'step',
      },
      {
        label: '通义千问',
        value: 'qianwen',
      },
      {
        label: '智谱清言',
        value: 'glm',
      },
      {
        label: '秘塔AI',
        value: 'metaso',
      },
      {
        label: '聆心智能',
        value: 'Emohaa',
      },
    ])

    const handleChange = (val: any) => {
      console.log('val', val)
      chatStore.setModelByUuid(+uuid, val)
      const item = options.value.filter(v => v.value === val)
      emit('update', item)
    }

    const getModelList = async () => {
      const result = await fetchModelList()
      console.log('getModelList', result)
      if (result.status === 'Success') {
        options.value = result.data
      }
    }

    const setDefaultModel = () => {
      handleChange(options.value[0].value)
    }

    onMounted(async () => {
      await getModelList()
      setDefaultModel()
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
