import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import multer from 'multer'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { chatService, getModelListForWeb, qiniuService } from './service'
dotenv.config()

const app = express()
const router = express.Router()

// 设置 Multer，将文件存储在服务器的临时目录
const upload = multer({ dest: 'uploads/' })

app.use(cors())
app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [limiter], async (req, res) => {
  return chatService(req, res)
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

// 上传文件的路由
router.post('/upload', upload.single('file'), (req, res) => {
  return qiniuService(req, res)
})

app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))
