// react-native-svg-transformer turns `import Foo from './foo.svg'` into a
// default-exported React component at build time (see metro.config.js).
// The RN jest preset instead treats `.svg` as a binary asset file, so
// without this mock every SVG import in a test renders as an asset stub
// object instead of a component. Redirected via moduleNameMapper.
module.exports = 'SvgMock';
