// PWA Initialization Script
// Registers the Service Worker and handles simple installation logging

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Optional: Listen for the 'beforeinstallprompt' event to customize the install UI
// (Android only - largely)
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    // e.preventDefault();
    // Stash the event so it can be triggered later.
    // deferredPrompt = e;
    console.log('PWA install prompt intercepted');
});
