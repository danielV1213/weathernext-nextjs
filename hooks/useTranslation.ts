import { useRouter } from "next/router";
import es from "../locales/es-CO.json";
import en from "../locales/en-US.json";

export type Locale = "es-CO" | "en-US";
export type TranslationKey = keyof typeof es;

const translations: Record<Locale, typeof es> = { "es-CO": es, "en-US": en };

export default function useTranslation() {
  const { locale, locales, asPath, push, defaultLocale } = useRouter();
  const currentLocale = (locale ?? defaultLocale) as Locale;

  const t = (key: TranslationKey): string => translations[currentLocale][key];

  const toggleLocale = () => {
    const nextLocale = locales?.find((l) => l !== currentLocale);
    push(asPath, asPath, { locale: nextLocale, scroll: false });
  };

  return { t, locale: currentLocale, toggleLocale };
}
