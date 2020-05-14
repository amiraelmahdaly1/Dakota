const devCerts = require("office-addin-dev-certs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");
const webpack = require("webpack");

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    
    devtool: "source-map",
    entry: {
      polyfill: "@babel/polyfill"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader", 
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader"
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: "file-loader"
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        filename: "Home.html",
        template: "./src/Home.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "Home.css",
          from: "./src/Home.css"
        }
      ]),
      new CopyWebpackPlugin([
        {
          to: "Home.js",
          from: "./src/Home.js"
        }
      ]),      
      new HtmlWebpackPlugin({
        filename: "AvTimes.html",
        template: "./src/AvTimes.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "AvTimesController.js",
          from: "./src/AvTimesController.js"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "BlockTimes.html",
        template: "./src/BlockTimes.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "BlockTimes.js",
          from: "./src/BlockTimes.js"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "Booking.html",
        template: "./src/Booking.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "BookingController.js",
          from: "./src/BookingController.js"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "CancelAppt.html",
        template: "./src/CancelAppt.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "CancelApptController.js",
          from: "./src/CancelApptController.js"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "Client.html",
        template: "./src/Client.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "ClientController.js",
          from: "./src/ClientController.js"
        }
      ]),
      new CopyWebpackPlugin([
        {
          to: "Common.js",
          from: "./src/Common.js"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "DailySchedule.html",
        template: "./src/DailySchedule.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "DailyScheduleController.js",
          from: "./src/DailyScheduleController.js"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "editAppt.html",
        template: "./src/editAppt.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "editApptController.js",
          from: "./src/editApptController.js"
        }
      ]),new HtmlWebpackPlugin({
        filename: "events.html",
        template: "./src/events.html"
      }),
      new HtmlWebpackPlugin({
        filename: "eventsE.html",
        template: "./src/eventsE.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "HomeController.js",
          from: "./src/HomeController.js"
        }
      ]),
      new HtmlWebpackPlugin({
        filename: "Index.html",
        template: "./src/Index.html"
      }),
      new CopyWebpackPlugin([
        {
          to: "IndexController.js",
          from: "./src/IndexController.js"
        }
      ]),
      new CopyWebpackPlugin([
        {
          to: "jquery.simple.dtpicker.js",
          from: "./src/jquery.simple.dtpicker.js"
        }
      ]),
      new CopyWebpackPlugin([
        {
          to: "jquery.simple.dtpicker.css",
          from: "./src/jquery.simple.dtpicker.css"
        }
      ]),
      new CopyWebpackPlugin([
        {
          to: "MessageBanner.js",
          from: "./src/MessageBanner.js"
        }
      ])
    ],
    devServer: {
      disableHostCheck: true,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },      
      https: (options.https !== undefined) ? options.https : await devCerts.getHttpsServerOptions(),
      port: process.env.npm_package_config_dev_server_port || 3000
    }
  };

  return config;
};
