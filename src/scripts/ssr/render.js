const React = require("react");
const helmet = require("react-helmet");
const ReactDOMServer = require("react-dom/server");
const { ChunkExtractor, ChunkExtractorManager } = require("@loadable/server");
const { Provider } = require("react-redux");
const { StaticRouter } = require("react-router");
const clientConfig = require("../../build/webpack.config");

module.exports = async (ctx, ClintApp, createStore, webStats) => {
  //获取 code splite
  const webExtractor = new ChunkExtractor({
    stats: webStats,
    publicPath: clientConfig.output.publicPath
  });

  //执行渲染
  const context = {};
  const store = createStore();
  const jsx = webExtractor.collectChunks(
    <ChunkExtractorManager extractor={webExtractor}>
      <Provider store={store}>
        <StaticRouter location={ctx.request.url} context={context}>
          <ClintApp> </ClintApp>
        </StaticRouter>{" "}
      </Provider>
    </ChunkExtractorManager>
  );

  const container = ReactDOMServer.renderToString(jsx);
  if (context.url) {
    return ctx.redirect(context.url);
  }

  const html = `
  <!DOCTYPE html>
  <html ${helmet.htmlAttributes.toString()}>
    <head>
      <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
    ${helmet.link.toString()}
    ${webExtractor.getStyleTags()}
    </head>
    <body ${helmet.bodyAttributes.toString()}>
      <div id="root">${container}</div>
      <script>
        window.__CONTEXT__=${JSON.stringify(store.getState())}
      </script>
      ${webExtractor.getScriptTags()}
    </body>
  </html>`;
  
  ctx.body = html;
};
