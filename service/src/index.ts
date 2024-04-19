import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { genQiniuyunToken } from './utils/qiniu'
import { getModelList, getModelListForWeb } from './utils/model'
dotenv.config()

const app = express()
const router = express.Router()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

const handleBearer = (key: string) => {
  if (!key.includes('Bearer')) {
    return `Bearer ${key}`
  }
  return key
}

const handleAuthorization = (authHeader, curModel) => {
  const keyStrategy = process.env.KEY_STRATEGY

  // 只使用后端配置的 key
  if (+keyStrategy === 2) {
    return handleBearer(curModel.apiKey)
  }

  // 优先使用前端的 key，前端没有在使用后端的 key
  return handleBearer(authHeader || curModel.apiKey)
}

router.post('/chat-process', [limiter], async (req, res) => {
  try {
    const keyStrategy = process.env.KEY_STRATEGY
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (+keyStrategy === 1 && !authHeader) {
      res.status(500).send({ status: 'Fail', message: `请配置${req.body.model}的认证信息`, data: null })
      return
    }

    const contentType = req.headers['content-type']
    const modelList = await getModelList()

    const curModel = modelList.filter(model => model.value === req.body.model)?.[0] ?? ({} as any)

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
    console.log('url', url)
    console.log('payload', payload)

    const result = await fetch(url, payload)

    if (result.status !== 200) {
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
        console.error('Stream error:', err)
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
    console.error('Error:', err)
    res.status(500).send({ status: 'Fail', message: 'Internal Server Error', data: null })
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/getQiniuToken', async (req, res) => {
  const token = await genQiniuyunToken()
  res.json({ status: 'Success', message: '', data: token })
})

router.post('/getModelList', async (req, res) => {
  const list = await getModelListForWeb()
  res.send({ status: 'Success', message: '', data: list })
})

router.post('/getWebSite', async (req, res) => {
  try {
    const webSiteStr = process.env.WEB_SITE
    const webSite = JSON.parse(webSiteStr)
    res.send({ status: 'Success', message: '', data: webSite })
  }
  catch (error) {
    console.log('web site 配置解析失败')
    const defaultWebSite = { avatar: 'https://qn.huat.xyz/mac/202404152305055.jpeg', nickName: '二十一', contact: '', shop: '' }
    res.send({ status: 'Success', message: '您配置 WEB_SITE 解析失败,使用默认的信息', data: defaultWebSite })
  }
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
