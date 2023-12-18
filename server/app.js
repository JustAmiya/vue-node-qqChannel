const express = require('express')
const http = require('http')
const jwt = require('jsonwebtoken')
const {Server} = require('socket.io')
const bodyParser = require('body-parser')
const UserApi = require('./sql/api/Syschatroom')
const userMethod = require('./sql/api/userMethod')
const channelMethod = require('./channelMethod')
const axios = require('axios')
const path = require('path')

const app = express()
const server = http.createServer(app)
//开启一个套接字
const io = new Server(server,{
    allowEIO3:true,
    cors:{
        origin:"http://127.0.0.1:5173",
        methods:["GET","POST"],
        credentials:true,
        maxHttpBufferSize: 1e8  //图片最大size
    }
})
//需要安装body-parser来获取req.body
//设置请求头
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","http://127.0.0.1:5173") //允许跨域
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,PATCH,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers","Content-type,Authorization")
    //快速返回options请求
    if(req.method.toLowerCase() == 'options'){
        res.sendStatus(200)
    }else{
        next()
    }
})

//解析req的url和body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static("./public"))  //静态资源托管

app.use('/userMethod',userMethod)
// 验证token,放在登录接口之后,其他接口之前
app.use((req,res,next) => {
    const url = req._parsedUrl.pathname
    let urlArr = ['/channelMethod/userInfInit','/api/userApi/reginster']
    if(urlArr.indexOf(url) >= 0){
        next()
    }else{
        const token = req.get("Authorization").split(" ")[1]
        try{
            const data = jwt.verify(token,"secret")
            next()
        }catch(e){
            res.status(401).send({
                data:"token失效"
            })
        }
    }
})

app.use('/channelMethod',channelMethod)
app.use('/api/userApi',UserApi)


app.get("/",(req,res) => {
    res.send('<h1>hello!this is node serve~</h1>')
})

io.on('connection',(socket)=>{
    console.log('a user connect');
    
    //用户连接
    socket.on('firstConnect',(channelInf,roomInf,chatInf) =>{
        let roomName = channelInf.Cname + roomInf.Rname
        socket.rooms.forEach(room => {
            if(room !== socket.id){
                socket.leave(room)
                console.log('leave success');
            }
        })
        
        socket.join(roomName)
  
    })
    
    //监听聊天事件
    socket.on("chatMsg",(channelInf,roomInf,chatInf) =>{
        let roomName = channelInf.Cname + roomInf.Rname
        chatInf.isMe = false
        socket.broadcast.to(roomName).emit("chatMsg",chatInf)
    })

    socket.on("sendImg",(data) => {
        let roomName = data.channelInf.Cname + data.roomInf.Rname
        data.chatInf.isMe = false
        socket.broadcast.to(roomName).emit("receiveImg",data)
    })

    socket.on('disconnect',() => {
        console.log('user disconnection');
    })
    console.log("-----");
})


server.listen(3000,()=>{
    console.log("listening on 3000");
})

