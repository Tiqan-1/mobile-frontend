# React Native Mobadrat

This is a modern React Native boilerplate with a well-organized project structure and essential configurations. The project is bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

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

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

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

## Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev)
- [Getting Started](https://reactnative.dev/docs/environment-setup)
- [Learn the Basics](https://reactnative.dev/docs/getting-started)
- [Blog](https://reactnative.dev/blog)
- [`@facebook/react-native`](https://github.com/facebook/react-native)


