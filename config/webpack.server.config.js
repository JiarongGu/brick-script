// webpack.server.js
const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const LoadablePlugin = require("@loadable/webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const clientConig = require("./webpack.client.config");
const mode = process.env.NODE_ENV;
const isDev = mode === "development";
const serverConfig = {
  name: "server",
  target: "node",
  mode: mode,
  entry: {
    main: path.resolve(process.cwd(), "src/server.entry.js")
  },
  output: {
    path: path.join(process.cwd(), "dist/node"),
    filename: "main.js",
    publicPath: clientConig.output.publicPath,
    libraryTarget: "commonjs2"
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".css", ".scss"]
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              caller: {
                target: "node"
              },
              cacheDirectory: true, // 开启缓存
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                "@babel/plugin-syntax-dynamic-import",
                [
                  "@babel/plugin-proposal-decorators",
                  {
                    legacy: true
                  }
                ],
                [
                  "@babel/plugin-proposal-class-properties",
                  {
                    loose: true
                  }
                ],
                [
                  "@babel/plugin-transform-runtime",
                  {
                    corejs: {
                      version: 3,
                      proposals: true
                    },
                    helpers: true,
                    regenerator: true,
                    useESModules: false
                  }
                ]
              ]
            }
          }
        ]
      },
      {
        test: /\.module\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: "[name]-[local]-[hash:base64:5]"
              },
              localsConvention: "camelCase"
            }
          },
          "sass-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("postcss-preset-env")]
            }
          }
        ]
      },
      {
        test: /\.module\.css$/i,
        use: [
          isDev ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              url: true,
              modules: {
                localIdentName: "[name]-[local]-[hash:base64:5]"
              },
              localsConvention: "camelCase"
            }
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: [require("postcss-preset-env")]
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 1000,
              name: "[path][name][hash:8].[ext]",
              fallback: "file-loader",
              // // 将图片打包到该公共目录下
              outputPath: "images"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDev ? "css/[name].css" : "css/[name].[hash:8].css",
      chunkFilename: isDev ? "css/[name].css" : "css/[name].[hash:8].css"
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new LoadablePlugin()
  ]
};

module.exports = serverConfig;
