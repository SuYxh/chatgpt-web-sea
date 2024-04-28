import { reactive } from 'vue'
import { defineStore } from 'pinia'
import type { ModelState, PlatformConfig } from './type'
import { getDefaultModels, getLocalState, setLocalState } from './helper'

export const useModelStore = defineStore('model-store', {
  state: (): ModelState => getLocalState(),
  actions: {
    saveCurrentModel(item: PlatformConfig) {
      const index = this.models.findIndex(v => v.platform === item.platform)
      if (index !== -1) {
        this.models[index] = item
        this.recordState()
      }
    },
    modelChange(group: string, params: string[]) {
      console.log('onModelChange', params)
      const groupItem = this.models.find(item => item.group === group)

      if (!groupItem)
        return

      const curModelList = groupItem.modelList ?? []
      const curModelListValues = new Set(curModelList.map(v => v.value))
      const paramsSet = new Set(params)

      // 查找缺失的模型
      const missingModels: string[] = params.filter(p => !curModelListValues.has(p))

      // 如果存在缺失模型，说明用户添加了模型，需要更新
      if (missingModels.length) {
        const newModels = missingModels.map(v => reactive({
          label: v,
          value: v,
          selected: 1,
          group,
          desc: '',
        }))
        console.log('newModels', newModels)

        groupItem.modelList = [...curModelList, ...newModels]
      }

      // 更新模型的选择状态
      groupItem.modelList = groupItem.modelList.map((v) => {
        v.selected = Number(paramsSet.has(v.value))
        return v
      })

      this.recordState()
    },
    resetModel() {
      this.models = { ...getDefaultModels().models }
      this.recordState()
    },
    recordState() {
      setLocalState(this.$state)
    },
  },
})
