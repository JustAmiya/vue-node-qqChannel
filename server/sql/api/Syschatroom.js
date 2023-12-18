const models = require('../db')
const mysql = require('mysql')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const conn = mysql.createConnection(models.mysql)
conn.connect()

// 接口：用户注册
router.get('/reginster',(req,res) => {
    const {query} = req
    const userInsertSql = 'insert into user(Uname,Uavatar,Upassword) value (?,?,?)'
    const userQuerySql = 'select * from user where Uname = ?'
    conn.query(userQuerySql,[query.username],(err,resu) => {
        if(err){
            return res.status(400).send({code:0,msg:'操作失败'});
        }
        if(resu.length > 0){
            return res.status(202).send({code:0,msg:'用户名已存在'});
        }else{
            conn.query(userInsertSql,[query.username,query.useravatar,query.userpassword],(err,resu) => {
                if(err){
                    return res.status(400).send('操作失败')
                }else{
                    return res.status(200).send({
                        msg:'添加成功',
                        resu:resu
                    })
                }
            })
        }
    }) 
})

// 接口：根据字段模糊查询频道
router.get('/queryChannelByCname',(req,res) => {
    const {query} = req
    const name = '%' + query.Cname + '%'
    const queryChannelByCnameSql = "select * from channel where Cname like ? "
    conn.query(queryChannelByCnameSql,name,(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }if(resu == 'undefined'){
            res.status(202).send(resu)
        }else{
            res.status(200).send(resu)
        }
    })
})

// 接口：根据用户id查询所加入的频道
router.get('/queryChannelByUid',(req,res) => {
    const {query} = req
    const queryChannelSql = 'select * from channel where Cid in (select Cid from channel_user where Uid = ?)'
    conn.query(queryChannelSql,[query.userid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }if(resu == 'undefined'){
            res.status(202).send('查询失败')
        }else{
            res.status(200).send(resu)
        }
    })
})

// 接口：更改user数据
router.get('/updateUserInf',(req,res) => {
    const {query} = req
    const updateUserInfSql = 'update user set Uname = ?,Uavatar = ? where Uid = ?'
    const userQuerySql = 'select * from user where Uname = ? and Uid != ?'

    conn.query(userQuerySql,[query.Uname,query.Uid],(err,resu) => {
        if(err){
            return res.status(400).send('更改失败')
        }
        if(resu.length > 0){
            return res.status(202).send({code:0,msg:'用户名已存在'});
        }else{
            conn.query(updateUserInfSql,[query.Uname,query.Uavatar,query.Uid],(err,resu) => {
                if(err){
                    return res.status(400).send('更改失败')
                }else{
                    return res.status(200).send({code:1,msg:'更改成功'})
                }
            })
        }
    })
})

// 接口：根据频道id查询频道的聊天房间
router.get('/queryroomByCid',(req,res) => {
    const {query} = req
    const queryroomSql = 'select * from chatroom where Cid = ?'
    conn.query(queryroomSql,[query.channelId],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }
        if(resu == 'undefined'){
            res.status(202).send('查询失败')
        }else{
            res.status(200).send(resu)
        }
    })
})
//接口：根据频道id查询频道的帖子房间
router.get('/querypostroomByCid',(req,res) => {
    const {query} = req
    const querypostroomSql = 'select * from postroom where Cid = ?'
    conn.query(querypostroomSql,[query.channelId],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }
        if(resu == 'undefined'){
            res.status(202).send('查询失败')
        }else{
            res.status(200).send(resu)
        }
    })
})

// 接口：根据频道id查询频道成员
router.get('/queryUidByCid',(req,res) => {
    const {query} = req
    const queryUidSql = 'select * from channel_user where Cid = ?'
    conn.query(queryUidSql,[query.Cid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }
        if(resu == 'undefined'){
            res.status(202).send('查询失败')
        }else{
            res.status(200).send(resu)
        }
    })
})

//接口：根据帖子房间id查询帖子内容
router.get('/querypostlistByPRid',(req,res) => {
    const {query} = req
    const querypostlistSql = 'select * from post where prid = ?'
    conn.query(querypostlistSql,[query.postroomId],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }else if(resu == 'undefined'){
            res.status(202).send('查询失败')
        }else{
            res.status(200).send(resu)
        }
    })
})

//接口：根据帖子id查询帖子图片信息
router.get('/querypostImgByPid',(req,res) => {
    const {query} = req
    const querypostImgSql = 'select * from postimg where pid = ?'
    conn.query(querypostImgSql,[query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }else if(resu == 'undefined'){
            res.status(202).send('查询失败')
        }else{
            res.status(200).send(resu)
        }
    })
})

//接口：根据房间id查询聊天内容
router.get('/querymsgByRid',(req,res) => {
    const {query} = req
    const querymsgSql = 'select * from msg where Rid = ?'
    conn.query(querymsgSql,[query.Rid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }
        if(resu == 'undefined'){
            res.status(202).send('查询失败')
        }else{
            res.status(200).send(resu)
        }
    })
})

//接口：添加聊天内容
router.get('/insertMsg',(req,res) => { 
    const {query} = req
    const insertMsg = 'insert into msg(Mcontent,Mdate,Mimg,Rid,Uid,Cid) value (?,?,?,?,?,?)'
    conn.query(insertMsg,[query.Mcontent,query.Mdate,query.Mimg,query.Rid,query.Uid,query.Cid],(err,resu) => {
        if(err){
            return res.status(400).send('添加失败')
        }else{
            return res.status(200).send('添加成功')
        }
        
    })
})

//接口：根据用户id查询用户信息
router.get('/queryuserByUid',(req,res) => {
    const {query} = req
    const queryUserSql = 'select * from user where Uid = ?'
    conn.query(queryUserSql,[query.Uid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }
        if(resu == 'undefined'){
            return res.status(202).send('查询失败')
        }else{
            return res.status(200).send(resu)
        }
    })
})

// 接口：根据频道id查询频道信息
router.get('/queryChannelInf',(req,res) => {
    const {query} = req
    const queryChannelInfSql = 'select * from channel where Cid = ?'
    conn.query(queryChannelInfSql,[query.Cid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }else{
            return res.status(200).send(resu)
        }
    })
})

// 接口：插入帖子图片信息
router.get('/insertimageUrlInPost',(req,res) => {
    const {query} = req
    const insertimageSql = 'insert into postimg(postImgUrl,pid) value (?,?)'
    conn.query(insertimageSql,[query.postImgUrl,query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('插入失败')
        }else{
            return res.status(200).send('添加成功')
        }
    })
})
// 接口：插入帖子内容信息
router.get('/insertpostInf',(req,res) => {
    const {query} = req
    const insertpostSql = 'insert into post(ptitle,ptext,pcontent,Uid,prid,pdate) value (?,?,?,?,?,?)'
    conn.query(insertpostSql,[query.ptitle,query.ptext,query.pcontent,query.Uid,query.prid,query.pdate],(err,resu) => {
        if(err){
            return res.status(400).send('插入失败')
        }else{
            return res.status(200).send({
                msg:'添加成功',
                resu:resu
            })
        }
    })
})
// 接口：点赞
router.get('/insertlikeInf',(req,res) => {
    const {query} = req
    const insertlikeInfSql = 'insert into postlike(pid,Uid) value(?,?)'
    conn.query(insertlikeInfSql,[query.pid,query.Uid],(err,resu) => {
        if(err){
            return res.status(400).send('插入失败')
        }else{
            return res.status(200).send('插入成功')
        }
    })
})
// 接口：取消点赞
router.get('/deletelike',(req,res) => {
    const {query} = req
    const deletelikeSql = 'delete from postlike where pid = ? AND Uid = ?'
    conn.query(deletelikeSql,[query.pid,query.Uid],(err,resu) => {
        if(err){
            return res.status(400).send('删除失败')
        }else{
            return res.status(200).send('删除成功')
        }
    })
})
// 接口：根据帖子id查询点赞信息
router.get('/querylike',(req,res) => {
    const {query} = req
    const querylikeSql = 'select * from postlike where pid = ?'
    conn.query(querylikeSql,[query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }else{
            return res.status(200).send(resu)
        }
    })
})
// 接口：根据帖子id查询评论信息
router.get('/querycomment',(req,res) => {
    const {query} = req
    const querycommentSql = 'select * from postcomment where pid = ?'
    conn.query(querycommentSql,[query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }else{
            return res.status(200).send(resu)
        }
    })
})
// 接口：添加评论内容
router.get('/insertcomment',(req,res) => {
    const {query} = req
    const insertcommentSql = 'insert into postcomment(pctext,pcdate,pid,Uid) value(?,?,?,?)'
    conn.query(insertcommentSql,[query.pctext,query.pcdate,query.pid,query.Uid],(err,resu) => {
        if(err){
            return res.status(400).send('插入失败')
        }else{
            return res.status(200).send('插入成功')
        }
    })
})

// 接口：创建频道
router.get('/insertnewChannel',(req,res) => {
    const {query} = req
    const insertnewChannelSql = 'insert into channel(Cname,Cavatar,Chost) value(?,?,?)'
    const channelQuerySql = 'select * from channel where Cname = ?'
    conn.query(channelQuerySql,[query.Cname],(err,resu) => {
        if(err){
            return res.status(400).send({code:0,msg:'操作失败'});
        }
        if(resu.length > 0){
            return res.status(202).send({code:0,msg:'频道名已存在'});
        }else{
            conn.query(insertnewChannelSql,[query.Cname,query.Cavatar,query.Chost],(err,resu) => {
                if(err){
                    return res.status(400).send('操作失败')
                }else{
                    return res.status(200).send({
                        msg:'添加成功',
                        resu:resu
                    })
                }
            })
        }
    })
})

// 接口：加入频道
router.get('/addUsertoChannel',(req,res) => {
    const {query} = req
    const addUserSql = 'insert into channel_user(Cid,Uid,ifmanager) value(?,?,?)'
    conn.query(addUserSql,[query.Cid,query.Uid,query.ifmanager],(err,resu) => {
        if(err){
            return res.status(400).send('插入失败')
        }else{
            return res.status(200).send('插入成功') 
        }
    })
})

// 接口：查询用户是否为某频道管理员
router.get('/ifManager',(req,res) => {
    const {query} = req
    const ifManagerSql = 'select * from channel_user where Cid = ? and Uid = ?'
    conn.query(ifManagerSql,[query.Cid,query.Uid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }else{
            return res.status(200).send(resu)
        }
    })
})

// 接口：更改频道信息
router.get('/channelInfChange',(req,res) => {
    const {query} = req
    const channelInfChangeSql = 'update channel set Cname = ?,Cavatar = ? where Cid = ?'
    const channelInfQuerySql = 'select * from channel where Cname = ? and Cid != ?'

    conn.query(channelInfQuerySql,[query.Cname,query.Cid],(err,resu) => {
        if(err){
            return res.status(400).send('更改失败')
        }
        if(resu.length > 0){
            return res.status(202).send({code:0,msg:'频道名已存在'});
        }else{
            conn.query(channelInfChangeSql,[query.Cname,query.Cavatar,query.Cid],(err,resu) => {
                if(err){
                    return res.status(400).send('更改失败')
                }else{
                    return res.status(200).send({code:1,msg:'更改成功'})
                }
            })
        }
    })
})

// 接口：添加帖子房间
router.get('/addPostRoom',(req,res) => {
    const {query} = req
    const addPostRoomSql = 'insert into postroom(prname,prcreatorid,Cid) value(?,?,?)'
    const postRoomQuerySql = 'select * from postroom where prname = ?'

    conn.query(postRoomQuerySql,[query.prname],(err,resu) => {
        if(err){
            return res.status(400).send('添加失败')
        }
        if(resu.length > 0){
            return res.status(202).send({code:0,msg:'房间名已存在'});
        }else{
            conn.query(addPostRoomSql,[query.prname,query.prcreatorid,query.Cid],(err,resu) => {
                if(err){
                    return res.status(400).send('添加失败')
                }else{
                    return res.status(200).send({code:1,msg:'更改成功'})
                }
            })
        }
    })
})

// 接口：添加聊天室
router.get('/addChatRoom',(req,res) => {
    const {query} = req
    const addChatRoomSql = 'insert into chatroom(Rname,crcreatorid,Cid) value(?,?,?)'
    const chatRoomQuerySql = 'select * from chatroom where Rname = ?'

    conn.query(chatRoomQuerySql,[query.Rname],(err,resu) => {
        if(err){
            return res.status(400).send('更改失败')
        }
        if(resu.length > 0){
            return res.status(202).send({code:0,msg:'房间名已存在'});
        }else{
            conn.query(addChatRoomSql,[query.Rname,query.crcreatorid,query.Cid],(err,resu) => {
                if(err){
                    return res.status(400).send('更改失败')
                }else{
                    return res.status(200).send({code:1,msg:'更改成功',resu:resu})
                }
            })
        }
    })
})

// 接口：改变用户身份
router.post('/changeIdentity',(req,res) => {
    const params = req.body
    const changeIdentitySql = 'update channel_user set ifmanager = ? where Cid = ? AND Uid = ?'
    conn.query(changeIdentitySql,[params.ifmanager,params.Cid,params.Uid],(err,resu) => {
        if(err){
            return res.status(400).send('更改失败')
        }else{
            return res.status(200).send('更改成功')
        }
    })
})

// 接口：将用户发送的信息删除
router.get('/deleteUserMsg',(req,res) => {
    const {query} = req
    const deleteUserMsgSql = 'delete from msg where Uid = ? AND Cid = ?'
    conn.query(deleteUserMsgSql,[query.Uid,query.Cid],(err,resu) => {
        if(err){
            return res.status(400).send('删除失败')
        }else{
            return res.status(200).send('删除成功')
        }
    })
})

// 接口：查询用户在某房间的帖子信息
router.get('/queryUserPostinChannel',(req,res) => {
    const {query} = req
    const queryUserPostinChannel = 'select * from post where Uid = ? and prid = ?'
    conn.query(queryUserPostinChannel,[query.Uid,query.prid],(err,resu) => {
        if(err){
            return res.status(400).send('查询失败')
        }else{
            return res.status(200).send(resu)
        }
    })
})

// 接口：将用户发送的帖子信息删除
router.get('/deleteUserPost',(req,res) => {
    const {query} = req
    const deleteUserPostSql = 'delete from post where pid = ?'
    conn.query(deleteUserPostSql,[query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('删除失败')
        }else{
            return res.status(200).send('删除成功')
        }
    })
})

// 接口：将用户发送的帖子图片删除
router.get('/deleteUserpostImg',(req,res) => {
    const {query} = req
    const deleteUserpostImgSql = 'delete from postimg where pid = ?'
    conn.query(deleteUserpostImgSql,[query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('删除失败')
        }else{
            return res.status(200).send('删除成功')
        }
    })
})

// 接口：将用户发送的帖子评论删除
router.get('/deleteUserpostComment',(req,res) => {
    const {query} = req
    const deletepostCommentSql = 'delete from postcomment where pid = ?'
    const deleteuserCommentSql = 'delete from postcomment where Uid = ?'
    conn.query(deletepostCommentSql,[query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('删除失败')
        }else{
            conn.query(deleteuserCommentSql,[query.Uid],(err,resu) => {
                if(err){
                    return res.status(400).send('删除失败')
                }else{
                    return res.status(200).send('删除成功')
                }
            })
        }
    })
})

// 接口：将用户的点赞信息删除
router.get('/deleteUserLike',(req,res) => {
    const {query} = req
    const  deleteUserLikeSql = 'delete from postlike where Uid = ? or pid = ?'
    conn.query(deleteUserLikeSql,[query.Uid,query.pid],(err,resu) => {
        if(err){
            return res.status(400).send('删除失败')
        }else{
            return res.status(200).send('删除成功')
        }
    })
})

// 接口：将用户移出频道
router.get('/deleteUserfromChannel',(req,res) => {
    const {query} = req
    const deleteUserfromChannelSql = 'delete from channel_user where Uid = ? and Cid = ?'
    conn.query(deleteUserfromChannelSql,[query.Uid,query.Cid],(err,resu) => {
        if(err){
            return res.status(400).send('删除失败')
        }else{
            return res.status(200).send('删除成功')
        }
    })
})

// 接口：加入频道
router.post('/addUserinChannel',(req,res) => {
    const params = req.body
    console.log(params);
    const addUserinChannel = 'insert into channel_user(Cid,Uid,ifmanager) value(?,?,?)'
    conn.query(addUserinChannel,[params.Cid,params.Uid,params.ifmanager],(err,resu) => {
        if(err){
            return res.status(400).send('加入失败')
        }else{
            return res.status(200).send('加入成功')
        }
    })
})

module.exports = router
