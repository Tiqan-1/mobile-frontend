module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
        extensions: ['.js', '.json'],
        root: ['./src'],
      },
    ],
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    'inline-dotenv',
    '@babel/plugin-proposal-export-namespace-from',
    'react-native-worklets/plugin',
  ],
  presets: ['module:@react-native/babel-preset'],
  "env": {
    "development": {
      "compact": false
    },
    "production": {
      "plugins": [
        [
          "transform-remove-console",
          {
            "exclude": [
              "error",
              "warn"
            ]
          }
        ]
      ]
    }
  },
};
