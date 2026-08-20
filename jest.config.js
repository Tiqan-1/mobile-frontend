module.exports = {
  preset: '@react-native/jest-preset',
  resolver: '<rootDir>/jest/resolver.js',
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    // Opaque native-module stubs — src/App.tsx statically imports every
    // screen via the navigator, and each of these reaches for a real
    // native module at import time that isn't present under Jest. None of
    // their actual behavior is exercised by the smoke test that needs
    // this — see __mocks__/nativeStub.js.
    '^react-native-pdf$': '<rootDir>/__mocks__/nativeStub.js',
    '^react-native-youtube-iframe$': '<rootDir>/__mocks__/nativeStub.js',
    '^expo-image$': '<rootDir>/__mocks__/expo-image.ts',
    // react-native-mmkv v4 is built on the native react-native-nitro-modules
    // Turbo Module, which doesn't exist under Jest — see the mock file.
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.ts',
    '^expo-updates$': '<rootDir>/__mocks__/expo-updates.ts',
  },
  setupFiles: [
    // react-native-gesture-handler's own mock — every screen tree pulls it
    // in (src/App.tsx imports it directly) and it hits a TurboModule that
    // doesn't exist under Jest without this.
    '<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/__mocks__/libs/index.ts'],
  // The RN preset's own pattern only lets react-native/@react-native
  // packages through the transform; everything else under node_modules is
  // left as-is (assumed CJS). Several deps ship ESM and need transforming
  // too, e.g. @reduxjs/toolkit -> immer's ESM build, which crashed the
  // suite outright before this (see docs/tasks/T0-hygiene.md).
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-modules-core|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-.*|@reduxjs/toolkit|immer|@sentry/react-native|@tanstack/react-query|redux-persist|react-redux|expo-image|expo-updates)/)',
  ],
};
