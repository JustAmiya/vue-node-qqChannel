<template>
    <body>
        <div class="loginDiv">
            <div class="title">Welcome to channel</div>
            <div class="content">
                <div class="name">
                    <span>Name:</span>
                    <input class="nameInput" type="text" placeholder="Input your name" v-model="name" @blur="onblur"><br>
                </div>
                <div class="psw">
                    <span>Password:</span>
                    <input class="passwordInput" type="password" placeholder="Input your password" v-model="psw" @blur="onblur">
                </div>
                
                
                <div class="btn">
                    <button @click="submit">submit</button>
                    <button @click="reginster">reginster</button>
                </div>
            </div>            
        </div>
    </body>
    
</template>

<script setup>
    import { ref } from 'vue';
    import {useRouter} from 'vue-router'
    import axios from 'axios'
    import {useUserCounterStore} from '@/stores/userCounter'

    const router = useRouter()
    const userCounter = useUserCounterStore()

    let name = ref("")
    let psw = ref("")
    const userInf = {
        username:name.value,
        userpassword:psw.value,
    }
    //input失焦触发
    const onblur = () =>{
        userInf.username = name.value
        userInf.userpassword = psw.value
    }
    //提交表单
    const submit = () => {
        if(userInf.username.trim()== "" && userInf.userpassword.trim() == ""){
            alert("No name and password")
        }else if(userInf.userpassword.trim() == ""){
            alert("No password")
            name.value = ""
            userInf.username = ""
        }else if(userInf.username.trim()==""){
            alert("No name")
            psw.value = ""
            userInf.userpassword = ""
        }
        if(userInf.username.trim()!="" || userInf.useravatar.trim()!=""){
            axios("http://localhost:3000/userMethod/login",{
                method:"POST",
                headers:{
                    "Content-type":"application/json"
                },
                data:JSON.stringify(userInf)
            }).then(resp => {
                console.log(resp);
                if(resp.status == 200){
                    sessionStorage.setItem('token',resp.data.token)
                    const userInf = resp.data.userInf[0]
                    userInf.Uavatar = userInf.Uavatar.replace("D:\\VScode\\workspace\\study\\server\\public","http://127.0.0.1:3000")
                    userInf.Uavatar = userInf.Uavatar.replaceAll("\\","//")
                    userCounter.infoChange(resp.data.userInf[0])
                    router.push('/')
                }else{
                    alert("用户名或密码错误")
                    name.value = ""
                    userInf.username = ""
                    psw.value = ""
                    userInf.userpassword = ""
                }
            })
            .catch(err => {
                console.error("出错了",err);
                name.value = ""
                userInf.username = ""
                psw.value = ""
                userInf.userpassword = ""
            })
        }  
    }
    //跳转到注册界面
    const reginster = () => {
        router.push('/reginster')
    }
</script>

<style scoped>
    body{
        width:480px;
        margin:10px auto;
        text-align: center;
    }
    .loginDiv{
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
        margin-top:10px;
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