/** @type {import('ts-jest').JestConfigWithTsJest} */
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
    'react-native-reanimated/plugin', // needs to be last
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
