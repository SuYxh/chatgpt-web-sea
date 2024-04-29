import fs from 'fs-extra'
import qiniu from 'qiniu'
import iconv from 'iconv-lite'
import * as dotenv from 'dotenv'
dotenv.config()

class QiniuStorageService {
  private formUploader: qiniu.form_up.FormUploader
  private putExtra: qiniu.form_up.PutExtra
  private config: qiniu.conf.Config
  private mac: qiniu.auth.digest.Mac
  private cachedToken: { token: string; expiry: number } = { token: '', expiry: 0 }

  constructor() {
    this.config = new qiniu.conf.Config()
    // @ts-expect-error
    this.config.zone = qiniu.zone.Zone_z0 // 根据存储区域设置
    this.formUploader = new qiniu.form_up.FormUploader(this.config)
    this.putExtra = new qiniu.form_up.PutExtra()
    this.mac = new qiniu.auth.digest.Mac(process.env.Qiniuyun_ACCESS_KEY, process.env.Qiniuyun_SECRET_KEY)
  }

  public async uploadFile(req) {
    const correctName = iconv.decode(Buffer.from(req.file.originalname, 'binary'), 'utf-8')

    const localFile = req.file.path
    const key = `aigc/${Date.now()}_${correctName}`

    try {
      const url = await this.putFile(localFile, key)
      return { status: 'Success', message: '', data: url }
    }
    catch (error) {
      console.error('Upload error:', error)
      return { status: 'Fail', message: error.message, data: null }
    }
    finally {
      await fs.unlink(localFile)
    }
  }

  private getToken(): string {
    const now = Date.now()
    if (now < this.cachedToken.expiry) {
      return this.cachedToken.token
    }

    const options = {
      scope: process.env.Qiniuyun_BUCKET_NAME,
      expires: 7200, // Token expiry time in seconds
    }

    const putPolicy = new qiniu.rs.PutPolicy(options)
    const token = putPolicy.uploadToken(this.mac)
    this.cachedToken = {
      token,
      expiry: now + options.expires * 1000 - 30000, // Cache the token, deduct 30 seconds to ensure freshness
    }

    return token
  }

  private async putFile(localFile: string, key: string): Promise<string> {
    const token = this.getToken()
    return new Promise((resolve, reject) => {
      this.formUploader.putFile(token, key, localFile, this.putExtra, (err, body, info) => {
        if (err || info.statusCode !== 200) {
          reject(new Error(info?.data?.error || 'Upload to Qiniu failed'))
        }
        else {
          resolve(`https://qn.huat.xyz/${body.key}`)
        }
      })
    })
  }
}

export default QiniuStorageService
