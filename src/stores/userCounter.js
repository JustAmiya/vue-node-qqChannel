import { defineStore } from 'pinia'
import {ref,computed} from 'vue'

export const useUserCounterStore = defineStore('userCounter',() => {
    const userInfo = ref(null)
    const num = ref(-1)

    const infoChange = (newval) => {
        userInfo.value = newval
    }

    const numChange = (newval) => {
        num.value = newval
    }

    return {userInfo,num,infoChange,numChange}
},{
    persist:{
        enabled:true
    }
})