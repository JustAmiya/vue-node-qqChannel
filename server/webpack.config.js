const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry:"./app.js",
    output:{
        path:path.join(__dirname,"dist"),
        filename:"bundle,js"
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./index.html'
        })
    ],
    module:{
        rules:[
            {
                test:/\.(png|jpg|gif|jpeg)$/i,
                type:'asset'
            }
        ]
    },
    target:'node'
}