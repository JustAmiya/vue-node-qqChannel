import { defineStore } from "pinia";
import {ref} from 'vue'

export const useChannelCounterStore = defineStore('channelCounter',() => {
    const channelList = ref(null)      // 频道列表
    const channel = ref(null)          // 当前选中的频道
    const channelUserInf = ref([])     // 当前选中频道的成员信息
    const chatroomList = ref(null)     // 聊天室列表
    const chatroom = ref(null)         // 当前选中的聊天室(也可能是上一次的选择
    const postroomList = ref(null)     // 帖子板块列表
    const postroom = ref(null)         // 当前选中的帖子板块(也可能是上一次的选择
    const postList = ref(null)         // 帖子板块中的帖子列表
    const post = ref(null)             // 当前选中的帖子

    const channelListChange = (newval) => {
        channelList.value = newval
    }

    const channelChoose = (newval) => {
        channel.value = newval
    }

    const channelUserInfChange = (newval) => {
        channelUserInf.value = newval
    }

    const chatroomListChange = (newval) => {
        chatroomList.value = newval
    }

    const chatroomChoose = (newval) => {
        chatroom.value = newval
    }

    const postroomListChange = (newval) => {
        postroomList.value = newval
    }

    const postroomChoose = (newval) => {
        postroom.value = newval
    } 

    const postListChange = (newval) => {
        postList.value = newval
    }

    const postChoose = (newval) => {
        post.value = newval
    }

    return {channelList,channel,channelUserInf,chatroomList,chatroom,postroomList,postroom,postList,post,channelListChange,channelChoose,channelUserInfChange,chatroomListChange,chatroomChoose,postroomListChange,postroomChoose,postListChange,postChoose}
},{
    persist:{
        enabled:true
    }
})