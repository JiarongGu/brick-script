const path = require("path");
const webpack = require("webpack");
const webpackMerge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const modules = require("../build/modules");

const isDev = process.env.NODE_ENV === "development";

const {
  getCustomConfig,
  getFavicon,
  getAppName,
  getTsconfig,
  getHtmlTemplate
} = require("../build/app");

const { css, ...userConfig } = getCustomConfig();
const config = webpackMerge(
  {
    name: "web",
    entry: {
      main: path.join(
        process.cwd(),
        !!getTsconfig() ? "src/index.tsx" : "src/index.jsx"
      )
    },
    output: {
      path: path.resolve(process.cwd(), "dist/web"),
      publicPath: process.env.TARGET_ENV === "web" ? "/" : "/public/",
      filename: isDev ? `js/[name].js` : `js/[name].[chunkhash].js`,
      chunkFilename: isDev ? `js/[name].js` : `js/[name].[chunkhash].js`
    },
    mode: process.env.NODE_ENV,
    resolve: {
      extensions: [".js", ".jsx", ".json", ".css", ".scss", ".ts", ".tsx"]
    },
    module: modules,
    optimization: {
      splitChunks: {
        chunks: "all", // 所有的 chunks 代码公共的部分分离出来成为一个单独的文件
        cacheGroups: {
          vendor: {
            chunks: "initial",
            // test: /react|angluar|lodash/, // 直接使用 test 来做路径匹配
            test: path.resolve(process.cwd(), "node_modules"), // 路径在 node_modules 目录下的都作为公共部分
            name: "vendor", // 使用 vendor 入口作为公共部分
            enforce: true,
            priority: 10 // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
          },
          utils: {
            // 抽离自定义公共代码
            test: /\.js$/,
            chunks: "initial",
            name: "common",
            minSize: 0 // 只要超出0字节就生成一个新包
          }
        }
      },
      runtimeChunk: {
        name: "manifest"
      }
    },
    plugins: [
      new webpack.BannerPlugin("nick 291375086@qq.com"),
      new MiniCssExtractPlugin({
        filename: isDev ? "css/[name].css" : "css/[name].[hash:8].css",
        chunkFilename: isDev ? "css/[name].css" : "css/[name].[hash:8].css"
      }),
      new HtmlWebpackPlugin({
        template: getHtmlTemplate(),
        title: getAppName(),
        favicon: getFavicon(),
        inject: true
      })
    ]
  },
  userConfig
);
if (isDev) {
  config["devtool"] = "eval-source-map";
}

module.exports = config;
