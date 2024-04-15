import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import * as dotenv from 'dotenv'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { genQiniuyunToken } from './utils/qiniu'
import { defaultModelList, getModelList } from './utils/model'
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

router.post('/chat-process2', [limiter], async (req, res) => {
  try {
    res.setHeader('Content-type', 'text/event-stream')

    const authHeader = req.headers.authorization || req.headers.Authorization

    const curModel = defaultModelList.filter(model => model.value === req.body.model)?.[0] ?? ({} as any)

    const url = `${curModel.baseUrl}${curModel.chatAPI}`
    const result = await fetch(url,
      {
        headers: {
          'Authorization': authHeader || curModel.apiKey,
          'Content-Type': req.headers['content-type'] || 'application/json',
        },
        method: req.method || 'POST',
        body: JSON.stringify(req.body),
      },
    )

    if (result.status !== 200) {
      return result.body
    }

    const stream = result.body

    stream.on('data', () => {
      stream.resume()
    })

    stream.on('end', () => {
      res.end()
    })

    stream.on('error', (err) => {
      console.error('Stream error:', err)
      res.write(err.message)
      res.end()
    })

    stream.pipe(res)
  }
  catch (err) {
    console.error('Error:', err)
    res.status(500).send('Internal Server Error')
  }
})

router.post('/chat-process', [limiter], async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization
    const contentType = req.headers['content-type']

    const curModel = defaultModelList.filter(model => model.value === req.body.model)?.[0] ?? ({} as any)
    const url = `${curModel.baseUrl}${curModel.chatAPI}`
    const payload = {
      headers: {
        'Authorization': authHeader || curModel.apiKey,
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

router.post('/getModelList', (req, res) => {
  const list = getModelList()
  res.send({ status: 'Success', message: '', data: list })
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
