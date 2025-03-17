import React from 'react';
import { Dimensions, I18nManager, Platform, View } from 'react-native';

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

export const LANGUAGES = ['English', 'عربي'];


const colorsLight = {
  gray100: '#DFDFDF',
  gray200: '#A1A1A1',
  gray400: '#4D4D4D',
  gray50: '#EFEFEF',
  gray800: '#303030',
  purple100: '#E1E1EF',
  purple50: '#1B1A23',
  purple500: '#44427D',
  red500: '#C13333',
  skeleton: '#A1A1A1',
} as const;

const colorsDark = {
  gray100: '#000000',
  gray200: '#BABABA',
  gray400: '#969696',
  gray50: '#EFEFEF',
  gray800: '#E0E0E0',
  purple100: '#252732',
  purple50: '#1B1A23',
  purple500: '#A6A4F0',
  red500: '#C13333',
  skeleton: '#303030',
} as const;


export const PALETTE = {
  WHITE: '#FFFFFF',
  BLACK: '#120703',
  GREEN: 'green',
  BLUE: '#1b0c75',
  GREY: '#7C8995',
  RED: '#FB565A',
  YELLOW: '#FEDB1D',
  PURPLE: '#B8AFF9',
  ORANGE: '#F15A29',
  GREY_BORDER: 'rgba(151, 151, 151, 0.12)',
  TRANSPARENT: 'transparent',
  PRIMARY_COLOR: '#F15A29',
  SECONDARY_COLOR: '#1b0c75',
  TERTIARY_COLOR: '#7C8995',
  BG_PRIMARY_COLOR: '#FB565A',
  BG_SECONDARY_COLOR: '#1b0c75',
  BG_TERTIARY_COLOR: '#c6c6c6',
  LINE: '#E9ECEE',
  BUTTON_MAIN_COLOR: '#0D6EFD',
  BUTTON_SECONDARY_COLOR: '#F15A29',
  bestBW: '#120703',
  LOGOColor: '#1b0c75',
  BG_WITH_LOGO: '#F2F2F2',
  APP_BG: colorsLight.gray50,

  ...colorsLight,
} as const;

export const PALETTEDARK = {
  WHITE: '#1B1A23',
  BLACK: '#FFFFFF',
  GREEN: 'green',
  BLUE: '#A6A4F0',
  GREY: '#969696',
  RED: '#FB565A',
  YELLOW: '#FEDB1D',
  PURPLE: '#B8AFF9',
  ORANGE: '#F15A29',
  GREY_BORDER: 'rgba(151, 151, 151, 0.3)',
  TRANSPARENT: 'transparent',
  PRIMARY_COLOR: '#A6A4F0',
  SECONDARY_COLOR: '#A6A4F0',
  TERTIARY_COLOR: '#969696',
  BG_PRIMARY_COLOR: '#FB565A',
  BG_SECONDARY_COLOR: '#252732',
  BG_TERTIARY_COLOR: '#303030',
  LINE: '#303030',
  BUTTON_MAIN_COLOR: '#0D6EFD',
  BUTTON_SECONDARY_COLOR: '#F15A29',
  bestBW: '#FFFFFF',
  LOGOColor: '#A6A4F0',
  BG_WITH_LOGO: '#252732',
  APP_BG: colorsDark.gray50,
  ...colorsDark,
} as const;
export const SHADOW = {
  shadowColor: PALETTE.GREY,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  // boxShadow: '0px 5px 20px 0px #00000014',
};
export const SHADOWINPUT = {
  shadowColor: PALETTE.BLACK,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 5,
  elevation: 5,
};

export const BUTTONS = {
  BUTTON_MAIN: 'normal',
};
