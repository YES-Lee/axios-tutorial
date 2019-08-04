<template>
  <div id="app">
    <div class="form">
      <div class="form-control">
        间隔（毫秒）
        <input v-model="axiosConfig.retryDelay" type="text" placeholder="重新发送间隔">
      </div>
      <div class="form-control">
        超时（毫秒）
        <input v-model="axiosConfig.timeout" type="text" placeholder="请求超时时间">
      </div>
      <button v-if="!loading" class="send-btn" :class="{ disabled: loading }" @click="handleSend">
        发送请求
      </button>
      <button v-if="loading" class="send-btn" :class="{ disabled: loading }" @click="handleCancel">
        取消
      </button>
    </div>
    <div class="result-panel">
      <span v-if="loading" class="loading-text">加载中...</span>
      <pre v-else class="result-content">{{resultData}}</pre>
    </div>
  </div>
</template>

<script>
import createHttpClient from './lib/http'
import Axios from 'axios'

export default {
  name: 'app',
  data () {
    return {
      resultData: null,
      loading: false,
      axiosConfig: {
        baseURL: 'https://api.github.com',
        timeout: 1000,
        retryDelay: 3000,
        retryTimes: 3
      },
      http: null,
      cancelSource: null
    }
  },
  created () {
    this.http = createHttpClient(this.axiosConfig)
  },
  watch: {
    'axiosConfig.timeout' () {
      this.http = createHttpClient(this.axiosConfig)
    },
    'axiosConfig.retryDelay' () {
      this.http = createHttpClient(this.axiosConfig)
    }
  },
  methods: {
    async handleSend () {
      this.loading = true
      this.resultData = null
      this.cancelSource = Axios.CancelToken.source()
      const result = await this.http.get('/users', {
        cancelToken: this.cancelSource.token
      })
      this.resultData = result.data
      this.loading = false
    },
    handleCancel () {
      this.cancelSource.cancel('请求被手动取消')
      this.cancelSource = null
      this.loading = false
    }
  }
}
</script>

<style lang="less">
body {
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

  display:flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding: 10px;
  box-sizing: border-box;
}

.form {
  display: flex;
  align-items: center;

  .form-control {
    margin-left: 15px;
  }
}

.send-btn {
  flex: 0 0 auto;
  margin-left: 15px;
  display: block;
  background: #2d8cf0;
  color: #fff;
  width: fit-content;
  text-align: center;
  padding: 5px 15px;
  border: none;
  border-radius: 5px;
  outline: none;
  font-size: 15px;
  cursor: pointer;

  &.disabled {
    background: #83b9f3;
  }
}

.result-panel {
  flex: 1 1 auto;
  overflow: auto;
  border: 1px solid #aaa;
  margin-top: 15px;
  padding: 15px;
}
</style>
