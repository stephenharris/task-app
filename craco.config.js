const { getLoader, loaderByName } = require("@craco/craco");

const webpack5esmInteropRule = {
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  };

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => { 
      
      //console.log(webpackConfig.module.rules);
      webpackConfig.module.rules[0].resolve = {
        fullySpecified: false
      }

      return webpackConfig; 
    },
  },
};