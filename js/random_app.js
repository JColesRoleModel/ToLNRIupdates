// Random Routine Logic
const RandomApp = (function () {
    const ROUTINE_OPTIONS = {
        all: [
            { path: 'eyes', routine: 'FULL' },
            { path: 'eyes', routine: 'GROUND' },
            { path: 'eyes', routine: 'RESTORE' },
            { path: 'eyes', routine: 'ALERT' },
            { path: 'lower', routine: 'HIPS1' },
            { path: 'lower', routine: 'HIPS2' },
            { path: 'upper', routine: 'RANDOM' }, // Need to ensure apps handle 'RANDOM' if passed
            { path: 'head', routine: 'RANDOM' },
            { path: 'mudras', routine: null },
            { path: 'breathwork', routine: null }
        ],
        eyes: [
            { path: 'eyes', routine: 'FULL' },
            { path: 'eyes', routine: 'GROUND' },
            { path: 'eyes', routine: 'RESTORE' },
            { path: 'eyes', routine: 'ALERT' }
        ],
        breath: [{ path: 'breathwork', routine: null }],
        lower: [
            { path: 'lower', routine: 'HIPS1' },
            { path: 'lower', routine: 'HIPS2' }
        ],
        upper: [{ path: 'upper', routine: 'CUSTOM' }], // Changed RANDOM to CUSTOM or a valid key
        head: [{ path: 'head', routine: 'CUSTOM' }],
        mudra: [{ path: 'mudras', routine: null }]
    };

    function init() {
        const cards = document.querySelectorAll('.random-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                const options = ROUTINE_OPTIONS[type];
                if (!options) return;

                const choice = options[Math.floor(Math.random() * options.length)];

                // Add visual feedback
                card.classList.add('clicked');
                setTimeout(() => {
                    card.classList.remove('clicked');
                    if (window.Router) {
                        const params = choice.routine ? { routine: choice.routine } : {};
                        window.Router.navigate(choice.path, params);
                    }
                }, 300);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    return { init };
})();
window.RandomApp = RandomApp;
