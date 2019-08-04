# axios-tutorial

> 原文：[优雅的解决axios请求超时](https://johnsonlee.site/post/10018)

## 在线demo

[]()

## 运行demo

```bash
git clone https://github.com/YES-Lee/axios-tutorial.git
cd axios-tutorial
npm run serve
```

## 简介
在`vue`中经常使用`axios`发起网络请求，与服务器进行数据交互。在使用过程中会有许多问题存在，比如由于网络不稳定导致请求超时/失败，通常有两种解决方案，一种是提示用户重新提交请求，另一种是进行相关提示并自动重新发送请求。第二种方式用户体验明显高于第一种方式。本文就针对第二种方式设计一个解决方案。

## 拦截器
基本所有的网络请求库都有拦截器接口，包括请求拦截器和响应拦截器。`axios`设置拦截器的接口为`axios.interceptor.request.use(cb, errCb)`和`axios.intercepter.response.use(cb, errCb)`，拦截器可以设置多个，按照设置的顺序执行。

## 请求失败
请求失败无论是网络异常还是其他原因，都会走到响应拦截器里，因此对于请求结果的相关处理，重点放在响应拦截器上，而请求异常的处理则放在响应拦截器的第二个回调函数里面。

## 解决方案
思路很简单，在响应拦截器中拦截到异常信息，通过分析异常信息来直接从拦截器中重新发送请求。整个过程对于调用请求的业务代码中来说是毫无感知的，只需等待`resolve`结果即可。

## 实现
首先，经过测试得到请求超时的错误代码是`ECONNABORTED`，网络连接异常没有错误代码，可以直接通过`error.message === 'Network Error'`进行判断。
```javascript
const httpClient = Axios.create(defaultConfig)
httpClient.interceptors.response.use(null, err => {
	// 异常处理

	const { config, code, message } = err
	if (code === 'ECONNABORTED' || message === 'Network Error') { // 请求超时
	console.warn(`请求超时，将在${defaultConfig.retryDelay / 1000}秒后重试`)
	return new Promise(resolve => {
		setTimeout(async _ => {
			resolve(await httpClient.request(config))
			}, defaultConfig.retryDelay) // 设置发送间隔
		})
	}

	// 可以进行相关提示等处理
	return Promise.reject(err)
})
```
经过错误代码判断，需要进行重新发送的时候，将请求的config直接传入`httpClient.request`中。这里加了一个`timeout`定时器，是为了防止请求频率过高，当网络连接异常时，请求响应时间是非常短的，如果马上进行请求就会导致进入死循环，甚至递归调用栈溢出。

整个过程实际上是一个递归调用请求的过程，重新发送次数过多可能会导致递归溢出问题，使用递归的原因是为了保证所有请求用的是同一个`axios`示例。当然，`config`里面几乎包含了所有的配置，也可以直接使用`axios.request`进行请求。区别就在于如果在请求拦截器中设置了一些操作可能会有一些问题。

## 小结
本文提供一种通过使用拦截器的解决方案，其中还有可以改进的地方，比如加入重新请求次数限制，或者最长等待时间等。核心在于如何灵活的使用`axios`的拦截器来处理请求异常，亦或是请求/响应数据的统一处理等。可以在拦截器中统一处理一些业务无关的逻辑，时调用者更专注于业务代码开发。
