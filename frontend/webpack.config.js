const path = require('path')
require('dotenv').config();

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, argv) => {
  const mode = argv.mode || 'development'

  return {
    mode: mode,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    devServer: {
      port: 3000,
      allowedHosts: ['localhost'],
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:5000',
          secure: false
        }
      ]
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html'
      })
    ]
  }
}
