process.env.NODE_ENV = 'production';
const webpack = require('webpack');

const clintWebpackConfig = require('../build/webpack.config');
const serveEntryWebpackConfig = require('../build/webpack.server');

const compiler = webpack([clintWebpackConfig, serveEntryWebpackConfig]);

compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    process.exit();
  }
  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error(info.errors);
    process.exit();
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
  console.log('编译成功');
});
