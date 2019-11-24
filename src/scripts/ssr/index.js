const mount = require('koa-mount');
const path = require('path');
const output = require('../../build/webpack.config').output;
const serverWebpackConfig = require('../../build/webpack.server');
const devServerConfig = require("../../build/webpackDevServer.config");

const Koa = require('koa');
const k2c = require('koa2-connect');
const httpProxy = require('http-proxy-middleware');
const app = new Koa();
const isDev = process.env.NODE_ENV === 'development';

//获取用户转发配置
const userProxyConfig = devServerConfig.proxy || {
  '/api': {
    target: 'http://localhost:3000',
    pathRewrite: {
      '^/api': ''
    }
  },
};

let proxyPrefix
for (let k in userProxyConfig) {
  proxyPrefix = k;
}

//api 请求转发
app.use(async (ctx, next) => {
  if (ctx.url.startsWith(proxyPrefix)) {
    ctx.respond = false;
    await k2c(
      httpProxy({
        target: userProxyConfig[proxyPrefix].target,
        changeOrigin: true,
        secure: false,
        pathRewrite: userProxyConfig[proxyPrefix].pathRewrite
      })
    )(ctx, next);
  }
  await next();
});

if (isDev) {
  const devRender = require('./dev');
  devRender(app);
} else {
  //静态资源服务
  app.use(
    mount(output.publicPath, require('koa-static')(output.path))
  );
  const render = require('./render');
  const serverEntryPath = path.join(
    serverWebpackConfig.output.path,
    serverWebpackConfig.output.filename
  );
  const bundle = require(serverEntryPath);
  const clientLoadblePath = path.join(
    output.path,
    'loadable-stats.json'
  );
  const webStats = require(clientLoadblePath);
  app.use(async (ctx, next) => {
    if (ctx.request.method === 'GET') {
      render(ctx, bundle.default.routes, bundle.default.store, webStats);
    }
    next();
  });
}
app.listen(devserverConfig.port, function () {
  console.log('app running ' + devserverConfig.port);
});
