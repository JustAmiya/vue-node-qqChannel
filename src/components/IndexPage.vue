<template>
    <div class="IndexPage">
        <div class="leftTab">
            <leftTab></leftTab>
        </div>
        <div class="leftNav">
            <router-view :key="$route.fullPath"></router-view>
        </div>
        <div class="rightContent">
            <router-view :key="$route.fullPath" name="rightContent"></router-view>
        </div>

        <div>
            <div class="mask" :style="{display:maskShow}"></div>
            <changeInf v-if="changeuInfFlag"></changeInf>
            <newChannel v-if="newchannelFlag"></newChannel>
            <manageChannel v-if="managechannelFlag"></manageChannel>
            <showchannelUser v-if="showchannelUserFlag"></showchannelUser>
            <searchChannel v-if="searchchannelFlag"></searchChannel>
        </div>
    </div>
        
</template>

<script setup>
    import leftTab from './leftTab/leftTab.vue'
    import changeInf from './maskContent/changeInf.vue'
    import newChannel from './maskContent/channelCreate.vue'
    import manageChannel from './maskContent/manageChannel.vue'
    import showchannelUser from './maskContent/showchannelUser.vue'
    import searchChannel from './maskContent/searchChannel.vue'
    import { watch,toRaw,provide,ref } from 'vue';

    
    const flag = ref(false)  // 控制遮罩开关
    const newchannelFlag = ref(false)
    const changeuInfFlag = ref(false)
    const managechannelFlag = ref(false)
    const showchannelUserFlag = ref(false)
    const searchchannelFlag = ref(false)
    const maskShow = ref('none')
    provide('flag',flag)    // 祖孙传值
    provide('newchannelFlag',newchannelFlag)
    provide('changeuInfFlag',changeuInfFlag)
    provide('managechannelFlag',managechannelFlag)
    provide('showchannelUserFlag',showchannelUserFlag)
    provide('searchchannelFlag',searchchannelFlag)

    // 监听遮罩层的开关
    watch(flag,()=>{
        if(flag.value) maskShow.value = 'block'
        else{
            setTimeout(() => {
                maskShow.value = 'none'
            },200)
        }
    })

</script>

<style scoped>
.IndexPage{
    width:1200px;
    height:700px;
    margin:20px auto;
    position:relative;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
.mask{
    position:fixed;
    top:0;
    right:0;
    bottom:0;
    left:0;
    opacity: 0.5;
    background-color: black;
}
.changeInf{
    position:absolute;
    top:0;
    bottom:0;
    left:0;
    right:0;
    margin:auto;
    width:400px;
    height:350px;
    overflow: hidden;
    border-radius: 10px;
    background-color: rgb(220, 220, 220);
}
.top{
    height:30px;
    margin:10px;
    display: flex;
    justify-content: space-between
}
.title{
    line-height: 30px;
}
.close{
    margin-top:5px;
    width:20px;
    height:20px;
    background-image: url('/icon/close.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.avatarInput{
    height:100px;
}
.avatar{
    width:100px;
    height:100px;
    margin:0 auto;
    position: relative;
    border-radius: 100px;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.avatarMask{
    width:100px;
    height:100px;
    border-radius: 100px;
    position: absolute;
    background-color: rgba(0,0,0,0.3);
    cursor: pointer;
}
.avatarMask div{
    width:40px;
    height:40px;
    position: absolute;
    top:30px;
    left:30px;
    background-image: url('/icon/picture.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.avatarInput input{
    display: none;
}
.usernameInput{
    height:30px;
    margin:20px 20px 10px 20px;
    border-radius: 5px;
    background-color: white;
}
.tip{
    line-height: 30px;
    margin:0 15px 0 10px;
}
.usernameInput input{
    height:30px;
    width:280px;
    padding:0;
    border:0;
}
.bottom{
    height:30px;
    display: flex;
    justify-content:space-evenly
}
.save{
    height:30px;
    width:60px;
    border-radius: 5px;
    line-height: 30px;
    border:1px solid rgb(220, 220, 220);
    text-align: center;
    color:white;
    background-color: #0099ff;
    cursor: pointer;
    position:relative
}
.saveMask{
    width:100%;
    height:100%;
    position: absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    border-radius: 5px;
}
.saveMask:hover{
    background-color: rgba(1,1,1,0.1);
}
.cancel{
    height:30px;
    width:60px;
    line-height: 30px;
    text-align: center;
    border:1px solid black;
    border-radius: 5px;
    cursor: pointer;
}
.cancel:hover{
    background-color: rgb(205, 205, 205);
}
</style>