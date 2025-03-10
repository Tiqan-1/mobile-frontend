import 'react-native-gesture-handler';

import { ActivityIndicator, View } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MMKV } from 'react-native-mmkv';

import { ThemeProvider } from '@/theme';
import ApplicationNavigator from '@/navigation/Application';

import {Provider} from 'react-redux';
import {persistor, storage, store} from '@/store';
import {PersistGate} from 'redux-persist/integration/react';

import '@/translations';

const LoadingComponent = () => (

  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

function App() {
  
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
      <GestureHandlerRootView>
          <ThemeProvider storage={storage}>
            <ApplicationNavigator />
          </ThemeProvider>
      </GestureHandlerRootView>
      </PersistGate>
    </Provider>

  );
}

export default App;
