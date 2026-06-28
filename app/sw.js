const CACHE_NAME = 'speedtest-v3';

// Chỉ cache đúng các file tĩnh
const STATIC_ASSETS = [
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/favicon.ico'
];

// Các domain KHÔNG BAO GIỜ cache - luôn fetch từ network
const NETWORK_ONLY_HOSTS = [
    'cloudflare.com',
    'speed.cloudflare.com',
    '1.1.1.1',
    'jsdelivr.net',
    'cdn.jsdelivr.net'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
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

    // Network only cho tất cả external domains
    const isNetworkOnly = NETWORK_ONLY_HOSTS.some(host => url.hostname.includes(host));
    if (isNetworkOnly) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Network only cho app.js - luôn lấy mới nhất
    if (url.pathname === '/app.js' || url.pathname.endsWith('/app.js')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Cache first cho static assets
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
