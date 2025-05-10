import 'react-native-gesture-handler';
import ApplicationNavigator from '@/navigation/Application';
import { persistor, storage, store } from '@/store';
import { ThemeProvider } from '@/theme/context/ThemeContext';
import { ActivityIndicator, I18nManager, View } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '@/translations';
import * as Sentry from '@sentry/react-native';
import React from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

function initSentry() {
  Sentry.init({
    dsn: 'https://03c561f706f33bd93950556b709e7366@o4509213076160512.ingest.de.sentry.io/4509213096083536',

    // Configure Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [Sentry.mobileReplayIntegration()],

    // uncomment the line below to enable Spotlight (https://spotlightjs.com)
    // spotlight: __DEV__,
  });
}

// eslint-disable-next-line no-unused-expressions
!__DEV__ && initSentry();

const LoadingComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

function App() {
  const flash = React.useRef(null);
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingComponent />} persistor={persistor}>
          <ThemeProvider storage={storage}>
            <ApplicationNavigator />
            <FlashMessage statusBarHeight={insets.top} position="top" />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
function AppWrapper() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(AppWrapper);
