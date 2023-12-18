<template>
    <div class="channelUsershow">
        <div class="top">
            <div class="title">频道成员</div>
            <div class="close" @click="close()"></div>
        </div>
        <div class="main">
            <span class="tip">管理员</span>
            <ul>
                <li class="showInfLi" v-for="(item,index) in channelManagerInf">
                    <div class="infmain">
                        <div class="avatar" :style="{backgroundImage:'url('+ item.Uavatar +')'}"></div>
                        <span class="uname">{{ item.Uname }}{{ isMe(item) }}</span>
                        <span class="identity">{{ identityName(item) }}</span>
                        <div class="option">
                            <div class="remove" v-if="showRemoveIcon(item)" @click="removeMember(item)"></div>
                            <div class="changeIdentity" v-if="showUporDownIcon(item)" :style="{backgroundImage:'url(/icon/decline.svg)'}" @click="decline(item)"></div>
                        </div>
                    </div>
                </li>
            </ul>
            <span class="tip">普通成员</span>
            <ul>
                <li class="showInfLi" v-for="(item,index) in channelNormalMemberInf">
                    <div class="infmain">
                        <div class="avatar" :style="{backgroundImage:'url('+ item.Uavatar +')'}"></div>
                        <span class="uname">{{ item.Uname }}{{ isMe(item) }}</span>
                        <span class="identity">{{ identityName(item) }}</span>
                        <div class="option">
                            <div class="remove" v-if="showRemoveIcon(item)" @click="removeMember(item)"></div>
                            <div class="changeIdentity" v-if="showUporDownIcon(item)" :style="{backgroundImage:'url(/icon/rise.svg)'}" @click="promote(item)"></div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>


<script setup>
    import { useUserCounterStore } from '../../stores/userCounter';
    import { useChannelCounterStore } from '../../stores/channelCounter';
    import { watch, toRaw, provide, ref, inject } from 'vue';
    import axios from 'axios';
    import { useRouter } from 'vue-router'

    const router = useRouter()

    const flag = inject('flag')
    const showchannelUserFlag = inject('showchannelUserFlag')

    const userCounter = useUserCounterStore()
    const channelCounter = useChannelCounterStore()
    const userInf = toRaw(userCounter.userInfo)
    const channel = toRaw(channelCounter.channel)
    const channelUserInfList = toRaw(channelCounter.channelUserInf)
    const chatroomList = toRaw(channelCounter.chatroomList)
    const postroomList = toRaw(channelCounter.postroomList)

    const channelManagerInf = ref([])
    const channelNormalMemberInf = ref([])
    let mineidentity = 0  //当前用户是普通成员

    for(const index in channelUserInfList){
        if(channelUserInfList[index].Uid == userInf.Uid){
            if(channelUserInfList[index].ifmanager == 1) mineidentity = 1  //当前用户是管理员
            if(channelUserInfList[index].Chost == 1) mineidentity = 2   //当前用户是频道主
        }
        if(channelUserInfList[index].ifmanager) channelManagerInf.value.push(channelUserInfList[index])
        else channelNormalMemberInf.value.push(channelUserInfList[index]) 
    }

    // 身份标识
    const identityName  = (item) => {
        if(item.Chost) return '频道主'
        if(item.ifmanager) return '管理员'
        return '普通成员'
    }
    // 显示自己
    const isMe = (item) => {
        if(item.Uid == userInf.Uid) return "(我)"
    }
    // 图标显示
    const showRemoveIcon = (item) => {
        if(item.Chost == 1) return false
        if(mineidentity == 0){
            if(userInf.Uid == item.Uid) return true
            else return false
        }else if(mineidentity == 1){
            if(userInf.Uid == item.Uid || item.ifmanager == 0) return true
            else return false
        }else if(mineidentity == 2){
            return true
        }
    }
    const showUporDownIcon = (item) => {
        if(item.Chost == 1) return false;
        if(mineidentity == 2) return true;
        return false;
    }

    // 踢出成员 || 退出频道
    const removeMember = (item) => {
        if(userInf.Uid == item.Uid) exitChannel(item)
        else kickout(item)
    }
    // 踢出频道
    const kickout = async(item) => {
        const f = confirm('确认移除成员吗？该成员的相关信息都会被删除。')
        const pridList = []
        const cridList = []
        const p = {
            channelId:channel.Cid
        }
        await axios.get('http://localhost:3000/api/userApi/queryroomByCid',{
            params:p
        }).then(resp => {
            for(const index in resp.data){
                cridList.push(resp.data[index].Rid)
            }
            return axios.get('http://localhost:3000/api/userApi/querypostroomByCid',{params:p})
        }).then(resp => {
            for(const index in resp.data){
                pridList.push(resp.data[index].prid)
            }
        }).catch(err => {
            console.error(err);
        })
        const params = {
            Uid:item.Uid,
            Cid:channel.Cid,
            Cname:channel.Cname,
            pridList:pridList,
            cridList:cridList
        }
        if(f){
            await axios.post('http://localhost:3000/channelMethod/deleteUser',params).then(resp => {
                close()
                router.go(0)
            }).catch(err => {
                console.error(err);
            })
        }
    }
    // 退出频道
    const exitChannel = async(item) => {
        console.log('exit');
        const f = confirm('确认退出吗，你留下的相关信息都会被删除')
        const pridList = []
        const cridList = []
        for(const index in postroomList){
            pridList.push(postroomList[index].prid) 
        }
        for(const index in chatroomList){
            cridList.push(chatroomList[index].Rid)
        }
        const params = {
            Uid:item.Uid,
            Cid:channel.Cid,
            Cname:channel.Cname,
            pridList:pridList,
            cridList:cridList
        }
        if(f){
            await axios.post('http://localhost:3000/channelMethod/deleteUser',params).then(resp => {
                close()
                router.push({path:'/'})
            }).catch(err => {
                console.error(err);
            })
        }
    }

    // 撤回管理员权限
    const decline = (item) => {
        const params = {
            ifmanager:0,
            Cid:channel.Cid,
            Uid:item.Uid,
        }
        axios.post("http://localhost:3000/api/userApi/changeIdentity",params).then(resp => {
            console.log('success');
        }).catch(err => {
            console.error(err);
        })
    }
    // 给予管理员权限
    const promote = (item) => {
        const params = {
            ifmanager:1,
            Cid:channel.Cid,
            Uid:item.Uid,
        }
        axios.post("http://localhost:3000/api/userApi/changeIdentity",params).then(resp => {
            console.log('success');
        }).catch(err => {
            console.error(err);
        })
    }

    const close = () => {
        flag.value = false
        showchannelUserFlag.value = false
    }

</script>

<style scoped>
.channelUsershow {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 700px;
    height: 600px;
    overflow: hidden;
    border-radius: 10px;
    background-color: rgb(220, 220, 220);
    overflow: scroll;
}
.channelUsershow::-webkit-scrollbar{
    display: none;
}
.top {
    height: 50px;
    margin: 10px;
    display: flex;
    justify-content: space-between
}

.title {
    line-height: 50px;
    font-size:22px;
    font-weight: bold;
}

.close {
    margin-top: 15px;
    width: 20px;
    height: 20px;
    background-image: url('/icon/close.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.main{
    margin: 5px 20px;
}

.showInfLi{
    height:50px;
    padding:5px 10px;
    margin-bottom:20px;
    border-radius: 10px;
    background-color: rgb(212, 212, 212);
}
.showInfLi:hover{
    background-color:rgb(203, 203, 203)
}
.infmain{
    height:50px;
    line-height: 50px;
    border-radius: 10px;
}
.avatar{
    width:50px;
    height:50px;
    border-radius: 50px;
    float:left;
    background-color: white;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.uname{
    float:left;
    height:50px;
    margin-left:20px;
    font-weight: bold;
}
.identity{
    float:left;
    height:50px;
    margin-left:25px;
    color:rgb(104, 104, 104);
}
.option{
    float:right;
    height:50px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
.remove{
    width:20px;
    height:20px;
    margin-top:15px;
    float:right;
    margin-right:10px;
    background-image: url('/icon/stop.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    cursor: pointer;
}
.changeIdentity{
    width:20px;
    height:20px;
    margin-top:15px;
    float:right;
    margin-right:20px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    cursor: pointer;
}

</style>