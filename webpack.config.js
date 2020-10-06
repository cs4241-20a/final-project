const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    entry: "./frontend/js/components/App.tsx",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [path.resolve(__dirname, "frontend/js")],
                use: [{
                    loader: "babel-loader"
                }]
            },
            {
                test: /\.html$/,
                include: [path.resolve(__dirname, "frontend")],
                use: "html-loader"
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./frontend/index.html",
            filename: "./index.html"
        }),
        new CompressionPlugin({algorithm: 'brotliCompress', filename: '[path][base].br'})
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    }
};