const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const isDev = process.env.NODE_ENV === "development";
const { getCustomConfig } = require("./app");
const config = {
  rules: [
    {
      test: /\.(j|t)s(x)?$/,
      use: [
        {
          loader: "babel-loader",
          options: {
            cacheDirectory: true, // 开启缓存
            presets: [
              ["@babel/preset-env"],
              "@babel/preset-typescript",
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-syntax-dynamic-import",
              "@babel/plugin-proposal-optional-chaining",
              [
                "@babel/plugin-proposal-decorators",
                {
                  legacy: true
                }
              ],
              [
                "@babel/plugin-proposal-class-properties",
                {
                  loose: true
                }
              ],
              [
                "@babel/plugin-transform-runtime",
                {
                  corejs: {
                    version: 3,
                    proposals: true
                  },
                  helpers: true,
                  regenerator: true,
                  useESModules: false
                }
              ],
              "react-hot-loader/babel"
            ]
          }
        }
      ],
      include: path.resolve(process.cwd(), "src")
    },
    // 只要scss 文件的后缀全部开启modules
    {
      test: /\.scss$/i,
      use: [
        isDev ? "style-loader" : MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            importLoaders: 2,
            modules: {
              localIdentName: "[folder]-[local]-[hash:base64:5]"
            },
            localsConvention: "camelCase"
          }
        },
        "postcss-loader",
        "sass-loader"
      ]
    },
    // 只要scss 文件的后缀全部开启modules
    {
      test: /\.less$/i,
      use: [
        isDev ? "style-loader" : MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            importLoaders: 2,
            modules: {
              localIdentName: "[folder]-[local]-[hash:base64:5]"
            },
            localsConvention: "camelCase"
          }
        },
        "postcss-loader",
        "less-loader"
      ]
    },
    // 只要是css 结尾的都不开启modules
    {
      test: /\.css$/i,
      use: [
        isDev ? "style-loader" : MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            importLoaders: 1,
            url: true,
            localsConvention: "camelCase"
          }
        },
        "postcss-loader"
      ]
    },
    {
      test: /\.(png|jpg|svg|gif)$/,
      use: [
        {
          loader: "url-loader",
          options: {
            limit: 1000,
            name: "[name][hash:8].[ext]",
            fallback: "file-loader",
            // // 将图片打包到该公共目录下
            outputPath: "assets"
          }
        }
      ]
    }
  ]
};
const { css = [] } = getCustomConfig();
css.forEach(element => {
  config.rules.forEach((item, index) => {
    if (
      item.test.toString() === element.test.toString() &&
      item.include === element.include
    ) {
      config.rules[index] = element;
    }
  });
});
module.exports = config;
