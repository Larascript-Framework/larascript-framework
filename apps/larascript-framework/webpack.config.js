const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: './src/app.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@src': path.resolve(__dirname, 'src/'),
    },
    fallback: {
      kerberos: false,
      '@mongodb-js/zstd': false,
      '@aws-sdk/credential-providers': false,
      'gcp-metadata': false,
      'pg-hstore': false,
      'pg-native': false,
      snappy: false,
      socks: false,
      aws4: false,
      'mongodb-client-encryption': false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json')
          }
        },
        exclude: /node_modules/
      },
      {
        test: /example\.ts$/,
        exclude: /example\.ts$/
      }
    ]
  },
  externals: {
    // List node-specific packages here if you encounter issues, such as 'fs', 'path', etc.
  },
  ignoreWarnings: [(warning) => {
    return warning.message.includes("Critical dependency: the request of a dependency is an expression");
  }],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: true  // This option preserves function names
        }
      })
    ]
  }
};
