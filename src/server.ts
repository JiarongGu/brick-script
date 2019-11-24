import * as path from 'path';

import * as Koa from 'koa';
import * as mount from 'koa-mount';

import * as paths from './config/paths';

const k2c = require('koa2-connect');
const httpProxy = require('http-proxy-middleware');

async function runner() {
  const isDev = process.env.NODE_ENV === 'development';

  const ownPath = paths.ownPath;
  const appPath = paths.appPath;

  // get brick script config
  const brickConfig = (await import(path.resolve(appPath, 'brick.config')))();

  const webpackClientConfig = await import(path.resolve(appPath, brickConfig.configDirectory, 'webpack.client.config'));
  const webpackServerConfig = await import(path.resolve(appPath, brickConfig.configDirectory, 'webpack.server.config'));
  const webpackDevServerConfig = await import(path.resolve(appPath, brickConfig.configDirectory, 'webpackDevServer.config'));

  const output = webpackClientConfig.output;

  // 获取用户转发配置
  const userProxyConfig = webpackDevServerConfig.proxy || {
    '/api': {
      pathRewrite: {
        '^/api': ''
      },
      target: 'http://localhost:3000'
    },
  };

  let proxyPrefix
  for (let k in userProxyConfig) {
    proxyPrefix = k;
  }

  const app = new Koa();

  // api 请求转发
  app.use(async (ctx, next) => {
    if (ctx.url.startsWith(proxyPrefix)) {
      ctx.respond = false;
      await k2c(
        httpProxy({
          changeOrigin: true,
          pathRewrite: userProxyConfig[proxyPrefix].pathRewrite,
          secure: false,
          target: userProxyConfig[proxyPrefix].target,
        })
      )(ctx, next);
    }
    await next();
  });

  if (isDev) {
    const devRender = require('./dev');
    devRender(app);
  } else {
    // 静态资源服务
    app.use(
      mount(output.publicPath, require('koa-static')(output.path))
    );
    const render = require('./render');
    const serverEntryPath = path.join(
      webpackServerConfig.output.path,
      webpackServerConfig.output.filename
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

  app.listen(webpackDevServerConfig.port, function () {
    console.log('app running ' + webpackDevServerConfig.port);
  });
}

runner();
