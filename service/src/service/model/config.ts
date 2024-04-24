import * as dotenv from 'dotenv'

dotenv.config()

export const defaultChatAPI = '/v1/chat/completions'

export const defaultModelList = [
  {
    label: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },
  {
    label: 'gpt-4-turbo',
    value: 'gpt-4-turbo',
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
  {
    label: '讯飞星火',
    value: 'spark',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.Spark_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.Spark_API_KEY,
    chatAPI: process.env.Spark_Chat_API || defaultChatAPI,
  },
  {
    label: 'gpt-3.5-turbo-0613',
    value: 'gpt-3.5-turbo-0613',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },
  {
    label: 'gpt-3.5-turbo-16k',
    value: 'gpt-3.5-turbo-16k',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },
  {
    label: 'gpt-3.5-turbo-0125',
    value: 'gpt-3.5-turbo-0125',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },

  {
    label: 'gpt-4-turbo-preview',
    value: 'gpt-4-turbo-preview',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },
  {
    label: 'gpt-4-0125-preview',
    value: 'gpt-4-0125-preview',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },

  {
    label: 'gpt-4-all',
    value: 'gpt-4-all',
    baseUrl: process.env.ONE_API_BASE_URL || process.env.OPENAI_API_BASE_URL,
    apiKey: process.env.ONE_API_KEY || process.env.OPENAI_API_KEY,
    chatAPI: process.env.OPENAI_Chat_API || defaultChatAPI,
  },
]
