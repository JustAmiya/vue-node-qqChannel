const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const axios = require('axios')
const fs = require('fs')


var upload = multer({dest:path.join(__dirname,`./public/tempDir`)}).single('postImg')
var avatarUpload = multer({dest:path.join(__dirname,`./public/userAvatar/tempAvatarFolder`)})
var channelPicUpload = multer({dest:path.join(__dirname,'/public/channelPic/tempChannelAvatar')})
var insertImgUpload = multer({dest:path.join(__dirname,'./public/tempDir')})

// 递归创建文件目录
function mkdirs(dirname){
    if(fs.existsSync(dirname)){
        return true
    }else{
        if(mkdirs(path.dirname(dirname))){
            fs.mkdirSync(dirname)
            return true
        }
    }
}
// 移动图片
function moveImg(movelist,targetPath){
    const folderpath = path.join(__dirname,'./public/tempDir')
    for(const id in movelist){
        const p = path.join(folderpath,movelist[id])
        fs.copyFileSync(path.join(folderpath,movelist[id]),path.join(targetPath,movelist[id]))
    }
}
// 删除文件夹下的图片
function deleteImg(dir){
    const allPic = fs.readdirSync(dir)
    for(const id in allPic){
        fs.unlinkSync(path.join(dir,allPic[id]))
    }
}
// 递归删除文件夹及其子项
function deleteFolder(dir){
    if(fs.existsSync(dir)){
        sons = fs.readdirSync(dir)
        for(const index in sons){
            const curPath = path.join(dir,sons[index])
            if(fs.statSync(curPath).isDirectory()){
                deleteFolder(curPath)
            }else{
                fs.unlinkSync(curPath)
            }
        }
        fs.rmdirSync(dir)
    }  
}
// 提交数据axios浅封装
function submitInfor(path,params){
    return axios.get(path,{
        params:params
    }).then(resp => {
        return {
            status:1,
            resp:resp.data
        }
    }).catch(err => {
        return {
            status:0,
            err:err
        }
    })
}
// 帖子图片暂存
router.post('/uploadImg',upload,(req,res) => {
    const file = req.file
    let url = "http://127.0.0.1:3000//tempDir//" + file.filename
    const msg = {
        "errno":0,
        "data":{
            "url":url
        }
    }
    return res.status(200).send(msg)
})

// 处理帖子信息
router.get('/handleContent',async(req,res) => {
    const {query} = req

    // 存入帖子信息
    const postInfParams = {
        ptitle:query.title,
        ptext:query.text,
        pcontent:query.contentlabel,
        Uid:query.Uid,
        prid:query.prid,
        pdate:query.pdate
    } 
    const result = await submitInfor("http://localhost:3000/api/userApi/insertpostInf",postInfParams) 
    if(result.status == 0){
        return res.status(400).send("文本添加失败")
    }
    const pid = result.resp.resu.insertId

    // 根据返回来的主键创建本地图片路径,之后存入数据库
    if(query.finalpicList != null){
        if(query.finalpicList.length > 0){
            const targetPath = path.join(__dirname,`./public/postuploadImg/${query.channelName}/${query.prid}/${pid}`)
            mkdirs(targetPath)
            moveImg(query.finalpicList,targetPath)
            deleteImg(path.join(__dirname,'./public/tempDir'))
            
            for(const id in query.finalpicList){
                const postPicInfParams = {
                    postImgUrl:path.join(targetPath,query.finalpicList[id]),
                    pid:pid
                }
                const result = await submitInfor("http://localhost:3000/api/userApi/insertimageUrlInPost",postPicInfParams)
                if(result.status == 0) return res.status(400).send("图片添加失败")
            }
        }
    }
    return res.status(200).send("添加成功")
})

// 处理新用户头像存储
router.post('/userInfInit',async(req,res) => {
    const params = req.body
    const maleAvatarPath = path.join(__dirname,'./public/initUserAvatar/male.svg')
    const femaleAvatarPath = path.join(__dirname,'./public/initUserAvatar/female.svg')
    const initAvatarPath = params.data.useravatar ? femaleAvatarPath : maleAvatarPath
    const userInit = {
        username:params.data.username,
        useravatar:initAvatarPath,
        userpassword:params.data.userpassword
    }
    const result = await submitInfor("http://localhost:3000/api/userApi/reginster",userInit)
    if(result.status == 0) return res.status(400).send('注册失败')
    else{
        if(result.resp.msg == '用户名已存在') return res.status(202).send('用户名已存在')
        else if(result.resp.msg == '操作失败') return res.status(400).send('注册失败')
    }
    const uid = result.resp.resu.insertId
    const targetFolderPath = path.join(__dirname,`./public/userAvatar/${uid}`)
    mkdirs(targetFolderPath)
    const targetPath = params.data.useravatar ? path.join(targetFolderPath,'/female.svg') : path.join(targetFolderPath,'/male.svg')
    fs.copyFileSync(initAvatarPath,targetPath)
    return res.status(200).send('注册成功')
})

// 处理用户信息更改
router.post('/userInfChange',avatarUpload.single('avatar'),async(req,res) => {
    const params = req.body
    const file = req.file
    const {Uid,nickname} = params
    const targetPath = path.join(__dirname,`./public/userAvatar/${Uid}`)
    const tempFolderPath = path.join(__dirname,'./public/userAvatar/tempAvatarFolder')
    let avatarPath = ''
    if(file == undefined){      // 只修改昵称
        const name = fs.readdirSync(targetPath)
        avatarPath = path.join(targetPath,name[0])
    }else{                      // 头像 || 昵称+头像
        avatarPath = path.join(targetPath,file.filename)
    }
    
    const query = {
        Uname:nickname,
        Uavatar:avatarPath,
        Uid:Uid
    }
    
    const resu = await submitInfor("http://localhost:3000/api/userApi/updateUserInf",query)

    // 图片转移
    if(resu.status == 1){
        if(resu.resp.code == 0){
            if(file != undefined) fs.unlinkSync(path.join(tempFolderPath,file.filename))
            return res.status(202).send(resu.resp.msg)
        }else{
            if(file == undefined) return res.status(200).send('更改成功')
            else{
                deleteImg(targetPath)
                fs.copyFileSync(path.join(tempFolderPath,file.filename),path.join(targetPath,file.filename))
                fs.unlinkSync(path.join(tempFolderPath,file.filename))
                return res.status(200).send('更改成功')
            }
        }
    }else{
        fs.unlinkSync(path.join(tempFolderPath,file.filename))
        return res.status(400).send('更改失败')
    }
})

// 创建新频道
router.post('/newChannel',channelPicUpload.single('avatar'),async(req,res) => {
    const params = req.body
    const file = req.file
    const {Uid,channelName} = params
    const targetPath = path.join(__dirname,`./public/channelPic/${channelName}`)
    const tempFolderPath = path.join(__dirname,'./public/channelPic/tempChannelAvatar')
    mkdirs(targetPath)

    const query = {
        Cname:channelName,
        Cavatar:path.join(targetPath,file.filename),
        Chost:Uid
    }

    const resu = await submitInfor("http://localhost:3000/api/userApi/insertnewChannel",query)

    if(resu.status == 1){
        if(resu.resp.code == 0){ 
            fs.unlinkSync(path.join(tempFolderPath,file.filename))
            return res.status(202).send(resu.resp.msg)
        }
        else{
            const Cid = resu.resp.resu.insertId
            const query = {
                Cid:Cid,
                Uid:Uid,
                ifmanager:1
            }
            const result = await submitInfor("http://localhost:3000/api/userApi/addUsertoChannel",query)
            if(result.status == 1){
                fs.copyFileSync(path.join(tempFolderPath,file.filename),path.join(targetPath,file.filename))
                fs.unlinkSync(path.join(tempFolderPath,file.filename))
                return res.status(200).send('创建成功')
            }else{
                return res.status.send('创建失败')
            }
            
        }
    }else{
        fs.unlinkSync(path.join(tempFolderPath,file.filename))
        return res.status(400).send('创建失败')
    }
})

// 更改频道信息
router.post('/updateChannelInf',channelPicUpload.single('avatar'),async(req,res) => {
    const params = req.body
    const file = req.file
    const {Cid,oldchannelName,newchannelName} = params

    const oldtargetPath = path.join(__dirname,`./public/channelPic/${oldchannelName}`)
    const newtargetPath = path.join(__dirname,`./public/channelPic/${newchannelName}`)
    const oldp1 = path.join(__dirname,`./public/chatRoomImg/${oldchannelName}`)
    const newp1 = path.join(__dirname,`./public/chatRoomImg/${newchannelName}`)
    const oldp2 = path.join(__dirname,`./public/postuploadImg/${oldchannelName}`)
    const newp2 = path.join(__dirname,`./public/postuploadImg/${newchannelName}`)
    const tempFolderPath = path.join(__dirname,'./public/channelPic/tempChannelAvatar')

    let avatarPath = ''
    if(file == undefined){      // 只修改频道名
        const name = fs.readdirSync(oldtargetPath)
        avatarPath = path.join(newtargetPath,name[0])
    }else{                      // 头像 || 频道名+头像
        avatarPath = path.join(newtargetPath,file.filename)
    }

    const query = {
        Cname:newchannelName,
        Cavatar:avatarPath,
        Cid:Cid
    }

    const resu = await submitInfor("http://localhost:3000/api/userApi/channelInfChange",query)

    // 图片转移
    if(resu.status == 1){
        if(resu.resp.code == 0){
            if(file != undefined) fs.unlinkSync(path.join(tempFolderPath,file.filename))
            return res.status(202).send(resu.resp.msg)
        }else{
            if(file == undefined){
                fs.renameSync(oldtargetPath,newtargetPath)
                fs.renameSync(oldp1,newp1) 
                fs.renameSync(oldp2,newp2)
                return res.status(200).send('更改成功')
            }
            else{
                deleteImg(oldtargetPath)
                fs.copyFileSync(path.join(tempFolderPath,file.filename),path.join(oldtargetPath,file.filename))
                fs.unlinkSync(path.join(tempFolderPath,file.filename))
                fs.renameSync(oldtargetPath,newtargetPath)
                fs.renameSync(oldp1,newp1) 
                fs.renameSync(oldp2,newp2)
                return res.status(200).send('更改成功')
            }
        }
    }else{
        fs.unlinkSync(path.join(tempFolderPath,file.filename))
        return res.status(400).send('更改失败')
    }
})

router.post('/addRoom',async(req,res) => {
    const params = req.body
    const p = params.params
    if(p.currentId == 1){
        const query = {
            Rname:p.roomName,
            Cid:p.Cid,
            crcreatorid:p.Uid
        }
        const result = await submitInfor("http://localhost:3000/api/userApi/addChatRoom",query)
        if(result.status == 1){
            if(result.resp.code == 0) return res.status(202).send('房间名已存在')
            else{
                const crid = result.resp.resu.insertId
                const targetPath = path.join(__dirname,`./public/chatRoomImg/${p.Cname}/${crid}`)
                mkdirs(targetPath)
                return res.status(200).send('聊天板块创建成功')
            }
        }else{
            return res.status(400).send('聊天板块创建失败')
        }
    }
    else if(p.currentId == 2){
        const query = {
            prname:p.roomName,
            Cid:p.Cid,
            prcreatorid:p.Uid
        }
        const result = await submitInfor("http://localhost:3000/api/userApi/addPostRoom",query)
        if(result.status == 1){
            if(result.resp.code == 0) return res.status(202).send('房间名已存在')
            return res.status(200).send('帖子板块创建成功')
        }else{
            return res.status(400).send('帖子板块创建失败')
        }
    }

})

router.post('/insertImg',insertImgUpload.single('chatImg'),async(req,res) => {
    const params = req.body
    const file = req.file
    const {Mcontent,Mdate,Mimg,Rid,Rname,Uid,Cid,Cname} = params
    const oldpath = path.join(__dirname,`./public/tempDir/${file.filename}`)
    const targetPath = path.join(__dirname,`./public/chatRoomImg/${Cname}/${Rname}/${file.filename}`)
    const query = {
        Mcontent:Mcontent,
        Mdate:Mdate,
        Mimg:targetPath,
        Rid:parseInt(Rid),
        Uid:parseInt(Uid),
        Cid:parseInt(Cid),
    }
    const result = await submitInfor("http://localhost:3000/api/userApi/insertMsg",query)
    if(result.status == 1){
        fs.copyFileSync(oldpath,targetPath)
        fs.unlinkSync(oldpath)
        return res.status(200).send("添加成功")
    }else{
        fs.unlinkSync(oldpath)
        return res.status(400).send("添加失败")
    } 

})

// 删除用户：删除msg -> 查询post pid -> 删除postimg(有外键),根据pid || uid删除postcomment(有外键) -> 删除post -> 删除user
router.post('/deleteUser',async(req,res) => {
    const params = req.body

    const msgDel = {
        Uid:params.Uid,
        Cid:params.Cid,
    }
    try{
        let msgFlag = false
        let postFlag = false
        let channelFlag = false
        // 删除msg
        const msgdelRes = await submitInfor("http://localhost:3000/api/userApi/deleteUserMsg",msgDel)
        if(msgdelRes.status == 1){
            msgFlag = true
        }else{
            throw 'serverErr'
        }
        // 删除post与postimg
        const pidList = []
        for(const index in params.pridList){
            const postQuery = {
                Uid:params.Uid,
                prid:params.pridList[index]
            }
            // 查找pid
            const postqueryRes = await submitInfor("http://localhost:3000/api/userApi/queryUserPostinChannel",postQuery)
            if(postqueryRes.status == 1){
                for(const index in postqueryRes.resp){
                    pidList.push(postqueryRes.resp[index].pid)

                    const postimgQuery = {
                        pid:postqueryRes.resp[index].pid
                    }
                    const postimgDel = postimgQuery
                    // 查找postimg
                    const postimgqueryRes = await submitInfor("http://localhost:3000/api/userApi/querypostImgByPid",postimgQuery)
                    // 删除本地图片
                    if(postimgqueryRes.resp.length > 0){
                        const targetFolder = path.join(__dirname,`./public/postuploadImg/${params.Cname}/${params.pridList[index]}/${postqueryRes.resp[index].pid}`)
                        deleteFolder(targetFolder)
                        // 删除postimg
                        const postimgDelRes = await submitInfor("http://localhost:3000/api/userApi/deleteUserpostImg",postimgDel)
                    }

                    // 删除用户评论
                    const postcommentDel = {
                        pid:postqueryRes.resp[index].pid,
                        Uid:params.Uid
                    }
                    const postcommentDelRes = await submitInfor("http://localhost:3000/api/userApi/deleteUserpostComment",postcommentDel)

                    //删除用户点赞信息
                    const postLikeDel = {
                        pid:postqueryRes.resp[index].pid,
                        Uid:params.Uid
                    }   
                    const postLikeDelRes = await submitInfor("http://localhost:3000/api/userApi/deleteUserLike",postLikeDel)

                    // 删除post
                    const postDel = {
                        pid:postqueryRes.resp[index].pid
                    }
                    const postDelRes = await submitInfor("http://localhost:3000/api/userApi/deleteUserPost",postDel)
                }
                postFlag = true
            }else{
                throw 'serverErr'
            }
        }

        // 移出频道
        const channeluserDel = {
            Uid:params.Uid,
            Cid:params.Cid
        }
        const channeluserDelRes = await submitInfor("http://localhost:3000/api/userApi/deleteUserfromChannel",channeluserDel)
        if(channeluserDelRes.status == 1){
            channelFlag = true
        }else{
            throw 'serverErr'
        }

        return res.status(200).send('success',msgFlag,postFlag,channelFlag)
    }catch(e){
        return res.status(400).send('fail',e)
    }
})
module.exports = router