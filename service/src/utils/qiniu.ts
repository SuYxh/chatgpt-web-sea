import qiniu from 'qiniu'
import * as dotenv from 'dotenv'
dotenv.config()

// 七牛云的 Access Key 和 Secret Key
const ACCESS_KEY = process.env.Qiniuyun_ACCESS_KEY
const SECRET_KEY = process.env.Qiniuyun_SECRET_KEY
// 七牛存储空间名称
const BUCKET_NAME = process.env.Qiniuyun_BUCKET_NAME

// 配置七牛云认证信息
const config = new qiniu.conf.Config()
// 可选，根据你的存储区域选择
// @ts-expect-error
config.zone = qiniu.zone.Zone_z0 // 华南地区

// 创建认证对象
const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY)

export function genQiniuyunToken() {
  const options = {
    scope: BUCKET_NAME, // 通用前缀路径
    expires: 7200,
  }

  const putPolicy = new qiniu.rs.PutPolicy(options)
  const token = putPolicy.uploadToken(mac)
  // 可以把这个 token 存在 redis 中，目前是前端做了缓存
  return token
}
