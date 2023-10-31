const path = require("path");
module.exports = {
  mode: "production",
  entry: {
    reactentry: "./src/index.js",
  },
  output: {
    path: path.resolve("dist"),
    filename: "main.js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env", "react"],
          },
        },
      },
      { test: /\.(jpg|png|svg|gif)$/, use: ["file-loader"] },
    ],
  },
};
