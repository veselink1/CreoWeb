var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        main: [path.join(__dirname, './ClientApp/boot-client.js')],
        vendor: [
            "babel-polyfill",
            "babel-standalone",
            "chart.js",
            "classnames",
            "css-validator",
            "draft-js",
            "draftjs-to-html",
            "file-saver",
            "golden-layout",
            "html-to-draftjs",
            "immutable",
            "isomorphic-fetch",
            "js-beautify",
            "jszip",
            "lodash._noop",
            "material-ui",
            "pretty-data",
            "react",
            "react-addons-css-transition-group",
            "react-animate-on-change",
            "react-color",
            "react-deep-force-update",
            "react-dom",
            "react-draft-wysiwyg",
            "react-redux",
            "react-reorder",
            "react-router",
            "react-tap-event-plugin",
            "redux",
            "redux-thunk",
        ],
    },
    output: {
        path: path.join(__dirname, 'wwwroot', 'dist'),
        publicPath: '/dist',
        filename: '[name].js',
    },
    devtool: process.env.NODE_ENV === 'production' ? 'eval' : 'source-map',
    resolve: {
        alias: {
            "~": path.join(__dirname, './ClientApp')
        }
    },
    module: {
        loaders: [
            { test: /\.js$/, loaders: ['babel'], exclude: /node_modules/ },
            { test: /\.css/, loaders: ['style', 'css', 'postcss'] },
            { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass'] },
        ]
    },
    plugins: process.env.NODE_ENV === 'production' ? [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: { warnings: false }
        })
    ] : [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        })
    ],
    options: {
        // Enable caching for improved performance during
        // development.
        cacheDirectory: true
    },
};