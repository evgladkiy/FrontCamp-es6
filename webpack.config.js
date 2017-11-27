const path = require('path');

module.exports = {
    entry: {
        bundle: path.join(__dirname, '/js/app.js'),
    },
    output: {
        path: path.join(__dirname, '/js/'),
        filename: '[name].js',
    },
    watch: true,
    // devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                    },
                },
            },
        ],
    },
    // devServer: {
    //     hot: true,
    //     contentBase: './',
    // }
};
