import type { ModelState, PlatformConfig } from './type'
import { modelListConfig } from './config'
import { ss } from '@/utils/storage'
import { isEmpty } from '@/utils/is/index'

const LOCAL_NAME = 'modelStorage'
export function mergeModelList(arr1: PlatformConfig[], arr2: PlatformConfig[]): PlatformConfig[] {
  if (!Array.isArray(arr1)) {
    arr1 = []
  }

  if (!Array.isArray(arr2)) {
    arr2 = []
  }

  const result: PlatformConfig[] = []

  arr2.forEach((arr2Item) => {
    const arr1Item = arr1.find(item => item.platform === arr2Item.platform)

    if (arr1Item) {
      const mergedItem: PlatformConfig = { ...arr1Item, ...arr2Item }
      // Merge modelList by updating or adding models based on the label
      const modelMap = new Map(arr1Item.modelList.map(model => [model.label, model]))

      arr2Item.modelList.forEach((model) => {
        if (modelMap.has(model.label)) {
          modelMap.set(model.label, { ...modelMap.get(model.label), ...model })
        }
        else {
          modelMap.set(model.label, model)
        }
      })

      mergedItem.modelList = Array.from(modelMap.values())

      result.push(mergedItem)
    }
    else {
      // If no matching platform found in arr1, add the new item from arr2
      result.push(arr2Item)
    }
  })

  // Add items from arr1 that are not in arr2
  arr1.forEach((arr1Item) => {
    if (!result.some(item => item.platform === arr1Item.platform)) {
      result.push(arr1Item)
    }
  })

  return result
}

export function getDefaultModels(): ModelState {
  return { models: modelListConfig }
}

export function getLocalState(): ModelState {
  const defaultModels = getDefaultModels()
  const localModel: ModelState = ss.get(LOCAL_NAME) ?? {}
  if (isEmpty(localModel)) {
    setLocalState(defaultModels)
  }
  const models = mergeModelList(defaultModels.models, localModel.models)
  return { models }
}

export function setLocalState(state: ModelState): void {
  ss.set(LOCAL_NAME, state)
}

export function findMissingModels(val: string[], curDefaultModelList: string[]) {
  const missingModels = val.filter(model => !curDefaultModelList.includes(model))
  return missingModels
}
