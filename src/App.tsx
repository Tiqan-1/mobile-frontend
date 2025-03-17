import 'react-native-gesture-handler';

import { ActivityIndicator, I18nManager, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import ApplicationNavigator from '@/navigation/Application';
import { persistor, storage, store } from '@/store';
import { ThemeProvider } from '@/theme/context/ThemeContext';

import '@/translations';

const LoadingComponent = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingComponent />} persistor={persistor}>
          <ThemeProvider storage={storage}>
            <ApplicationNavigator />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
