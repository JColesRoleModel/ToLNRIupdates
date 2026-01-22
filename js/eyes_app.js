// Neuro‑Ocular Activation app script
const EyesApp = (function () {
  const IMAGE_BASE_PATH = "InnervationSVGs/";

  const ROUTINES = {
    FULL: [
      { file: "9_HEIGHT_C_D_IMG.svg", order: 1 },
      { file: "9_WEST_C_D_IMG.svg", order: 2 },
      { file: "9_DEPTH_C_D_IMG.svg", order: 3 },
      { file: "9_EAST_C_D_IMG.svg", order: 4 },
      { file: "9_HEIGHTWEST_C_D_IMG.svg", order: 5 },
      { file: "9_HEIGHTEAST_C_D_IMG.svg", order: 6 },
      { file: "9_DEPTHWEST_C_D_IMG.svg", order: 7 },
      { file: "9_DEPTHEAST_C_D_IMG.svg", order: 8 },
      { file: "9_INWARD_C_D_IMG.svg", order: 9 }
    ],
    CORE: [
      { file: "9_HEIGHT_C_D_IMG.svg", order: 1 },
      { file: "9_DEPTH_C_D_IMG.svg", order: 2 },
      { file: "9_WEST_C_D_IMG.svg", order: 3 },
      { file: "9_EAST_C_D_IMG.svg", order: 4 }
    ],
    DIAGONAL: [
      { file: "9_HEIGHTWEST_C_D_IMG.svg", order: 1 },
      { file: "9_HEIGHTEAST_C_D_IMG.svg", order: 2 },
      { file: "9_DEPTHWEST_C_D_IMG.svg", order: 3 },
      { file: "9_DEPTHEAST_C_D_IMG.svg", order: 4 }
    ],
    ALERT: [
      { file: "9_HEIGHT_C_D_IMG.svg", order: 1 },
      { file: "9_WEST_C_D_IMG.svg", order: 2 },
      { file: "9_EAST_C_D_IMG.svg", order: 3 },
      { file: "9_HEIGHTEAST_C_D_IMG.svg", order: 4 },
      { file: "9_INWARD_C_D_IMG.svg", order: 5 }
    ],
    GROUND: [
      { file: "9_DEPTHWEST_C_D_IMG.svg", order: 1 },
      { file: "9_DEPTH_C_D_IMG.svg", order: 2 },
      { file: "9_DEPTHEAST_C_D_IMG.svg", order: 3 },
      { file: "9_WEST_C_D_IMG.svg", order: 4 },
      { file: "9_INWARD_C_D_IMG.svg", order: 5 }
    ],
    RESTORE: [
      { file: "9_DEPTHWEST_C_D_IMG.svg", order: 1 },
      { file: "9_DEPTHEAST_C_D_IMG.svg", order: 2 },
      { file: "9_INWARD_C_D_IMG.svg", order: 3 },
      { file: "9_INWARD_C_D_IMG.svg", order: 4 }
    ]
  };

  const FILE_TO_LABEL = {
    "9_HEIGHT_C_D_IMG.svg": "Height (Up) ⬆️",
    "9_DEPTH_C_D_IMG.svg": "Depth (Down) ⬇️",
    "9_WEST_C_D_IMG.svg": "West (Right) ➡️",
    "9_EAST_C_D_IMG.svg": "East (Left) ⬅️",
    "9_HEIGHTWEST_C_D_IMG.svg": "Height‑West (Up‑Right) ↗️",
    "9_HEIGHTEAST_C_D_IMG.svg": "Height‑East (Up‑Left) ↖️",
    "9_DEPTHWEST_C_D_IMG.svg": "Depth‑West (Down‑Right) ↘️",
    "9_DEPTHEAST_C_D_IMG.svg": "Depth‑East (Down‑Left) ↙️",
    "9_INWARD_C_D_IMG.svg": "Inward (Circular) 🎯"
  };

  let selectedRoutineKey = null;
  let selectedRoutineMovements = [];
  let prefs = { secondsPerMovement: 45, restBetween: 3, rounds: 2 };
  let isRunning = false;
  let movementTimerId = null;
  let currentMovementIndex = 0;
  let currentRound = 1;
  let currentPhase = "idle";
  let secondsRemaining = 0;
  let lazyLoader = null;
  let audioEnabled = true;
  let audioEl;

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  function playDing() {
    if (!audioEnabled || !audioEl) return;
    try { audioEl.currentTime = 0; audioEl.play(); } catch (e) { }
  }

  function switchScreen(screenId) {
    const container = document.getElementById('view-eyes');
    if (!container) return;
    const screens = Array.from(container.querySelectorAll(".screen"));
    screens.forEach(s => {
      s.classList.toggle("screen-active", s.id === screenId);
    });
  }

  function prettyRoutineName(key) {
    if (key === "FULL") return "All 9 Points";
    if (key === "CORE") return "Main 4 Directions";
    if (key === "DIAGONAL") return "Supplemental 4 Angles";
    if (key === "ALERT") return "Alertness Flow";
    if (key === "GROUND") return "Grounding Flow";
    if (key === "RESTORE") return "Restoring Flow";
    return key;
  }

  function movementLabelFromFile(key, file) {
    return FILE_TO_LABEL[file] || file.replace(/_/g, " ");
  }

  function sortedMovementsFor(key) {
    const arr = ROUTINES[key] || [];
    return [...arr].sort((a, b) => a.order - b.order);
  }

  function handleCustomSequence() {
    const allFiles = Array.from(new Set([].concat(...Object.values(ROUTINES).map(arr => arr.map(m => m.file)))));
    const maxAllowed = Math.min(9, allFiles.length);
    let num = parseInt(prompt(`Enter number of gazes (3–${maxAllowed})`, "5"), 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > maxAllowed) num = maxAllowed;
    const shuffled = allFiles.sort(() => Math.random() - 0.5).slice(0, num);
    selectedRoutineKey = "CUSTOM";
    selectedRoutineMovements = shuffled.map((file, idx) => ({ file: file, order: idx + 1 }));
    qs("#eyes-prefs-title").textContent = "Custom Random";
    qs("#eyes-prefs-tagline").textContent = "Set your gaze duration and rest.";
    qs("#eyes-prefs-preview-label").textContent = "Custom Random";
    const strip = qs("#eyes-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("eyes-screen-prefs");
  }

  function renderRoutineCards() {
    const container = qs("#eyes-routine-list");
    if (!container) return;
    container.innerHTML = "";
    Object.keys(ROUTINES).forEach(key => {
      const moves = sortedMovementsFor(key);
      const card = document.createElement("div");
      card.className = "routine-card";
      const header = document.createElement("div");
      header.className = "routine-header-row";
      const title = document.createElement("div");
      title.className = "routine-name";
      title.textContent = prettyRoutineName(key);
      const count = document.createElement("div");
      count.className = "routine-count";
      count.textContent = moves.length + " gazes";
      header.appendChild(title); header.appendChild(count);
      card.appendChild(header);
      const strip = document.createElement("div");
      strip.className = "thumb-strip";
      moves.forEach(m => {
        const t = document.createElement("div");
        t.className = "thumb";
        const img = document.createElement("img");
        img.dataset.src = IMAGE_BASE_PATH + m.file;
        img.alt = movementLabelFromFile(key, m.file);
        t.appendChild(img);
        strip.appendChild(t);
        if (lazyLoader) lazyLoader.observe(img);
      });
      card.appendChild(strip);
      card.addEventListener("click", () => handleRoutineSelected(key));
      container.appendChild(card);
    });

    const customCard = document.createElement("div");
    customCard.className = "routine-card";
    customCard.innerHTML = `<div class="routine-header-row"><div class="routine-name">Custom Random</div><div class="routine-count">3–9 gazes</div></div>`;
    const strip = document.createElement("div");
    strip.className = "thumb-strip";
    customCard.appendChild(strip);
    customCard.addEventListener("click", handleCustomSequence);
    container.appendChild(customCard);
  }

  function handleRoutineSelected(key) {
    selectedRoutineKey = key;
    selectedRoutineMovements = sortedMovementsFor(key);
    qs("#eyes-prefs-title").textContent = prettyRoutineName(key);
    qs("#eyes-prefs-preview-label").textContent = prettyRoutineName(key);
    const strip = qs("#eyes-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("eyes-screen-prefs");
  }

  function pickRandomRoutine() {
    const keys = Object.keys(ROUTINES);
    handleRoutineSelected(keys[Math.floor(Math.random() * keys.length)]);
  }

  function collectPrefsAndStart() {
    const sec = parseInt(qs("#eyes-input-seconds").value, 10) || 45;
    const rest = parseInt(qs("#eyes-input-rest").value, 10) || 3;
    const rounds = parseInt(qs("#eyes-input-rounds").value, 10) || 2;
    prefs.secondsPerMovement = Math.max(5, sec);
    prefs.restBetween = Math.max(0, rest);
    prefs.rounds = Math.max(1, rounds);
    startRoutine();
  }

  function setupPlayerUI() {
    qs("#eyes-player-title").textContent = prettyRoutineName(selectedRoutineKey);
    qs("#eyes-player-preview-label").textContent = prettyRoutineName(selectedRoutineKey);
    const strip = qs("#eyes-player-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("eyes-screen-player");
  }

  const bar = document.getElementById("eyes-prog");
  let barDirectionForward = true;

  function animateProgressBarForMovement(seconds) {
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

  function startRoutine() {
    stopRoutineTimers();
    currentMovementIndex = 0; currentRound = 1; isRunning = true;
    qs("#eyes-btn-play-pause").textContent = "Pause";
    qs("#eyes-status-message").textContent = "";
    barDirectionForward = true;
    resetProgressBarInstant();
    if (window.timeTracker) window.timeTracker.startSession('Neuro-Ocular Activation', selectedRoutineKey);
    startPhase("move");
  }

  function stopRoutineTimers() {
    if (movementTimerId) { clearInterval(movementTimerId); movementTimerId = null; }
  }

  function startPhase(phase) {
    currentPhase = phase;
    if (phase === "move") {
      secondsRemaining = prefs.secondsPerMovement;
      resetProgressBarInstant();
      requestAnimationFrame(() => animateProgressBarForMovement(prefs.secondsPerMovement));
    } else {
      secondsRemaining = prefs.restBetween;
      if (bar) bar.style.transition = "none";
    }
    updateMovementUI();
    if (movementTimerId) clearInterval(movementTimerId);
    if (!isRunning) return;
    if (secondsRemaining <= 0) { handlePhaseComplete(); return; }
    movementTimerId = setInterval(() => {
      if (!isRunning) return;
      secondsRemaining--;
      if (secondsRemaining <= 0) { clearInterval(movementTimerId); movementTimerId = null; handlePhaseComplete(); }
      else updatePhaseLabel();
    }, 1000);
  }

  function handlePhaseComplete() {
    if (currentPhase === "move" && window.timeTracker) {
      const move = selectedRoutineMovements[currentMovementIndex];
      if (move) window.timeTracker.recordMovement(movementLabelFromFile(selectedRoutineKey, move.file), prefs.secondsPerMovement);
    }
    playDing();
    if (currentPhase === "move" && prefs.restBetween > 0) startPhase("rest");
    else advanceMovement();
  }

  function advanceMovement() {
    currentMovementIndex++;
    if (currentMovementIndex >= selectedRoutineMovements.length) {
      currentRound++;
      if (currentRound > prefs.rounds) { finishRoutine(); return; }
      currentMovementIndex = 0;
    }
    startPhase("move");
  }

  function finishRoutine() {
    isRunning = false;
    stopRoutineTimers();
    qs("#eyes-btn-play-pause").textContent = "Restart";
    qs("#eyes-phase-label").textContent = "Complete";
    qs("#eyes-status-message").textContent = "Sequence complete.";
    playDing();
    if (window.timeTracker) {
      window.timeTracker.stopSession();
      const sessionTime = window.timeTracker.getLastSessionDuration();
      if (window.TimeStatsUI) setTimeout(() => TimeStatsUI.showQuickSummary('Neuro-Ocular Activation', sessionTime), 500);
    }
  }

  function updateMovementUI() {
    const move = selectedRoutineMovements[currentMovementIndex];
    if (!move) return;
    qs("#eyes-current-movement-label").textContent = movementLabelFromFile(selectedRoutineKey, move.file);
    qs("#eyes-current-movement-image").src = IMAGE_BASE_PATH + move.file;
    qs("#eyes-movement-count").textContent = `Gaze ${currentMovementIndex + 1} of ${selectedRoutineMovements.length}`;
    qs("#eyes-round-count").textContent = `Round ${currentRound} of ${prefs.rounds}`;
    updatePhaseLabel();
  }

  function updatePhaseLabel() {
    let txt = "";
    if (currentPhase === "move") txt = `Gaze • ${secondsRemaining}s`;
    else if (currentPhase === "rest") txt = `Rest • ${secondsRemaining}s`;
    else txt = "Ready";
    qs("#eyes-phase-label").textContent = txt;
  }

  function togglePlayPause() {
    if (!selectedRoutineMovements.length) return;
    if (!isRunning && currentPhase === "idle") { startRoutine(); return; }
    if (isRunning) {
      isRunning = false; stopRoutineTimers();
      qs("#eyes-btn-play-pause").textContent = "Resume";
      if (bar) bar.style.transition = "none";
    } else {
      isRunning = true;
      qs("#eyes-btn-play-pause").textContent = "Pause";
      if (currentPhase === "move") animateProgressBarForMovement(secondsRemaining);
      startPhase(currentPhase || "move");
    }
  }

  function restartRoutine() { if (selectedRoutineMovements.length) startRoutine(); }

  function init() {
    lazyLoader = new LazyImageLoader({ rootMargin: '100px' });
    renderRoutineCards();
    qsa(".back-btn").forEach(btn => {
      if (btn.closest('#view-eyes')) {
        btn.addEventListener("click", () => {
          const target = btn.dataset.back;
          stopRoutineTimers(); isRunning = false;
          qs("#eyes-btn-play-pause").textContent = "Start";
          currentPhase = "idle";
          qs("#eyes-phase-label").textContent = "Ready";
          switchScreen(target);
        });
      }
    });

    const randomBtn = qs("#eyes-btn-random");
    if (randomBtn) randomBtn.addEventListener("click", pickRandomRoutine);
    qs("#eyes-btn-start-routine").addEventListener("click", collectPrefsAndStart);
    qs("#eyes-btn-play-pause").addEventListener("click", togglePlayPause);
    qs("#eyes-btn-restart").addEventListener("click", restartRoutine);

    audioEl = document.getElementById("audio-ding");
    const audioToggle = document.getElementById("eyes-audio-toggle");
    if (audioToggle) {
      audioToggle.addEventListener("click", () => {
        audioEnabled = !audioEnabled;
        audioToggle.dataset.on = audioEnabled ? "1" : "0";
        audioToggle.querySelector(".pill-label").textContent = audioEnabled ? "On" : "Off";
      });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has("routine")) {
      const key = params.get("routine").toUpperCase();
      if (ROUTINES[key]) handleRoutineSelected(key);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init, loadRoutine: handleRoutineSelected };
})();
window.EyesApp = EyesApp;
