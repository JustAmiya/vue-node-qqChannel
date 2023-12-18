<template>
    <div class="changeInf">
        <div class="top">
            <div class="title">修改个人信息</div>
            <div class="close" @click="close()"></div>
        </div>
        <div class="main">
            <div class="avatarInput">
                <div class="avatar" :style="{ backgroundImage: 'url(' + adaptBgi + ')' }">
                    <div class="avatarMask" @click="chooseAvatar()">
                        <div>
                            <input type="file" @change="onChange" accept="image/png, image/jpeg">
                        </div>
                    </div>
                </div>
            </div>
            <div class="usernameInput">
                <span class="tip">昵称</span>
                <input type="text" v-model.lazy="nickname">
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
    import { watch,toRaw,provide,ref,inject } from 'vue';
    import axios from 'axios';
    import {useRouter} from 'vue-router'

    const router = useRouter()

    const flag = inject('flag')
    const changeuInfFlag = inject('changeuInfFlag')

    const userCounter = useUserCounterStore()
    const userInf = toRaw(userCounter.userInfo)

    const f = new FormData()

    // 适应backgroundImage
    const src = userInf.Uavatar.replaceAll('\\','//')
    const adaptBgi = ref(src)

    const nickname = ref(userInf.Uname)
    let avatarChangeFlag = false

    // 触发选择器
    const chooseAvatar = () => {
        const input = document.querySelector('.avatarInput input')
        input.click()
    }

    // 改变显示层
    const onChange = (e) => {
        if(e.target.files.length === 0) return;
        const file = e.target.files[0]
        if(!validateFile(file)) return;
        const reader = new FileReader()
        reader.onload = (e) => {
            adaptBgi.value = e.target.result
        }
        reader.readAsDataURL(file)
        f.append('avatar',file)
        avatarChangeFlag = true
    }

    // 验证file的合法性
    const validateFile = (file) => {
        const legalExts = ['.jpg','.jpeg','.bmp','.webp','.gif','.png']
        const name = file.name.toLowerCase()
        if(!legalExts.some((ext) => name.endsWith(ext))){
            alert('文件类型错误')
            return false
        }
        return true
    }

    // 上传修改信息
    const upload = async() => {
        if(nickname.value == userInf.Uname && avatarChangeFlag == false){   // 未修改
            close()
            return
        }
        if(nickname.value == ''){
            alert('昵称为空')
            return
        }
        f.append('Uid',userInf.Uid)
        f.append('nickname',nickname.value)
        axios.post('http://localhost:3000/channelMethod/userInfChange',f).then(resp => {    //其实这里可以直接返回更改之后的数据(后来发现的优化点)
            if(resp.status == 202){
                return Promise.reject({code:202,msg:'用户名重复'})
            }
            return refreshUserInf()
        }).then(resp => {
            alert('更改成功')
            close()
            router.go(0)
        }).catch(err => {
            if(err.code == 202) alert(err.msg)
            else alert('更改失败')
            nickname.value = userInf.Uname
            adaptBgi.value = src
        })
    }

    // 取消修改
    const cancel = () => {
        if(nickname.value == userInf.Uname && avatarChangeFlag == false) close()
        if(nickname.value != userInf.Uname || avatarChangeFlag == true){
            const flag = confirm("信息未保存，是否退出")
            if(flag){
                nickname.value = userInf.Uname
                avatarChangeFlag = false
                flag.value = false
                changeuInfFlag.value = false
            }
        }
    }

    // 关闭遮罩层
    const close = () => {
        if(nickname.value == userInf.Uname && avatarChangeFlag == false){
            flag.value = false
            changeuInfFlag.value = false
        }
        if(nickname.value != userInf.Uname || avatarChangeFlag == true){
            const f = confirm("信息未保存，是否退出")
            if(f){
                nickname.value = userInf.Uname
                avatarChangeFlag = false
                flag.value = false
                changeuInfFlag.value = false
            }
        }
        
    }
    // 更新页面数据
    const refreshUserInf = async() => {
        const params = {
            Uid:userInf.Uid
        }
        await axios.get('http://localhost:3000/api/userApi/queryuserByUid',{
            params:params
        }).then(resp => {
            resp.data[0].Uavatar = resp.data[0].Uavatar.replace("D:\\VScode\\workspace\\study\\server\\public","http://127.0.0.1:3000")
            userCounter.infoChange(resp.data[0])
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
    margin: 10px;
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

.usernameInput {
    height: 30px;
    margin: 20px 20px 10px 20px;
    border-radius: 5px;
    background-color: white;
}

.tip {
    line-height: 30px;
    margin: 0 15px 0 10px;
}

.usernameInput input {
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