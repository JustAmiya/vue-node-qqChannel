import { ref,toRaw } from 'vue'
import {defineStore} from 'pinia'
import axios from 'axios'

export const usemsgCounterStore = defineStore('msgCounter',() => {
    const msgList = ref([])

    const judgeMsgSender = (myId,senderId) => {
        if(myId == senderId) return true
        return false
    }

    const msgListinit = async(initvalue,userid) => {
        msgList.value = []
        if(initvalue.length != 0){
            const newmsgList = []
            for (const value of initvalue){
                const params = {
                    Uid:value.Uid
                }
                await axios.get("http://localhost:3000/api/userApi/queryuserByUid",{
                    params:params
                }).then(resp => {
                    const msg = {
                        userid:resp.data[0].Uid,
                        username:resp.data[0].Uname,
                        userAvatar:resp.data[0].Uavatar,
                        chatMsg:value.Mcontent,
                        msgDate:value.Mdate,
                        img:value.Mimg,
                        isMe:judgeMsgSender(userid,resp.data[0].Uid)
                    }
                    msg.userAvatar = msg.userAvatar.replace('D:\\VScode\\workspace\\study\\server\\public','http://127.0.0.1:3000')
                    msg.userAvatar = msg.userAvatar.replaceAll('\\','//')
                    if(msg.img != null){
                        msg.img = msg.img.replace('D:\\VScode\\workspace\\study\\server\\public','http://127.0.0.1:3000')
                        msg.img = msg.img.replaceAll('\\','//')
                    }
                    newmsgList.push(msg)
                }).catch(err => {
                    console.log(err);
                })
            }
            msgList.value = newmsgList
            console.log(newmsgList);
        } 
        return msgList
    }

    return {msgList,msgListinit}
},{
    persist:{
        enabled:true
    }
})