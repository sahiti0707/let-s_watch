// Web configuration for let's_watch
// This file is used when building the web version via Expo

module.exports = {
  name: "let's_watch",
  shortName: 'letswatch',
  description: 'watch together. anywhere.',
  themeColor: '#0a0a0a',
  backgroundColor: '#0a0a0a',
  display: 'standalone',
  orientation: 'portrait',
  startUrl: '/',
  scope: '/',
  icons: [
    { src: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
