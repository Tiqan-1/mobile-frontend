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
  GREY_BACKGROUND: '#F5F8FB',
  NOTE_BACKGROUND: '#F2F2F2',
  GREY_BORDER: 'rgba(151, 151, 151, 0.12)',
  TRANSPARENT: 'transparent',
  PRIMARY_COLOR: '#F15A29', // Titles, icons
  PURPLE_BG: '#FFFFFF40', // Titles, icons
  SECONDARY_COLOR: '#1b0c75', // Titles, text
  TERTIARY_COLOR: '#7C8995', // Text, default
  BG_PRIMARY_COLOR: '#FB565A', // Buttons
  BG_SECONDARY_COLOR: '#1b0c75', // background color fot the app
  BG_TERTIARY_COLOR: '#c6c6c6', //PURPLE FAQ, SUBSCRIPTION
  LINE: '#E9ECEE',
  BUTTON_MAIN_COLOR: '#0D6EFD',
  BUTTON_SECONDARY_COLOR: '#F15A29',
  IntroColor: '#958CBE',
  colorForBG: '#F5F5F5',
  bestBW: '#120703',

  LOGOColor: '#1b0c75',
  BG_WITH_LOGO: '#F2F2F2',
  LOGOColor_INVERT: '#F2F2F2',
  BG_WITH_LOGO_INVERT: '#1b0c75',
};

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

export const FONT_SIZES = {
  TITLE: 'title',
  SMALL_TITLE: 'smallTitle',
  TEXT: 'text',
  LARGE_TEXT: 'largeText',
  SMALL_TEXT: 'smallText',
  EXTRA_SMALL_TEXT: 'extraSmallText',
  SUPER_SMALL_TEXT: 'superSmallText',
};

export const BUTTONS = {
  BUTTON_MAIN: 'normal',
};

export const SIZES = {
  DEVICE_WIDTH: device.width,
  DEVICE_HEIGHT: device.height,
  HEADER_HEIGHT: device.height > largeScreen ? 60 : 50,
  BOTTOM_BAR_HEIGHT: 55,
  DRAWER: 280,
};
