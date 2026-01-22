(() => {
  function initMenuDropdown() {
    const dropdown = document.querySelector('.menu-dropdown');
    if (!dropdown) return;
    const toggleBtn = dropdown.querySelector('.menu-button');
    const closeMenu = () => dropdown.classList.remove('open');

    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on link click
    dropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    dropdown.querySelectorAll('[data-menu-stats]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.timeStatsUI) {
          window.timeStatsUI.open();
        }
        closeMenu();
      });
    });
  }

  function initFooterStats() {
    // Also handling the new Dashboard Stats button
    const dashStatsBtn = document.getElementById('dash-stats-btn');
    if (dashStatsBtn) {
      dashStatsBtn.addEventListener('click', () => {
        if (window.timeStatsUI) window.timeStatsUI.open();
      });
    }

    // Populate Dashboard Widgets
    const weeklyTimeEl = document.getElementById('dash-weekly-time');
    const streakEl = document.getElementById('dash-streak');

    // Simple update if tracker exists
    const updateDash = () => {
      if (window.TimeTracker && window.timeTracker) {
        const stats = window.timeTracker.getSummaryStats();
        const seconds = stats.week;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        let timeStr = "0m";
        if (h > 0) timeStr = `${h}h ${m}m`;
        else timeStr = `${m}m`;

        if (weeklyTimeEl) weeklyTimeEl.textContent = timeStr;
        // Streak placeholder
        if (streakEl) streakEl.textContent = "0";
      }
    };

    // Run now
    updateDash();
    // And listen for updates
    window.addEventListener('time-tracker-update', updateDash);

    const footerStats = document.getElementById('footer-stats');
    if (footerStats) {
      footerStats.addEventListener('click', (e) => {
        if (window.timeStatsUI) {
          e.preventDefault();
          window.timeStatsUI.open();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenuDropdown();
    initFooterStats();
  });
})();
