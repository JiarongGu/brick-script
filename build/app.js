const path = require("path");
const os = require("os");
const fs = require("fs");
const childProcess = require("child_process");
const networkInterfaces = os.networkInterfaces();

/**
 * 默认读取根目录下的favicon.ico文件
 */
const getFavicon = function() {
  const faviconPath = path.resolve(process.cwd(), "favicon.ico");
  if (fs.existsSync(faviconPath)) {
    return faviconPath;
  }
  return "";
};

const getAppName = function() {
  const { name } = path.parse(process.cwd());
  return name;
};

const getIpAddress = function() {
  let ipAddress = "";
  for (var devName in interfaces) {
    var networkInterface = networkInterfaces[devName];
    for (let i = 0; i < networkInterface.length; i++) {
      var alias = networkInterface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        ipAddress = alias.address;
      }
    }
  }
  return ipAddress;
};

const openBrowser = function(url) {
  childProcess.exec(`start ${url}`);
};

//获取用户自定义配置
const getCustomConfig = () => {
  let config = {};
  if (fs.existsSync(path.resolve(process.cwd(), "n.config.js"))) {
    config = require(path.resolve(process.cwd(), "n.config.js"));
  }
  return config;
};

/**
 * 判断用户项目根目录下是否有tsConifg文件
 */
const getTsConfig = () => {
  return fs.existsSync(path.resolve(process.cwd(), "tsconfig.json"));
};

/**
 * 获取html模板文件
 */
const getHtmlTemplate = () => {
  if (fs.existsSync(path.resolve(process.cwd(), "index.html"))) {
    return path.join(process.cwd(), "./index.html");
  }
  return path.join(__dirname, "./index.html");
};

module.exports = {
  getFavicon,
  getAppName,
  getIpAddress,
  openBrowser,
  getCustomConfig,
  getTsConfig,
  getHtmlTemplate
};
