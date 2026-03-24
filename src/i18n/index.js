import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';
// Stubs for others
import kn from './locales/kn.json';
import bn from './locales/bn.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import or from './locales/or.json';
import as from './locales/as.json';
import mni from './locales/mni.json';
import ml from './locales/ml.json';
import gom from './locales/gom.json';
import ur from './locales/ur.json';

const STORE_LANGUAGE_KEY = 'settings.lang';

const languageDetectorPlugin = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async function (callback) {
    try {
      await AsyncStorage.getItem(STORE_LANGUAGE_KEY).then((language) => {
        if (language) {
          return callback(language);
        } else {
          return callback('en');
        }
      });
    } catch (error) {
      console.log('Error reading language', error);
    }
  },
  cacheUserLanguage: async function (language) {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
    } catch (error) {}
  },
};

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  kn: { translation: kn },
  bn: { translation: bn },
  gu: { translation: gu },
  pa: { translation: pa },
  ta: { translation: ta },
  te: { translation: te },
  mr: { translation: mr },
  or: { translation: or },
  as: { translation: as },
  mni: { translation: mni },
  ml: { translation: ml },
  gom: { translation: gom },
  ur: { translation: ur },
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    resources,
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
