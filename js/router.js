// Simple Hash Router for SPA
const Router = (function () {
    const routes = {
        '': 'view-home',
        'home': 'view-home',
        'lower': 'view-lower',
        'upper': 'view-upper',
        'head': 'view-head',
        'eyes': 'view-eyes',
        'breathwork': 'view-breathwork',
        'mudras': 'view-mudras',
        'random': 'view-random',
        'other': 'view-other'
    };

    const appMap = {
        'lower': window.LegsApp,
        'upper': window.UpperApp,
        'head': window.HeadApp,
        'eyes': window.EyesApp,
        'breathwork': window.BreathApp,
        'mudras': window.MudrasApp
    };

    function init() {
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Handle initial load
    }

    function handleHashChange() {
        const hash = window.location.hash.slice(1); // Remove #
        const [path, query] = hash.split('?');
        const viewId = routes[path] || 'view-home';
        const params = new URLSearchParams(query);

        // Hide all views
        document.querySelectorAll('.spa-view').forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none'; // Ensure hidden
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
            targetView.style.display = 'block';
            window.scrollTo(0, 0); // Scroll to top
        }

        // Handle App routing (loadRoutine)
        const app = appMap[path];
        if (app && params.has('routine')) {
            const routine = params.get('routine');
            if (app.loadRoutine) {
                // Delay slightly to ensure view is visible/ready
                setTimeout(() => app.loadRoutine(routine.toUpperCase()), 50);
            }
        }
    }

    function navigate(path, params = {}) {
        // Construct hash
        let hash = '#' + path;
        const query = new URLSearchParams(params).toString();
        if (query) hash += '?' + query;
        window.location.hash = hash;
    }

    return { init, navigate };
})();

// Auto-init on load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", Router.init);
} else {
    Router.init();
}
window.Router = Router;
