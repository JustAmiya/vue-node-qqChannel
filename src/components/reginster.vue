<template>
    <body>
        <div class="reginsterDiv">
            <div class="title">Reginster the account</div>
            <div class="content">
                <div class="name">
                    <span>Name:</span>
                    <input class="nameInput" type="text" placeholder="Input your name" v-model="name" @blur="onblur"><br>
                </div>
                <div class="psw">
                    <span>Password:</span>
                    <input class="passwordInput" type="password" placeholder="Input your password" v-model="psw" @blur="onblur">
                </div>
                <div class="avatarChoose">
                    <span>choose your avatar:</span>
                    <div class="flex">
                        <div v-for="item,index in avatar">
                            <label class="avatarList" :class="{border:index==id}" tabindex="1" :style="{background:'url('+item+')',backgroundRepeat: 'no-repeat',backgroundPosition:'center',backgroundSize:'cover'}" @click="avatarChoose(index)"></label>
                        </div>
                    </div>
                </div>
                
                <div class="btn">
                    <button @click="submit">submit</button>
                </div>
                
                
            </div>            
        </div>
    </body>
    
</template>

<script setup>
    import { ref } from 'vue';
    import {useRouter} from 'vue-router'
    import axios from 'axios'
    const router = useRouter()
    const avatar = [
        "icon/male.svg",
        "icon/female.svg"
    ]
    let name = ref("")
    let psw = ref("")
    const avatarFlag = ref(false)
    let id = ref(-1);
    const userInf = {
        username:name.value,
        userpassword:psw.value,
        useravatar:-1
    }
    //选择头像
    const avatarChoose = (index) => {
        id.value = index;
        userInf.useravatar = index
        avatarFlag.value = !avatarFlag.value
    }
    //input失焦触发
    const onblur = () =>{
        userInf.username = name.value
        userInf.userpassword = psw.value
    }

    const submit = () => {
        if(userInf.username.trim()=="" && userInf.userpassword.trim() == "" && userInf.useravatar==null){
            alert("No enough information")
        }else if(userInf.useravatar==-1){
            alert("No avatar")
            name.value = ""
            userInf.username = ""
            psw.value = ""
            userInf.userpassword = ""
        }else if(userInf.username.trim()==""){
            alert("No name")
            id.value = -1
            userInf.useravatar = -1
            psw.value = ""
            userInf.userpassword = ""
        }else if(userInf.userpassword.trim() == ""){
            alert("No password")
            id.value = -1
            userInf.useravatar = -1
            name.value = ""
            userInf.username = ""
        }
        if(userInf.username.trim()!="" && userInf.useravatar!=-1 && userInf.userpassword.trim()!=""){
            axios.post("http://localhost:3000/channelMethod/userInfInit",{
                headers:{
                    "Content-type":"application/json"
                },
                data:userInf
            }).then(resp => {
                alert(resp.data)
                if(resp.status == 200){
                    router.push('/login')
                }else{
                    return Promise.reject(err)
                }
            }).catch(err => {
                alert("注册失败",err)
                name.value = ''
                psw.value = ''
                userInf.useravatar = -1
                id.value = -1
            })
        }  
    }
</script>

<style scoped>
    body{
        width:480px;
        margin:10px auto;
        text-align: center;
    }
    .reginsterDiv{
        height: 500px;
        background-color: #eee;
        overflow: hidden;
        position:relative;
    }
    .title{
        height:100px;
        margin-top: 40px;
        font-size: 25px;
        font-weight: bolder; 
    }
    .content{
        width:480px;
        height: 400px;
    }
    .name{
        margin-bottom:10px;
    }
    .flex{
        display: flex;
        flex:1;
        justify-content: center;
    }
    .btn{
        position:flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .avatarChoose{
        margin-top:20px;
    }
    .avatarList{
        float:left;
        height:40px;
        width:40px;
        border-radius: 100%;
        margin:5px;
    }
    .border{
        border:1px solid aqua;
    }
    .nameInput{
        width:200px;
        height:35px;
        margin-left:10px;
        border: 0;
        border-radius: 5px;
    }
    .passwordInput{
        width:200px;
        height:35px;
        margin-left:10px;
        border: 0;
        border-radius: 5px;  
    }
</style>