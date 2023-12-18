<template>
    <div class="downList">
        <div class="channelList">
            <ul>
                <li v-for="item,index in channellist">
                    <label class="groupPic" tabindex="1" @click="channelEnter(item,index)" :style="{backgroundImage:'url('+ item.Cavatar +')',backgroundRepeat:'no-repeat', backgroundPosition:'center center', backgroundSize: 'cover'}"></label>
                </li>
            </ul>
        </div>
        
        <div class="addChannel">
            <hr>
            <div class="addBtn" @click="addNewChannel(flag)"></div>
        </div>
    </div>
</template>

<script setup>
    import axios from 'axios';
    import {ref,toRaw,watch,inject} from 'vue'
    import { useChannelCounterStore } from '@/stores/channelCounter'
    import { useUserCounterStore } from '@/stores/userCounter'
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const userCounter = useUserCounterStore()
    const channelCounter = useChannelCounterStore()

    const userInf = toRaw(userCounter.userInfo)
    const params = {
        userid:userInf.Uid
    }
    let channellist = ref(null)
    const flag = inject('flag')
    const newchannelFlag = inject('newchannelFlag')

    //获取频道
    axios.get("http://localhost:3000/api/userApi/queryChannelByUid",{
            params:params
        }).then(resp => {
            for ( const index in resp.data){
                resp.data[index].Cavatar = resp.data[index].Cavatar.replace("D:\\VScode\\workspace\\study\\server\\public", "http://127.0.0.1:3000")
                resp.data[index].Cavatar = resp.data[index].Cavatar.replaceAll("\\","//")
            }
            channelCounter.channelListChange(resp.data)
            channellist.value = resp.data
        }).catch(err => {
            console.error(err);
        })
    // 进入频道
    const channelEnter = (item,index) => {
        const channelId = item.Cid
        channelCounter.channelChoose(item)
        router.push({path:`/channel/${channelId}/whitePage`})
    }
    // 新增频道
    const addNewChannel = (f) => {
        flag.value = !f
        newchannelFlag.value = true
    }

</script>

<style scoped>
.downList{
    margin-top:20px;
    width:68px;
    height:530px;
    position:relative
}
.channelList{
    height:510px;
}
.channelList::-webkit-scrollbar {
    display: none;
}
.downList ul{
    margin:0;
    padding:0;
}
.downList ul li{
    overflow: hidden;
    height:50px;
    margin-top: 15px;
    position:relative;
}
.groupPic{
    width:40px;
    height:40px;
    float:left;
    margin:5px 14px;
    border-radius: 5px;
    background-color: grey;
    transition:0.2s;
}
.groupPic:hover{
    transform:scale(1.05);
    box-shadow: 0 0 10px grey;
}
.groupPic:focus{
    outline: 3px solid #1ed0a1;
}
.addChannel{
    height:60px;
    width:68px;
    position:absolute;
    bottom:0;
}
.addChannel hr{
    width:40px;
    margin: 0 auto;
}
.addBtn{
    width:40px;
    height:40px;
    margin:10px auto;
    border-radius:10px;
    background-image: url('/icon/add_grey.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
    transition:0.2s
}
.addBtn:hover{
    transform:scale(1.05);
    box-shadow: 0 0 10px grey;
}
</style>