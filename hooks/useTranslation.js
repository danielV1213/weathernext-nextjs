import { useRouter } from "next/router";
import es from "../locales/es-CO.json";
import en from "../locales/en-US.json";

const translations = { "es-CO": es, "en-US": en };

export default function useTranslation() {
  const { locale, locales, asPath, push } = useRouter();

  const t = (key) => translations[locale]?.[key];

  const toggleLocale = () => {
    const nextLocale = locales.find((l) => l !== locale);
    push(asPath, asPath, { locale: nextLocale, scroll: false });
  };

  return { t, locale, toggleLocale };
}
