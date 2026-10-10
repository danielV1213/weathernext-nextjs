# i18n Implementation Plan

Replace the hardcoded if/else translation block in `pages/index.js` with static JSON translation files, a reusable hook, and Next.js built-in i18n routing.

**Created on:** 10/10/2026

**Approved by:** Daniel Vélez

## Approach

Use **Next.js built-in i18n routing + static JSON files + a small custom hook**. No new packages are needed.

- For 2 languages and ~10 strings, i18next is unnecessary overhead.
- Built-in routing provides the locale in the URL, sets `<html lang>` automatically, and persists the language on refresh.
- If the app grows, migrating to `next-i18next` (the Pages Router wrapper for i18next) is straightforward; the JSON files can be reused.

### Language switch UX

The translate button keeps its current behavior. It calls `router.push(asPath, asPath, { locale })`, which is a client-side transition to the same page:

- No page reload; `Home` is not remounted, so state (weather data, etc.) is preserved.
- Text switches instantly.
- URL changes to `/en-US` (Spanish stays at `/` as the default locale).

## Steps

### 0. Clean up unused dependencies ✅

`i18next`, `react-i18next`, `i18next-browser-languagedetector` and `i18next-http-backend` are installed but unused. The `i` package looks like an accidental `npm i i`.

```bash
npm uninstall i18next react-i18next i18next-browser-languagedetector i18next-http-backend i
```

### 1. Fix `next.config.js` ✅

`nextConfig` is currently defined but not exported, so `reactStrictMode` is lost. Merge everything into one object:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["es-CO", "en-US"],
    defaultLocale: "es-CO",
    localeDetection: true,
  },
  images: {
    domains: ["openweathermap.org", "images.pexels.com"],
  },
};

module.exports = nextConfig;
```

> **Decided:** `localeDetection` is enabled, so Next redirects users with an English browser to `/en-US` on first visit.

### 2. Add translation files ✅

Create `locales/es-CO.json` and `locales/en-US.json` with identical keys.

`locales/es-CO.json`:

```json
{
  "apiLang": "es",
  "langSB": "Español seleccionado",
  "placeholder": "Buscar ciudad",
  "weatherIn": "Clima en ",
  "feelsLike": "Se siente de",
  "humidity": "Humedad",
  "wind": "Viento",
  "errorMessage": "No se pudo obtener el clima. Intenta de nuevo."
}
```

`locales/en-US.json`:

```json
{
  "apiLang": "en",
  "langSB": "English selected",
  "placeholder": "Search city",
  "weatherIn": "Weather in ",
  "feelsLike": "Feels like",
  "humidity": "Humidity",
  "wind": "Wind",
  "errorMessage": "Couldn't get the weather. Please try again."
}
```

- `apiLang` replaces the hardcoded `sp`/`en` sent to OpenWeather (it accepts `es`).

> **Decided:** English uses its own `errorMessage` instead of falling back to OpenWeather's error text.

### 3. Create `hooks/useTranslation.js` ✅

Isolates all language logic from `index.js`:

```js
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
```

### 4. Refactor `pages/index.js` ✅

- Remove the `languageChange` state, the `let` variables and the if/else block.
- `const { t, toggleLocale } = useTranslation();`
- `handleLanguageChange` becomes: `toggleLocale(); setSnackbarMessage(null); setIsOpen(true);`
- API URL: `lang=${t("apiLang")}`.
- Error handler: `t("errorMessage") || error.response?.data?.message || ...`.

### 5. Components ✅

> **Decided:** Option B. Components read their own translations through `useTranslation()` instead of receiving translated strings as props from `index.js`. (Option A, passing `t(...)` values down as props, was discarded.)

**`pages/index.js`**

- Remove the `labels` object.
- `<Search>` receives `snackbarMessage={snackbarMessage}` instead of `labels`.
- `<Weather>` only receives `data`: `weather.main && <Weather data={weather} />`.
- `index.js` still uses `t` for `apiLang` and `errorMessage`, which are needed for fetching.

**`components/Search.jsx`**

- Import `useTranslation` and call `const { t } = useTranslation();`.
- Replace the `labels` prop with `snackbarMessage`.
- Input: `placeholder={t("placeholder")}`.
- Snackbar: `message={snackbarMessage || t("langSB")}`. An error message takes priority; otherwise the language confirmation is shown.

**`components/Weather.jsx`**

- Import `useTranslation` and call `const { t } = useTranslation();`.
- Props reduced to `{ data }`.
- Labels: `t("weatherIn") + data.name`, `t("feelsLike")`, `t("humidity")`, `t("wind")`.

Since every consumer reads `locale` from the router, a locale change re-renders all of them with the new strings, with no prop drilling.

### 6. Edge case: weather already displayed ✅

The weather description comes from the API in the requested language. Switching language after a search updates the labels but not the description. To fix it:

- Store the last searched city in its own state (`city` is cleared after each fetch).
- Add a `useEffect` on `locale` that fetches again when `weather.main` exists.

### 7. Verification ✅

1. `npm run dev`; `/` shows everything in Spanish (with a Spanish browser; an English browser is redirected to `/en-US`).
2. Press the translate button: URL becomes `/en-US`, text changes without reload, snackbar shows "English selected", weather data stays.
3. Refresh on `/en-US`: stays in English.
4. Search an invalid city in both languages and check the error message.
5. `npm run build` passes. (Built-in i18n doesn't work with `output: "export"`, which this project doesn't use.)
