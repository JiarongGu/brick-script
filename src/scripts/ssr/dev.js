const webpack = require("webpack");
const middleware = require("webpack-dev-middleware");
const path = require("path");
const createDevServerConfig = require("../../build/webpackDevServer.config");
const devServerConfig = createDevServerConfig;
const MemoryFileSystem = require("memory-fs");
const devClientMfs = new MemoryFileSystem();
const clientConfig = require("../../build/webpack.config");
const mime = require("mime-types");
const serveEntryWebpackConfig = require("../../build/webpack.server");
const { getIpAddress, openBrowser } = require("../../build/app");

const publicPath = clientConfig.output.publicPath;
const outputPath = clientConfig.output.path;
const devClientCompiler = webpack([serveEntryWebpackConfig, clientConfig]);

middleware(devClientCompiler, {
  serverSideRender: true,
  fs: devClientMfs
});

openBrowser("http://" + getIpAddress() + ":" + devServerConfig.port);

const loadableBundlePath = path.join(outputPath, "loadable-stats.json");
// 可以运行在服务端的前台代码入口
const bundlePath = path.join(
  serveEntryWebpackConfig.output.path,
  serveEntryWebpackConfig.output.filename
);

const testRegExp = new RegExp("^" + publicPath);

module.exports = function(app) {
  // 静态资源直接从内存冲读出去
  app.use(async (ctx, next) => {
    const url = ctx.request.url;
    if (ctx.request.method === "GET" && testRegExp.test(url)) {
      if (!devClientMfs) {
        return (ctx.body = "app is compiling");
      }
      const staticContent = devClientMfs
        .readFileSync(
          path.join(outputPath, url.replace(testRegExp, "")),
          "utf-8"
        )
        .toString();
      ctx.type = mime.contentType(
        path.extname(path.join(outputPath, url.replace(testRegExp, "")))
      );
      ctx.body = staticContent;
      return;
    }
    next();
  });
  
  // 执行render 操作保证返回的数据和客户端的一致
  app.use(async ctx => {
    if (ctx.request.method === "GET") {
      const webStats = JSON.parse(
        devClientMfs.readFileSync(loadableBundlePath, "utf-8").toString()
      );
      const bundle = eval(
        devClientMfs.readFileSync(bundlePath, "utf-8").toString()
      );
      if (!webStats || !bundle) {
        return (ctx.body = "编译中");
      }
      require("./render")(
        ctx,
        bundle.default.routes,
        bundle.default.store,
        webStats,
        devClientMfs
      );
    }
  });
};
