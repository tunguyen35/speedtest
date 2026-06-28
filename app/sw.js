const CACHE_NAME = 'speedtest-v2';

// Chỉ cache style và icons, KHÔNG cache app.js và API
const ASSETS = [
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // KHÔNG cache: app.js, API calls, CDN
  if (
    url.pathname.endsWith('app.js') ||
    url.hostname.includes('cloudflare.com') ||
    url.hostname.includes('1.1.1.1') ||
    url.hostname.includes('jsdelivr.net')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first cho static assets còn lại
  event.respondWith(
    
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
