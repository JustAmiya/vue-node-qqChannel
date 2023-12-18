<template>
    <div class="groupContent">
        <ul>
            <li class="groupChannel" tabindex="1" :class="current==index?'chosen':''" v-for="item,index in roomList" @click="roomChoose(item,index,0)">
                <label></label>
                <span class="title">{{item.Rname}}</span>
            </li>   
        </ul>
        <ul>
            <li class="postChannel" tabindex="1" :class="current==index?'chosen':''" v-for="item,index in postList" @click="roomChoose(item,index,1)">
                <label></label>
                <span class="title">{{ item.prname }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
    import axios from 'axios';
    import {ref,toRaw} from 'vue'
    import { useRouter } from 'vue-router'
    import { useChannelCounterStore } from '../../stores/channelCounter';

    const router = useRouter()
    const channelCounter = useChannelCounterStore()
    const roomList = ref(null)
    const postList = ref(null)
    const current = ref(-1)   
    const params = {
        channelId:toRaw(channelCounter.channel).Cid
    }

    //获取聊天室房间
    axios.get('http://localhost:3000/api/userApi/queryroomByCid',{
        params:params
    }).then(resp => {
        roomList.value = resp.data
        channelCounter.chatroomListChange(resp.data)
    }).catch(err => {
        console.error(err);
    })
    //获取帖子房间
    axios.get('http://localhost:3000/api/userApi/querypostroomByCid',{
        params:params
    }).then(resp => {
        postList.value = resp.data
        channelCounter.postroomListChange(resp.data)
    }).catch(err => {
        console.error(err)
    })
    

    const roomChoose = (item,index,flag) => {
        let target = ''
        let query = ''
        if(!flag){
            target = 'chatroom'
            query = chatroomChoose(item,index)
        }else{
            target = 'postroom'
            query = postroomChoose(item,index)
        }
        router.push({path:`/channel/${params.channelId}/${target}/${query}`})
    }

    //选择聊天室并跳转到聊天页面
    const chatroomChoose = (item,index) => { 
        const roomInfo = toRaw(item)
        channelCounter.chatroomChoose(roomInfo)   //注意 这里不能把之前做过的点击置空，否则浏览器回退的时候找不到页面
        return roomInfo.Rname
    }
    //选择帖子并跳转到帖子页面
    const postroomChoose = (item,index) => {
        const roomInfo = toRaw(item)
        channelCounter.postroomChoose(roomInfo)
        return roomInfo.prname
    }
</script>

<style scoped>
.groupContent {
    width: 260px;
    margin-top: 5px;
    height: 503px;
    overflow:auto;
    position:relative;
}
.groupContent::-webkit-scrollbar{
    display: none;
}
.groupContent ul {
    padding: 0;
    margin: 0;
}
.groupContent .groupChannel {
    overflow: hidden;
    width: 230px;
    height: 40px;
    margin: 2px 10px;
    padding: 10px 5px;
    border-radius: 5px;
    transition: 0.2s;
}
.groupContent .groupChannel:hover {
    background-color: rgb(235, 235, 235);
}
.chosen{
    background-color: rgb(226, 226, 226);
}
.groupContent .groupChannel label{
    float:left;
    width:20px;
    height:20px;
    background-image: url('/icon/msg.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.groupContent .groupChannel .title{
    display: block;
    float: left;
    font-weight: bold;
    margin-left: 10px;
    height:20px;
    line-height: 20px;
}
.groupContent .postChannel{
    overflow: hidden;
    width: 230px;
    height: 40px;
    margin: 2px 10px;
    padding: 10px 5px;
    border-radius: 5px;
    transition: 0.2s;
}
.groupContent .postChannel:hover {
    background-color: rgb(235, 235, 235);
}
.groupContent .postChannel label{
    float:left;
    width:20px;
    height:20px;
    background-image: url('/icon/post.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.groupContent .postChannel .title{
    display: block;
    float: left;
    font-weight: bold;
    margin-left: 10px;
    height:20px;
    line-height: 20px;
}
</style>