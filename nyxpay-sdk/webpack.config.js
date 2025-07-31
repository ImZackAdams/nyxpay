// webpack.config.js

const path = require('path');
const webpack = require('webpack');

module.exports = {
  // Entry point for your SDK
  entry: './src/index.js',

  // Output configuration
  output: {
    // Directory to emit bundled files
    path: path.resolve(__dirname, 'dist'),

    // UMD bundle for browsers and Node
    filename: 'nyxpay-pay-sdk.umd.js',

    // Name of the global variable when included via <script>
    library: 'nyxpayPaySDK',

    // Export in UMD format (AMD, CommonJS, global)
    libraryTarget: 'umd',

    // Ensures the globalObject is correct in different environments
    globalObject: 'this',

    // Name the AMD module (optional, but conventional)
    umdNamedDefine: true
  },

  // Production mode for optimizations; use 'development' for faster builds
  mode: 'production',

  // Generate source maps for debugging
  devtool: 'source-map',

  module: {
    rules: [
      {
        // Transpile JS with Babel
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                // Targets can be customized as needed
                targets: "> 0.25%, not dead"
              }]
            ]
          }
        }
      }
    ]
  },

  resolve: {
    // Allow omitting extensions when importing
    extensions: ['.js'],

    // Fallbacks for Node built-ins (e.g., Buffer)
    fallback: {
      buffer: require.resolve('buffer/')
    }
  },

  plugins: [
    // Provide Buffer automatically without import
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ],

  // Don't bundle these dependencies; expect them as externals
  externals: {
    '@solana/web3.js': 'solanaWeb3',
    'bn.js': 'BN'
  }
};
