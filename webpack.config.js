const path = require('path'); 
const HtmlWepbackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill','./src/js/app.js'], 
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/bundle.js'
    },
    devServer:{
        contentBase: './dist'
    },
    plugins:[
        new HtmlWepbackPlugin({
            filename: 'app.html',
            template:'./src/app.html'
        })
    ],
    module:{
        rules: [
            {
               test: /\.js$/,
               exclude: /node_modules/,
               use: {
                   loader: 'babel-loader'
               }
            }
        ]
    }
};
