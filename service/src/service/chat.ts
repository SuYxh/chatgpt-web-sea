import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { logger } from '../utils/logger'

dotenv.config()

export async function chatService(req, res) {
  try {
    logger.info('req.headers', req.headers)
    logger.info('req.body', req.body)

    const defaultChatAPI = '/v1/chat/completions'
    const authHeader = req.headers.authorization || req.headers.Authorization
    const contentType = req.headers['content-type']
    const baseUrl = req.body.baseUrl
    const chatAPI = req.body.chatAPI ?? defaultChatAPI
    delete req.body.baseUrl
    const url = `${baseUrl}${chatAPI}`

    const payload = {
      headers: {
        'Authorization': authHeader,
        'Content-Type': contentType || 'application/json',
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
