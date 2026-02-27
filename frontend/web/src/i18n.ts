import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, fr, es } from "@shared/i18n";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
