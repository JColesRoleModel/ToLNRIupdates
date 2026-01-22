// Upper Body Innervation app script
window.UpperApp = (function () {
  const IMAGE_BASE_PATH = "InnervationSVGs/";

  const ROUTINES = {
    PALMSTOGETHER: [
      { file: "2_CLASPMID_LEFT_D_IMG.svg", order: 1 },
      { file: "2_CLASPMID_RIGHT_D_IMG.svg", order: 4 },
      { file: "2_CLASPUP_LEFT_D_IMG.svg", order: 3 },
      { file: "2_CLASPUP_RIGHT_D_IMG.svg", order: 6 },
      { file: "2_CLASPDOWN_LEFT_D_IMG.svg", order: 2 },
      { file: "2_CLASPDOWN_RIGHT_D_IMG.svg", order: 5 }
    ],
    PALMIN: [
      { file: "2_PALMIN_UP_D_IMG.svg", order: 1 },
      { file: "2_PALMIN_IN_D_IMG.svg", order: 2 },
      { file: "2_PALMIN_DOWN_D_IMG.svg", order: 3 },
      { file: "2_PALMIN_OUT_D_IMG.svg", order: 4 }
    ],
    PALMOPEN: [
      { file: "2_PALMOPEN_UP_D_IMG.svg", order: 1 },
      { file: "2_PALMOPEN_IN_D_IMG.svg", order: 2 },
      { file: "2_PALMOPEN_DOWN_D_IMG.svg", order: 3 },
      { file: "2_PALMOPEN_OUT_D_IMG.svg", order: 4 }
    ],
    PALMOUT: [
      { file: "2_PALMOUT_DOWN_D_IMG.svg", order: 1 },
      { file: "2_PALMOUT_OUT_D_IMG.svg", order: 2 },
      { file: "2_PALMOUT_UP_D_IMG.svg", order: 3 },
      { file: "2_PALMOUT_IN_D_IMG.svg", order: 4 }
    ],
    PALMCLOSED: [
      { file: "2_PALMCLOSED_UP_D_IMG.svg", order: 1 },
      { file: "2_PALMCLOSED_IN_D_IMG.svg", order: 2 },
      { file: "2_PALMCLOSED_DOWN_D_IMG.svg", order: 3 },
      { file: "2_PALMCLOSED_OUT_D_IMG.svg", order: 4 }
    ],
    HEARTOPEN: [
      { file: "2_HEARTOPEN_RIGHT_D_IMG.svg", order: 1 },
      { file: "2_HEARTOPEN_LEFT_D_IMG.svg", order: 2 },
      { file: "2_HEARTOPEN_BOTH_D_IMG.svg", order: 3 }
    ],
    HEARTPROTECTED: [
      { file: "2_HEARTPROTECTED_RIGHT_D_IMG.svg", order: 1 },
      { file: "2_HEARTPROTECTED_LEFT_D_IMG.svg", order: 2 },
      { file: "2_HEARTPROTECTED_BOTH_D_IMG.svg", order: 3 }
    ],
    SCAPULA: [
      { file: "2_SCAPULA_RIGHT_D_IMG.svg", order: 1 },
      { file: "2_SCAPULA_LEFT_D_IMG.svg", order: 2 },
      { file: "2_SCAPULA_BOTH_D_IMG.svg", order: 3 }
    ],
    CROSSOPENBACKWARD: [
      { file: "2_CROSSPALM_BACKWARD_0_IMG.svg", order: 1 },
      { file: "2_CROSSPALM_BACKWARD_45L_IMG.svg", order: 2 },
      { file: "2_CROSSPALM_BACKWARD_90L_IMG.svg", order: 3 },
      { file: "2_CROSSPALM_BACKWARD_135L_IMG.svg", order: 4 },
      { file: "2_CROSSPALM_BACKWARD_45R_IMG.svg", order: 5 },
      { file: "2_CROSSPALM_BACKWARD_90R_IMG.svg", order: 6 },
      { file: "2_CROSSPALM_BACKWARD_135R_IMG.svg", order: 7 }
    ],
    CROSSOPENDOWN: [
      { file: "2_CROSSPALM_DOWN_0_IMG.svg", order: 1 },
      { file: "2_CROSSPALM_DOWN_45L_IMG.svg", order: 2 },
      { file: "2_CROSSPALM_DOWN_90L_IMG.svg", order: 3 },
      { file: "2_CROSSPALM_DOWN_135L_IMG.svg", order: 4 },
      { file: "2_CROSSPALM_DOWN_45R_IMG.svg", order: 5 },
      { file: "2_CROSSPALM_DOWN_90R_IMG.svg", order: 6 },
      { file: "2_CROSSPALM_DOWN_135R_IMG.svg", order: 7 }
    ],
    CROSSOPENFORWARD: [
      { file: "2_CROSSPALM_FORWARD_0_IMG.svg", order: 1 },
      { file: "2_CROSSPALM_FORWARD_45L_IMG.svg", order: 2 },
      { file: "2_CROSSPALM_FORWARD_90L_IMG.svg", order: 3 },
      { file: "2_CROSSPALM_FORWARD_135L_IMG.svg", order: 4 },
      { file: "2_CROSSPALM_FORWARD_45R_IMG.svg", order: 5 },
      { file: "2_CROSSPALM_FORWARD_90R_IMG.svg", order: 6 },
      { file: "2_CROSSPALM_FORWARD_135R_IMG.svg", order: 7 }
    ],
    CROSSOPENREVERSE: [
      { file: "2_CROSSPALM_REVERSE_0_IMG.svg", order: 1 },
      { file: "2_CROSSPALM_REVERSE_45L_IMG.svg", order: 2 },
      { file: "2_CROSSPALM_REVERSE_90L_IMG.svg", order: 3 },
      { file: "2_CROSSPALM_REVERSE_135L_IMG.svg", order: 4 },
      { file: "2_CROSSPALM_REVERSE_45R_IMG.svg", order: 5 },
      { file: "2_CROSSPALM_REVERSE_90R_IMG.svg", order: 6 },
      { file: "2_CROSSPALM_REVERSE_135R_IMG.svg", order: 7 }
    ],
    CROSSOPENUP: [
      { file: "2_CROSSPALM_UP_0_IMG.svg", order: 1 },
      { file: "2_CROSSPALM_UP_45L_IMG.svg", order: 2 },
      { file: "2_CROSSPALM_UP_90L_IMG.svg", order: 3 },
      { file: "2_CROSSPALM_UP_135L_IMG.svg", order: 4 },
      { file: "2_CROSSPALM_UP_45R_IMG.svg", order: 5 },
      { file: "2_CROSSPALM_UP_90R_IMG.svg", order: 6 },
      { file: "2_CROSSPALM_UP_135R_IMG.svg", order: 7 }
    ],
    CROSSCLOSEDBACKWARD: [
      { file: "2_CROSSFIST_BACKWARD_0_IMG.svg", order: 1 },
      { file: "2_CROSSFIST_BACKWARD_45L_IMG.svg", order: 2 },
      { file: "2_CROSSFIST_BACKWARD_90L_IMG.svg", order: 3 },
      { file: "2_CROSSFIST_BACKWARD_135L_IMG.svg", order: 4 },
      { file: "2_CROSSFIST_BACKWARD_45R_IMG.svg", order: 5 },
      { file: "2_CROSSFIST_BACKWARD_90R_IMG.svg", order: 6 },
      { file: "2_CROSSFIST_BACKWARD_135R_IMG.svg", order: 7 }
    ],
    CROSSCLOSEDDOWN: [
      { file: "2_CROSSFIST_DOWN_0_IMG.svg", order: 1 },
      { file: "2_CROSSFIST_DOWN_45L_IMG.svg", order: 2 },
      { file: "2_CROSSFIST_DOWN_90L_IMG.svg", order: 3 },
      { file: "2_CROSSFIST_DOWN_135L_IMG.svg", order: 4 },
      { file: "2_CROSSFIST_DOWN_45R_IMG.svg", order: 5 },
      { file: "2_CROSSFIST_DOWN_90R_IMG.svg", order: 6 },
      { file: "2_CROSSFIST_DOWN_135R_IMG.svg", order: 7 }
    ],
    CROSSCLOSEDFORWARD: [
      { file: "2_CROSSFIST_FORWARD_0_IMG.svg", order: 1 },
      { file: "2_CROSSFIST_FORWARD_45L_IMG.svg", order: 2 },
      { file: "2_CROSSFIST_FORWARD_90L_IMG.svg", order: 3 },
      { file: "2_CROSSFIST_FORWARD_135L_IMG.svg", order: 4 },
      { file: "2_CROSSFIST_FORWARD_45R_IMG.svg", order: 5 },
      { file: "2_CROSSFIST_FORWARD_90R_IMG.svg", order: 6 },
      { file: "2_CROSSFIST_FORWARD_135R_IMG.svg", order: 7 }
    ],
    CROSSCLOSEDREVERSE: [
      { file: "2_CROSSFIST_REVERSE_0_IMG.svg", order: 1 },
      { file: "2_CROSSFIST_REVERSE_45L_IMG.svg", order: 2 },
      { file: "2_CROSSFIST_REVERSE_90L_IMG.svg", order: 3 },
      { file: "2_CROSSFIST_REVERSE_135L_IMG.svg", order: 4 },
      { file: "2_CROSSFIST_REVERSE_45R_IMG.svg", order: 5 },
      { file: "2_CROSSFIST_REVERSE_90R_IMG.svg", order: 6 },
      { file: "2_CROSSFIST_REVERSE_135R_IMG.svg", order: 7 }
    ],
    CROSSCLOSEDUP: [
      { file: "2_CROSSFIST_UP_0_IMG.svg", order: 1 },
      { file: "2_CROSSFIST_UP_45L_IMG.svg", order: 2 },
      { file: "2_CROSSFIST_UP_90L_IMG.svg", order: 3 },
      { file: "2_CROSSFIST_UP_135L_IMG.svg", order: 4 },
      { file: "2_CROSSFIST_UP_45R_IMG.svg", order: 5 },
      { file: "2_CROSSFIST_UP_90R_IMG.svg", order: 6 },
      { file: "2_CROSSFIST_UP_135R_IMG.svg", order: 7 }
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
    const container = document.getElementById('view-upper');
    if (!container) return;
    const screens = Array.from(container.querySelectorAll(".screen"));
    screens.forEach(s => {
      s.classList.toggle("screen-active", s.id === screenId);
    });
  }

  function prettyRoutineName(key) {
    const map = {
      PALMSTOGETHER: "Palms Together",
      PALMIN: "Palms In",
      PALMOPEN: "Palms Open",
      PALMOUT: "Palms Out",
      PALMCLOSED: "Palms Closed",
      HEARTOPEN: "Heart Open",
      HEARTPROTECTED: "Heart Protected",
      SCAPULA: "Scapula",
      CROSSOPENBACKWARD: "Cross – Open Palm Backward",
      CROSSOPENDOWN: "Cross – Open Palm Down",
      CROSSOPENFORWARD: "Cross – Open Palm Forward",
      CROSSOPENREVERSE: "Cross – Open Palm Reverse",
      CROSSOPENUP: "Cross – Open Palm Up",
      CROSSCLOSEDBACKWARD: "Cross – Closed Palm Backward",
      CROSSCLOSEDDOWN: "Cross – Closed Palm Down",
      CROSSCLOSEDFORWARD: "Cross – Closed Palm Forward",
      CROSSCLOSEDREVERSE: "Cross – Closed Palm Reverse",
      CROSSCLOSEDUP: "Cross – Closed Palm Up",
      CUSTOM: "Custom Random"
    };
    return map[key] || key;
  }

  function movementLabelFromFile(key, file) {
    const base = file.replace(".svg", "");
    const parts = base.split("_");
    const category = parts[1] || key;
    const variation = parts[2] || "";
    let label = (category + " " + variation).toLowerCase().replace(/_/g, " ").split(" ").filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    if (category === "CROSSPALM" || category === "CROSSFIST") {
      const angle = parts[3] || "";
      label = variation.toLowerCase().replace(/_/g, " ");
      label = label.charAt(0).toUpperCase() + label.slice(1);
      if (angle) label += " " + angle.replace(/_/g, "");
      label = label.split(" ").filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    return label;
  }

  function sortedMovementsFor(key) {
    const arr = ROUTINES[key] || [];
    return [...arr].sort((a, b) => a.order - b.order);
  }

  function handleCustomSequence() {
    const allMoves = Array.from(new Set([].concat(...Object.values(ROUTINES).map(arr => arr.map(m => m.file)))));
    const maxAllowed = Math.min(12, allMoves.length);
    let num = parseInt(prompt(`Enter number of movements for a custom random routine (3–${maxAllowed})`, "5"), 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > maxAllowed) num = maxAllowed;
    const shuffled = allMoves.sort(() => Math.random() - 0.5).slice(0, num);
    selectedRoutineKey = "CUSTOM";
    selectedRoutineMovements = shuffled.map((file, idx) => ({ file: file, order: idx + 1 }));
    qs("#upper-prefs-title").textContent = "Custom Random";
    qs("#upper-prefs-tagline").textContent = "Set your preferred timing, then begin.";
    qs("#upper-prefs-preview-label").textContent = "Custom Random";
    const strip = qs("#upper-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("upper-screen-prefs");
  }

  function renderRoutineCards() {
    const container = qs("#upper-routine-list");
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
        const img = document.createElement("img");
        img.dataset.src = IMAGE_BASE_PATH + m.file;
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
    qs("#upper-prefs-title").textContent = prettyRoutineName(key);
    qs("#upper-prefs-preview-label").textContent = prettyRoutineName(key);
    const strip = qs("#upper-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("upper-screen-prefs");
  }

  function playDing() {
    if (!audioEnabled || !audioEl) return;
    try { audioEl.currentTime = 0; audioEl.play(); } catch (e) { }
  }

  function pickRandomRoutine() {
    const keys = Object.keys(ROUTINES);
    handleRoutineSelected(keys[Math.floor(Math.random() * keys.length)]);
  }

  function startRoutine() {
    stopRoutineTimers();
    currentMovementIndex = 0; currentRound = 1; isRunning = true;
    qs("#upper-btn-play-pause").textContent = "Pause";
    qs("#upper-status-message").textContent = "";
    if (window.timeTracker) window.timeTracker.startSession('Upper Body Innervation', selectedRoutineKey);
    startPhase("move");
  }

  function stopRoutineTimers() {
    if (movementTimerId) { clearInterval(movementTimerId); movementTimerId = null; }
  }

  function startPhase(phase) {
    currentPhase = phase;
    secondsRemaining = (phase === "move") ? prefs.secondsPerMovement : prefs.restBetween;
    updateMovementUI();
    if (movementTimerId) clearInterval(movementTimerId);
    if (!isRunning) return;
    if (secondsRemaining <= 0) { handlePhaseComplete(); return; }
    movementTimerId = setInterval(() => {
      if (!isRunning) return;
      secondsRemaining -= 1;
      if (secondsRemaining <= 0) {
        clearInterval(movementTimerId); movementTimerId = null; handlePhaseComplete();
      } else updatePhaseLabel();
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
    currentMovementIndex += 1;
    if (currentMovementIndex >= selectedRoutineMovements.length) {
      currentRound += 1;
      if (currentRound > prefs.rounds) { finishRoutine(); return; }
      currentMovementIndex = 0;
    }
    startPhase("move");
  }

  function finishRoutine() {
    isRunning = false;
    stopRoutineTimers();
    qs("#upper-btn-play-pause").textContent = "Restart";
    qs("#upper-phase-label").textContent = "Complete";
    qs("#upper-status-message").textContent = "Routine complete.";
    if (window.timeTracker) {
      window.timeTracker.stopSession();
      const sessionTime = window.timeTracker.getLastSessionDuration();
      if (window.TimeStatsUI) setTimeout(() => TimeStatsUI.showQuickSummary('Upper Body Innervation', sessionTime), 500);
    }
  }

  function updateMovementUI() {
    const move = selectedRoutineMovements[currentMovementIndex];
    if (!move) return;
    qs("#upper-current-movement-label").textContent = movementLabelFromFile(selectedRoutineKey, move.file);
    qs("#upper-current-movement-image").src = IMAGE_BASE_PATH + move.file;
    qs("#upper-movement-count").textContent = `Movement ${currentMovementIndex + 1} of ${selectedRoutineMovements.length}`;
    qs("#upper-round-count").textContent = `Round ${currentRound} of ${prefs.rounds}`;
    updatePhaseLabel();
    const bar = qs("#upper-prog");
    bar.style.transition = "none";
    bar.style.width = currentPhase === "move" ? "0%" : "100%";
    setTimeout(() => {
      bar.style.transition = `width ${prefs.secondsPerMovement}s linear`;
      bar.style.width = currentPhase === "move" ? "100%" : "0%";
    }, 50);
  }

  function updatePhaseLabel() {
    let txt = "";
    if (currentPhase === "move") txt = `Move · ${secondsRemaining}s`;
    else if (currentPhase === "rest") txt = `Rest · ${secondsRemaining}s`;
    else txt = "Ready";
    qs("#upper-phase-label").textContent = txt;
  }

  function togglePlayPause() {
    if (!selectedRoutineMovements.length) return;
    if (!isRunning && currentPhase === "idle") { startRoutine(); return; }
    if (isRunning) {
      isRunning = false; stopRoutineTimers();
      qs("#upper-btn-play-pause").textContent = "Resume";
    } else {
      isRunning = true;
      qs("#upper-btn-play-pause").textContent = "Pause";
      startPhase(currentPhase || "move");
    }
  }

  function restartRoutine() { if (selectedRoutineMovements.length) startRoutine(); }

  function init() {
    lazyLoader = new LazyImageLoader({ rootMargin: '100px' });
    renderRoutineCards();
    qsa(".back-btn").forEach(btn => {
      if (btn.closest('#view-upper')) {
        btn.addEventListener("click", () => {
          const target = btn.dataset.back;
          stopRoutineTimers(); isRunning = false;
          qs("#upper-btn-play-pause").textContent = "Start";
          currentPhase = "idle";
          qs("#upper-phase-label").textContent = "Ready";
          switchScreen(target);
        });
      }
    });

    const randomBtn = qs("#upper-btn-random");
    if (randomBtn) randomBtn.addEventListener("click", handleCustomSequence);
    qs("#upper-btn-start-routine").addEventListener("click", () => { startRoutine(); switchScreen("upper-screen-player"); });
    qs("#upper-btn-play-pause").addEventListener("click", togglePlayPause);
    qs("#upper-btn-restart").addEventListener("click", restartRoutine);

    audioEl = document.getElementById("audio-ding");
    const toggle = qs("#upper-audio-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const on = toggle.dataset.on === "1";
        toggle.dataset.on = on ? "0" : "1";
        audioEnabled = !on;
        toggle.querySelector(".pill-label").textContent = audioEnabled ? "On" : "Off";
      });
    }

    const secInput = qs("#upper-input-seconds");
    const restInput = qs("#upper-input-rest");
    const roundsInput = qs("#upper-input-rounds");
    secInput.addEventListener("change", () => prefs.secondsPerMovement = Math.max(5, parseInt(secInput.value) || 45));
    restInput.addEventListener("change", () => prefs.restBetween = Math.max(0, parseInt(restInput.value) || 3));
    roundsInput.addEventListener("change", () => prefs.rounds = Math.max(1, parseInt(roundsInput.value) || 2));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init, loadRoutine: handleRoutineSelected };
})();
