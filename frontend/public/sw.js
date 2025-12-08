const CACHE_VERSION = 'v3';
const CACHE_NAME = 'libradesk-' + CACHE_VERSION;
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// URLs that should NEVER be cached
const NEVER_CACHE = [
    '/api/',
    'api.digilady.online',
    'localhost:8000'
];

self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // NEVER cache API requests - always go to network
    if (NEVER_CACHE.some(pattern => url.includes(pattern))) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    // Cache first for static assets
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    // Delete ALL old caches
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
