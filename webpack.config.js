const path = require('path'); 
const HtmlWepbackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');


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
            filename: 'index.html',
            template:'./src/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: "css/app.css"
        }),
        new CopyPlugin([
            {
              from: './src/manifest.json',
              to: 'manifest.json',
            },
            {
              from: './src/sw.js',
              to: 'sw.js',
            },
            {
              from: './src/icons',
              to: 'icons',
            },
            {
              from: './src/lib/idb.js',
              to: 'lib/idb.js',
            },
            {
              from: './src/lib/idb-utility.js',
              to: 'lib/idb-utility.js',
            },
          ]),
    ],
    module:{
        rules: [
            {
               test: /\.js$/,
               exclude: /node_modules/,
               use: {
                   loader: 'babel-loader'
               }
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                      loader: MiniCssExtractPlugin.loader,
                    },
                    {
                      loader: 'css-loader',
                      options: {
                        importLoaders: 1,
                      }
                    },
                    {
                      loader: 'postcss-loader',
                      options: {
                        plugins: () => [autoprefixer(), cssnano()]
                      }
                    }
                  ]
            }
        ]
    }
};
