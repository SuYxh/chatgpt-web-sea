import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { defaultChatAPI, defaultModelList } from './config'

dotenv.config()

const modelApi = process.env.MODEL_API
const modelConfig = process.env.MODEL_CONFIG

export const getModelList = async () => {
  let list: any[] = []
  if (modelApi) {
    try {
      const response = await fetch(modelApi)
      if (!response.ok) {
        console.log(`Network response was not ok ${response.statusText}`)
      }
      const data = await response.json()
      list = data as any[]
    }
    catch (error) {
      console.error('There was a problem fetching the data:', error)
      list = defaultModelList
    }
  }
  else if (modelConfig) {
    try {
      list = JSON.parse(modelConfig)
    }
    catch (error) {
      console.log('MODEL_CONFIG 解析失败')
      list = defaultModelList
    }
  }
  else {
    list = defaultModelList
  }

  return list
}

export const getModelListForWeb = async () => {
  const allModel = await getModelList()
  const list = allModel.map(v => ({ label: v.label, value: v.value, baseUrl: '', apiKey: '', chatAPI: defaultChatAPI }))
  return list
}
