<template>
    <div class="changeInf">
        <div class="top">
            <div class="title">创建频道</div>
            <div class="close" @click="close()"></div>
        </div>
        <div class="main">
            <div class="avatarInput">
                <div class="avatar" :style="{backgroundImage: 'url(' + adaptBgi + ')' }">
                    <div class="avatarMask" @click="chooseAvatar()">
                        <div>
                            <input type="file" @change="onChange" accept="image/png, image/jpeg">
                        </div>
                    </div>
                </div>
            </div>
            <div class="usernameInput">
                <span class="tip">频道名</span>
                <input type="text" v-model.lazy="channelName">
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
    import { useChannelCounterStore } from '../../stores/channelCounter'
    import { watch, toRaw, provide, ref, inject } from 'vue';
    import axios from 'axios';
    import { useRouter } from 'vue-router'

    const router = useRouter()

    //控制页面显示
    const flag = inject('flag')
    const newchannelFlag = inject('newchannelFlag')

    const userCounter = useUserCounterStore()
    const channelCounter = useChannelCounterStore()
    const userInf = toRaw(userCounter.userInfo)

    const f = new FormData()

    // 适应backgroundImage
    const src = ''
    const adaptBgi = ref(src)

    const channelName = ref('')
    let avatarChangeFlag = false

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

    // 上传修改信息
    const upload = async () => {
        if (channelName.value == '' || avatarChangeFlag == false) {
            alert('频道名或头像为空')
            return
        }
        f.append('Uid', userInf.Uid)
        f.append('channelName', channelName.value)
        axios.post('http://localhost:3000/channelMethod/newChannel', f).then(resp => {
            if (resp.status == 202) {
                return Promise.reject({ code: 202, msg: '频道名重复' })
            }else{
                alert('更改成功')
                close()
                router.go(0)
            }
        }).catch(err => {
            if (err.code == 202) alert(err.msg)
            else alert('更改失败')
            channelName.value = ''
            adaptBgi.value = src
        })
    }

    // 取消修改
    const cancel = () => {
        if (channelName.value == '' && avatarChangeFlag == false) close()
        if (channelName.value != '' || avatarChangeFlag == true) {
            const flag = confirm("信息未保存，是否退出")
            if (flag) {
                channelName.value = ''
                avatarChangeFlag = false
                flag.value = false
                newchannelFlag.value = false
            }
        }
    }

    // 关闭遮罩层
    const close = () => {
        if (channelName.value == '' && avatarChangeFlag == false){
            flag.value = false
            newchannelFlag.value = false
        }
        if (channelName.value != '' || avatarChangeFlag == true) {
            const f = confirm("信息未保存，是否退出")
            if (f) {
                channelName.value = ''
                avatarChangeFlag = false
                flag.value = false
                newchannelFlag.value = false
            }
        }
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