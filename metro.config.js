const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('metro-config');

const {
  withSentryConfig
} = require("@sentry/react-native/metro");

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://docs.expo.dev/guides/customizing-metro
 *
 * @type {import('expo/metro-config').MetroConfig}
 */

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer/react-native'),
    unstable_allowRequireContext: true
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
};

module.exports = withSentryConfig(mergeConfig(defaultConfig, wrapWithReanimatedMetroConfig(config)));