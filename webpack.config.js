var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dev_mode = process.env.NODE_ENV !== 'production';
const example_path = path.resolve(__dirname, './src/example/');

module.exports = {
    entry: {
        home: path.resolve(__dirname, './src/index.tsx'),
        rayTracing: path.resolve(example_path, './ray-tracing/index.tsx'),
        sea: path.resolve(example_path, './sea/index.tsx'),
    },
    output: {
        filename: '[name]_bundle.js', 
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            title: 'home',
            filename: 'index.html',
            chunks: ['home'],
        }),
        new HtmlWebpackPlugin({
            title: 'sea',
            filename: 'sea.html',
            chunks: ['sea'],
        }),
        new HtmlWebpackPlugin({
            title: 'ray tracing',
            filename: 'rayTracing.html',
            chunks: ['rayTracing'],
        }),
    ],
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
                use: [
                    {
                        loader: dev_mode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader?modules&localIdentName=[path][name]---[local]---[hash:base64:5]",
                    }, {
                        loader: "sass-loader",
                    }]
            },
            {
                test: /\.(css)$/,
                use: [
                    {
                        loader: dev_mode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader?modules&localIdentName=[path][name]---[local]---[hash:base64:5]',
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [require('autoprefixer')],
                        },
                    },
                ]
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

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 8080,

        before: function(app, server) {
            app.get('/ray', function(req, res) {
                res.sendFile(path.resolve(__dirname, './dist/rayTracing.html'))
            });
            app.get('/sea', function(req, res) {
                res.sendFile(path.resolve(__dirname, './dist/sea.html'))
            });
        },
    },
}