import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { logger } from '../utils/logger'
import { getModelList } from './model'

dotenv.config()

const getKeyStrategy = () => {
  const keyStrategy = process.env.KEY_STRATEGY || 3
  return keyStrategy
}

const handleBearer = (key: string) => {
  if (!key.includes('Bearer')) {
    return `Bearer ${key}`
  }
  return key
}

const handleAuthorization = (authHeader, curModel) => {
  const keyStrategy = getKeyStrategy()

  // 只使用后端配置的 key
  if (+keyStrategy === 2) {
    return handleBearer(curModel.apiKey)
  }

  // 优先使用前端的 key，前端没有在使用后端的 key
  let _authHeader = ''

  // 前端没有配置的时候传递的是 Bearer
  if (authHeader && authHeader !== 'Bearer') {
    _authHeader = authHeader
  }
  else {
    _authHeader = curModel.apiKey
  }

  return handleBearer(_authHeader)
}

export async function chatService(req, res) {
  try {
    logger.info('req.headers', req.headers)
    logger.info('req.body', req.body)

    const keyStrategy = getKeyStrategy()
    logger.info('KEY_STRATEGY', keyStrategy)
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (+keyStrategy === 1 && !authHeader) {
      res.status(500).send({ status: 'Fail', message: `请配置${req.body.model}的认证信息`, data: null })
      return
    }

    const contentType = req.headers['content-type']
    const modelList = await getModelList()

    const curModel = modelList.filter(model => model.value === req.body.model)?.[0] ?? ({} as any)
    logger.info('当前选用的模型', curModel)

    const authorization = handleAuthorization(authHeader, curModel)
    const url = `${curModel.baseUrl}${curModel.chatAPI}`
    const payload = {
      headers: {
        'Authorization': authorization,
        'Content-Type': contentType || 'application/json',
        // 'zz': 'zz',
      },
      method: req.method || 'POST',
      body: JSON.stringify(req.body),
      // agent: proxyAgent, // 使用代理
    }

    // if (process.env.HTTPS_PROXY) {
    //   设置代理
    //   payload.agent = new HttpsProxyAgent(process.env.HTTPS_PROXY)
    // }
    logger.info('准备向模型发起请求-地址', url)
    logger.info('准备向模型发起请求-参数', payload)

    const result = await fetch(url, payload)

    if (result.status !== 200) {
      logger.error('向模型发起请求-失败-result', result)
      const errorMessage = await result.text()
      return res.send({ status: 'Fail', message: errorMessage, data: null })
    }

    if (req.body.stream) {
      res.setHeader('Content-type', 'text/event-stream')
      const stream = result.body
      stream.on('data', () => {
        stream.resume()
      })
      stream.on('end', () => {
        res.end()
      })
      stream.on('error', (err) => {
        logger.error('stream-error', err)
        res.send({ status: 'Fail', message: err.message, data: null })
      })
      stream.pipe(res)
    }
    else {
      const jsonData = await result.json()
      res.send({ status: 'Success', message: 'Data retrieved successfully', data: jsonData })
    }
  }
  catch (err) {
    logger.error('chatProcess Error', err)
    res.status(500).send({ status: 'Fail', message: err.message, data: null })
  }
}
