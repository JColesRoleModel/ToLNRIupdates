// Breathwork Toolkit logic
const BreathApp = (function () {

  function init() {
    const brandItems = document.querySelectorAll(".brand-item");

    const nostrilScreen = document.getElementById("breath-nostrilScreen");
    const hyperScreen = document.getElementById("breath-hyperScreen");

    const phaseDurationInput = document.getElementById("breath-phaseDuration");
    const startAltBtn = document.getElementById("breath-startAltBtn");
    const stopAltBtn = document.getElementById("breath-stopAltBtn");

    const leftNostrilCol = document.getElementById("breath-leftNostril");
    const rightNostrilCol = document.getElementById("breath-rightNostril");
    if (leftNostrilCol) leftNostrilCol.classList.add("left");
    if (rightNostrilCol) rightNostrilCol.classList.add("right");

    const phaseTitleEl = document.getElementById("breath-phaseTitle");
    const phaseSubtitleEl = document.getElementById("breath-phaseSubtitle");
    const altProgressBar = document.getElementById("breath-altProgressBar");
    const elapsedTimeEl = document.getElementById("breath-elapsedTime");
    const totalTimeEl = document.getElementById("breath-totalTime");
    const cycleCountEl = document.getElementById("breath-cycleCount");
    const cycleDefinitionTextEl = document.getElementById("breath-cycleDefinitionText");

    const infoAlternate = document.getElementById("breath-nostrilInfoAlternate");
    const infoRight = document.getElementById("breath-nostrilInfoRight");
    const infoLeft = document.getElementById("breath-nostrilInfoLeft");

    const hvSpeedEl = document.getElementById("breath-hvSpeed");
    const hvRoundsEl = document.getElementById("breath-hvRounds");
    const hvBreathsSelectEl = document.getElementById("breath-hvBreathsSelect");
    const hvBreathsCustomEl = document.getElementById("breath-hvBreathsCustom");

    const startHvBtn = document.getElementById("breath-startHvBtn");
    const stopHvBtn = document.getElementById("breath-stopHvBtn");

    const hvPhaseTitleEl = document.getElementById("breath-hvPhaseTitle");
    const hvPhaseSubtitleEl = document.getElementById("breath-hvPhaseSubtitle");
    const hvProgressBar = document.getElementById("breath-hvProgressBar");
    const hvRoundLabelEl = document.getElementById("breath-hvRoundLabel");
    const hvBreathLabelEl = document.getElementById("breath-hvBreathLabel");
    const hvDirectionLabelEl = document.getElementById("breath-hvDirectionLabel");
    const hvTimerDisplayEl = document.getElementById("breath-hvTimerDisplay");
    const hvTimerLabelEl = document.getElementById("breath-hvTimerLabel");
    const hvEndRetentionBtn = document.getElementById("breath-hvEndRetentionBtn");
    const hvHoldsContainer = document.getElementById("breath-hvHoldsContainer");
    const hvHoldsList = document.getElementById("breath-hvHoldsList");

    let altMode = "alternate";
    let altDurationMs = 4000;
    let altRunning = false;
    let altPhaseIndex = 0;
    let altCycleCount = 0;
    let altPhaseStart = null;
    let altRafId = null;

    const ALT_SEQUENCES = {
      alternate: [
        { nostril: "Left", direction: "In" },
        { nostril: "Right", direction: "Out" },
        { nostril: "Right", direction: "In" },
        { nostril: "Left", direction: "Out" }
      ],
      right: [
        { nostril: "Right", direction: "In" },
        { nostril: "Right", direction: "Out" }
      ],
      left: [
        { nostril: "Left", direction: "In" },
        { nostril: "Left", direction: "Out" }
      ]
    };

    const CYCLE_DEFS = {
      alternate: "(Alternate mode: 1 cycle = IN L → OUT R → IN R → OUT L)",
      right: "(Right mode: 1 cycle = IN Right → OUT Right)",
      left: "(Left mode: 1 cycle = IN Left → OUT Left)"
    };

    function setAltMode(mode) {
      if (!cycleCountEl) return;
      altMode = mode;
      altPhaseIndex = 0;
      altCycleCount = 0;
      cycleCountEl.textContent = "0";
      if (cycleDefinitionTextEl) cycleDefinitionTextEl.textContent = CYCLE_DEFS[mode];

      if (infoAlternate) infoAlternate.classList.remove("active");
      if (infoRight) infoRight.classList.remove("active");
      if (infoLeft) infoLeft.classList.remove("active");

      if (mode === "alternate" && infoAlternate) infoAlternate.classList.add("active");
      if (mode === "right" && infoRight) infoRight.classList.add("active");
      if (mode === "left" && infoLeft) infoLeft.classList.add("active");

      updateAltPhaseUIReady();
    }

    function updateAltPhaseUIReady() {
      if (!phaseTitleEl) return;
      phaseTitleEl.textContent = "Ready";
      phaseSubtitleEl.innerHTML = 'Set your phase time, choose a pattern from the icons above, then press <strong>Start</strong>.';
      elapsedTimeEl.textContent = "0.0s";
      totalTimeEl.textContent = (altDurationMs / 1000).toFixed(1) + "s";
      altProgressBar.style.width = "0%";
      altProgressBar.classList.remove("exhale");
      leftNostrilCol.classList.remove("active");
      rightNostrilCol.classList.remove("active");
    }

    function altStart() {
      if (altRunning) return;
      const seconds = parseFloat(phaseDurationInput.value);
      if (!isFinite(seconds) || seconds <= 0) {
        phaseDurationInput.value = "4";
        altDurationMs = 4000;
      } else {
        altDurationMs = seconds * 1000;
      }
      totalTimeEl.textContent = (altDurationMs / 1000).toFixed(1) + "s";

      altRunning = true;
      altPhaseStart = null;
      altPhaseIndex = 0;
      altCycleCount = 0;
      cycleCountEl.textContent = "0";

      if (window.timeTracker) {
        const modeLabel = altMode === "alternate" ? "Alternate" : altMode === "right" ? "Right-only" : "Left-only";
        window.timeTracker.startSession('Breathwork Toolkit', `Nostril - ${modeLabel}`);
      }

      if (altRafId) cancelAnimationFrame(altRafId);
      altRafId = requestAnimationFrame(altTick);
    }

    function altStop(resetInfo = true) {
      altRunning = false;
      if (altRafId) { cancelAnimationFrame(altRafId); altRafId = null; }
      if (window.timeTracker) window.timeTracker.stopSession();

      altPhaseStart = null;
      altPhaseIndex = 0;
      altCycleCount = 0;
      if (cycleCountEl) cycleCountEl.textContent = "0";
      if (altProgressBar) { altProgressBar.style.width = "0%"; altProgressBar.classList.remove("exhale"); }
      if (leftNostrilCol) leftNostrilCol.classList.remove("active");
      if (rightNostrilCol) rightNostrilCol.classList.remove("active");
      if (elapsedTimeEl) elapsedTimeEl.textContent = "0.0s";
      if (resetInfo) updateAltPhaseUIReady();
    }

    function altTick(timestamp) {
      if (!altRunning) return;

      if (altPhaseStart == null) altPhaseStart = timestamp;

      const seq = ALT_SEQUENCES[altMode];
      const phase = seq[altPhaseIndex];
      const elapsed = timestamp - altPhaseStart;
      let progress = elapsed / altDurationMs;
      if (progress > 1) progress = 1;

      const isInhale = phase.direction === "In";
      const shownProgress = isInhale ? progress : 1 - progress;

      altProgressBar.style.width = (shownProgress * 100).toFixed(1) + "%";
      altProgressBar.classList.toggle("exhale", !isInhale);

      elapsedTimeEl.textContent = (elapsed / 1000).toFixed(1) + "s";

      leftNostrilCol.classList.remove("active");
      rightNostrilCol.classList.remove("active");
      if (phase.nostril === "Left") leftNostrilCol.classList.add("active");
      if (phase.nostril === "Right") rightNostrilCol.classList.add("active");

      const modeLabel = altMode === "alternate" ? "Alternate" : altMode === "right" ? "Right-only" : "Left-only";
      phaseTitleEl.textContent = `${modeLabel} — ${phase.direction.toUpperCase()} ${phase.nostril.toUpperCase()}`;

      const tagHtml = `<span class="tag ${isInhale ? "tag-inhale" : "tag-exhale"}">${isInhale ? "Inhale" : "Exhale"}</span>`;
      const action = `${isInhale ? "Inhale through the " : "Exhale through the "}${phase.nostril.toLowerCase()} nostril.`;
      phaseSubtitleEl.innerHTML = `${tagHtml}${action}`;

      if (elapsed >= altDurationMs) {
        altPhaseIndex++;
        altPhaseStart = timestamp;

        if (altPhaseIndex >= seq.length) {
          altPhaseIndex = 0;
          altCycleCount++;
          cycleCountEl.textContent = String(altCycleCount);
          if (window.timeTracker) {
            const cycleTime = (altDurationMs / 1000) * seq.length;
            const modeLabel = altMode === "alternate" ? "Alternate" : altMode === "right" ? "Right-only" : "Left-only";
            window.timeTracker.recordMovement(`${modeLabel} Cycle`, cycleTime);
          }
        }
      }
      altRafId = requestAnimationFrame(altTick);
    }

    if (phaseDurationInput) {
      phaseDurationInput.addEventListener("change", () => {
        if (altRunning) return;
        const seconds = parseFloat(phaseDurationInput.value);
        if (!isFinite(seconds) || seconds <= 0) {
          phaseDurationInput.value = "4";
          altDurationMs = 4000;
        } else {
          altDurationMs = seconds * 1000;
        }
        totalTimeEl.textContent = (altDurationMs / 1000).toFixed(1) + "s";
      });
    }

    if (startAltBtn) startAltBtn.addEventListener("click", altStart);
    if (stopAltBtn) stopAltBtn.addEventListener("click", () => altStop(true));

    // HYPERVENTILATION
    let hvState = "idle";
    let hvRunning = false;
    let hvRoundTotal = 0;
    let hvRoundCurrent = 0;
    let hvBreathsPerRound = 0;
    let hvBreathCount = 0;
    let hvPhaseDirection = "In";
    let hvPhaseDurationMs = 1200;
    let hvPhaseStart = null;
    let hvBreathingRafId = null;
    let hvTimerIntervalId = null;
    let hvRetentionStartTime = null;
    let hvTimerRemaining = 0;

    function getHvPhaseDurationMs() {
      const val = hvSpeedEl.value;
      if (val === "slow") return 2200;
      if (val === "fast") return 700;
      return 1200;
    }

    function showHvBreathCount() {
      hvBreathLabelEl.textContent = hvState === "breathing" ? `Breath: ${hvBreathCount}/${hvBreathsPerRound}` : "Breath: —";
    }

    function resetHvUI() {
      if (!hvProgressBar) return;
      hvRunning = false;
      hvState = "idle";
      hvRoundTotal = 0;
      hvRoundCurrent = 0;
      hvBreathsPerRound = 0;
      hvBreathCount = 0;
      hvPhaseDirection = "In";
      hvPhaseDurationMs = getHvPhaseDurationMs();
      hvPhaseStart = null;

      if (hvBreathingRafId) cancelAnimationFrame(hvBreathingRafId);
      hvBreathingRafId = null;

      if (hvTimerIntervalId) clearInterval(hvTimerIntervalId);
      hvTimerIntervalId = null;

      hvEndRetentionBtn.disabled = true;

      hvProgressBar.style.width = "0%";
      hvRoundLabelEl.textContent = "Round: —";
      hvBreathLabelEl.textContent = "Breath: —";
      hvDirectionLabelEl.textContent = "Phase: —";
      hvTimerDisplayEl.textContent = "0.0";
      hvTimerLabelEl.textContent = "Timer";

      hvPhaseTitleEl.textContent = "Ready";
      hvPhaseSubtitleEl.textContent = "Choose your breath speed, rounds, and breaths per round, then press Start Rounds.";

      hvHoldsList.innerHTML = "";
      hvHoldsContainer.classList.add("hidden");
    }

    function hvStart() {
      if (hvRunning) return;
      hvPhaseDurationMs = getHvPhaseDurationMs();

      let rounds = parseInt(hvRoundsEl.value, 10);
      if (!Number.isFinite(rounds) || rounds < 2) rounds = 2;
      if (rounds > 12) rounds = 12;
      hvRoundsEl.value = String(rounds);
      hvRoundTotal = rounds;

      let breaths = 20;
      const selectVal = hvBreathsSelectEl.value;
      if (selectVal === "custom") {
        const custom = parseInt(hvBreathsCustomEl.value, 10);
        if (Number.isFinite(custom) && custom > 0 && custom <= 200) breaths = custom;
      } else {
        const n = parseInt(selectVal, 10);
        if (Number.isFinite(n)) breaths = n;
      }
      hvBreathsPerRound = breaths;

      hvRunning = true;
      hvRoundCurrent = 1;
      hvHoldsList.innerHTML = "";
      hvHoldsContainer.classList.add("hidden");

      startHvBreathingRound();
    }

    function startHvBreathingRound() {
      hvState = "breathing";
      hvPhaseDurationMs = getHvPhaseDurationMs();
      hvPhaseDirection = "In";
      hvPhaseStart = null;
      hvBreathCount = 0;

      if (hvBreathingRafId) cancelAnimationFrame(hvBreathingRafId);
      hvBreathingRafId = requestAnimationFrame(hvBreathingTick);

      hvPhaseTitleEl.textContent = `Round ${hvRoundCurrent} — Hyperventilation`;
      hvPhaseSubtitleEl.textContent = "Full inhale, relaxed exhale. Let the rhythm carry you. When the breaths finish, you’ll move into empty-hold retention.";
      hvRoundLabelEl.textContent = `Round: ${hvRoundCurrent}/${hvRoundTotal}`;
      hvDirectionLabelEl.textContent = "Phase: IN";
      showHvBreathCount();
      hvTimerLabelEl.textContent = "Phase timer";
    }

    function hvBreathingTick(timestamp) {
      if (!hvRunning || hvState !== "breathing") return;
      if (hvPhaseStart == null) hvPhaseStart = timestamp;
      const elapsed = timestamp - hvPhaseStart;
      let progress = elapsed / hvPhaseDurationMs;
      if (progress > 1) progress = 1;

      const isIn = hvPhaseDirection === "In";
      const shownProg = isIn ? progress : 1 - progress;
      hvProgressBar.style.width = (shownProg * 100).toFixed(1) + "%";
      hvTimerDisplayEl.textContent = (elapsed / 1000).toFixed(1);
      hvDirectionLabelEl.textContent = `Phase: ${hvPhaseDirection.toUpperCase()}`;

      if (elapsed >= hvPhaseDurationMs) {
        if (hvPhaseDirection === "In") {
          hvPhaseDirection = "Out";
          hvPhaseStart = timestamp;
        } else {
          hvBreathCount++;
          if (hvBreathCount >= hvBreathsPerRound) {
            hvProgressBar.style.width = "0%";
            startRetentionPhase();
            return;
          } else {
            hvPhaseDirection = "In";
            hvPhaseStart = timestamp;
          }
        }
        showHvBreathCount();
      }
      hvBreathingRafId = requestAnimationFrame(hvBreathingTick);
    }

    function startRetentionPhase() {
      hvState = "retention";
      if (hvBreathingRafId) { cancelAnimationFrame(hvBreathingRafId); hvBreathingRafId = null; }

      hvPhaseTitleEl.textContent = `Round ${hvRoundCurrent} — Retention`;
      hvPhaseSubtitleEl.textContent = "Exhale fully and hold on empty lungs. Stay relaxed. When you’re ready to breathe in again, tap End Retention.";
      hvDirectionLabelEl.textContent = "Phase: Retention";
      hvTimerLabelEl.textContent = "Retention (empty hold)";
      hvTimerDisplayEl.textContent = "0.0";
      hvProgressBar.style.width = "0%";

      hvRetentionStartTime = performance.now();
      if (hvTimerIntervalId) clearInterval(hvTimerIntervalId);
      hvTimerIntervalId = setInterval(() => {
        const now = performance.now();
        const seconds = (now - hvRetentionStartTime) / 1000;
        hvTimerDisplayEl.textContent = seconds.toFixed(1);
      }, 100);
      hvEndRetentionBtn.disabled = false;
    }

    function endRetentionPhase() {
      if (hvState !== "retention") return;
      hvEndRetentionBtn.disabled = true;
      if (hvTimerIntervalId) { clearInterval(hvTimerIntervalId); hvTimerIntervalId = null; }
      const now = performance.now();
      const seconds = ((now - hvRetentionStartTime) / 1000).toFixed(1);
      const li = document.createElement("li");
      li.textContent = `Round ${hvRoundCurrent}: ${seconds}s`;
      hvHoldsList.appendChild(li);
      hvHoldsContainer.classList.remove("hidden");
      startInhaleHoldPhase();
    }

    function startInhaleHoldPhase() {
      hvState = "inhale_hold";
      hvTimerRemaining = 20;
      hvTimerDisplayEl.textContent = "20";
      hvTimerLabelEl.textContent = "Big inhale — hold it in";
      hvPhaseTitleEl.textContent = `Round ${hvRoundCurrent} — Inhale Hold`;
      hvPhaseSubtitleEl.textContent = "Take one deep inhale, fill your lungs comfortably, and hold for about 20 seconds.";
      hvDirectionLabelEl.textContent = "Phase: Inhale hold";

      if (hvTimerIntervalId) clearInterval(hvTimerIntervalId);
      hvTimerIntervalId = setInterval(() => {
        hvTimerRemaining--;
        if (hvTimerRemaining <= 0) {
          hvTimerDisplayEl.textContent = "0";
          clearInterval(hvTimerIntervalId);
          hvTimerIntervalId = null;
          startExhaleReleasePhase();
        } else {
          hvTimerDisplayEl.textContent = hvTimerRemaining.toString().padStart(2, "0");
        }
      }, 1000);
    }

    function startExhaleReleasePhase() {
      hvState = "exhale_release";
      hvTimerRemaining = 5;
      hvTimerDisplayEl.textContent = "5";
      hvTimerLabelEl.textContent = "Release";
      hvPhaseTitleEl.textContent = `Round ${hvRoundCurrent} — Release`;
      hvPhaseSubtitleEl.textContent = "Exhale fully and let your whole body soften. When the countdown ends, the next round will start automatically or the session will finish.";
      hvDirectionLabelEl.textContent = "Phase: Release";

      if (hvTimerIntervalId) clearInterval(hvTimerIntervalId);
      hvTimerIntervalId = setInterval(() => {
        hvTimerRemaining--;
        if (hvTimerRemaining <= 0) {
          hvTimerDisplayEl.textContent = "0";
          clearInterval(hvTimerIntervalId);
          hvTimerIntervalId = null;
          advanceHvRoundOrFinish();
        } else {
          hvTimerDisplayEl.textContent = hvTimerRemaining.toString().padStart(2, "0");
        }
      }, 1000);
    }

    function advanceHvRoundOrFinish() {
      if (!hvRunning) return;
      if (hvRoundCurrent < hvRoundTotal) {
        hvRoundCurrent++;
        startHvBreathingRound();
      } else {
        finishHvSession();
      }
    }

    function finishHvSession() {
      hvRunning = false;
      hvState = "idle";
      if (hvBreathingRafId) cancelAnimationFrame(hvBreathingRafId);
      hvBreathingRafId = null;
      if (hvTimerIntervalId) clearInterval(hvTimerIntervalId);
      hvTimerIntervalId = null;

      hvPhaseTitleEl.textContent = "Session complete";
      hvPhaseSubtitleEl.textContent = "Take a moment to notice how you feel. Review your retention times below if you like, then rest.";
      hvDirectionLabelEl.textContent = "Phase: Done";
      hvRoundLabelEl.textContent = `Round: ${hvRoundTotal}/${hvRoundTotal}`;
      hvBreathLabelEl.textContent = "Breath: —";
      hvTimerLabelEl.textContent = "Session";
      hvProgressBar.style.width = "0%";
    }

    if (startHvBtn) startHvBtn.addEventListener("click", hvStart);
    if (stopHvBtn) stopHvBtn.addEventListener("click", resetHvUI);
    if (hvEndRetentionBtn) hvEndRetentionBtn.addEventListener("click", endRetentionPhase);

    if (hvBreathsSelectEl) {
      hvBreathsSelectEl.addEventListener("change", () => {
        hvBreathsCustomEl.classList.toggle("hidden-input", hvBreathsSelectEl.value !== "custom");
      });
    }

    function showNostrilScreenFor(mode) {
      resetHvUI();
      if (hyperScreen) hyperScreen.classList.remove("active");
      if (nostrilScreen) nostrilScreen.classList.add("active");
      altStop(false);
      setAltMode(mode);
    }

    function showHyperScreen() {
      altStop(true);
      if (nostrilScreen) nostrilScreen.classList.remove("active");
      if (hyperScreen) hyperScreen.classList.add("active");
      resetHvUI();
    }

    if (brandItems.length) {
      brandItems.forEach((item) => {
        item.addEventListener("click", () => {
          brandItems.forEach((b) => b.classList.remove("active"));
          item.classList.add("active");

          const pattern = item.dataset.pattern;
          if (pattern === "cyclical") showHyperScreen();
          else if (pattern === "solar") showNostrilScreenFor("right");
          else if (pattern === "lunar") showNostrilScreenFor("left");
          else showNostrilScreenFor("alternate");
        });
      });
    }

    setAltMode("alternate");
    resetHvUI();
    if (nostrilScreen) nostrilScreen.classList.add("active");
    if (hyperScreen) hyperScreen.classList.remove("active");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { init };
})();
window.BreathApp = BreathApp;