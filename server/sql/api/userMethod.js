const models = require('../db')
const mysql = require('mysql')
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

const conn = mysql.createConnection(models.mysql)
conn.connect()

// 接口：用户登录
router.post('/login',(req,res) => {
    const params = req.body
    const userQuerySql = 'select * from user where Uname = ? AND Upassword = ?'
    conn.query(userQuerySql,[params.username,params.userpassword],(err,resu) => {
        if(err){
            return res.status(400).send('登录失败')
        }
        if(resu.length > 0){
            const token = jwt.sign({params},"secret",{
                expiresIn:"10s"    //token过期时间
            })
            res.status(200).send({
                msg:"登录成功",
                userInf:resu,
                token:token
            })
        }else{
            res.status(202).send('用户名或密码错误')
        }
    })
})

module.exports = router