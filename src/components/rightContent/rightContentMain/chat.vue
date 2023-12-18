<template>
    <div class="chat">
        <div class="rightContentHeader">
            <label></label>
            <span>{{roomInf.Rname}}</span>
        </div>
        <div class="chatBox">
            <div class="chatMain">
                <div class="flex">
                    <div :class="item.isMe ? 'mineChatMsg':'othersChatMsg'" v-for="item in chatContent">
                        <label :style="{background:'url('+item.userAvatar+')',backgroundRepeat: 'no-repeat',backgroundPosition:'center',backgroundSize:'cover'}"></label>
                        <div class="main">
                            <p>{{ item.username }}</p>
                            <div v-if="msgOrimg(item)"><span style="white-space: pre-wrap">{{ item.chatMsg }}</span></div>
                            <div v-else><img class="msgImg" :src="item.img"></div>
                        </div>
                    </div>                     
                </div>

            </div>
            <div class="chatBar">
                <div class="chatTool">
                    <div class="icon">
                        <label class="icon-path" tabindex="1" @click="emojiShow=!emojiShow">{{ emoji[1].char }}</label>
                        <div class="emoji" tabindex="1" v-show="emojiShow" >
                            <span v-for="item in emojiList" :key="item.codes" @click="handleEmoji(item)">{{ item.char }}</span>
                        </div>
                    </div>
                    <div class="img">
                        <label class="imgLabel" tabindex="1" @click="chatPicUpload"></label>
                        <input class="imgInput" id="tp" type="file" @change="onChange">
                    </div>
                </div>
            </div>
            <div class="chatInput">
                <textarea placeholder="开始聊天吧" v-model="msg" @keydown.enter.prevent="msgSend"></textarea>
            </div>
        </div>
        <div class="chatMember">
            <span class="title">频道成员</span>
            <span class="identity">管理员</span>
            <ul>
                <li class="memberInf" v-for="item,index in managerMember">
                    <label :style="{background:'url('+item.Uavatar+')',backgroundRepeat: 'no-repeat',backgroundPosition:'center',backgroundSize:'cover'}"></label>
                    <span>{{ item.Uname }}</span>
                </li>
            </ul>
            <span class="identity">普通成员</span>
            <ul>
                <li class="memberInf" v-for="item,index in normalMember">
                    <label :style="{background:'url('+item.Uavatar+')',backgroundRepeat: 'no-repeat',backgroundPosition:'center',backgroundSize:'cover'}"></label>
                    <span>{{ item.Uname }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import {ref,watch,toRaw} from 'vue'
    import { io } from 'socket.io-client';  
    import emoji from "@/assests/emoji.json"
    import axios, { all } from 'axios';
    import { useChannelCounterStore } from '@/stores/channelCounter'
    import { useUserCounterStore } from '@/stores/userCounter'
    import { usemsgCounterStore } from '@/stores/msgCounter';
    //创建socket实例实现通信
    const socket = io('http://localhost:3000',{
        debug:true,
        autoConnect: true
    })
    //定义消息 记得加响应式 否则页面不重新渲染
    const msg = ref("")
    let chatContent = ref([])
    let managerMember = ref([])
    let normalMember = ref([])
    const userCounter = useUserCounterStore()
    const channelCounter = useChannelCounterStore()
    const msgCounter = usemsgCounterStore()
    let emojiList = ref(emoji)
    let emojiShow = ref(false)
    const textarea = ref(null)
    const userInf = toRaw(userCounter.userInfo)
    const roomInf = toRaw(channelCounter.chatroom)
    const channelInf = toRaw(channelCounter.channel)
    const allUserInf = toRaw(channelCounter.channelUserInf)
    let chatInf = {
        userid:userInf.Uid,
        username:userInf.Uname,
        userAvatar:userInf.Uavatar,
        chatMsg:"",
        msgDate:'刚刚',
        isMe:true
    }

    // 频道成员信息
    for(const i in allUserInf){
        if(allUserInf[i].ifmanager) managerMember.value.push(allUserInf[i])
        else normalMember.value.push(allUserInf[i])
    }

    //查询历史消息
    const queryHistoryMsg = (roomInf) => {
        const params = {
            Rid:roomInf.Rid
        }
        axios.get("http://localhost:3000/api/userApi/querymsgByRid",{
            params:params
        }).then(resp => {
            let returnValue = msgCounter.msgListinit(resp.data,userInf.Uid)
            return returnValue
        }).then(resp => {
            chatContent.value = toRaw(resp.value)
        }).catch(err => {
            console.error(err);
        })
    }
    queryHistoryMsg(roomInf)
    

    //用户连接上 将群组信息和用户信息发送侦听group变化
    watch(userCounter.userInfo,()=>{
        socket.emit('firstConnect',channelInf,roomInf,chatInf)
        chatContent.value = []
        //groupMember.value = []
        
    },{immediate:true}) //这个属性可以在创建侦听时立即回调一次

    // 监听聊天事件
    socket.on("chatMsg",(data)=>{
        chatContentPush(data);
    })
    // 监听图片接受事件
    socket.on("receiveImg",(data) => {
        let dat = data.chatInf
        dat.img = data.img
        dat.userAvatar = dat.userAvatar.replaceAll("\\","//")
        chatContentPush(dat);
    })
    // 判断聊天信息还是图片信息
    const msgOrimg = (item) => {
        if(item.img == "undefined" || item.img == null) return true
        return false
    }


    //回车发送消息
    const msgSend = () =>{
        if(msg.value.length > 0){
            let myInf = structuredClone(chatInf)    //使用深拷贝
            myInf.chatMsg = msg.value
            chatContentPush(myInf)         //自己发的消息直接push到数组里
            socket.emit("chatMsg",channelInf,roomInf,myInf)
            insertMsg(userInf,roomInf,channelInf,msg.value)
        }
        msg.value = ""
    }
    //输入表情
    const handleEmoji = (emoji) => {
        msg.value += emoji.char     //添加表情
        emojiShow.value = false     //关闭表情栏
        textarea.value.focus()      //获取焦点
    }
    // 发送图片
    const chatPicUpload = (item) => {
        const input = document.querySelector('.imgInput')
        input.click()
    }
    // 获取图片通过socket传到后台
    const onChange = (e) => {
        let nowDate = new Date()
        let localDate = nowDate.toLocaleString()
        let str = localDate
        str = str.replaceAll('/','-')
        str = str.replaceAll(':','-')
        const f = new FormData()
        const imgData = ref(null)

        if(e.target.files.length == 0) return;

        const file = e.target.files[0] 
        if (!validateFile(file)) return;

        const reader = new FileReader()
        reader.onload = (e) => {
            imgData.value = e.target.result
            const data = {
                channelInf:channelInf,
                roomInf:roomInf,
                chatInf:chatInf,
                img:e.target.result,
                imgName:str,
                date:localDate
            }
            socket.emit('sendImg',data) 
            const minemsgImg = chatInf
            minemsgImg.img = e.target.result
            chatContentPush(minemsgImg)
        }
        reader.readAsDataURL(file)
        f.append('chatImg', file)
        insertImg(f,localDate,str)
    }
    // 验证图片合法性
    const validateFile = (file) => {
        const legalExts = ['.jpg', '.jpeg', '.bmp', '.webp', '.gif', '.png']
        const name = file.name.toLowerCase()
        if (!legalExts.some((ext) => name.endsWith(ext))) {
            alert('文件类型错误')
            return false
        }
        return true
    } 

    //输入文字或图片
    const chatContentPush = (data)=>{
        chatContent.value.push(data)
    }

    //使滚动条位于底部


    //向数据库添加msg
    const insertMsg = (userInf,roomInf,channelInf,msg) => {
        let nowDate = new Date()
        let localDate = nowDate.toLocaleString()
        const params = {
            Mcontent:msg,
            Mdate:localDate,
            Rid:roomInf.Rid,
            Uid:userInf.Uid,
            Cid:channelInf.Cid
        }
        axios.get("http://localhost:3000/api/userApi/insertMsg",{
            params:params
        }).then(resp => {
            console.log('success');
        }).catch(err => {
            console.error(err);
        })
    }
    // 向数据库插入图片
    const insertImg = (f,localDate,str) => {
        const params = {
            Mcontent:"",
            Mdate:localDate,
            Mimg:str,
            Rid:roomInf.Rid,
            Rname:roomInf.Rname,
            Uid:chatInf.userid,
            Cid:channelInf.Cid,
            Cname:channelInf.Cname
        }
        f.append("Mcontent","")
        f.append("Mdate",localDate)
        f.append("Mimg",str)
        f.append("Rid",roomInf.Rid)
        f.append("Rname",roomInf.Rname)
        f.append("Uid",chatInf.userid)
        f.append("Cid",channelInf.Cid)
        f.append("Cname",channelInf.Cname)
        axios.post("http://localhost:3000/channelMethod/insertImg",f).then(resp => {
            console.log('success');
        }).catch(err => {
            console.error(err);
        })

    }
    
</script>

<style scoped>
.chat{
    height:700px;
    width:872px;
}
.chat .rightContentHeader{
    width:872px;
    height:69px;
    border-bottom: 1px solid #ccc;
    position:relative;
}
.chat .rightContentHeader label{
    position: absolute;
    bottom:5px;
    left:20px;
    width:30px;
    height:30px;
    background-image: url('/icon/msg.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.chat .rightContentHeader span{
    display: block;
    position: absolute;
    bottom:5px;
    left:60px;
    height:30px;
    line-height: 30px;
    font-weight: bold;
    font-size: 20px;
}
.chat .chatBox{
    height:630px;
    width:700px;
    position:relative;   
    float:left;
}
.chat .chatBox .chatMain{
    width:100%;
    height:439px;
    border-bottom: 1px solid grey;
    overflow:auto;          /*flex与overflow联用失效，分两个div */
}
.flex{ 
    display: flex;                          /*利用flex布局实现自下而上*/ 
    flex-direction: column;
    justify-content: flex-end;
}
.chatMain::-webkit-scrollbar {
    display: none;
}
.chat .chatBox .chatMain .flex .othersChatMsg{
    width:680px;
    margin:10px 0;
    padding:0 10px;
}
.chat .chatBox .chatMain .othersChatMsg label{
    float: left;
    width:40px;
    height:40px;
    border-radius: 100%;
}
.chat .chatBox .chatMain .othersChatMsg .main{
    float: left;
    margin-left: 10px;
}
.chat .chatBox .chatMain .othersChatMsg .main p{
    margin:0;
    padding:0;
    display: block; 
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    color:grey;
}
.chat .chatBox .chatMain .othersChatMsg .main div{
    padding:10px;
    border-radius: 5px;  
    font-size: 14px;
    width:500px;
    word-wrap: break-word;  
    white-space: pre-wrap;
}
.msgImg{
    width:200px;
    height:200px;
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.chat .chatBox .chatMain .flex .mineChatMsg {
    width:680px;
    margin:10px 0;
    padding:0 10px;

}
.chat .chatBox .chatMain .mineChatMsg label{
    float: right;
    width:40px;
    height:40px;
    border-radius: 100%;
}
.chat .chatBox .chatMain .mineChatMsg .main{
    float: right;
    margin-right: 10px;
}
.chat .chatBox .chatMain .mineChatMsg .main p{
    margin: 0;
    padding: 0;
    display: block; 
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    color:grey;
    text-align: right;  /* 字体靠右显示 */
}
.chat .chatBox .chatMain .mineChatMsg .main div{
    padding:10px;
    border-radius: 5px;  
    font-size: 14px;
    width:500px;
    word-wrap: break-word;
    text-align: right;
}
.chat .chatBox .chatBar .chatTool{
    width:690px;
    height:40px;
    padding-left: 10px;
}
.icon{
    display: flex;
    float:left;
    margin:0 5px;
}
.icon-path{
    height:40px;
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
    line-height: 40px;
    cursor: pointer;   
}
.icon .emoji{
    position: absolute;
    bottom:200px;
    left:10px;
    display: flex;
    flex-wrap: wrap;
    width:276px;
    height:218px;
    overflow:auto;
    background-color: #eee;
}
.emoji span{
    padding: 7px;
    cursor: pointer;
}
.imgLabel{
    height:25px;
    width:25px;
    margin:7.5px 15px; 
    float:left;
    background-image: url('/icon/picture-filling.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
    cursor: pointer;
}
.imgInput{
    display: none;
}
.chat .chatBox .chatInput{
    width:700px;
    height:150px;
}
.chat .chatBox .chatInput textarea{
    width:660px;
    height:100%;
    border:0;
    padding:0;
    margin:0 20px;
    background-color: rgb(245,245,245);
    font-size: 16px;
    resize: none;
}
.chat .chatMember{
    height:630px;
    width:171px;
    float: left;
    border-left: 1px solid #ccc;
}
.chatMember .title{
    display: block;
    height:40px;
    line-height: 40px;
    margin-left: 5px;
}
.identity{
    margin-left: 5px;
    font-size:14px;
    color:rgb(125, 125, 125)
}
.chatMember ul{
    margin: 0;
    padding: 0;
}
.memberInf{
    overflow: hidden;
    height:50px;
}
.memberInf:hover{
    background-color: #eee;
}
.memberInf label{
    float:left;
    width:30px;
    height:30px;
    border-radius: 100%;
    margin: 10px 5px;
}
.memberInf span{
    display: block;
    float:left;
    color:grey;
    height:50px;
    line-height: 50px;
    font-size: 14px;
}
</style>