var path = require('path');

module.exports = {
    entry: './index.tsx',
    output: {
        filename: 'bundle.js', 
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                use: {
                loader: 'babel-loader',
                options: {
                        "presets": ["@babel/preset-env","@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.(ts|tsx)?$/,
                loader: "ts-loader"
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader",
                }, {
                    loader: "css-loader",
                }, {
                    loader: "sass-loader",
                }]
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                    loader: 'image-webpack-loader',
                    options: {
                        disable: true,
                        },
                    },
                ],
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                  'raw-loader',
                  'glslify-loader'
                ]
              }
        ]
    },

    performance: {
        hints: false
    },

    devtool: 'cheap-module-inline-source-map',
}