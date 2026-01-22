// Legs Innervation app script
window.LegsApp = (function () {
  const IMAGE_BASE_PATH = "InnervationSVGs/";

  const ROUTINES = {
    FEET: [
      { file: "1_FEET_MIDCROSSRIGHT_D_IMG.svg", order: 1 },
      { file: "1_FEET_MIDCROSSLEFT_D_IMG.svg", order: 2 },
      { file: "1_FEET_SIDECROSSRIGHT_D_IMG.svg", order: 3 },
      { file: "1_FEET_SIDECROSSLEFT_D_IMG.svg", order: 4 },
      { file: "1_FEET_BACKRIGHT_D_IMG.svg", order: 5 },
      { file: "1_FEET_BACKLEFT_D_IMG.svg", order: 6 },
      { file: "1_FEET_OUTRIGHT_D_IMG.svg", order: 7 },
      { file: "1_FEET_OUTLEFT_D_IMG.svg", order: 8 }
    ],
    GROUNDING: [
      { file: "1_GROUNDING_FORWARD_D_IMG.svg", order: 1 },
      { file: "1_GROUNDING_OUT_D_IMG.svg", order: 2 },
      { file: "1_GROUNDING_IN_D_IMG.svg", order: 3 },
      { file: "1_GROUNDING_CROSSLEFT_D_IMG.svg", order: 4 },
      { file: "1_GROUNDING_CROSSRIGHT_D_IMG.svg", order: 5 }
    ],
    HIPS1: [
      { file: "1_HIPS1_LEFTFRONTIN_D_IMG.svg", order: 1 },
      { file: "1_HIPS1_LEFTFRONTOUT_D_IMG.svg", order: 2 },
      { file: "1_HIPS1_LEFTMIDIN_D_IMG.svg", order: 3 },
      { file: "1_HIPS1_LEFTMIDOUT_D_IMG.svg", order: 4 },
      { file: "1_HIPS1_LEFTREARIN_D_IMG.svg", order: 5 },
      { file: "1_HIPS1_LEFTREAROUT_D_IMG.svg", order: 6 },
      { file: "1_HIPS1_RIGHTFRONTIN_D_IMG.svg", order: 7 },
      { file: "1_HIPS1_RIGHTFRONTOUT_D_IMG.svg", order: 8 },
      { file: "1_HIPS1_RIGHTMIDIN_D_IMG.svg", order: 9 },
      { file: "1_HIPS1_RIGHTMIDOUT_D_IMG.svg", order: 10 },
      { file: "1_HIPS1_RIGHTREARIN_D_IMG.svg", order: 11 },
      { file: "1_HIPS1_RIGHTREAROUT_D_IMG.svg", order: 12 }
    ],
    HIPS2: [
      { file: "1_HIPS2_PLANKOPPOSITELEFTFRONT_D_IMG.svg", order: 1 },
      { file: "1_HIPS2_PLANKSAMELEFTFRONT_D_IMG.svg", order: 2 },
      { file: "1_HIPS2_PLANKSAMERIGHTFRONT_D_IMG.svg", order: 3 },
      { file: "1_HIPS2_PLANKOPPOSITERIGHTFRONT_D_IMG.svg", order: 4 },
      { file: "1_HIPS2_STAGGEROPPOSITERIGHTFRONT_D_IMG.svg", order: 5 },
      { file: "1_HIPS2_STAGGEROPPOSITELEFTFRONT_D_IMG.svg", order: 6 },
      { file: "1_HIPS2_STAGGERSAMELEFTFRONT_D_IMG.svg", order: 7 },
      { file: "1_HIPS2_STAGGERSAMERIGHTFRONT_D_IMG.svg", order: 8 }
    ]
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
  let audioEl = null;

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

  function switchScreen(screenId) {
    const container = document.getElementById('view-lower');
    if (!container) return;
    const screens = Array.from(container.querySelectorAll(".screen"));
    screens.forEach(s => {
      s.classList.toggle("screen-active", s.id === screenId);
    });
  }

  function prettyRoutineName(key) {
    if (key === "FEET") return "FEET / SHINS";
    if (key === "GROUNDING") return "GROUNDING";
    if (key === "HIPS1") return "HIPS I";
    if (key === "HIPS2") return "HIPS II";
    return key;
  }

  function movementLabelFromFile(key, file) {
    const base = file.replace(".svg", "");
    const parts = base.split("_");
    const routinePart = parts[1] || key;
    const movePart = parts[2] || "";
    return (routinePart + " " + movePart).toLowerCase().replace(/_/g, " ").split(" ").filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  function sortedMovementsFor(key) {
    const arr = ROUTINES[key] || [];
    return [...arr].sort((a, b) => a.order - b.order);
  }

  function handleCustomSequence() {
    const allMoves = Array.from(new Set([].concat(...Object.values(ROUTINES).map(arr => arr.map(m => m.file)))));
    const maxAllowed = Math.min(12, allMoves.length);
    let num = parseInt(prompt(`Enter number of movements (3–${maxAllowed})`, "5"), 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > maxAllowed) num = maxAllowed;
    const selectedFiles = allMoves.sort(() => Math.random() - 0.5).slice(0, num);
    selectedRoutineKey = "CUSTOM";
    selectedRoutineMovements = selectedFiles.map((file, idx) => ({ file: file, order: idx + 1 }));

    qs("#lower-prefs-title").textContent = "Custom Random";
    qs("#lower-prefs-tagline").textContent = "Set your preferred timing, then begin.";
    qs("#lower-prefs-preview-label").textContent = "Custom Random";
    const strip = qs("#lower-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("lower-screen-prefs");
  }

  function renderRoutineCards() {
    const container = qs("#lower-routine-list");
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
      count.textContent = moves.length + " movements";
      header.appendChild(title); header.appendChild(count);
      card.appendChild(header);

      const strip = document.createElement("div");
      strip.className = "thumb-strip";
      moves.forEach(m => {
        const t = document.createElement("div");
        t.className = "thumb";
        const img = document.createElement('img');
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
    customCard.innerHTML = `<div class="routine-header-row"><div class="routine-name">Custom Random</div><div class="routine-count">3–12 movements</div></div>`;
    const strip = document.createElement("div");
    strip.className = "thumb-strip";
    customCard.appendChild(strip);
    customCard.addEventListener("click", handleCustomSequence);
    container.appendChild(customCard);
  }

  function handleRoutineSelected(key) {
    selectedRoutineKey = key;
    selectedRoutineMovements = sortedMovementsFor(key);
    qs("#lower-prefs-title").textContent = prettyRoutineName(key);
    qs("#lower-prefs-preview-label").textContent = prettyRoutineName(key);
    const strip = qs("#lower-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("lower-screen-prefs");
  }

  function pickRandomRoutine() {
    const keys = Object.keys(ROUTINES);
    handleRoutineSelected(keys[Math.floor(Math.random() * keys.length)]);
  }

  function collectPrefsAndStart() {
    const sec = parseInt(qs("#lower-input-seconds").value, 10) || 45;
    const rest = parseInt(qs("#lower-input-rest").value, 10) || 3;
    const rounds = parseInt(qs("#lower-input-rounds").value, 10) || 2;
    prefs.secondsPerMovement = Math.max(5, sec);
    prefs.restBetween = Math.max(0, rest);
    prefs.rounds = Math.max(1, rounds);
    startRoutine();
  }

  function setupPlayerUI() {
    qs("#lower-player-title").textContent = prettyRoutineName(selectedRoutineKey);
    qs("#lower-player-preview-label").textContent = prettyRoutineName(selectedRoutineKey);
    const strip = qs("#lower-player-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("lower-screen-player");
  }

  const bar = document.getElementById("lower-prog");
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
    setupPlayerUI();
    currentMovementIndex = 0; currentRound = 1; isRunning = true;
    qs("#lower-btn-play-pause").textContent = "Pause";
    qs("#lower-status-message").textContent = "";
    barDirectionForward = true;
    resetProgressBarInstant();
    if (window.timeTracker) window.timeTracker.startSession('Lower Body Innervation', selectedRoutineKey);
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
    qs("#lower-btn-play-pause").textContent = "Restart";
    qs("#lower-phase-label").textContent = "Complete";
    qs("#lower-status-message").textContent = "Routine complete.";
    playDing();
    if (window.timeTracker) {
      window.timeTracker.stopSession();
      const sessionTime = window.timeTracker.getLastSessionDuration();
      if (window.TimeStatsUI) setTimeout(() => TimeStatsUI.showQuickSummary('Lower Body Innervation', sessionTime), 500);
    }
  }

  function updateMovementUI() {
    const move = selectedRoutineMovements[currentMovementIndex];
    if (!move) return;
    qs("#lower-current-movement-label").textContent = movementLabelFromFile(selectedRoutineKey, move.file);
    qs("#lower-current-movement-image").src = IMAGE_BASE_PATH + move.file;
    qs("#lower-movement-count").textContent = `Movement ${currentMovementIndex + 1} of ${selectedRoutineMovements.length}`;
    qs("#lower-round-count").textContent = `Round ${currentRound} of ${prefs.rounds}`;
    updatePhaseLabel();
  }

  function updatePhaseLabel() {
    let txt = "";
    if (currentPhase === "move") txt = `Move · ${secondsRemaining}s`;
    else if (currentPhase === "rest") txt = `Transition · ${secondsRemaining}s`;
    else txt = "Ready";
    qs("#lower-phase-label").textContent = txt;
  }

  function togglePlayPause() {
    if (!selectedRoutineMovements.length) return;
    if (!isRunning && currentPhase === "idle") { startRoutine(); return; }
    if (isRunning) {
      isRunning = false; stopRoutineTimers();
      qs("#lower-btn-play-pause").textContent = "Resume";
      if (bar) bar.style.transition = "none";
    } else {
      isRunning = true;
      qs("#lower-btn-play-pause").textContent = "Pause";
      if (currentPhase === "move") animateProgressBarForMovement(secondsRemaining);
      startPhase(currentPhase || "move");
    }
  }

  function restartRoutine() { if (selectedRoutineMovements.length) startRoutine(); }

  function init() {
    lazyLoader = new LazyImageLoader({ rootMargin: '100px' });
    renderRoutineCards();

    // Back Buttons
    qsa(".back-btn").forEach(btn => {
      if (btn.closest('#view-lower')) {
        btn.addEventListener("click", () => {
          const target = btn.dataset.back;
          if (btn.closest("#lower-screen-player")) {
            stopRoutineTimers(); isRunning = false;
            qs("#lower-btn-play-pause").textContent = "Start";
            currentPhase = "idle";
            qs("#lower-phase-label").textContent = "Ready";
          }
          switchScreen(target);
        });
      }
    });

    qs("#lower-btn-random").addEventListener("click", pickRandomRoutine);
    qs("#lower-btn-start-routine").addEventListener("click", collectPrefsAndStart);
    qs("#lower-btn-play-pause").addEventListener("click", togglePlayPause);
    qs("#lower-btn-restart").addEventListener("click", restartRoutine);

    audioEl = document.getElementById("audio-ding");
    const audioToggle = document.getElementById("lower-audio-toggle");
    if (audioToggle) {
      audioToggle.addEventListener("click", () => {
        audioEnabled = !audioEnabled;
        audioToggle.dataset.on = audioEnabled ? "1" : "0";
        audioToggle.querySelector(".pill-label").textContent = audioEnabled ? "On" : "Off";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init, loadRoutine: handleRoutineSelected };
})();
