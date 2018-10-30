const path = require('path');
const webpack = require('webpack'); //to access built-in plugins
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    devtool: 'source-map',
    context: __dirname+'/src',
    entry: {
        main:'./index.js',
        browser:'./browser/browser.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: '[name]'
    },
    watch: NODE_ENV ==='development',
    watchOptions: {
        aggregateTimeout:100
    },
    module: {
        rules: [
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader:"file-loader",
                query:{
                    name:'[name].[ext]',
                    outputPath:'images/'
                    //the images will be emmited to public/assets/images/ folder
                    //the images will be put in the DOM <style> tag as eg. background: url(assets/images/image.png);
                }
            },
            {
                test: /\.css$/,
                loaders: ["style-loader","css-loader"]
            }
        ],
        loaders: [
            // {
            //     test: /\.(html)$/,
            //     use: {
            //         loader: 'html-loader',
            //         options: {
            //             attrs: [':data-src']
            //         }
            //     }
            // },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: 'babel-loader'
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.styl$/,
                loader: 'style!css!stylus'
            },
            {
                test: /\.(svg|ttf|eot|woff|woff2)$/,
                loader: 'file-loader?name=[name].[ext]',
                query:{
                    name:'[name].[ext]',
                    outputPath:'images/'
                    //the images will be emmited to public/assets/images/ folder
                    //the images will be put in the DOM <style> tag as eg. background: url(assets/images/image.png);
                }
            },
            // {
            //     test:require.resolve('ol'),
            //     loader:"imports-loader?define=>false"
            // }
            // ,{
            //     loader: 'file-loader',
            //     options: {
            //         name: '../lib/OpenLayers.js',
            //         outputPath: 'file-loader/'
            //     }
            // }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            _:'lodash',
            $: 'jquery',
            '$': 'jquery',
            jquery: 'jquery',
            jQuery: 'jquery',
            'window.jquery': 'jquery',
            'window.jQuery': 'jquery',
            AFRAME: "aframe",
            ol:'ol'
        }),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            LANG: JSON.stringify('ru')
        }),
        // new HtmlWebpackPlugin({
        //    template: './dist/main.tmplt.html'
        // }),
        new ExtractTextPlugin('./src/html/css/main.css'),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name:'common'
        })
   ],
    resolve:{
        alias: {
            jquery: path.join(__dirname, 'node_modules/jquery/src/jquery'),
        },
    }
};