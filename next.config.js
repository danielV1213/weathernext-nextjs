/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  i18n: {
    locales: ['es-CO','en-US'],
    defaultLocale: 'es-CO',
  },
  images: {
    domains: [
      'openweathermap.org',
      'images.pexels.com'
    ]
  }
}
