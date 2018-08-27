var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: path.join(__dirname, './boot-server.js'),
    output: {
        path: __dirname,
        filename: 'boot-server-bundle.js',
    },
    devtool: 'source-map',
    resolve: {
        alias: {
            "~": path.join(__dirname, './')
        }
    },
    module: {
        loaders: [
            { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
            { test: /\.css/, loaders: ['style-loader', 'css-loader', 'postcss-loader'] },
            { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'] },
        ]
    }
};