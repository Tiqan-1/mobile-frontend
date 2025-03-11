import type { Language } from './schema';

import i18next from 'i18next';
import memoize from 'lodash.memoize';
import { I18nManager } from 'react-native';
import RNRestart from 'react-native-restart';
import { storage } from '@/store';
import { SupportedLanguages } from './schema';

// import RNLocalize from 'react-native-localize';
// import { resources } from '@/translations';

// Key for storing language preference
const LANGUAGE_STORAGE_KEY = 'app_language';

// Define language constants to avoid using enum directly
export const LANG_AR = SupportedLanguages.AR;
export const LANG_EN = SupportedLanguages.EN;

const initializeRTL = (isRTL: boolean) => {
  I18nManager.forceRTL(isRTL);
  I18nManager.allowRTL(isRTL);
};

const changeLanguage = (lang: Language) => {
  // Store the selected language
  storage.set(LANGUAGE_STORAGE_KEY, lang);
  const restart = i18next.language !== lang;
  i18next.changeLanguage(lang);
  initializeRTL(lang === LANG_AR);
  if (restart) {
    setTimeout(() => {
      RNRestart.Restart();
    }, 500);
  }
};

const toggleLanguage = () => {
  const newLang = i18next.language === LANG_EN ? LANG_AR : LANG_EN;
  changeLanguage(newLang);
};

export const localizedNumber = (value) =>
  new Intl.NumberFormat(i18next.language).format(value);

const translate = memoize(
  (key: string, config?) => i18next.t(key, config),
  (key: string, config?) => (config ? key + JSON.stringify(config) : key)
);

export const useI18n = () => {
  return { changeLanguage, toggleLanguage, translate };
};

// export default function useLocalize() {
//   const setI18nConfig = () => {
//     // Try to get stored language first
//     const storedLanguage = storage.getString(LANGUAGE_STORAGE_KEY);

//     // If no stored language, find best available language
//     const fallbackTranslationSettings = { languageTag: LANG_EN, isRTL: false };

//     let { languageTag, isRTL } = fallbackTranslationSettings;

//     // Check if stored language is valid
//     const validLanguages = [LANG_AR, LANG_EN];
//     if (storedLanguage && validLanguages.includes(storedLanguage)) {
//       // Use stored language
//       languageTag = storedLanguage;
//       isRTL = languageTag === LANG_AR;
//     } else {
//       // Find best available language
//       const availableLanguages = Object.keys(resources);
//       const deviceLanguages = RNLocalize.getLocales().map(
//         (locale) => locale.languageCode
//       );

//       // Find the first device language that matches our available languages
//       const matchedLanguage = deviceLanguages.find((lang) =>
//         availableLanguages.includes(lang)
//       );

//       if (matchedLanguage) {
//         languageTag = matchedLanguage;
//         isRTL = matchedLanguage === LANG_AR;
//       }

//       // Store the detected language for future use
//       storage.set(LANGUAGE_STORAGE_KEY, languageTag);
//     }

//     if (translate.cache.clear) {
//       translate.cache.clear();
//     }

//     initializeRTL(isRTL);

//     // Type assertion to ensure languageTag is a valid key
//     const languageKey = languageTag as keyof typeof resources;

//     i18next.translations = {
//       [languageTag]: resources[languageKey],
//     };

//     i18next.locale = languageTag;
//   };

//   return { setI18nConfig, translate };
// }
