const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    entry: "./frontend/js/routes/App.tsx",
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
            {
                test: /\.txt$/,
                use: "raw-loader"
            }
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
        publicPath: '/',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /node_modules/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		}
	}
};