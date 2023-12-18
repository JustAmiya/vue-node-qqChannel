import { createApp, VueElement } from 'vue'
import App from './App.vue'
import router from './router'
import 'vant/lib/index.css'
import axios from 'axios'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'

const pinia = createPinia()
pinia.use(piniaPersist)
const app = createApp(App)

app.use(router)
app.use(pinia)

//axios拦截器登录验证
axios.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token')
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
axios.interceptors.response.use(response => {
    return response
},err => {
    if(err.response.status === 401){
        sessionStorage.removeItem("token")
    }
    return Promise.reject(error)    //要返回promise，否则catch不到
})

const vm = app.mount('#app')
