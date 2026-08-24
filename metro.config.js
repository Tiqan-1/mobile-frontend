const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

const { withSentryConfig } = require('@sentry/react-native/metro');

const { isStorybookEnabled } = require('./scripts/storybook-flag');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://docs.expo.dev/guides/customizing-metro
 *
 * @type {import('expo/metro-config').MetroConfig}
 */

defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  unstable_allowRequireContext: true,
};

defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...sourceExts, 'svg'],
};

// withStorybook is outermost, matching the existing outermost-Sentry order.
// When disabled (the STORYBOOK_ENABLED flag off) it returns early with a
// resolver that empties out every `storybook`/`@storybook/*` import and
// stubs `.rnstorybook`'s entry — Storybook code never reaches the bundle.
// It composes with (doesn't replace) whatever resolveRequest is already on
// the config, same "extend in place" rule as the rest of this file — see
// CLAUDE.md §3 "Native config" for why mergeConfig is banned here.
module.exports = withStorybook(withSentryConfig(wrapWithReanimatedMetroConfig(defaultConfig)), {
  enabled: isStorybookEnabled(),
});
