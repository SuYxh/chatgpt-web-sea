import { fetchModelList } from '@/api'
import { ss } from '@/utils/storage'

const LOCAL_NAME = 'modelList'
const ONE_API_INFO = 'oneAPIInfo'

export function useModel() {
  function setOneAPI(state: any) {
    ss.set(ONE_API_INFO, state)
  }

  function getOneAPI(): Model.Model {
    const defaultConfig = {
      label: 'one-api',
      value: 'one-api',
      baseUrl: '',
      apiKey: '',
      chatAPI: '/v1/chat/completions',
    }
    const localState = ss.get(ONE_API_INFO) ?? defaultConfig
    return { ...defaultConfig, ...localState }
  }

  function setLocalModelData(state: Model.ModelList) {
    ss.set(LOCAL_NAME, state)
  }

  function updateModelData(state: Model.ModelList) {
    setLocalModelData(state)
  }

  function mergeData(originModel: Model.ModelList, localModel: Model.ModelList) {
    const models = [...originModel]
    localModel.forEach((v: Model.Model) => {
      const index = originModel.findIndex((item: Model.Model) => item.value === v.value)
      if (index !== -1) {
        models[index].apiKey = v.apiKey
        models[index].baseUrl = v.baseUrl
        models[index].chatAPI = v.chatAPI
      }
    })
    return models
  }

  const getModelList = async () => {
    const result = await fetchModelList()
    const localModelList = getLocalModelData()
    console.log('getModelList', result)
    if (result.status === 'Success') {
      if (localModelList.length) {
        const res = mergeData(result.data, localModelList)
        setLocalModelData(res)
      }
      else {
        setLocalModelData(result.data)
      }
    }
  }

  function getLocalModelData(): Model.ModelList {
    let count = 0
    const localState = ss.get(LOCAL_NAME) ?? []
    if (!localState?.length) {
      getModelList().then(() => {
        if (count >= 3) {
          return []
        }
        count++
        getLocalModelData()
      })
    }
    return [...localState]
  }

  function getModelConfigByName(name: string): Model.Model {
    const localState = ss.get(LOCAL_NAME) ?? []
    const curModel = (localState as Model.ModelList).find(v => v.value === name) ?? ({} as Model.Model)
    return curModel
  }

  return {
    setOneAPI,
    getOneAPI,
    getModelList,
    updateModelData,
    setLocalModelData,
    getLocalModelData,
    getModelConfigByName,
  }
}
