import 'intl-pluralrules';

import type { Language } from '@/hooks/language/schema';
import { storage } from '@/store';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './ar.json';
import en from './en.json';
import { I18nManager } from 'react-native';
import { APP_LANGUTAGE } from '@/config';

export const defaultNS = ['screens', 'common'] as const;

// Key for storing language preference
const LANGUAGE_STORAGE_KEY = 'app_language';

export const resources = {
  ar,
  en,
} as const satisfies Record<Language, unknown>;

const storedLanguage = storage.getString(LANGUAGE_STORAGE_KEY) || APP_LANGUTAGE;
// console.log(storage);
// Initialize RTL for Arabic language
I18nManager.forceRTL(storedLanguage === APP_LANGUTAGE);
I18nManager.allowRTL(true);

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    defaultNS,
    fallbackLng: APP_LANGUTAGE,
    lng: storedLanguage,
    resources,
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    // add capitalization formatter
    i18n.services.formatter?.add(
      'capitalize',
      (value: string) =>
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    );
  });

export default i18n;
