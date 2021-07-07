import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./i18n/translation.json";

const DEFAULT_LANG = window.location.pathname.substr(1,2) === 'en' ? 'en' : 'zh'

i18n
  .use(initReactI18next)
  .init({
    resources,
    whitelist: ['en', 'zh'],
    lowerCaseLng: true,
    lng: DEFAULT_LANG,
    nsSeparator: false,
    keySeparator: false,
    debug: false,
    interpolation:{
      escapeValue: false
    }
  });

export default i18n;
