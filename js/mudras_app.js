// Mudra Generator App
const MudrasApp = (function () {
  const IMAGE_BASE_PATH = "assets/mudras/";
  const TOTAL_MUDRAS = 45;
  const MUDRA_FILES = Array.from({ length: TOTAL_MUDRAS }, (_, i) => `${i + 1}.svg`);

  let mudraSequence = [];
  let prefs = { count: 3, secondsPerMudra: 45, restBetween: 3 };
  let isRunning = false;
  let currentIndex = 0;
  let currentPhase = "idle";
  let secondsRemaining = 0;
  let timerId = null;
  let lazyLoader = null;
  let audioEnabled = true;
  let audioEl = null;
  let bar = null;
  let barDirectionForward = true;

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  function playDing() {
    if (!audioEnabled || !audioEl) return;
    try { audioEl.currentTime = 0; audioEl.play(); } catch (e) { }
  }

  function switchScreen(id) {
    const container = document.getElementById('view-mudras');
    if (!container) return;
    const screens = Array.from(container.querySelectorAll(".screen"));
    screens.forEach(s => {
      s.classList.toggle("screen-active", s.id === id);
    });
  }

  function generateMudraSequence(count) {
    const maxCount = Math.min(count, MUDRA_FILES.length);
    const shuffled = [...MUDRA_FILES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, maxCount);
    mudraSequence = selected.map((file, idx) => ({ file, label: `Mudra ${idx + 1}` }));
  }

  function setupPlayerUI() {
    const title = qs("#mudras-player-title");
    const label = qs("#mudras-player-preview-label");
    const strip = qs("#mudras-player-preview-strip");
    if (title) title.textContent = "Mudra Session";
    if (label) label.textContent = "Sequence";
    if (strip) {
      strip.innerHTML = "";
      mudraSequence.forEach(m => {
        const d = document.createElement("div");
        d.className = "preview-thumb";
        const img = document.createElement("img");
        img.dataset.src = IMAGE_BASE_PATH + m.file;
        img.alt = m.label;
        d.appendChild(img);
        strip.appendChild(d);
        if (lazyLoader) lazyLoader.observe(img);
      });
    }
    updateMudraUI();
  }

  function animateProgressBarForPhase(seconds) {
    if (!bar) return;
    bar.style.transition = `width ${seconds}s linear`;
    bar.style.width = barDirectionForward ? "100%" : "0%";
    barDirectionForward = !barDirectionForward;
  }

  function resetProgressBarInstant() {
    if (!bar) return;
    bar.style.transition = "none";
    bar.style.width = barDirectionForward ? "0%" : "100%";
  }

  function prepareSession() {
    if (!mudraSequence.length) return;
    isRunning = false; currentIndex = 0; currentPhase = "idle";
    secondsRemaining = 0;
    resetProgressBarInstant();
    updateMudraUI();
    const phaseLabel = qs("#mudras-phase-label");
    if (phaseLabel) phaseLabel.textContent = "Ready";
    const playBtn = qs("#mudras-btn-play-pause");
    if (playBtn) playBtn.textContent = "Start";
    const status = qs("#mudras-status-message");
    if (status) status.textContent = "";
    switchScreen("mudras-screen-player");
  }

  function startSession() {
    if (!mudraSequence.length) return;
    if (isRunning) return;
    isRunning = true;
    const playBtn = qs("#mudras-btn-play-pause");
    if (playBtn) playBtn.textContent = "Pause";
    currentPhase = "move";
    secondsRemaining = prefs.secondsPerMudra;
    barDirectionForward = true;
    resetProgressBarInstant();
    if (window.timeTracker) window.timeTracker.startSession('Mudras', 'Random');
    requestAnimationFrame(() => animateProgressBarForPhase(prefs.secondsPerMudra));
    runTimerTick();
  }

  function runTimerTick() {
    if (timerId) clearInterval(timerId);
    updatePhaseLabel();
    timerId = setInterval(() => {
      if (!isRunning) return;
      secondsRemaining--;
      if (secondsRemaining <= 0) {
        clearInterval(timerId); timerId = null; handlePhaseComplete();
      } else updatePhaseLabel();
    }, 1000);
  }

  function handlePhaseComplete() {
    if (currentPhase === "move" && window.timeTracker) {
      const current = mudraSequence[currentIndex];
      if (current) window.timeTracker.recordMovement(current.label, prefs.secondsPerMudra);
    }
    playDing();
    if (currentPhase === "move" && prefs.restBetween > 0) {
      currentPhase = "rest"; secondsRemaining = prefs.restBetween;
      if (bar) bar.style.transition = "none";
      updatePhaseLabel();
      runTimerTick();
      return;
    }
    currentIndex++;
    if (currentIndex >= mudraSequence.length) { finishSession(); return; }
    currentPhase = "move"; secondsRemaining = prefs.secondsPerMudra;
    updateMudraUI();
    barDirectionForward = !barDirectionForward;
    resetProgressBarInstant();
    requestAnimationFrame(() => animateProgressBarForPhase(prefs.secondsPerMudra));
    runTimerTick();
  }

  function finishSession() {
    isRunning = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    const playBtn = qs("#mudras-btn-play-pause");
    if (playBtn) playBtn.textContent = "Restart";
    const phaseLabel = qs("#mudras-phase-label");
    if (phaseLabel) phaseLabel.textContent = "Complete";
    const status = qs("#mudras-status-message");
    if (status) status.textContent = "Session complete. Sit for a moment and notice what shifted.";
    playDing();
    if (window.timeTracker) {
      window.timeTracker.stopSession();
      const sessionTime = window.timeTracker.getLastSessionDuration();
      if (window.TimeStatsUI) setTimeout(() => TimeStatsUI.showQuickSummary('Mudras', sessionTime), 500);
    }
    if (window.routineCompletionPrompt) setTimeout(() => window.routineCompletionPrompt.show(), 2000);
  }

  function updateMudraUI() {
    const current = mudraSequence[currentIndex];
    const labelEl = qs("#mudras-current-mudra-label");
    const imgEl = qs("#mudras-current-mudra-image");
    const countEl = qs("#mudras-mudra-count");
    if (current) {
      if (labelEl) labelEl.textContent = current.label;
      if (imgEl) { imgEl.src = IMAGE_BASE_PATH + current.file; imgEl.alt = current.label; }
      if (countEl) countEl.textContent = `Mudra ${currentIndex + 1} of ${mudraSequence.length}`;
    } else {
      if (labelEl) labelEl.textContent = "Mudra";
      if (countEl) countEl.textContent = "";
    }
    updatePhaseLabel();
  }

  function updatePhaseLabel() {
    const phaseLabel = qs("#mudras-phase-label");
    if (!phaseLabel) return;
    let txt = "Ready";
    if (currentPhase === "move") txt = `Hold · ${secondsRemaining}s`;
    else if (currentPhase === "rest") txt = `Rest · ${secondsRemaining}s`;
    phaseLabel.textContent = txt;
  }

  function togglePlayPause() {
    if (!mudraSequence.length) return;
    const playBtn = qs("#mudras-btn-play-pause");
    if (!isRunning && currentPhase === "idle") { startSession(); return; }
    if (isRunning) {
      isRunning = false; if (timerId) { clearInterval(timerId); timerId = null; }
      if (playBtn) playBtn.textContent = "Resume";
      if (bar) bar.style.transition = "none";
    } else {
      isRunning = true; if (playBtn) playBtn.textContent = "Pause";
      if (currentPhase === "move") {
        barDirectionForward = !barDirectionForward;
        resetProgressBarInstant();
        requestAnimationFrame(() => animateProgressBarForPhase(secondsRemaining));
      }
      runTimerTick();
    }
  }

  function restartSession() {
    if (!mudraSequence.length) return;
    isRunning = false; if (timerId) { clearInterval(timerId); timerId = null; }
    currentIndex = 0; currentPhase = "idle"; secondsRemaining = 0;
    prepareSession();
  }

  function handleGenerateClick(single) {
    const countInput = qs("#mudras-input-mudra-count");
    const secInput = qs("#mudras-input-seconds");
    const restInput = qs("#mudras-input-rest");
    const status = qs("#mudras-status-message");

    let count = parseInt(countInput && countInput.value, 10) || prefs.count;
    let seconds = parseInt(secInput && secInput.value, 10) || prefs.secondsPerMudra;
    let rest = parseInt(restInput && restInput.value, 10);
    if (isNaN(rest)) rest = prefs.restBetween;
    if (single) count = 1;
    count = Math.max(1, Math.min(count, MUDRA_FILES.length));
    seconds = Math.max(5, Math.min(seconds, 300));
    rest = Math.max(0, Math.min(rest, 120));
    prefs.count = count; prefs.secondsPerMudra = seconds; prefs.restBetween = rest;
    if (status) status.textContent = "";

    generateMudraSequence(count);
    setupPlayerUI();
    prepareSession();
  }

  function init() {
    lazyLoader = new LazyImageLoader({ rootMargin: '100px' });
    audioEl = document.getElementById("audio-ding");
    bar = document.getElementById("mudras-prog");

    const audioToggle = qs("#mudras-audio-toggle");
    if (audioToggle) {
      audioToggle.addEventListener("click", () => {
        audioEnabled = !audioEnabled;
        audioToggle.dataset.on = audioEnabled ? "1" : "0";
        const labelSpan = audioToggle.querySelector(".pill-label");
        if (labelSpan) labelSpan.textContent = audioEnabled ? "On" : "Off";
      });
    }

    const genBtn = qs("#mudras-btn-generate-sequence");
    if (genBtn) genBtn.addEventListener("click", () => handleGenerateClick(false));
    const singleBtn = qs("#mudras-btn-single-mudra");
    if (singleBtn) singleBtn.addEventListener("click", () => handleGenerateClick(true));
    const playBtn = qs("#mudras-btn-play-pause");
    if (playBtn) playBtn.addEventListener("click", togglePlayPause);
    const restartBtn = qs("#mudras-btn-restart");
    if (restartBtn) restartBtn.addEventListener("click", restartSession);
    const backBtn = qs("#mudras-btn-back-to-config");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        isRunning = false; if (timerId) { clearInterval(timerId); timerId = null; }
        currentPhase = "idle";
        const phaseLabel = qs("#mudras-phase-label");
        if (phaseLabel) phaseLabel.textContent = "Ready";
        switchScreen("mudras-screen-config");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init };
})();
window.MudrasApp = MudrasApp;
