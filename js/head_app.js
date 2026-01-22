// Head Innervation app script
const HeadApp = (function () {
  const IMAGE_BASE_PATH = "InnervationSVGs/";

  const ROUTINES = {
    CHINBOTTOM: [
      { file: "3_CHINBOTTOM_0_D_IMG.svg", order: 1 },
      { file: "3_CHINBOTTOM_L_D_IMG.svg", order: 2 },
      { file: "3_CHINBOTTOM_R_D_IMG.svg", order: 3 },
      { file: "3_CHINBOTTOM_1_D_IMG.svg", order: 4 },
      { file: "3_CHINBOTTOM_2_D_IMG.svg", order: 5 },
      { file: "3_CHINBOTTOM_3_D_IMG.svg", order: 6 },
      { file: "3_CHINBOTTOM_4_D_IMG.svg", order: 7 },
      { file: "3_CHINBOTTOM_5_D_IMG.svg", order: 8 },
      { file: "3_CHINBOTTOM_6_D_IMG.svg", order: 9 },
      { file: "3_CHINBOTTOM_7_D_IMG.svg", order: 10 },
      { file: "3_CHINBOTTOM_8_D_IMG.svg", order: 11 }
    ],
    CHINTOP: [
      { file: "3_CHINTOP_0_D_IMG.svg", order: 1 },
      { file: "3_CHINTOP_L_D_IMG.svg", order: 2 },
      { file: "3_CHINTOP_R_D_IMG.svg", order: 3 },
      { file: "3_CHINTOP_1_D_IMG.svg", order: 4 },
      { file: "3_CHINTOP_2_D_IMG.svg", order: 5 },
      { file: "3_CHINTOP_3_D_IMG.svg", order: 6 },
      { file: "3_CHINTOP_4_D_IMG.svg", order: 7 },
      { file: "3_CHINTOP_5_D_IMG.svg", order: 8 },
      { file: "3_CHINTOP_6_D_IMG.svg", order: 9 },
      { file: "3_CHINTOP_7_D_IMG.svg", order: 10 },
      { file: "3_CHINTOP_8_D_IMG.svg", order: 11 }
    ],
    LION: [
      { file: "3_LION_0_D_IMG.svg", order: 1 },
      { file: "3_LION_1_D_IMG.svg", order: 2 },
      { file: "3_LION_2_D_IMG.svg", order: 3 },
      { file: "3_LION_3_D_IMG.svg", order: 4 },
      { file: "3_LION_4_D_IMG.svg", order: 5 },
      { file: "3_LION_5_D_IMG.svg", order: 6 },
      { file: "3_LION_6_D_IMG.svg", order: 7 },
      { file: "3_LION_7_D_IMG.svg", order: 8 },
      { file: "3_LION_8_D_IMG.svg", order: 9 }
    ],
    LIONLEFT: [
      { file: "3_LIONLEFT_0_D_IMG.svg", order: 1 },
      { file: "3_LIONLEFT_1_D_IMG.svg", order: 2 },
      { file: "3_LIONLEFT_2_D_IMG.svg", order: 3 },
      { file: "3_LIONLEFT_3_D_IMG.svg", order: 4 },
      { file: "3_LIONLEFT_4_D_IMG.svg", order: 5 },
      { file: "3_LIONLEFT_5_D_IMG.svg", order: 6 },
      { file: "3_LIONLEFT_6_D_IMG.svg", order: 7 },
      { file: "3_LIONLEFT_7_D_IMG.svg", order: 8 },
      { file: "3_LIONLEFT_8_D_IMG.svg", order: 9 }
    ],
    LIONRIGHT: [
      { file: "3_LIONRIGHT_0_D_IMG.svg", order: 1 },
      { file: "3_LIONRIGHT_1_D_IMG.svg", order: 2 },
      { file: "3_LIONRIGHT_2_D_IMG.svg", order: 3 },
      { file: "3_LIONRIGHT_3_D_IMG.svg", order: 4 },
      { file: "3_LIONRIGHT_4_D_IMG.svg", order: 5 },
      { file: "3_LIONRIGHT_5_D_IMG.svg", order: 6 },
      { file: "3_LIONRIGHT_6_D_IMG.svg", order: 7 },
      { file: "3_LIONRIGHT_7_D_IMG.svg", order: 8 },
      { file: "3_LIONRIGHT_8_D_IMG.svg", order: 9 }
    ],
    NOSE: [
      { file: "3_OPENNOSE_CLOSEMOUTH_D_IMG.svg", order: 1 },
      { file: "3_OPENNOSE_OPENMOUTH_D_IMG.svg", order: 2 },
      { file: "3_PULLNOSE_MID_D_IMG.svg", order: 3 },
      { file: "3_PULLNOSE_L_D_IMG.svg", order: 4 },
      { file: "3_PULLNOSE_R_D_IMG.svg", order: 5 },
      { file: "3_SCRUNCHNOSE_MID_D_IMG.svg", order: 6 },
      { file: "3_SCRUNCHNOSE_R_D_IMG.svg", order: 7 },
      { file: "3_SCRUNCHNOSE_L_D_IMG.svg", order: 8 }
    ],
    PULL: [
      { file: "3_PULLTOP_R_D_IMG.svg", order: 1 },
      { file: "3_PULLTOP_L_D_IMG.svg", order: 2 },
      { file: "3_PULLFOREHEAD_R_D_IMG.svg", order: 3 },
      { file: "3_PULLFOREHEAD_L_D_IMG.svg", order: 4 },
      { file: "3_PULLJAW_R_D_IMG.svg", order: 5 },
      { file: "3_PULLJAW_L_D_IMG.svg", order: 6 },
      { file: "3_PULLEAR_R_D_IMG.svg", order: 7 },
      { file: "3_PULLEAR_L_D_IMG.svg", order: 8 }
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
    const container = document.getElementById('view-head');
    if (!container) return;
    const screens = Array.from(container.querySelectorAll(".screen"));
    screens.forEach(s => {
      s.classList.toggle("screen-active", s.id === screenId);
    });
  }

  function prettyRoutineName(key) {
    const map = {
      CHINBOTTOM: "Chin – Bottom",
      CHINTOP: "Chin – Top",
      LION: "Lion (Center)",
      LIONLEFT: "Lion (Left Bias)",
      LIONRIGHT: "Lion (Right Bias)",
      NOSE: "Nose & Mid-Face",
      PULL: "Top / Forehead / Jaw / Ear Pulls",
      CUSTOM: "Custom Random"
    };
    return map[key] || key;
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
    let num = parseInt(prompt(`Enter number of movements for a custom random routine (3–${maxAllowed})`, "5"), 10);
    if (isNaN(num) || num < 3) num = 3;
    if (num > maxAllowed) num = maxAllowed;
    const shuffled = allMoves.sort(() => Math.random() - 0.5).slice(0, num);
    selectedRoutineKey = "CUSTOM";
    selectedRoutineMovements = shuffled.map((file, idx) => ({ file, order: idx + 1 }));
    qs("#head-prefs-title").textContent = "Custom Random";
    qs("#head-prefs-tagline").textContent = "Set your timing, then begin.";
    qs("#head-prefs-preview-label").textContent = "Custom Random";
    const strip = qs("#head-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.dataset.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("head-screen-prefs");
  }

  function renderRoutineCards() {
    const container = qs("#head-routine-list");
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
      count.textContent = moves.length + " positions";
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
    customCard.dataset.key = "CUSTOM";
    customCard.innerHTML = `<div class="routine-header-row"><div class="routine-name">Custom Random</div><div class="routine-count">3–12 positions</div></div>`;
    const strip = document.createElement("div");
    strip.className = "thumb-strip";
    customCard.appendChild(strip);
    customCard.addEventListener("click", handleCustomSequence);
    container.appendChild(customCard);
  }

  function handleRoutineSelected(key) {
    selectedRoutineKey = key;
    selectedRoutineMovements = sortedMovementsFor(key);
    qs("#head-prefs-title").textContent = prettyRoutineName(key);
    qs("#head-prefs-tagline").textContent = "Set your preferred timing, then begin.";
    qs("#head-prefs-preview-label").textContent = prettyRoutineName(key);
    const strip = qs("#head-prefs-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.dataset.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("head-screen-prefs");
  }

  function pickRandomRoutine() {
    const keys = Object.keys(ROUTINES);
    handleRoutineSelected(keys[Math.floor(Math.random() * keys.length)]);
  }

  function collectPrefsAndStart() {
    const sec = parseInt(qs("#head-input-seconds").value, 10) || 45;
    const rest = parseInt(qs("#head-input-rest").value, 10) || 3;
    const rounds = parseInt(qs("#head-input-rounds").value, 10) || 2;
    prefs.secondsPerMovement = Math.max(5, sec);
    prefs.restBetween = Math.max(0, rest);
    prefs.rounds = Math.max(1, rounds);
    startRoutine();
  }

  function setupPlayerUI() {
    qs("#head-player-title").textContent = prettyRoutineName(selectedRoutineKey);
    qs("#head-player-preview-label").textContent = prettyRoutineName(selectedRoutineKey);
    const strip = qs("#head-player-preview-strip");
    strip.innerHTML = "";
    selectedRoutineMovements.forEach(m => {
      const d = document.createElement("div");
      d.className = "preview-thumb";
      const img = document.createElement("img");
      img.dataset.src = IMAGE_BASE_PATH + m.file;
      d.appendChild(img);
      strip.appendChild(d);
    });
    switchScreen("head-screen-player");
  }

  const bar = document.getElementById("head-prog");
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
    qs("#head-btn-play-pause").textContent = "Pause";
    qs("#head-status-message").textContent = "";
    if (window.timeTracker) window.timeTracker.startSession('Head Innervation', selectedRoutineKey);
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
    qs("#head-btn-play-pause").textContent = "Restart";
    qs("#head-phase-label").textContent = "Complete";
    qs("#head-status-message").textContent = "Routine complete.";
    if (window.timeTracker) {
      window.timeTracker.stopSession();
      const sessionTime = window.timeTracker.getLastSessionDuration();
      if (window.TimeStatsUI) setTimeout(() => TimeStatsUI.showQuickSummary('Head Innervation', sessionTime), 500);
    }
  }

  function updateMovementUI() {
    const move = selectedRoutineMovements[currentMovementIndex];
    if (!move) return;
    qs("#head-current-movement-label").textContent = movementLabelFromFile(selectedRoutineKey, move.file);
    qs("#head-current-movement-image").src = IMAGE_BASE_PATH + move.file;
    qs("#head-movement-count").textContent = `Movement ${currentMovementIndex + 1} of ${selectedRoutineMovements.length}`;
    qs("#head-round-count").textContent = `Round ${currentRound} of ${prefs.rounds}`;
    updatePhaseLabel();
  }

  function updatePhaseLabel() {
    let txt = "Ready";
    if (currentPhase === "move") txt = `Move · ${secondsRemaining}s`;
    else if (currentPhase === "rest") txt = `Rest · ${secondsRemaining}s`;
    qs("#head-phase-label").textContent = txt;
  }

  function togglePlayPause() {
    if (!selectedRoutineMovements.length) return;
    if (!isRunning && currentPhase === "idle") { startRoutine(); return; }
    if (isRunning) {
      isRunning = false; stopRoutineTimers();
      qs("#head-btn-play-pause").textContent = "Resume";
    } else {
      isRunning = true;
      qs("#head-btn-play-pause").textContent = "Pause";
      startPhase(currentPhase || "move");
    }
  }

  function restartRoutine() { if (selectedRoutineMovements.length) startRoutine(); }

  function playDing() {
    if (!audioEnabled || !audioEl) return;
    try { audioEl.currentTime = 0; audioEl.play(); } catch (e) { }
  }

  function init() {
    lazyLoader = new LazyImageLoader({ rootMargin: '100px' });
    renderRoutineCards();
    qsa(".back-btn").forEach(btn => {
      if (btn.closest('#view-head')) {
        btn.addEventListener("click", () => {
          const target = btn.dataset.back;
          stopRoutineTimers(); isRunning = false;
          qs("#head-btn-play-pause").textContent = "Start";
          currentPhase = "idle";
          qs("#head-phase-label").textContent = "Ready";
          switchScreen(target);
        });
      }
    });

    qs("#head-btn-random").addEventListener("click", pickRandomRoutine);
    qs("#head-btn-start-routine").addEventListener("click", collectPrefsAndStart);
    qs("#head-btn-play-pause").addEventListener("click", togglePlayPause);
    qs("#head-btn-restart").addEventListener("click", restartRoutine);

    audioEl = document.getElementById("audio-ding");
    const audioToggle = qs("#head-audio-toggle");
    if (audioToggle) {
      audioToggle.addEventListener("click", () => {
        const on = audioToggle.dataset.on === "1";
        audioToggle.dataset.on = on ? "0" : "1";
        audioEnabled = !on;
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
window.HeadApp = HeadApp;
