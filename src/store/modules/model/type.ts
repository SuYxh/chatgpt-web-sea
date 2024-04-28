export interface Model {
  label: string
  value: string
  selected: number // Assuming 0 or 1 as possible values, indicating a boolean state.
  group: string

  desc: string
}

export interface PlatformConfig {
  platform: string
  group: string
  logo: string
  enable: number | boolean // Assuming 0 or 1 as possible values, similar to a boolean.
  apikey: string
  apiKeyTitle: string // Optional property, as it might not be present in all configurations.
  apiKeyTip: string // Optional property
  baseUrl: string
  chatAPI: string
  baseUrlTitle: string // Optional property
  baseUrlTip: string // Optional property
  modelListTitle: string // Optional property
  modelListTip: string // Optional property
  modelList: Model[]
  defaultSelectModel?: string[]
}

export interface ModelState {
  models: PlatformConfig[]
}
