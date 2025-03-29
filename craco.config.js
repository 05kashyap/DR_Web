const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Copy ONNX runtime WebAssembly files to output directory
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      
      // Add a rule to handle .wasm files
      webpackConfig.module.rules.push({
        test: /\.wasm$/,
        type: 'asset/resource',
      });
      
      return webpackConfig;
    },
  },
};