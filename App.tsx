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
import i18n from './src/localization/i18n';
import LibraryScreen from './src/screens/LibraryScreen';
import PDFViewerScreen from './src/screens/PDFViewerScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Library">
          <Stack.Screen
            name="Library"
            component={LibraryScreen}
            
          />
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
  );
};

export default App;
