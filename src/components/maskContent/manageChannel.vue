<template>
    <div class="changeInf">
        <div class="top">
            <div class="title">修改频道信息</div>
            <div class="close" @click="close()"></div>
        </div>
        <div class="main">
            <div class="avatarInput">
                <div class="avatar" :style="{ backgroundImage: 'url(' + adaptBgi + ')' }">
                    <div class="avatarMask" @click="chooseAvatar()" v-if="channelInfo.Chost == userInfo.Uid">
                        <div>
                            <input type="file" @change="onChange" accept="image/png, image/jpeg">
                        </div>
                    </div>
                </div>
            </div>
            <span class="t" v-if="channelInfo.Chost == userInfo.Uid">修改频道名</span>
            <div class="channelnameInput" v-if="channelInfo.Chost == userInfo.Uid">
                <span class="tip">频道名</span>
                <input type="text" v-model.lazy="channelName">
            </div>
            <span class="t">创建子板块(可选)</span>
            <div class="roomTypeInput">
                <select id="selectId" v-model="currentId" @change="roomTypechange">
                    <option v-for="(item,index) in productList" :key="index" :value=item.id v-text="item.val"></option>
                </select>
            </div>
            <div class="roomNameInput">
                <span class="tip">板块名</span>
                <input type="text" v-model.lazy="roomName">
            </div>
        </div>
        <div class="bottom">
            <div class="save" @click="upload">保存
                <div class="saveMask"></div>
            </div>
            <div class="cancel" @click="cancel">取消</div>
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
    const managechannelFlag = inject('managechannelFlag')

    const userCounter = useUserCounterStore()
    const channelCounter = useChannelCounterStore()
    const userInfo = toRaw(userCounter.userInfo)
    const channelInfo = toRaw(channelCounter.channel)

    const f = new FormData()

    // 适应backgroundImage
    const src = channelInfo.Cavatar
    let avatarChangeFlag = false
    const adaptBgi = ref(src)

    const channelName = ref(channelInfo.Cname)
    
    let currentId = 0
    const productList = [
        {id:0,val:'—————选择想要创建的板块类型—————'},
        {id:1,val:'讨论板块'},
        {id:2,val:'帖子板块'}
    ]
    const roomName = ref('')

    // 触发选择器
    const chooseAvatar = () => {
        const input = document.querySelector('.avatarInput input')
        input.click()
    }

    // 改变显示层
    const onChange = (e) => {
        if (e.target.files.length === 0) return;
        const file = e.target.files[0]
        if (!validateFile(file)) return;
        const reader = new FileReader()
        reader.onload = (e) => {
            adaptBgi.value = e.target.result
        }
        reader.readAsDataURL(file)
        f.append('avatar', file)
        avatarChangeFlag = true
    }

    // 验证file的合法性
    const validateFile = (file) => {
        const legalExts = ['.jpg', '.jpeg', '.bmp', '.webp', '.gif', '.png']
        const name = file.name.toLowerCase()
        if (!legalExts.some((ext) => name.endsWith(ext))) {
            alert('文件类型错误')
            return false
        }
        return true
    }

    const roomTypechange = (e) => {
        currentId = e.target.value
    }

    // 上传修改信息
    const upload = async () => {
        if (channelName.value == channelInfo.Cname && avatarChangeFlag == false && roomName.value == '' && currentId == 0) {   // 未修改
            close()
            return
        }
        if(channelName.value == ''){
            alert('频道名为空')
            return
        }
        if(roomName.value == '' && currentId != 0 || roomName.value != '' && currentId == 0){
            alert('房间信息缺失')
            let selectElem = document.getElementById('selectId');
            selectElem.value = 0
            currentId = 0
            roomName.value == ''
            return
        }
        
        if(channelName.value != channelInfo.Cname || avatarChangeFlag == true){
            f.append('Cid', channelInfo.Cid)
            f.append('oldchannelName',channelInfo.Cname)
            f.append('newchannelName', channelName.value)
            axios.post('http://localhost:3000/channelMethod/updateChannelInf', f).then(resp => {    //其实这里可以直接返回更改之后的数据(后来发现的优化点)
                if(resp.status == 202) {
                    return Promise.reject({ code: 202, msg: '频道名重复' })
                }else{
                    return refreshChannelInf()
                }
            }).then(resp => {
                alert('频道名更改成功')
                flag.value = false
                managechannelFlag.value = false
                router.go(0)
            }).catch(err => {
                if (err.code == 202) alert(err.msg)
                else alert('频道名更改失败')
                channelName.value = channelInfo.Cname
                adaptBgi.value = src
            })
        }
        
        if(roomName.value != '' && currentId != 0){
            const params = {
                currentId:currentId,
                roomName:roomName.value,
                Uid:userInfo.Uid,
                Cid:channelInfo.Cid,
                Cname:channelInfo.Cname
            }
            axios.post('http://localhost:3000/channelMethod/addRoom',{
                params:params
            }).then(resp => {
                if(resp.status == 202) {
                    return Promise.reject({ code: 202, msg: '频道名重复' })
                }else{
                    alert('子板块创建成功')
                    flag.value = false
                    managechannelFlag.value = false
                    router.go(0)
                }
            }).catch(err => {
                if (err.code == 202) alert(err.msg)
                else alert('更改失败')
                channelName.value = channelInfo.Cname
                adaptBgi.value = src
            })
        }
    }

    // 取消修改
    const cancel = () => {
        if (channelName.value == channelInfo.Cname && avatarChangeFlag == false && roomName.value == '' && currentId == 0) close()
        if (channelName.value != channelInfo.Cname || avatarChangeFlag == true || roomName.value != '' || currentId != 0) {
            const f = confirm("信息未保存，是否退出")
            if (f) {
                channelName.value = channelInfo.Cname
                avatarChangeFlag = false
                roomName.value = ''
                currentId = 0
                flag.value = false
                managechannelFlag.value = false
            }
        }
    }

    // 关闭遮罩层
    const close = () => {
        if (channelName.value == channelInfo.Cname && avatarChangeFlag == false && roomName.value == '' && currentId == 0){
            flag.value = false
            managechannelFlag.value = false
        }
        if (channelName.value != channelInfo.Cname || avatarChangeFlag == true || roomName.value != '' || currentId != 0) {
            const f = confirm("信息未保存，是否退出")
            if (f) {
                channelName.value = channelInfo.Cname
                avatarChangeFlag = false
                roomName.value = ''
                currentId = 0
                flag.value = false
                managechannelFlag.value = false
            }
        }
    }
    // 更新页面数据
    const refreshChannelInf = async () => {
        const params = {
            Cid: channelInfo.Cid
        }
        await axios.get('http://localhost:3000/api/userApi/queryChannelInf',{
            params: params
        }).then(resp => {
            resp.data[0].Cavatar = resp.data[0].Cavatar.replace("D:\\VScode\\workspace\\study\\server\\public", "http://127.0.0.1:3000")
            resp.data[0].Cavatar = resp.data[0].Cavatar.replaceAll('\\','//')
            channelCounter.channelChoose(resp.data[0])
        }).catch(err => {
            console.error(err);
        })
    }


</script>

<style scoped>
.changeInf {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 400px;
    height: 350px;
    overflow: hidden;
    border-radius: 10px;
    background-color: rgb(220, 220, 220);
}

.top {
    height: 30px;
    margin: 10px 10px 5px 10px;
    display: flex;
    justify-content: space-between
}

.title {
    line-height: 30px;
}

.close {
    margin-top: 5px;
    width: 20px;
    height: 20px;
    background-image: url('/icon/close.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.avatarInput {
    height: 100px;
}

.avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto;
    position: relative;
    border-radius: 100px;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.avatarMask {
    width: 100px;
    height: 100px;
    border-radius: 100px;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.3);
    cursor: pointer;
}

.avatarMask div {
    width: 40px;
    height: 40px;
    position: absolute;
    top: 30px;
    left: 30px;
    background-image: url('/icon/picture.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.avatarInput input {
    display: none;
}
.t{
    margin:5px 10px;
    font-size:14px;
}
.channelnameInput {
    height: 30px;
    margin: 5px 20px 5px 20px;
    border-radius: 5px;
    background-color: white;
}
.roomTypeInput{
    height: 30px;
    margin: 5px 20px 10px 20px;
    border-radius: 5px;
    background-color: white;
}
.roomTypeInput select{
    height: 30px;
    width: 340px;
    margin:0 10px;
    padding: 0;
    border: 0;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
}
.roomTypeInput select option{
    border: 0;
}
.roomNameInput{
    height: 30px;
    margin: 10px 20px 10px 20px;
    border-radius: 5px;
    background-color: white;
}

.tip {
    line-height: 30px;
    margin: 0 15px 0 10px;
}

.channelnameInput input {
    height: 30px;
    width: 280px;
    padding: 0;
    border: 0;
}
.roomNameInput input{
    height: 30px;
    width: 280px;
    padding: 0;
    border: 0;
}
.bottom {
    height: 30px;
    display: flex;
    justify-content: space-evenly
}

.save {
    height: 30px;
    width: 60px;
    border-radius: 5px;
    line-height: 30px;
    border: 1px solid rgb(220, 220, 220);
    text-align: center;
    color: white;
    background-color: #0099ff;
    cursor: pointer;
    position: relative
}

.saveMask {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 5px;
}

.saveMask:hover {
    background-color: rgba(1, 1, 1, 0.1);
}

.cancel {
    height: 30px;
    width: 60px;
    line-height: 30px;
    text-align: center;
    border: 1px solid black;
    border-radius: 5px;
    cursor: pointer;
}

.cancel:hover {
    background-color: rgb(205, 205, 205);
}
</style>