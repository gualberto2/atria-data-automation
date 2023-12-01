const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    popup: "./src/popup.js",
    inject: "./src/inject.js",
    newTabScript: "./src/newTabScript.js",
    service_worker: "./src/service_worker.js",
    // Add other entry points if needed
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      // Add other rules for different file types here
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./src/index.html",
      chunks: ["popup"],
    }),
    // Add other instances of HtmlWebpackPlugin for other HTML files if needed
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/xlsx.full.min.js", to: "xlsx.full.min.js" },
      ],
    }),
  ],
  mode: "development", // Or 'production'
  devtool: "inline-source-map", // For development
};
