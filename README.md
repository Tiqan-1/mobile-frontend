This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

## Project Structure

```
src/
├── assets/          # Images, fonts, and other static files
├── components/      # Reusable UI components
├── config/         # Configuration files and constants
├── hooks/          # Custom React hooks
├── navigation/     # Navigation configuration and types
├── screens/        # Screen components
├── services/       # API and other service integrations
├── store/          # State management (Redux/Context)
├── theme/          # Theme configuration and styles
├── translations/   # Internationalization files
├── types/          # TypeScript type definitions
└── utils/          # Utility functions and helpers
```

## Features

- 🎨 **Theme Support**: Built-in theming system for consistent styling
- 🌐 **Internationalization**: Ready for multi-language support
- 📱 **Responsive Design**: Mobile-first approach
- 🔄 **State Management**: Integrated state management solution using redux-toolkit
- 🧪 **Testing Setup**: Jest configuration for unit testing
- 📝 **TypeScript**: Full TypeScript support
- 🎯 **ESLint & Prettier**: Code quality and formatting tools
- 🔍 **Reactotron**: Debugging tool integration

## Template Usage

### Initial Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```
3. Install iOS dependencies:
   ```bash
   cd ios && pod install && cd ..
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```


### Available Scripts
- `yarn start` - Start Metro bundler
- `yarn android` - Run Android app
- `yarn ios` - Run iOS app
- `yarn test` - Run tests
- `yarn lint` - Run linting
- `yarn lint:fix` - Fix linting issues
- `yarn pod-install` - Install iOS dependencies

## Getting Started the Project

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).


## Configuration

### Environment Variables
The project uses `react-native-config` for environment variables. Create a `.env` file in the root directory with your variables:

```env
API_URL=https://api.example.com
APP_ENV=development
```

### Babel Configuration
Located in `babel.config.js`, includes:
- Module resolver for absolute imports
- Environment variables support
- React Native preset

### TypeScript Configuration
Located in `tsconfig.json`, includes:
- Strict type checking
- Path aliases
- React Native specific types

### ESLint & Prettier
- ESLint configuration in `eslint.config.mjs`
- Prettier configuration in `.prettierrc.js`
- Run `yarn lint:fix` to automatically fix code style issues

## Theming

### Theme Structure
The theme system is located in `src/theme/` and includes:

```typescript
// src/theme/colors.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  // ... other colors
};

// src/theme/typography.ts
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  // ... other text styles
};
```

### Using the Theme

1. Access theme in components:
```typescript
import { useTheme } from '@/theme';

const MyComponent = () => {
  const { colors } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.primary, padding: spacing.md }}>
      <Text style={typography.h1}>Hello World</Text>
    </View>
  );
};
```

2. Customizing the theme:
   - Modify colors in `src/theme/colors.ts`
   - Adjust style in `src/theme/style.ts`
   - Update typography in `src/theme/typography.ts`

### Dark Mode Support
The theme system includes built-in dark mode support. Toggle between light and dark mode using the theme context:

```typescript
import { useTheme } from '@/theme';

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();
  
  return (
    <Button onPress={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'} />
  );
};
```

### Color Usage Guidelines

1. **Brand Colors**
   - Use `primary` for main actions and key UI elements
   - Use `secondary` for supporting actions and accents

2. **Background Colors**
   - Use `background` for main app background
   - Use `surface` for cards, modals, and elevated surfaces

3. **Text Colors**
   - Use `text.primary` for main content
   - Use `text.secondary` for supporting text
   - Use `text.disabled` for disabled states

4. **Status Colors**
   - Use `success` for positive actions and states
   - Use `error` for errors and destructive actions
   - Use `warning` for cautionary states
   - Use `info` for informational states

5. **Border Colors**
   - Use `border` for dividers and borders
   - Use `overlay` for modal backgrounds and overlays

## Development Guidelines

### Page Templates
- use the `rnscreen` for quick page start

### Code Style
- Follow the established ESLint and Prettier configurations
- Use TypeScript for all new files
- Follow the component structure in the `components` directory
- Keep components small and focused on a single responsibility

### State Management
- Use the provided store setup for global state
- Prefer local state when possible
- Follow the established patterns in the `store` directory

### Navigation
- Define new routes in the navigation configuration
- Use typed navigation for better type safety
- Follow the established navigation patterns

### Testing
- Write unit tests for utilities and hooks
- Test components using React Native Testing Library
- Follow the testing patterns in the `__tests__` directories

## Environment Variables

The project uses `.env` for environment variables. Make sure to:
1. Copy `.env.example` to `.env`
2. Fill in the required environment variables
3. Never commit the `.env` file

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
