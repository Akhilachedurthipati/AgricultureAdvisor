import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'India / Global' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'North / Central India' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh & Telangana' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu & Puducherry' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Kerala' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal & Tripura' }
];

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  ta: { translation: ta },
  kn: { translation: kn },
  ml: { translation: ml },
  mr: { translation: mr },
  bn: { translation: bn }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'agri_preferred_language',
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // React already escapes values safely
    },
    react: {
      useSuspense: false
    }
  });

// Keep document HTML lang attribute updated
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;

