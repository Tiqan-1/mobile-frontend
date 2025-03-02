/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {I18nextProvider} from 'react-i18next';
import i18n from 'localization/i18n';
import LibraryScreen from 'screens/LibraryScreen';
import PDFViewerScreen from 'screens/PDFViewerScreen';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';

import {store, persistor} from 'store';
import {ActivityIndicator, View} from 'react-native';

const Stack = createNativeStackNavigator();
const LoadingComponent = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <ActivityIndicator size="large" />
  </View>
);

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingComponent />} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Library">
              <Stack.Screen name="Library" component={LibraryScreen} />
              <Stack.Screen
                name="PDFViewer"
                component={PDFViewerScreen}
                options={({route}) => ({
                  title: route.params?.document?.title || '',
                })}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </I18nextProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
