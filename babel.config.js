module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          assets: './src/assets',
          components: './src/components',
          containers: './src/containers',
          styles: './src/styles',
          utils: './src/utils',
          api: './src/api',
          screens: './src/screens',
          services: './src/services',
          store: './src/store',
          hooks: './src/hooks',
        },
      },
    ],
  ],
};
