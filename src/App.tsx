import 'react-native-gesture-handler';

import { ActivityIndicator, I18nManager, View } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { ThemeProvider } from '@/theme/context/ThemeContext';
import ApplicationNavigator from '@/navigation/Application';

import { persistor, storage, store } from '@/store';

import '@/translations';

import React from 'react';

const LoadingComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

function App() {
  const flash = React.useRef(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingComponent />} persistor={persistor}>
          <ThemeProvider storage={storage}>
            <ApplicationNavigator />
            <FlashMessage statusBarHeight={0} ref={flash} position="top" />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
