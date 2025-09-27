import React from 'react';
import { Dimensions, I18nManager, Platform, View } from 'react-native';
export const enableDark = false;
// import deviceInfoModule from 'react-native-device-info';

export const PLATFORM = Platform.OS === 'ios' ? 'ios' : 'android';

export const AllowPayment = true; // Allow the payment in the app
export const isTestPayment = false; // It testing, will pay only 1 SAR for any order
export const isDevApi = __DEV__; //API test or live

const device = Dimensions.get('screen');

export const IsIOS = Platform.OS === 'ios';
export const isRTL = I18nManager.isRTL;

export const SCREEN = Dimensions.get('window');

const { width, height } = device;
// orientation must fixed
const SCREEN_WIDTH = width < height ? width : height;
// Remove it and use SIZES
export const DEVICE_WIDTH = device.width;
export const DEVICE_HEIGHT = device.height;
export const isFlipped = DEVICE_HEIGHT > DEVICE_WIDTH;
export const largeScreen = 768;


export const BUTTONS = {
  BUTTON_MAIN: 'normal',
};
