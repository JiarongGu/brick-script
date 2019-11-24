const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');
const webpackConfig = require('../../build/webpack.config');
const compiler = webpack(webpackConfig);
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  //执行开发环境
  const devServerConfig = require('../../build/webpackDevServer.config');
  const WebpackDevServer = require('webpack-dev-server');
  const devServer = new WebpackDevServer(compiler, devServerConfig);
  devServer.listen(devServerConfig.port, devServerConfig.host, err => {
    if (err) {
      return console.log(err);
    }
    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        devServer.close();
        process.exit();
      });
    });
  });
} else {
  const devMiddle = middleware(compiler, {
    writeToDisk: true,
    logLevel: 'error'
  });
  devMiddle.waitUntilValid(function() {
    console.log('编译完成');
    devMiddle.close();
  });
}
