import type { ReactotronReactNative } from 'reactotron-react-native';

import Reactotron from 'reactotron-react-native';
import mmkvPlugin from 'reactotron-react-native-mmkv';

import config from '../app.json';
import { storage } from './App';



Reactotron.configure({
  name: config.expo.name,
  onDisconnect: () => {
  },
})
  .useReactNative()
  .use(mmkvPlugin<ReactotronReactNative>({ storage }))
  .connect();
