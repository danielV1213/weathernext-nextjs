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
