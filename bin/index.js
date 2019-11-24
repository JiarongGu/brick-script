#!/usr/bin/env node
'use strict';

const chalk = require("chalk");
const spawn = require("cross-spawn");

process.on("unhandledRejection", err => {
  throw err;
});

const args = process.argv[2]; //需要执行的命令
const type = process.argv[3] || "react"; // 需要打包的工程类型

const targets = ["dev", "build"];
const projects = ["react", "typescript", "ssr"];

if (!targets.includes(args)) {
  console.log(chalk.yellow(`只支持操作${targets}`));
  process.exit(1);
}

if (!projects.includes(type)) {
  console.log(chalk.yellow(`只支持类型${projects}`));
  process.exit(1);
}

let result;
if (type === "ssr") {
  process.env.TARGET_ENV = "server";
  const entryFilePath = require.resolve("../scripts/" + type + "-" + args);
  const executingOrder = args === "dev" ? "npx babel-node" : "node";
  result = spawn.sync(executingOrder, [entryFilePath], {
    stdio: "inherit"
  });
} else {
  process.env.TARGET_ENV = "web";
  process.env.NODE_ENV = args === "dev" ? "development" : "production";
  result = spawn.sync("node", [require.resolve("../scripts/reactRun.js")], {
    stdio: "inherit"
  });
}

if (result.signal) {
  if (result.signal === "SIGKILL") {
    console.log(
      "The build failed because the process exited too early. " +
        "This probably means the system ran out of memory or someone called " +
        "`kill -9` on the process."
    );
  } else if (result.signal === "SIGTERM") {
    console.log(
      "The build failed because the process exited too early. " +
        "Someone might have called `kill` or `killall`, or the system could " +
        "be shutting down."
    );
  }
  process.exit(1);
}
process.exit(result.status);
