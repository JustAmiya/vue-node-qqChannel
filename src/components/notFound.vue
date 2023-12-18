<template>
    <div class="notFound">
        <div>页面似乎出错了，{{ 3 - count }}秒后将返回首页</div>
    </div>
    
</template>

<script setup>
    import { ref } from 'vue';
    import router from '../router';

    const interval = 1000
    let totalCount = 2000
    let count = ref(0)
    
    const startTime = new Date().getTime()
    let timeoutID = setTimeout(countDownFn, interval)
    
    // 倒计时回调函数
    function countDownFn() {
        count.value++ 
        const offset = new Date().getTime() - startTime - count.value * interval
        let nextTime = interval - offset
        if (nextTime < 0 ) {
            nextTime = 0
        }
        totalCount -= interval
        if (totalCount < 0) {
            clearTimeout(timeoutID)
            router.push({path:"/"})
        } else {
            timeoutID = setTimeout(countDownFn, nextTime)
        }
    }
</script>

<style scoped>

</style>