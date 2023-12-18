<template>
    <div class="leftNav">
        <div class="groupHead"  :style="{background:'linear-gradient(to top,rgba(0,0,0,0.5),rgba(0,0,0,0) 50%),url('+channel.Cavatar+')',backgroundRepeat:'no-repeat', backgroundPosition:'center center', backgroundSize: 'cover'}">
            <span>{{ channel.Cname }}</span>
            <div class="tool">
                <div class="manage" v-if="ifManager" @click="manageClick"></div>
                <div class="member" @click="showChannelUser"></div>
            </div>
            
        </div>
        
        <div class="Content">
            <groupContent></groupContent>
        </div>
    </div>
</template>

<script setup>
    import groupContent from './groupContent.vue'
    import {ref,toRaw,inject} from 'vue'
    import { useRoute } from 'vue-router'
    import { useChannelCounterStore } from '@/stores/channelCounter'
    import { useUserCounterStore } from '../../stores/userCounter'
    import axios from 'axios'

    
    const userCounter = useUserCounterStore()
    const channelCounter = useChannelCounterStore()
    const channel = toRaw(channelCounter.channel)
    const userInfo = toRaw(userCounter.userInfo)
    const ifManagerParams = {
        Cid:channel.Cid,
        Uid:userInfo.Uid,
    }
    const ifManager = ref(0)
    const flag = inject('flag')
    const managechannelFlag = inject('managechannelFlag')
    const showchannelUserFlag = inject('showchannelUserFlag')

    const manageClick = () => {
        flag.value = true
        managechannelFlag.value = true
    }
    const showChannelUser = () => {
        flag.value = true
        showchannelUserFlag.value = true
    }

    // 查询用户是否是频道管理员
    axios.get('http://localhost:3000/api/userApi/ifManager',{
        params:ifManagerParams
    }).then(resp => {
        ifManager.value = resp.data[0].ifmanager
    }).catch(err => {
        return err
    })

    // 查询所选频道的用户信息
    axios.get('http://localhost:3000/api/userApi/queryUidByCid',{
        params:{
            Cid:channel.Cid
        }
    }).then(resp => {
        const uidList = []
        const ifmanagerList = []
        for(const index in resp.data){
            uidList.push(resp.data[index].Uid)
            ifmanagerList.push(resp.data[index].ifmanager)
        }
        return getUserInf(uidList,ifmanagerList)
    }).then(resp => {
        channelCounter.channelUserInfChange(resp)
    }).catch(err => {
        console.error(err);
    })
    
    const getUserInf = async(uidList,ifmanagerList) => {
        const uInfList = []
        for(const i in uidList){
            const params = {
                Uid:uidList[i]
            }
            await axios.get('http://localhost:3000/api/userApi/queryuserByUid',{
                params:params
            }).then(resp => {
                const uinf = {
                    Uid:resp.data[0].Uid,
                    Uname:resp.data[0].Uname,
                    Uavatar:resp.data[0].Uavatar,
                    ifmanager:ifmanagerList[i],
                    Chost:channel.Chost == resp.data[0].Uid ? 1 : 0
                }
                uinf.Uavatar = uinf.Uavatar.replace("D:\\VScode\\workspace\\study\\server\\public","http://127.0.0.1:3000") 
                uinf.Uavatar = uinf.Uavatar.replaceAll('\\','//')
                uInfList.push(uinf)
            }).catch(err => {
                console.error(err);
            })
        }
        return uInfList  
    }

</script>

<style scoped>
.leftNav{
    height:700px;
    width:260px;
    background-color: white;
    float:left;
}
.leftNav .groupHead{
    width:260px;
    height:120px;
    position:relative
}
.leftNav .groupHead span{
    color:white;
    height:20px;
    line-height: 20px;
    position: absolute;
    bottom:5%;
    left:5%;
    font-weight: bold;
}
.tool{
    position:absolute;
    bottom:5%;
    right:2%;
    width:50px;
    height:20px;
}
.manage{
    width:20px;
    height:20px;
    float: right;
    margin-left: 10px;
    background-image: url('/icon/elipsis.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:contain;
    cursor: pointer;
}
.member{
    width:20px;
    height:20px;
    float: right;
    background-image: url('/icon/user.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:contain;
    cursor: pointer;
}

</style>