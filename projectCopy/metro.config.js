// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);

module.exports = {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      sourceExts: ['jsx', 'js', 'ts', 'tsx', 'cjs'],
    },
  };


  //KARTIK...
//   const { getDefaultConfig } = require("metro-config");
// module.exports = (async () => {
//   const defaultConfig = await getDefaultConfig();
//   const { assetExts } = defaultConfig.resolver;
//   return {
//     resolver: {
//       // Add bin to assetExts
//       assetExts: [...assetExts, "bin"],
//     },
//   };
// })();