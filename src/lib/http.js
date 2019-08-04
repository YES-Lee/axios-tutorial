/**
 * @author Johnson
 * @email yeslee1126@gmail.com
 * @date Saturday, 3rd August 2019 9:24:55 pm
 * @last Modified by Johnson
 *
 * 配置并创建axios实例
 */

import Axios from 'axios'

export default function createHttpClient (config = {}) {
  const defaultConfig = {
    timeout: 1000,
    retryDelay: 3000
  }

  Object.assign(defaultConfig, config)

  // 详细配置参数参考https://github.com/axios/axios
  const httpClient = Axios.create(defaultConfig)

  // 请求拦截器
  httpClient.interceptors.request.use(config => {
    // 对请求进行统一处理，比如：在header中添加token
    return config
  }, err => {
    return Promise.reject(err)
  })

  // 响应拦截器
  httpClient.interceptors.response.use(null, err => {
    // 异常处理

    const { config, code, message } = err
    console.log(config.retryTimes)
    if (code === 'ECONNABORTED' || message === 'Network Error') { // 请求超时
      console.warn(`请求超时，将在${defaultConfig.retryDelay / 1000}秒后重试`)
      return new Promise(resolve => {
        setTimeout(async _ => {
          resolve(await httpClient.request(config))
        }, defaultConfig.retryDelay)
      })
    }

    // 可以进行相关提示等处理
    return Promise.reject(err)
  })

  return httpClient
}
