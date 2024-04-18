import { fetchModelList } from '@/api'
import { ss } from '@/utils/storage'

const LOCAL_NAME = 'modelList'

export function useModel() {
  function getLocalModelData(): Model.ModelList {
    const localState = ss.get(LOCAL_NAME) ?? []
    return [...localState]
  }

  function setLocalModelData(state: Model.ModelList) {
    ss.set(LOCAL_NAME, state)
  }

  const getModelList = async () => {
    const result = await fetchModelList()
    console.log('getModelList', result)
    if (result.status === 'Success') {
      setLocalModelData(result.data)
    }
  }

  return {
    getModelList,
    setLocalModelData,
    getLocalModelData,
  }
}
