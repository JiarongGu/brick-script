// webpack.dev.js
const webpackBaseConfig = require("./webpack.client.config");
const webpackMerge = require("webpack-merge");
const { getIpAddress } = require("../build/app");

module.exports = webpackMerge(
  {
    contentBase: webpackBaseConfig.output.path,
    host: getIpAddress(),
    port: 3000,
    overlay: true,
    compress: false,
    inline: true,
    hot: true,
    historyApiFallback: true,
    open: true,
    hotOnly: true,
    proxy: {}, // 设置请求代理
    watchContentBase: true,
    clientLogLevel: "none",
    quiet: true,
    https: false
  },
  webpackBaseConfig.devServer || {}
);
