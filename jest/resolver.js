// Chains two custom Jest resolvers that each patch `options` before
// delegating to `options.defaultResolver`, so both fixes apply together:
//
// 1. react-native-worklets/jest/resolver.js strips the `native` condition
//    from resolvable extensions when resolving anything inside
//    react-native-worklets, so its NativeWorklets.native.ts (which reaches
//    for a real TurboModule that doesn't exist under Jest) is skipped in
//    favor of the plain, mockable implementation. Without this,
//    react-native-reanimated's setUpTests() crashes on
//    "Cannot read properties of undefined (reading 'loadUnpackers')".
// 2. @react-native/jest-preset's own resolver.js (the preset's default)
//    strips `exports` from react-native's own package.json so its
//    subpaths stay mockable.
//
// react-native-worklets' resolver calls `options.defaultResolver` directly,
// which would skip #2 if used alone — so its logic is inlined here and
// handed off to the RN preset's resolver instead of calling worklets'
// export directly.
const rnPresetResolver = require('@react-native/jest-preset/jest/resolver.js');

module.exports = (request, options) => {
  if (options.basedir.includes('react-native-worklets') || request.includes('react-native-worklets')) {
    options = {
      ...options,
      extensions: options.extensions?.filter(ext => !ext.includes('native')),
    };
  }
  return rnPresetResolver(request, options);
};
