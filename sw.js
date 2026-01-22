const CACHE_NAME = 'tolnri-v1';
const ASSETS = [
    './',
    './index.html',
    './breathwork.html',
    './eyes.html',
    './head.html',
    './lower.html',
    './mudras.html',
    './other.html',
    './random.html',
    './upper.html',
    './css/legs_style.css',
    './css/footer-nav.css',
    './css/completion-modal.css',
    './js/menu.js',
    './js/time-tracker.js',
    './js/time-stats-ui.js',
    './js/lazy-loader.js',
    './js/firebase-integration.js',
    './assets/logo/tolnrilogo.png'
];

// Install event - Cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // We use addAll but wrap it to not fail entirely if one 404s (optional robustness)
            // But for PWA strictness, addAll is good to ensure integrity.
            return cache.addAll(ASSETS);
        })
    );
    // Force activation immediately
    self.skipWaiting();
});

// Activate event - Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - Network first, falling back to cache
// (Or Cache first for assets, Network for data? Let's go Stale-While-Revalidate for HTML/CSS/JS)
// For simplicity and PWA checklist: Cache First or Network First.
// Let's use "Network First, fall back to Cache" for HTML to ensure updates are seen,
// and "Cache First" for static assets if possible.
// Given the simplicity, a simple "Cache falling back to Network" strategy is often fastest,
// but prompts issues with updates.
// Let's do: Try Network -> Cache (good for always fresh content if online).

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like Firebase) from the cache logic usually,
    // or let them pass through. Firebase SDK handles its own connectivity.
    // We only cache GET requests.
    if (event.request.method !== 'GET') return;

    // Skip firebase domains
    if (event.request.url.includes('firebase')) return;
    if (event.request.url.includes('googleapis')) return;
    if (event.request.url.includes('gstatic')) return;

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
