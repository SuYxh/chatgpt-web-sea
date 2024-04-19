import log from 'npmlog'
import * as dotenv from 'dotenv'
dotenv.config()

// 日志配置类
class Logger {
  constructor() {
    // 设置默认日志级别
    this.setLogLevel()
  }

  private setLogLevel() {
    // 根据环境变量设置日志级别，可以根据需要调整
    const env = process.env.DEBUG || 'dev'
    console.log('env', env)

    switch (env) {
      case 'dev':
        log.level = 'verbose'
        break
      case 'test':
        log.level = 'info'
        break
      case 'prod':
        log.level = 'warn'
        break
      default:
        log.level = 'info'
        break
    }
  }

  private formatArgs(args: any[]): any[] {
    return args.map(arg =>
      ((arg !== null && typeof arg === 'object') ? JSON.stringify(arg, null, 2) : arg),
    )
  }

  public verbose(tag: string, message: any, ...args: any[]) {
    log.verbose(tag, message, ...this.formatArgs(args))
  }

  public info(tag: string, message: any, ...args: any[]) {
    log.info(tag, message, ...this.formatArgs(args))
  }

  public warn(tag: string, message: any, ...args: any[]) {
    log.warn(tag, message, ...this.formatArgs(args))
  }

  public error(tag: string, message: any, ...args: any[]) {
    log.error(tag, message, ...this.formatArgs(args))
  }
}

// 导出单例模式的 Logger 实例
export const logger = new Logger()
