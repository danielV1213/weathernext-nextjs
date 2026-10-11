# TypeScript Migration Plan

Migrate the project from JavaScript to TypeScript. Keep the current behavior, the layered architecture (service → hook → component → page) and the existing code patterns.

**Created on:** 11/10/2026

**Approved by:** Daniel Vélez

## Approach

Use **Next.js built-in TypeScript support** and migrate **file by file, bottom-up** through the layers. No runtime packages are added; only dev dependencies.

- Next 13.1 detects a `tsconfig.json`, generates `next-env.d.ts` and type-checks during `next build`. No Babel or webpack config is needed.
- `allowJs: true` lets `.js` and `.ts` files live side by side, so the app keeps working after every step.
- Migrating bottom-up (types → services → hooks → components → pages) means each file is converted after the things it imports already have types.
- Files are renamed with `git mv` to keep their history.

### Scope

| Converted                                      | Stays as JS                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `pages/`, `components/`, `hooks/`, `services/` | `next.config.js` (`next.config.ts` is only supported from Next 15)                                |
|                                                | `tailwind.config.js`, `postcss.config.js` (tooling configs, already typed via JSDoc where needed) |

Out of scope: upgrading Next.js, replacing `@next/font` / the legacy `layout` prop of `next/image`, adding ESLint config, or fixing existing bugs. Any of these found during the migration are noted, not fixed.

## Steps

### 0. Install dev dependencies ✅

```bash
npm install --save-dev typescript@^5 @types/react@^18 @types/react-dom@^18 @types/node@^20
```

- `@types/react` / `@types/react-dom` must match React 18 (the installed version).

### 1. Add `tsconfig.json` ✅

Create an empty `tsconfig.json` and run `npm run dev`. Next fills it with its defaults and creates `next-env.d.ts`. Then adjust:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- `next-env.d.ts` is committed but never edited (it also provides the types for static image imports like `spinner.gif`).
- `resolveJsonModule` is required to import `locales/*.json`.
- Add `.vscode/settings.json` so the editor uses the project's TypeScript instead of its bundled one:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "js/ts.tsdk.path": "node_modules/typescript/lib"
}
```

> **Found during implementation:** VS Code's bundled TypeScript (6.x) enables `noUncheckedSideEffectImports` by default, which flags `import "../styles/globals.css"` in `_app.tsx` (Next 13.1 only declares `*.module.css`). The project's TypeScript 5.9 doesn't, so `tsc` and the build passed while the editor showed an error.

> **Decided:** `strict: true` instead of Next's default `strict: false`. The codebase is small, so strict mode costs little now and avoids `any` leaking in later.

### 2. Shared types ✅

Create a `types/` folder for types used across layers.

`types/weather.ts`: only the fields of the OpenWeather response the app actually reads:

```ts
export interface WeatherCondition {
  description: string;
  icon: string;
}

export interface WeatherData {
  name: string;
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}
```

> **Decided:** type only the used fields (as above), not the full API response. Fields are added when a component starts using them.

`types/environment.d.ts`: types `process.env.NEXT_PUBLIC_WEATHER_KEY` as `string`.

```ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_WEATHER_KEY: string;
  }
}
```

### 3. Service: `services/weatherService.ts` ✅

- Type the parameters and the response with the axios generic:

```ts
import axios from "axios";
import type { WeatherData } from "../types/weather";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const getWeatherByCity = (
  city: string,
  lang: string,
): Promise<WeatherData> =>
  axios
    .get<WeatherData>(BASE_URL, {
      params: {
        q: city,
        units: "metric",
        lang,
        appid: process.env.NEXT_PUBLIC_WEATHER_KEY,
      },
    })
    .then((response) => response.data);
```

### 4. Hooks ✅

**`hooks/useTranslation.ts`**

Derive the key and locale types from the JSON files, so a key missing from a locale becomes a **compile error** instead of `undefined` at runtime:

```ts
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
```

- `useRouter()` types `locale` / `locales` as possibly `undefined`, hence the fallback.
- `Record<Locale, typeof es>` forces `en-US.json` to have every key of `es-CO.json`.

**`hooks/useWeather.ts`**

- Type the options: `{ onError?: (message: string) => void }`.
- Type the state: `useState<WeatherData | null>(null)` instead of `useState({})`.
- In the `catch`, use `axios.isAxiosError(error)` before reading `error.response?.data?.message` (the error is `unknown` in strict mode).
- Return type is inferred; no explicit interface needed.

> **Decided:** `WeatherData | null`. It requires changing `weather.main && ...` to `weather && ...` in `pages/index.tsx`. (`Partial<WeatherData>` with `{}` was discarded: it keeps the current check but weakens the types inside `Weather`.)

### 5. Components (`.jsx` → `.tsx`) ✅

> **Decided:** components only hold presentational logic, so their type signatures live outside them. Each component gets its own folder, with the component and its types in separate files:

```
components/
├── notification/
│   ├── Notification.tsx
│   └── Notification.types.ts
├── search/
│   ├── Search.tsx
│   └── Search.types.ts
├── spinner/
│   └── Spinner.tsx
└── weather/
    ├── Weather.tsx
    └── Weather.types.ts
```

- Folders are lowercase; the component and types files are PascalCase.
- `Component.types.ts` exports the `ComponentProps` interface. `Component.tsx` imports it with `import type` and keeps the current `const Component = ({ ... }: ComponentProps) => {}` pattern.
- A `.types.ts` file is only created when the component has types (`Spinner` has no props, so it has none).
- Move the files with `git mv` (e.g. `git mv components/Search.jsx components/search/Search.tsx`) to keep their history.
- Relative imports inside the components gain one level (`../hooks/...` → `../../hooks/...`, `../public/spinner.gif` → `../../public/spinner.gif`).
- `tailwind.config.js` needs no change: `./components/**/*.{js,ts,jsx,tsx}` already covers subfolders.

**`components/notification/Notification.types.ts`**

```ts
import type { SyntheticEvent } from "react";

export interface NotificationProps {
  isOpen: boolean;
  message: string;
  handleToClose: (
    event?: SyntheticEvent | Event | null,
    reason?: string,
  ) => void;
}
```

- The signature has to fit both `Snackbar.onClose` and `IconButton.onClick`.

> **Found during implementation:** the installed MUI version calls `Snackbar.onClose` with `event` set to `null`, so the signature accepts `null`.

**`components/search/Search.types.ts`**

```ts
import type { SyntheticEvent } from "react";

export interface SearchProps {
  fetchWeather: (e: SyntheticEvent) => void;
  setCity: (city: string) => void;
  handleLanguageChange: () => void;
}
```

- `fetchWeather` is used by both the form's `onSubmit` and the button's `onClick`, so it takes the common `SyntheticEvent`.

**`components/weather/Weather.types.ts`**

```ts
import type { WeatherData } from "../../types/weather";

export interface WeatherProps {
  data: WeatherData;
}
```

**`components/spinner/Spinner.tsx`**

- Move and rename only; no props. The `.gif` import is typed by `next-env.d.ts`.

### 6. Pages (`.js` → `.tsx`) ✅

**`pages/_app.tsx`**: type the props with `AppProps` from `next/app`.

**`pages/_document.tsx`**: rename only.

**`pages/index.tsx`**

- Update the component imports to the new paths (e.g. `../components/search/Search`).
- `useState<string | null>("")` for `snackbarMessage` (`handleLanguageChange` sets it to `null`).
- `handleToClose` and `fetchWeather` reuse the signatures from step 5 instead of redeclaring them. The type goes on the variable, not on the parameters:

```ts
const handleToClose: NotificationProps["handleToClose"] = (_event, reason) => { ... };
const fetchWeather: SearchProps["fetchWeather"] = (e) => { ... };
```

- `showError` takes `message: string`.
- Weather render: `weather && <Weather data={weather} />` (see the decision in step 4).

### 7. Cleanup ✅

- Search for leftover `.js` / `.jsx` files in the migrated folders. When none remain, set `allowJs: false`.
- Make sure `.gitignore` covers `*.tsbuildinfo` (generated by `incremental: true`).

> **Status:** no `.js` / `.jsx` files remain in the migrated folders and `.gitignore` already covers `*.tsbuildinfo`. Only `allowJs: false` is pending.

### 8. Documentation ✅

Update `README.md`:

- Intro: mention TypeScript.
- **Project Structure:** new extensions, one folder per component (`Component.tsx` + `Component.types.ts`), `types/` folder, `tsconfig.json`, `next-env.d.ts`.
- **Architecture / Data flow:** `pages/index.js` → `pages/index.tsx`.
- **i18n:** file names, the usage example (`tsx`), and **Adding a string** (a missing key is now a type error instead of returning `undefined`). **Adding a locale** also requires adding it to the `Locale` type.
- **Guidelines:** each component in its own lowercase folder with a PascalCase `.tsx` and, if it has props, a `.types.ts` file; hooks as `useXxx.ts`; shared types in `types/`; avoid `any`.
- **Scripts:** add `npx tsc --noEmit` as the way to type-check without building.
- **TypeScript:** new section summarizing the conventions above and linking to this plan.

### 9. Verification

1. `npx tsc --noEmit` passes with no errors.
2. `npm run build` passes (Next type-checks during the build). Stop the dev server first: both write to `.next/`, and building while `next dev` runs breaks the dev server with an `ENOENT` error on `.next/server/pages/index.js`.
3. `npm run dev`: search a valid city; weather, icon and labels render as before.
4. Search an invalid city in both languages; the translated error is shown.
5. Toggle the language with weather displayed: labels and the API description change, no reload.
6. Temporarily remove a key from `locales/en-US.json`: `tsc` reports an error. Restore it.
