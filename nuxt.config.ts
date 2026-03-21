export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  css: ['~/assets/css/style.css'],
  devServer: {
    host: '0.0.0.0',
    port: 4000,
  },
  nitro: {
    preset: 'node-server',
  },
  app: {
    head: {
      title: 'gitbit',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
      ],
    },
  },
})
