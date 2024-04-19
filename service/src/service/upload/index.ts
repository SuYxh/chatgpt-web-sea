import type { CloudStorageService } from '../../types'
import QiniuStorageService from './qiniu'

class StorageServiceSelector {
  private service: CloudStorageService

  constructor(serviceType: string) {
    if (serviceType === 'qiniu') {
      this.service = new QiniuStorageService()
    }
    else if (serviceType === 'aliyun') {
      // this.service = new AliyunStorageService();
    }
    else {
      throw new Error('Unsupported service type')
    }
  }

  getService(): CloudStorageService {
    return this.service
  }
}

export async function qiniuService(req, res) {
  if (!req.file) {
    return res.send({ status: 'Fail', message: 'No file uploaded', data: null })
  }

  const serviceType = 'qiniu' // 或从环境变量或配置文件中读取
  const selector = new StorageServiceSelector(serviceType)
  const storageService = selector.getService()

  try {
    const result = await storageService.uploadFile(req)
    res.json(result)
  }
  catch (error) {
    console.error('Upload error:', error)
    res.send({ status: 'Fail', message: error.message, data: null })
  }
}
