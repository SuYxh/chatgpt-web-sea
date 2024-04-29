# ChatGPT Web Sea

> 声明：此项目只发布于 GitHub，基于 MIT 协议，免费且作为开源学习使用。并且不会有任何形式的卖号、付费服务，谨防受骗。本项目为开源项目，基于[chatgpt-web](https://github.com/Chanzhaoyu/chatgpt-web)进行二次开发，感谢原作者的无私奉献。 使用者必须在遵循**法律法规**的情况下使用，不得用于非法用途。

 :warning:根据[《生成式人工智能服务管理暂行办法》](http://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm)的要求，请勿对中国地区公众提供一切未经备案的生成式人工智能服务。



**支持所有符合 openai 接口标准的模型**

![模型选择tip](https://qn.huat.xyz/mac/202404282232254.jpg)



![kimi](https://qn.huat.xyz/mac/202404282237680.png)



**支持文件上传**

![kimi-图片解析](https://qn.huat.xyz/mac/202404290915138.jpg)

> 这块的交互待优化



**模型可自由选择、自行配置、扩展，兼容 `OneAPI`** 

![模型配置](https://qn.huat.xyz/mac/202404282234270.jpg)



**内置ChatGPT 中文调教指南**

![提示词](https://qn.huat.xyz/mac/202404282236388.jpg)

![](https://qn.huat.xyz/mac/202404282258701.png)



- [ChatGPT Web](#chatgpt-web)
	- [介绍](#介绍)
	- [TODO](#TODO)
	- [前置要求](#前置要求)
		- [Node](#node)
		- [PNPM](#pnpm)
		- [图片上传](#图片上传)
	- [安装依赖](#安装依赖)
		- [后端](#后端)
		- [前端](#前端)
	- [测试环境运行](#测试环境运行)
		- [后端服务](#后端服务)
		- [前端网页](#前端网页)
	- [环境变量](#环境变量)
	- [食用说明](#食用说明)
	- [打包](#打包)
		- [使用 Docker](#使用-docker)
			- [Docker compose](#docker-compose)
			- [防止爬虫抓取](#防止爬虫抓取)
		- [使用 Railway 部署](#使用-railway-部署)
			- [Railway 环境变量](#railway-环境变量)
		- [使用 Sealos 部署](#使用-sealos-部署)
		- [手动打包](#手动打包)
			- [后端服务](#后端服务-1)
			- [前端网页](#前端网页-1)
	- [常见问题](#常见问题)
	- [参与贡献](#参与贡献)
	- [致谢](#致谢)
	- [赞助](#赞助)
	- [License](#license)


## 介绍

⚠️ 废弃功能

- 不再使用`chatgpt` 包来进行模型调用
- 使用 `fetch` 替换 `axios`



➕ 新增功能

- [x] 兼容 [kimi](https://github.com/LLM-Red-Team/kimi-free-api)

- [x] 兼容 [阶跃星辰](https://github.com/LLM-Red-Team/step-free-api)

- [x] 兼容 [阿里通义](https://github.com/LLM-Red-Team/qwen-free-api)

- [x] 兼容 [智谱清言](https://github.com/LLM-Red-Team/glm-free-api)

- [x] 兼容 [秘塔AI ](https://github.com/LLM-Red-Team/metaso-free-api)

- [x] 兼容 [聆心智能](https://github.com/LLM-Red-Team/emohaa-free-api)

- [x] 兼容 [讯飞星火](https://github.com/LLM-Red-Team/spark-free-api)

- [x] 兼容 在[One API](https://github.com/songquanpeng/one-api)、 [New API](https://github.com/Calcium-Ion/new-api)项目提供的中转接口

- [x] 增加图片上传的能力，需要配置七牛云

- [x] 增加模型配置页面，支持自由配置模型

- [x] `kimi`、`glm`支持`conversation_id`

  

## TODO

[✗] 语音对话

[✗] 手机号注册

[✗] 用户模块

[✗] 订单模块

[✗] 支付能力

[✗] 后台管理

[✗] More...



> https://ask.vuejs.news 实现了手机号注册、用户模块、订单模块、支付、以及后台，可体验。

## 前置要求

### Node

`node` 需要 `^16 || ^18 || ^19` 版本（`node >= 14` 需要安装 [fetch polyfill](https://github.com/developit/unfetch#usage-as-a-polyfill)），使用 [nvm](https://github.com/nvm-sh/nvm) 可管理本地多个 `node` 版本

```shell
node -v
```

### PNPM
如果你没有安装过 `pnpm`
```shell
npm install pnpm -g
```



### 图片上传

kimi 等支持的文件以及图片是需要有一个公网可以访问的链接，这里上传到了七牛云，您需要正确的进行配置，后续会出更详细的文档教程

```
# 七牛云上传配置示例
Qiniuyun_ACCESS_KEY=Pui37bG292DPyFm
Qiniuyun_SECRET_KEY=_gy7BBVDxrD706R10ixoeO1i
Qiniuyun_BUCKET_NAME=bucketName
```

> 如果不配置，就无法上传图片，但是不影响对话功能



## 安装依赖

> 为了简便 `后端开发人员` 的了解负担，所以并没有采用前端 `workspace` 模式，而是分文件夹存放。如果只需要前端页面做二次开发，删除 `service` 文件夹即可。

### 后端

进入文件夹 `/service` 运行以下命令

```shell
pnpm install
```

### 前端
根目录下运行以下命令
```shell
pnpm bootstrap
```

## 测试环境运行
### 后端服务

进入文件夹 `/service` 运行以下命令

```shell
pnpm start
```

### 前端网页
根目录下运行以下命令
```shell
pnpm dev
```



## 环境变量

上传：

- `Qiniuyun_ACCESS_KEY`:  七牛云获取到的`ACCESS_KEY`
- `Qiniuyun_SECRET_KEY`:  七牛云获取到的`SECRET_KEY`
- `Qiniuyun_BUCKET_NAME`: 七牛云存储空间的名称

通用：

- `DEBUG` 日志打印等级，默认是 `prod`  ， 支持 `dev` 、`test` 、`prod` 、`info`

- `AUTH_SECRET_KEY` 访问权限密钥，可选

- `MAX_REQUEST_PER_HOUR` 每小时最大请求次数，可选，默认无限

- `HTTPS_PROXY` 支持 `http`，`https`, `socks5`，可选

- `WEB_SITE` 网站配置(需要配置成 JSON 字符串)，默认配置` {"avatar":"https://qn.huat.xyz/mac/202404152305055.jpeg","name":"二十三","description":"Y170088888","shop":"https://example.com"}`

  - `avatar`: 头像  
  - `nickName`: 昵称  
  - `description`: 你的联系方式比如微信、QQ   
  - `shop`: 你卖 key 的商店链接

  

## 食用说明



### 模型配置

![模型配置](https://qn.huat.xyz/mac/202404282245372.jpg)



**开关按钮**： 控制当前平台的模型是否启用，关闭后，这个平台下的所有模型都无法被选择。

**API Key**： 调用接口的凭证，不同平台的不同。

**接口代理地址**：调用模型接口的域名，比如： https://example.vuejs.news

**聊天接口地址**：一般都是 `/v1/chat/completions` ，一般不用改

**模型列表**：可以选择需要的内置模型，被选中的模型会出现在聊天页面的模型选择下拉框中。同时也支持模型扩展， **直接输入模型名称** 即可，会实时保存。

**连通性检查**：检查当前模型是否可用，**只有点击`检查按钮`才会保存 `API Key` 和 `接口代理地址`**

> 如果你使用的是 one-api 项目提供的接口，那么所有平台的 apikey 和 接口代理地址 都填写一样的。



### 提示词

![提示词](https://qn.huat.xyz/mac/202404282255154.jpg)



你将项目运行起来了，这里应该是空的，需要手动安装一下，步骤如下：

![image-20240428225643948](https://qn.huat.xyz/mac/202404282256999.png)

使用

![image-20240428225804804](https://qn.huat.xyz/mac/202404282258865.png)



## 打包

### Docker

```bash
docker run -d -p 3002:3002 \
 -e DEBUG=prod \
 -e Qiniuyun_ACCESS_KEY=Pui37RsbdDiBM57QnS892DPyFm \
 -e Qiniuyun_SECRET_KEY=_gy7BBVDxrD710ixoeO1i \
 -e Qiniuyun_BUCKET_NAME=bucket-name \
 --name chatgpt-web-sea \
  jarvis0426/chatgpt-web-sea:latest
```

> 七牛云的配置信息请你使用你自己的。



#### Docker compose

待做...

#### 防止爬虫抓取

**nginx**

将下面配置填入nginx配置文件中，可以参考 `docker-compose/nginx/nginx.conf` 文件中添加反爬虫的方法

```
# 防止爬虫抓取
if ($http_user_agent ~* "360Spider|JikeSpider|Spider|spider|bot|Bot|2345Explorer|curl|wget|webZIP|qihoobot|Baiduspider|Googlebot|Googlebot-Mobile|Googlebot-Image|Mediapartners-Google|Adsbot-Google|Feedfetcher-Google|Yahoo! Slurp|Yahoo! Slurp China|YoudaoBot|Sosospider|Sogou spider|Sogou web spider|MSNBot|ia_archiver|Tomato Bot|NSPlayer|bingbot")
{
  return 403;
}
```



###  使用 Railway 部署

待做...

### 使用 Sealos 部署

待做...



### 手动打包
#### 后端服务
> 如果你不需要本项目的 `node` 接口，可以省略如下操作

复制 `service` 文件夹到你有 `node` 服务环境的服务器上。

```shell
# 安装
pnpm install

# 打包
pnpm build

# 运行
pnpm prod
```

PS: 不进行打包，直接在服务器上运行 `pnpm start` 也可

#### 前端网页

1、修改根目录下 `.env` 文件中的 `VITE_GLOB_API_URL` 为你的实际后端接口地址

2、根目录下运行以下命令，然后将 `dist` 文件夹内的文件复制到你网站服务的根目录下

[参考信息](https://cn.vitejs.dev/guide/static-deploy.html#building-the-app)

```shell
pnpm build
```

## 常见问题
Q: 为什么 `Git` 提交总是报错？

A: 因为有提交信息验证，请遵循 [Commit 指南](./CONTRIBUTING.md)



Q: 如果只使用前端页面，在哪里改请求接口？

A: 根目录下 `.env` 文件中的 `VITE_GLOB_API_URL` 字段。



Q: 文件保存时全部爆红?

A: `vscode` 请安装项目推荐插件，或手动安装 `Eslint` 插件。



Q: 前端没有打字机效果？

A: 一种可能原因是经过 Nginx 反向代理，开启了 buffer，则 Nginx 会尝试从后端缓冲一定大小的数据再发送给浏览器。请尝试在反代参数后添加 `proxy_buffering off;`，然后重载 Nginx。其他 web server 配置同理。



Q: 如何扩展不存在的模型？

A: 找对对应的平台，在模型选择中手动输入你需要的模型，输入的内容就是模型名称，系统会自动保存




## 致谢

感谢 [JetBrains](https://www.jetbrains.com/) 为这个项目提供免费开源许可的软件。


## 赞助

如果你觉得这个项目对你有帮助，并且情况允许的话，可以给我一点点支持，总之非常感谢支持～

<div style="display: flex; gap: 20px;">
	<div style="text-align: center">
		<img style="max-width: 100%" src="https://qn.huat.xyz/mac/202404160043547.png" alt="微信号" />
		<p>微信号</p>
	</div>
	<div style="text-align: center">
		<img style="max-width: 100%" src="https://qn.huat.xyz/mac/202404160040430.png" alt="微信公众号" />
		<p>公众号</p>
	</div>
</div>


## License
MIT © [ershiyi](./license)
