# WeatherNext

A weather app built with [Next.js](https://nextjs.org/) (Pages Router), React, Tailwind CSS and MUI. It fetches current weather data from the [OpenWeather API](https://openweathermap.org/api).

## Getting Started

**Prerequisites:** Node.js and npm. This project uses **npm** as its package manager (do not use yarn).

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with your OpenWeather API key:

```bash
NEXT_PUBLIC_WEATHER_KEY=your_api_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

| Command         | Description                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Create a production build        |
| `npm run start` | Serve the production build       |
| `npm run lint`  | Run ESLint through `next lint`   |

## Project Structure

```
.
├── components/        # Reusable UI components
│   ├── Notification.jsx # Snackbar for errors and language changes
│   ├── Search.jsx     # City search input + language toggle
│   ├── Spinner.jsx    # Loading indicator
│   └── Weather.jsx    # Weather results display
├── docs/              # Project documentation (e.g. i18n-plan.md)
├── hooks/             # Custom React hooks (state logic)
│   ├── useTranslation.js # i18n hook (translations + language toggle)
│   └── useWeather.js  # Weather state (data, loading, errors, locale refetch)
├── locales/           # Translation files, one JSON per locale
│   ├── en-US.json
│   └── es-CO.json
├── pages/             # Next.js routes
│   ├── _app.js        # App wrapper
│   ├── _document.js   # Custom document
│   └── index.js       # Home page (composes hooks and components)
├── public/            # Static assets (icons, images)
├── services/          # API calls, no React
│   └── weatherService.js # OpenWeather requests
├── styles/
│   └── globals.css    # Global styles (Tailwind directives)
├── next.config.js
├── postcss.config.js
└── tailwind.config.js
```

## Architecture

The code is split into layers, each with one job:

| Layer | Location | Responsibility |
| ----- | -------- | -------------- |
| Service | `services/` | Calls the API and returns the data. Takes plain parameters and doesn't use React, hooks or translations. |
| Hook | `hooks/` | Holds the React state for a feature (data, loading, errors) and calls the services. |
| Component | `components/` | Renders the UI. Gets its translated text from `useTranslation()`. |
| Page | `pages/` | Connects hooks and components and owns page-level UI state (e.g. the notification). |

Data flow for a search:

1. `Search` submits the form.
2. `pages/index.js` calls `getWeather(city)` from `useWeather`.
3. `useWeather` calls `getWeatherByCity(city, lang)` from `weatherService`.
4. `useWeather` updates `weather` and `isLoading`, or sends a translated error message through its `onError` callback.
5. `pages/index.js` renders `Weather`, `Spinner` or `Notification`.

## Internationalization (i18n)

The app supports Spanish (`es-CO`, default) and English (`en-US`) using Next.js [built-in i18n routing](https://nextjs.org/docs/pages/building-your-application/routing/internationalization) and static JSON files. No i18n library is used.

### How it works

- **Routing:** locales are configured in `next.config.js`. Spanish is served at `/` and English at `/en-US`. `localeDetection` is enabled, so on the first visit users with an English browser are redirected to `/en-US`.
- **Translations:** `locales/<locale>.json` holds every UI string, plus `apiLang` (the language code sent to OpenWeather).
- **`useTranslation` hook** (`hooks/useTranslation.js`) returns:
  - `t(key)`: the string for `key` in the current locale.
  - `locale`: the active locale.
  - `toggleLocale()`: switches to the other locale with a client-side route change. There's no page reload, and page state is preserved.
- **Components** call `useTranslation()` themselves instead of receiving translated strings as props.
- **Weather data:** when the locale changes, `useWeather` fetches the last searched city again, so the weather description from the API matches the new language.

### Usage

```jsx
import useTranslation from "../hooks/useTranslation";

const MyComponent = () => {
  const { t } = useTranslation();
  return <p>{t("humidity")}</p>;
};
```

### Adding a string

Add the same key to **every** file in `locales/`. A key missing from a locale returns `undefined`.

### Adding a locale

1. Add the locale code to `i18n.locales` in `next.config.js`.
2. Create `locales/<locale>.json` with all existing keys, including a valid OpenWeather `apiLang`.
3. Register it in the `translations` map in `hooks/useTranslation.js`.
4. `toggleLocale()` assumes there are exactly two locales. Replace it with a language selector.

See [docs/i18n-plan.md](docs/i18n-plan.md) for the implementation plan and the design decisions behind it.

## Guidelines

- Use **npm** only. Commit `package-lock.json`; do not add `yarn.lock`.
- Keep secrets in `.env` (git-ignored). Never commit it.
- Place reusable UI in `components/` (PascalCase `.jsx` files) and routes in `pages/`.
- Put API calls in `services/` and stateful logic in `hooks/` (`useXxx.js`). Keep pages focused on wiring them together.
- Style with Tailwind utility classes; use MUI components where already established.
- Never hardcode UI text. Add it to every file in `locales/` and read it with `t()` from `useTranslation`.
- Follow the existing code patterns, and keep changes scoped to what the task requires.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenWeather API Documentation](https://openweathermap.org/api)
