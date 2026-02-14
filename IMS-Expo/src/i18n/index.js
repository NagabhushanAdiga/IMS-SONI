import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import kn from './locales/kn.json';

const LANGUAGE_KEY = '@ims_language';

export const getStoredLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
};

export const setStoredLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (e) {
    console.warn('Could not save language preference', e);
  }
};

const initI18n = async () => {
  const lang = await getStoredLanguage();
  await i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, kn: { translation: kn } },
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
};

export default initI18n;
