const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/index',
    resolve: {
        // alias: {
        //     url$: 'whatwg-url'
        // },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: ['src', 'node_modules']
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'eslint-loader'
            },
            {
                enforce: 'pre',
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'source-map-loader'
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'awesome-typescript-loader',
                    options: {
                        babelCore: '@babel/core',
                        useBabel: true,
                        useCache: true
                    }
                }]
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader'
                ]
            },
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.png$/, loader: 'file-loader' }
        ]
    },
    plugins: [
        new CheckerPlugin(),
        new HtmlWebpackPlugin({
            title: 'Polygon viewer',
            template: path.resolve('./index.html')
        }),
        new webpack.DefinePlugin({
            'process.env': {
                HERE_APP_ID: JSON.stringify('M6vXjX9heAYw1inqr0UX'),
                HERE_APP_CODE: JSON.stringify('DyMgjakUymQlSuuqKqAMbw'),
                ELASTIC_ENDPOINT: JSON.stringify('c7004e660dad4f63aeec33b77844341a.eu-west-1.aws.found.io'),
                ES_CLOUD_ID: JSON.stringify('homes-staging:ZXUtd2VzdC0xLmF3cy5mb3VuZC5pbyRjNzAwNGU2NjBkYWQ0ZjYzYWVlYzMzYjc3ODQ0MzQxYSRmOWYyNDMzNzJjOWM0ZDUzOTJmNjVlMjIwZTQzNzIxOA=='),
                ES_USERNAME: JSON.stringify('elastic'),
                ES_PASSWORD: JSON.stringify('oea9iXsu4cFlLzhqaaUhdbrL')
            }
        })
    ],
    devServer: {
        compress: true
    }
};
