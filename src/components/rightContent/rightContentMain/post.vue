<template>
    <div class="post">
        <div class="header">
            <label></label>
            <span>{{ pr.prname }}</span>
        </div>
        <div class="main">
            <div class="postMain" :style=" !flag ?'initStyle':'changeStyle'">
                <ul class="postUl">
                    <li class="postLi" v-for="(item,index) in postListInf"  @click="browsePost(item,index)">
                        <div class="margin" :class="postChoosen==index?'chosen':''">
                            <div class="postInf" >
                                <label :style="{backgroundImage:'url('+ item.Uavatar +')'}"></label>
                                <div class="basicInf">
                                    <span class="username">{{ item.Uname }}</span>
                                    <span class="date">{{ item.postDate }}</span>
                                </div>
                            </div>
                            <div class="postContent">
                                <div :class="item.img.length > 0 ? 'contentMain' : 'noimg' ">
                                    <div class="postTitle">{{ item.postTitle }}</div>
                                    <div class="postText">{{ item.pText }}</div>
                                </div>
                                <img class="postImg" :src="postListInf[index].img[0]" v-if="item.img.length > 0 ? true : false"><!--需要v-if判断-->
                            </div>
                            <div class="postBottom">
                                <div class="like">
                                    <label :class="postListInf[index].likeUid.includes(userInfo.Uid)?'likePost':'unlikePost'" @click="changeLike(item,index)"></label>
                                    <span>{{ item.likeUid.length }}</span>
                                </div>
                                <div class="comment">
                                    <label></label>
                                    <span>{{ item.comment.length }}</span>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="detailedContent" v-if="flag">
                <div class="">
                    <div class="postDetailePart" v-if="postDetailFlag">
                        <div class="detaileTop">
                            <div class="type">查看帖子</div>
                            <div class="close" @click="close()"></div>
                        </div>
                        <div class="white">
                            <div class="inf">
                                <div class="title">{{ detail.postTitle }}</div>
                                <div class="writerInf">
                                    <label :style="{backgroundImage:'url('+ detail.Uavatar +')'}"></label>
                                    <div class="writerName">{{ detail.Uname }}</div>
                                    <span style="margin:0 5px;float: left">|</span>
                                    <div class="postdate">{{ detail.postDate }} 发表了帖子</div>
                                </div>
                            </div>
                            <div class="detailMain" v-html=detail.postContent></div>
                            <div class="detailComment">
                                <div class="commentArea">
                                    <img class="avatar" :src="userInfo.Uavatar">
                                    <div class="text" :style="{height:commentBtn ? '150px':'30px'}">
                                        <textarea class="area" :style="{height:commentBtn ? '100px':'20px'}" placeholder="请输入评论" @focus="onFocus()" @blur="onBlur()" tabindex="-1"  v-model.lazy="commentMsg" ></textarea>
                                        <div class="submit" v-if="commentBtn" @click="commentSubmit(detail)">提交</div>
                                    </div>
                                </div>
                                <div class="gross">评论&nbsp{{ detail.comment.length }}</div>
                                <ul>
                                    <li v-for="(item,index) in detail.comment">
                                        <div class="commentUserInf">
                                            <label :style="{backgroundImage:'url('+ item.Uavatar +')'}"></label>
                                            <div class="commentUserName">{{ item.Uname }}</div>
                                        </div>
                                        <div class="commentText">{{ item.commentText }}</div>
                                        <div class="downInf">
                                            <span class="commentdate">{{ item.commentDate }}</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="postWritePart" v-if="editorFlag">
                        <div class="detaileTop" style="margin:0 10px">
                            <div class="type" >发布帖子</div>
                            <div class="close" @click="close()"></div>
                        </div>
                        <div>
                            <Toolbar :editor="editorRef" :mode="mode" :defaultConfig="toolbarConfig"></Toolbar>
                            <textarea class="editorTitle" placeholder="输入标题" v-model="editorTitle"></textarea>
                            <Editor style="height:430px;overflow-y:hidden;padding:0 7px;" :mode="mode" v-model="valueHTML" :defaultConfig="editorConfig" @onCreated="handleCreated"></Editor>
                        </div>
                        <div class="editorBottom">
                            <div class="sendPost" @click="releasePost">发布帖子</div>
                        </div>
                    </div>
                </div>
                
            </div>
            <div class="postEditorBtn" v-if="editorBtnFlag" @click="showEditorPage"></div>
        </div>
        
    </div>

</template>

<script setup>
    import {ref,watch,toRaw,shallowRef,onBeforeUnmount,onBeforeMount} from 'vue'
    import axios from 'axios'
    import {Editor,Toolbar} from '@wangeditor/editor-for-vue'
    import '@wangeditor/editor/dist/css/style.css'
    import { useChannelCounterStore } from '@/stores/channelCounter'
    import { useUserCounterStore } from '@/stores/userCounter'
    import {useRouter} from 'vue-router'

    const router = useRouter()
    
    const userCounter = useUserCounterStore()
    const channelCounter = useChannelCounterStore()

    const userInfo = toRaw(userCounter).userInfo
    const pr = toRaw(channelCounter.postroom)
    const querypostlistParams = {
        postroomId:pr.prid
    }

    const postListInf = ref([])
    let postInf = {
        Uid:null,
        Uavatar:null,
        Uname:null,
        postId:null,
        postTitle:null,
        postContent:null,
        postDate:null,
        like:0,
        comment:0,
        img:[],
    }
    const imgPath = ref(null)

    const flag = ref(false)
    const editorFlag = ref(false)
    const postDetailFlag = ref(false)
    const editorBtnFlag = ref(true)
    const postChoosen = ref(null)

    const editorTitle = ref(null)

    let detail = ref({})
    const commentMsg = ref('')
    const commentBtn = ref(false)


    // 配置富文本编辑器
    const editorRef = shallowRef()    // 编辑器实例
    const valueHTML = ref('<p>hello</p>')   // 内容HTML
    const editorConfig = {           // 配置编辑栏
        MENU_CONF: {},
        placeholder: '请输入内容...',
        hoverbarKeys:{    // 通过type配置某种元素的编辑栏,如果不想显示数组就置空
            'image':{
                menuKeys:[]
            },
            'text':{
                menuKeys:["bold","underline","italic"]
            }
        },
        
    } 
    const mode = 'simple' // 简洁模式，可以隐藏选中文本时的hoverbar
    //配置工具栏
    const toolbarConfig = {
        toolbarKeys:[
            "bold",
            "underline",
            "italic",
            "|",
            {
                iconSvg: "<svg viewBox=\"0 0 1024 1024\"><path d=\"M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z\"></path></svg>",
                key: "group-image",
                menuKeys: ['uploadImage'],
                title: "图片"
            }
        ]
    }
    //配置上传图片
    editorConfig.MENU_CONF['uploadImage'] = {
        fieldName:'postImg',
        server:'http://localhost:3000/channelMethod/uploadImg',
        maxNumberOfFiles: 1,
        maxFileSize: 20 * 1024 * 1024,
        allowedFileTypes: ['image/*'],
        meta:{
            channelid:'1',
            postroomid:'2',
        },
        
        onSuccess(file,res){
            console.log('success',file,res);
        },
        onProgress(progress){
            console.log('progress',progress);
        },
        onFailed(file, res){
            console.log('fail',file,res);
        },
        onError(file, err, res){
            console.log('err',file,err,res);
        },
        onBeforeUpload(file){
            return file
        },

        customInsert:(res,insertFn) => {
            const data = res.data
            const {url} = data 
            insertFn(url)
        },
    }

    // 记录editor实例
    const handleCreated = (editor) => {
        editorRef.value = editor
    }
    // 销毁编辑器
    const destroyEditor = () => {
        const editor = editorRef.value
        if(editor == null) return
        editor.destroy()
    }
    // 组件销毁时销毁编辑器  
    onBeforeUnmount(() => {
        destroyEditor()
    })
    
    

    //控制页面格式
    const initStyle = {
        width:"100%"
    }
    const changeStyle = {
        width:"50%"
    }
    //控制页面改变
    const browsePost = (item,index) => {
        flag.value = true
        postDetailFlag.value = true
        editorFlag.value = false
        editorBtnFlag.value = false

        postChoosen.value = index
        detailInf(item)
    }
    const close = () => {
        flag.value = false
        editorFlag.value = false
        postDetailFlag.value = false
        editorBtnFlag.value = true

        postChoosen.value = null
    }
    const showEditorPage = () => {
        flag.value = true
        editorFlag.value = true
        postDetailFlag.value = false
        editorBtnFlag.value = false
    }

    // 提交数据
    const releasePost = async() => {
        if(editorTitle.value == null || editorTitle.value.trim() == ""){
            alert("标题不能为空")
            editorTitle.value = null
        }else{
            let nowDate = new Date()
            let localDate = nowDate.toLocaleString()
            const html = editorRef.value.getHtml()
            const posttext = editorRef.value.getText()
            const piclist = editorRef.value.getElemsByType('image')
            const finalPicnameList = []
            if(piclist.length > 0){
                for(const id in piclist){
                    finalPicnameList.push(piclist[id].src.split('//')[3])
                }
            }
            
            const params = {
                title:editorTitle.value,
                text:posttext,
                contentlabel:html,
                Uid:toRaw(userCounter.userInfo).Uid,
                channelName:toRaw(channelCounter.channel).Cname,
                prid:toRaw(channelCounter.postroom).prid,
                pdate:localDate,
                imgPath:imgPath.value,
                finalpicList:finalPicnameList,
            }
            await axios.get('http://localhost:3000/channelMethod/handleContent',{
                params:params
            }).then(resp => {
                if(resp.status == 200){
                    alert("帖子发送成功！")
                    close()
                    router.go(0)
                }
            }).catch(err => {
                console.error(err);
            })

        }
    }

    // 查询历史帖子
    axios.get('http://localhost:3000/api/userApi/querypostlistByPRid',{  // 获取帖子基本信息
        params:querypostlistParams
    }).then(resp => {
        const plist = resp.data
        let data = []
        let tempList = []
        let pidList = []
        for(const id in plist){
            let tempInf = {
                Uid:null,
                Uavatar:null,
                Uname:null,
                postId:null,
                postTitle:null,
                pText:null,
                postContent:null,
                postDate:null,
                likeUid:[],
                comment:[],
                img:[],
            }
            data.push(plist[id].Uid)
            tempInf.postId = plist[id].pid
            tempInf.postTitle = plist[id].ptitle
            tempInf.pText = plist[id].ptext
            tempInf.postContent = plist[id].pcontent
            tempInf.postDate = plist[id].pdate

            changeUrl(tempInf)

            pidList.push(plist[id].pid)
            tempList.push(tempInf)
        }
        return getPostImg(pidList,data,tempList)    
    }).then(resp => {                                                    // 获取帖子图片信息
        return getPostLike(resp.pidList,resp.uidList,resp.tempList)
    }).then(resp => {                                                    // 获取帖子点赞信息
        return getPostComment(resp.pidList,resp.uidList,resp.tempList)
    }).then(resp => {                                                    // 获取帖子评论信息

        return getUserInf(resp.uidList,resp.tempList)
    }).then(resp => { 
        let tempList = resp.tempList
        let data = resp.data
        for(const id in data){
            tempList[id].Uid = data[id].Uid
            tempList[id].Uavatar = data[id].Uavatar
            tempList[id].Uname = data[id].Uname       
        }
        postListInf.value = tempList
        channelCounter.postListChange(postListInf.value)
    }).catch(err => {
        console.error(err);
    })


    // 获取帖子图片信息
    const getPostImg = async(pidList,uidList,tempList) => {
        for(const id in pidList){
            const params = {
                pid:pidList[id]
            }
            await axios.get('http://localhost:3000/api/userApi/querypostImgByPid',{
                params:params
            }).then(resp => {
                const data = resp.data
                if(data.length > 0){
                    for(const index in data){
                        const url = data[index].postImgUrl
                        const res = url.replace("D:\\VScode\\workspace\\study\\server\\public","http://127.0.0.1:3000")     
                        tempList[id].img.push(res)
                    } 
                }     
            }).catch(err => {
                return err
            })
        }
        return {pidList,tempList,uidList}
    }

    // 获取发贴用户信息
    const getUserInf = async(uidList,tempList) => {
        let data = []
        for(const param in uidList){
            await axios.get('http://localhost:3000/api/userApi/queryuserByUid',{
                params:{Uid:uidList[param]}
            }).then(resp => {
                resp.data[0].Uavatar = resp.data[0].Uavatar.replace("D:\\VScode\\workspace\\study\\server\\public","http://127.0.0.1:3000")
                resp.data[0].Uavatar = resp.data[0].Uavatar.replaceAll("\\","//")
                data.push(resp.data[0])
            }).catch(err => {
                return err
            })
        }
        return {data,tempList}
    }

    // 获取帖子的点赞信息
    const getPostLike = async(pidList,uidList,tempList) => {
        for(const id in pidList){
            const params = {
                pid:pidList[id],
                Uid:uidList[id]
            }
            await axios.get('http://localhost:3000/api/userApi/querylike',{
                params:params
            }).then(resp => {
                const data = resp.data
                for(const index in data){
                    tempList[id].likeUid.push(data[index].Uid)
                }
            }).catch(err => {
                return err
            })
        }
        return {pidList,uidList,tempList}
    }

    // 获取帖子评论信息(写的不好)
    const getPostComment = async(pidList,uidList,tempList) => {
        for(const id in pidList){
            const params = {
                pid:pidList[id]
            }
            
            await axios.get('http://localhost:3000/api/userApi/querycomment',{
                params:params
            }).then(resp => {
                const data = resp.data
                const uidList = []
                for(const index in data){
                    const temp = {
                        Uid:null,
                        Uname:undefined,
                        Uavatar:null,
                        pid:null,
                        commentText:undefined,
                        commentDate:undefined
                    }
                    temp.Uid = data[index].Uid
                    temp.pid = data[index].pid
                    temp.commentText = data[index].pctext
                    temp.commentDate = data[index].pcdate
                    
                    uidList.push(data[index].Uid)
                    tempList[id].comment.push(temp)
                }
                return getCommentUser(uidList,tempList,id)
            }).catch(err => {
                return err
            })
        }
        return {uidList,tempList}
    }

    // 获取发评论的用户信息(这里写的不好，重复请求数据库了
    const getCommentUser = async(uidList,tempList,id) => {
        for(const index in uidList){
            const params = {
                Uid:uidList[index]
            }
            await axios.get('http://localhost:3000/api/userApi/queryuserByUid',{
                params:params
            }).then(resp => {
                const data = resp.data
                const t = tempList[id].comment[index]
                t.Uname = data[0].Uname
                data[0].Uavatar = data[0].Uavatar.replace("D:\\VScode\\workspace\\study\\server\\public","http://127.0.0.1:3000")
                data[0].Uavatar = data[0].Uavatar.replaceAll("\\","//")
                t.Uavatar = data[0].Uavatar
            }).catch(err => {
                console.error(err);
            })
        }
    }

    // pinia存放选中帖子
    const detailInf = (postInf) => {
        channelCounter.postChoose(postInf)
        detail.value = toRaw(channelCounter.post)
    }

    // 修改postContent的图片src
    const changeUrl = (tempInf) => {
        const ch = toRaw(channelCounter.channel)
        const pr = toRaw(channelCounter.postroom)
        tempInf.postContent = tempInf.postContent.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
            const realsrc = capture.replace('tempDir',`postUploadImg//${ch.Cname}//${pr.prid}//${tempInf.postId}`)

            return "<img src='" + realsrc + "' style='max-width: 396px;max-height:396px;background-repeat: no-repeat;background-position:center;background-size:cover;'>"
        });
    }

    // 用户点赞/取消点赞
    const changeLike = async(item,index) => {
        const uid = userInfo.value.Uid
        const flag = postListInf.value[index].likeUid.includes(uid)
        const params = {
            pid:postListInf.value[index].postId,
            Uid:uid
        }
        try{
            if(flag){
                postListInf.value[index].likeUid = postListInf.value[index].likeUid.filter(item => item !== uid)
                await shallowPackAxios('http://localhost:3000/api/userApi/deletelike',params)
            }else{
                postListInf.value[index].likeUid.push(uid)
                await shallowPackAxios('http://localhost:3000/api/userApi/insertlikeInf',params)
            }
        }catch(err){
            console.err(err);
        }
    }

    // 提交评论
    const onFocus = () => {
        commentBtn.value = true
    }
    const onBlur = () => {
        if(commentMsg.value == ''){
            commentBtn.value = false
        }
    }
    const commentSubmit = async(item) => {
        let nowDate = new Date()
        let localDate = nowDate.toLocaleString()
        const params = {
            pctext:commentMsg.value,
            pcdate:localDate,
            pid:item.postId,
            Uid:userInfo.value.Uid,
        }
        try{
            const res = await shallowPackAxios('http://localhost:3000/api/userApi/insertcomment',params)
            const obj = {
                Uid:item.Uid,
                Uname:item.Uname,
                commentDate:localDate,
                commentText:commentMsg.value,
                pid:item.postId
            }
            postListInf.value[postChoosen.value].comment.push(obj)
        }catch(err){
            console.error(err)
        }finally{
            commentMsg.value = ''
            commentBtn.value = false
        }
    }

    // 套皮axios
    const shallowPackAxios = (path,params) => {
        return axios.get(path,{
            params:params
        }).then(resp => {
            return resp
        }).catch(err => {
            return err
        })
    }

    
</script>

<style scoped> 
.post{
    background-color: #eee;
    height:700px;
    width:872px;
}
.post .header{
    width:872px;
    height:69px;
    border-bottom: 1px solid #ccc;
    position:relative;
}
.post .header label{
    position: absolute;
    bottom:5px;
    left:20px;
    width:30px;
    height:30px;
    background-image: url('/icon/post.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.post .header span{
    display: block;
    position: absolute;
    bottom:5px;
    left:60px;
    height:30px;
    line-height: 30px;
    font-weight: bold;
    font-size: 20px;
}
.post .main{
    height:630px;
    width:872px;
    position:absolute;
    display: flex;
}
.postMain{
    height:630px;
    width:100%;
    overflow: scroll;
}
.postMain::-webkit-scrollbar{
    display: none;
}
.margin{
    padding:10px 20px 15px 20px;
    margin:0 auto;
    border-radius: 10px;
}
.postUl{
    margin:0 auto;
    margin-bottom:10px;
    width:80%;
}
.postUl .postLi{
    margin-top:20px;
    height:200px;
    border-radius: 10px;
    background-color: #fff;
}
.chosen{
    background-color: rgb(211, 211, 211);
}
.postInf{
    height:30px;
}
.basicInf{
    height:30px;
    line-height: 30px;
}
.postInf label{
    float: left;
    width:30px;
    height:30px;
    border-radius: 30px;
    background-color: grey;
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.postInf div{
    padding-left: 40px;
}
.username{
    font-size: 18px;
}
.date{
    float: right;
    font-size: 14px;
    color:rgb(155, 155, 155)
}
.postContent{
    margin:10px 0 15px 0;
    height:100px;
    display: flex;
    justify-content: space-between;
}
.contentMain{
    height:100px;
    width:75%;
}
.noImg{
    height:100px;
    width:100%
}
.postTitle{
    font-size: 20px;
    height:30px;
    line-height: 30px;
}
.postText{
    margin-right:10px;
    line-height: 150%;
    color:rgb(139, 139, 139);

    display: -webkit-box;   /* 固定高度多行文本超出显示省略号 */
    text-overflow:ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;  /* 如果超出3行还有文字会显示，这是个bug，不过我设置的高度最多支持3行，溢出直接hidden */
    overflow: hidden;
    word-break: break-all;
    
}
.postImg{
    width:150px;
    min-width: 150px;
    background-repeat: no-repeat;
    object-position: 50% 50%;
    object-fit: contain;
}
.postBottom{
    height:20px;
    line-height:20px;
    display: flex;
}
.postBottom label{
    float:left;
    height:20px;
    width:20px;
    margin-right:5px;
    
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}

.comment{
    margin-left:10px;
}
.unlikePost{
    background-image: url('/icon/like.svg');
}
.likePost{
    background-image: url('/icon/like_fill.svg');
}
.comment label{
    background-image: url('/icon/comment.svg');
}
.postBottom span{
    font-size: 14px;
    color:rgb(139, 139, 139);
}
.detailedContent{
    width:50%;
    min-width:50%;
    background-color: #fff;
    margin: 20px 10px 20px 0;
    border-radius: 10px;
    overflow: scroll;
    transition:0.2s;
}
.detailedContent::-webkit-scrollbar{
    display: none;
}
.postDetailePart{
    width:100%;
    padding:10px 0;
}
.detaileTop{
    height:30px;
    line-height: 30px;
    margin: 0 20px;
    display: flex;
    align-items: center;
    justify-content:space-between
}
.type{
    float:left;
}
.close{
    width:20px;
    height:20px;
    float: right;
    float:right;
    background-image: url('/icon/close.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.white{
    margin:10px 20px;
}
.inf{
    height:50px;
}
.title{
    height:30px;
    line-height: 30px;
    font-size: 24px;
}
.writerInf{
    margin-top:10px;
    height:20px;
}
.writerInf label{
    height:20px;
    width:20px;
    border-radius: 20px;
    float:left;
    background-color: grey;
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.writerName{
    float:left;
    height:20px;
    line-height: 20px;
    margin-left:5px;
    font-size:14px;
}
.postdate{
    float:left;
    height:20px;
    line-height: 20px;
    font-size:14px;
    color:rgb(139, 139, 139)
}
.detailMain{
    margin:20px 0;
    min-height:100px;
    font-size:14px;
    white-space: pre-wrap;
    word-break: break-all;
}
.commentArea{
    display: flex;
}
.avatar{
    width:30px;
    height:30px;
    border-radius: 30px;
    background-color: grey;
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
}
.text{
    width: 356px;
    margin-left: 10px;
    border-radius: 5px;
    background-color: #eee;
    position:relative;
}
.area{
    margin: 5px 10px;
    padding:0;
    width:346px;
    font-size: 14px;
    border: none;
    resize: none;
    background-color: #eee;
}
.area::-webkit-scrollbar{
    display: none;
}
.submit{
    height:25px;
    width:50px;
    position:absolute;
    bottom:5px;
    right:5px;
    border-radius: 5px;
    color:white;
    text-align: center;
    line-height: 25px;
    font-size:14px;
    cursor: pointer;
    background-color: blue;
}
.gross{
    height:18px;
    line-height: 18px;
    font-size: 14px;
    margin:15px 0;
}
.commentUserInf{
    height:20px;
}
.commentUserInf label{
    height:20px;
    width:20px;
    border-radius: 20px;
    background-color: grey;
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
    float:left;
}
.commentUserName{
    height:20px;
    line-height: 20px;
    float:left;
    margin-left:5px;
    font-size: 14px;
}
.commentText{
    margin:10px 25px;
    white-space: pre-wrap;
    word-break: break-all;
    font-size:14px;
}
.downInf{
    height:20px;
    line-height: 20px;
}
.commentdate{
    float:right;
    font-size: 14px;
}
.postWritePart{
    width:100%;
    padding:10px 0;
}
.editorTitle{
    margin:0 17px;
    padding:0;
    height:30px;
    width:402px;
    line-height:30px;
    font-size:20px;
    font-weight: bold;
    border:none;
    outline: none;
    resize: none;
}
.editorBottom{
    margin:10px 10px 0 0;
    height:30px;
    line-height: 30px;
}
.sendPost{
    height:30px;
    font-size:14px;
    float:right;
}
.postEditorBtn{
    position:absolute;
    width:30px;
    height:30px;
    right:20px;
    bottom:30px;
    border-radius: 30px;
    /* background-color: #fff; */
    background-image: url('/icon/add_grey.svg');
    background-repeat: no-repeat;
    background-position:center;
    background-size:cover;
    transition: 0.2s;
}
.postEditorBtn:hover{
    transform:scale(1.05);
    box-shadow: 0 0 10px grey;
}
/* .w-e-bar .w-e-hover-bar .w-e-bar-bottom .w-e-bar-show{
    display: none;
} */
</style>