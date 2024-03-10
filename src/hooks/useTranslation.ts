import { useTranslation } from "react-i18next";

const useLanguage = () => {
  const {
    i18n: { language },
  } = useTranslation();
  return language as "en" | "zh";
};

export default useLanguage;
