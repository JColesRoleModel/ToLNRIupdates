const CACHE_NAME = 'innervation-v1';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'manifest.json',
    'css/legs_style.css',
    'css/footer-nav.css',
    'js/lazy-loader.js',
    'js/time-tracker.js',
    'js/time-stats-ui.js',
    'js/firebase-manager.js',
    'js/menu.js',
    'assets/pwa/icon-192.png',
    'assets/pwa/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Navigation requests: try network first, then cache (for latest content)
    // Asset requests: try cache first, then network (for speed)

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('index.html');
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Only return something here if we want a fallback image etc.
                // For now, failure is acceptable for non-critical assets
            });
        })
    );
});
