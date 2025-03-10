import { I18nManager, Platform } from "react-native";


export const IsIOS = Platform.OS === 'ios'; 

export const isRTL = I18nManager.isRTL;