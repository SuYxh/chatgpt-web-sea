import * as dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const modelApi = process.env.MODEL_API
const modelConfig = process.env.MODEL_CONFIG

const defaultChatAPI = '/v1/chat/completions'

export const defaultModelList = [
  {
    label: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },
  {
    label: 'Kimi',
    value: 'kimi',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.Kimi_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.Kimi_API_KEY,
    chatAPI: process.env.Kimi_Chat_API || defaultChatAPI,
  },
  {
    label: '阶跃星辰',
    value: 'step',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.Step_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.Step_API_KEY,
    chatAPI: process.env.Step_Chat_API || defaultChatAPI,
  },
  {
    label: '通义千问',
    value: 'qwen',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.Qwen_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.Qwen_API_KEY,
    chatAPI: process.env.Qwen_Chat_API || defaultChatAPI,
  },
  {
    label: '智谱清言',
    value: 'glm',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.Glm_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.Glm_API_KEY,
    chatAPI: process.env.Glm_Chat_API || defaultChatAPI,
  },
  {
    label: '秘塔AI',
    value: 'metaso',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.Metaso_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.Metaso_API_KEY,
    chatAPI: process.env.Metaso_Chat_API || defaultChatAPI,
  },
  {
    label: '聆心智能',
    value: 'Emohaa',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.Emohaa_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.Emohaa_API_KEY,
    chatAPI: process.env.Emohaa_Chat_API || defaultChatAPI,
  },
]

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
  const list = allModel.map(v => ({ label: v.label, value: v.value }))
  return list
}
