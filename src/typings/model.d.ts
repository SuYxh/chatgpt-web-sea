declare namespace Model {

	interface Model {
		// 模型名称
			label: string
			// modal 对应的值，可以直接和名称保持一致，前端 select 组件需要这种结构
			value: string
			// 调用模型的域名
			baseUrl?: string
			// 调用模型的凭证
			apiKey?: string
			// 模型聊天接口的地址(去除域名部分) , 默认是 /v1/chat/completions
			chatAPI?: string
			[key: string]: string | undefined;
	}

	type ModelList = Model[]
}
