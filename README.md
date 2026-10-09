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
│   ├── Search.jsx     # City search input
│   ├── Spinner.jsx    # Loading indicator
│   └── Weather.jsx    # Weather results display
├── pages/             # Next.js routes
│   ├── _app.js        # App wrapper
│   ├── _document.js   # Custom document
│   └── index.js       # Home page (fetches weather data)
├── public/            # Static assets (icons, images)
├── styles/
│   └── globals.css    # Global styles (Tailwind directives)
├── next.config.js
├── postcss.config.js
└── tailwind.config.js
```

## Guidelines

- Use **npm** only. Commit `package-lock.json`; do not add `yarn.lock`.
- Keep secrets in `.env` (git-ignored). Never commit it.
- Place reusable UI in `components/` (PascalCase `.jsx` files) and routes in `pages/`.
- Style with Tailwind utility classes; use MUI components where already established.
- Follow the existing code patterns, and keep changes scoped to what the task requires.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenWeather API Documentation](https://openweathermap.org/api)
