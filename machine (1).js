/* ===========================================================
   THE RESUME MACHINE — machine.js
   Vanilla JS. No frameworks, no dependencies.
   =========================================================== */

const CONFIG = {
  resumeURL: "https://www.jamesgeorgeff.com/resume",
  resumePDF: "assets/James-Georgeff-Resume.pdf",
  portfolioURL: "https://www.jamesgeorgeff.com/mywork"
};

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t = (ms) => (reduceMotion ? Math.min(ms, 60) : ms);

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const els = {
    grid: $("#grid"),
    intro: $("#intro"),
    finale: $("#finale"),
    startBtn: $("#startBtn"),
    skipBtn: $("#skipBtn"),
    soundBtn: $("#soundBtn"),
    live: $("#live"),
    bubble: $("#bubble"),
    crt: $("#crt"),
    lights: $$("#lights li"),
    james: $("#jamesWrap"),
    introJames: $(".plate-james .james"),
    btnResume: $("#btnResume"),
    btnPDF: $("#btnPDF"),
    btnPortfolio: $("#btnPortfolio"),
    btnAgain: $("#btnAgain"),
    mods: {
      1: $("#mod1"), 2: $("#mod2"), 3: $("#mod3"),
      4: $("#mod4"), 5: $("#mod5"), 6: $("#mod6")
    }
  };

  let soundOn = false;
  let audioCtx = null;
  let state = { stage: 0, running: false, done: false };

  /* ---------------- config wiring ---------------- */
  function wireLinks() {
    [els.skipBtn, els.btnResume].forEach((a) => { if (a) a.href = CONFIG.resumeURL; });
    if (els.btnPDF) els.btnPDF.href = CONFIG.resumePDF;
    if (els.btnPortfolio) els.btnPortfolio.href = CONFIG.portfolioURL;
  }

  /* ---------------- sound (tiny synthesized blips, optional) ---------------- */
  function ensureAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }
  function blip(freq, dur, type) {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "square";
    osc.frequency.value = freq;
    gain.gain.value = 0.05;
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }
  const sfx = {
    click: () => blip(440, 0.06, "square"),
    lever: () => blip(180, 0.12, "sawtooth"),
    counter: () => blip(900, 0.02, "square"),
    stamp: () => blip(120, 0.15, "square"),
    ding: () => { blip(660, 0.12, "sine"); setTimeout(() => blip(880, 0.18, "sine"), 100); },
    warn: () => blip(300, 0.05, "square")
  };

  function toggleSound() {
    soundOn = !soundOn;
    els.soundBtn.setAttribute("aria-pressed", String(soundOn));
    els.soundBtn.textContent = "SOUND: " + (soundOn ? "ON" : "OFF");
    if (soundOn) ensureAudio();
  }

  /* ---------------- helpers ---------------- */
  function announce(msg) {
    els.live.textContent = "";
    // force re-announce even if text repeats
    window.requestAnimationFrame(() => { els.live.textContent = msg; });
  }
  function say(msg) {
    els.bubble.textContent = msg;
  }
  function setJamesState(elm, stateName) {
    if (elm) elm.dataset.state = stateName;
  }
  function crt(msg) {
    els.crt.textContent = msg;
  }
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, t(ms)));
  }
  function lightOn(n) {
    const li = els.lights[n - 1];
    if (!li) return;
    li.dataset.done = "true";
    li.querySelector(".lst").textContent = "●";
    li.querySelector(".st-text").textContent = "complete";
  }
  function setModState(n, s) {
    if (els.mods[n]) els.mods[n].dataset.state = s;
  }
  function enableBtn(mod, action) {
    const btn = els.mods[mod].querySelector(`[data-action="${action}"]`);
    if (btn) { btn.disabled = false; }
  }
  function focusFirstControl(mod) {
    const btn = els.mods[mod].querySelector("button:not([disabled])");
    if (btn) btn.focus({ preventScroll: true });
  }

  /* ---------------- STAGE 1: EXPERIENCE ---------------- */
  async function runExperienceStage() {
    setModState(1, "active");
    sfx.lever();
    const btn = els.mods[1].querySelector('[data-action="exp"]');
    btn.classList.add("pulled");
    btn.disabled = true;
    setJamesState(els.james, "operating");
    say("Pulling the record...");
    crt("PROCESSING...");

    const odo = $("#odo", els.mods[1]);
    const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    for (const y of years) {
      odo.textContent = String(y);
      sfx.counter();
      await wait(70);
    }
    await wait(120);
    sfx.stamp();
    setModState(1, "done");
    setJamesState(els.james, "celebrating");
    say("12+ years. Still standing.");
    crt("EXPERIENCE: 12+ YRS");
    lightOn(1);
    announce("Stage 1 complete: 12 plus years of experience, agency plus in-house.");
    await wait(500);
    setJamesState(els.james, "neutral");
    setModState(2, "active");
    enableBtn(2, "prod");
    focusFirstControl(2);
  }

  /* ---------------- STAGE 2: PRODUCTION ---------------- */
  async function runProductionStage() {
    const btn = els.mods[2].querySelector('[data-action="prod"]');
    btn.disabled = true;
    btn.classList.add("pressed");
    sfx.click();
    setJamesState(els.james, "operating");
    say("Running production...");
    crt("EXPORTING...");

    const belt = $("#belt", els.mods[2]);
    const items = ["PRINT", "DIGITAL", "OOH", "EMAIL", "SOCIAL", "PRESENTATIONS", "CAMPAIGNS", "BRAND SYSTEMS"];
    items.forEach((label, i) => {
      const chip = document.createElement("span");
      chip.className = "belt-chip";
      chip.textContent = label;
      chip.style.animationDelay = (i * 90) + "ms";
      belt.appendChild(chip);
    });

    const counter = $("#prodCount", els.mods[2]);
    const counts = ["001", "012", "048", "137", "284", "500+"];
    for (const c of counts) {
      counter.textContent = c;
      sfx.counter();
      await wait(140);
    }
    await wait(reduceMotion ? 0 : 500);
    belt.innerHTML = "";
    sfx.stamp();
    setModState(2, "done");
    setJamesState(els.james, "neutral");
    say("Preflight clean. Zero errors.");
    crt("PRODUCTION: HIGH-VOLUME");
    lightOn(2);
    announce("Stage 2 complete: high volume production, preflight zero errors.");
    await wait(400);
    setModState(3, "active");
    enableBtn(3, "sweet");
    focusFirstControl(3);
  }

  /* ---------------- STAGE 3: THE SWEET SPOT ---------------- */
  async function runCreativeStage() {
    const dial = $("#dial", els.mods[3]);
    dial.disabled = true;
    sfx.click();
    setJamesState(els.james, "thinking");
    say("Dialing it in...");
    crt("CALIBRATING...");

    dial.style.setProperty("--a", "-70deg");
    await wait(30);
    dial.style.setProperty("--a", "70deg");
    await wait(t(550));
    dial.style.setProperty("--a", "0deg");
    await wait(t(650));

    sfx.stamp();
    setModState(3, "done");
    setJamesState(els.james, "celebrating");
    say("Right in the middle.");
    crt("CREATIVE + PRODUCTION");
    lightOn(3);
    announce("Stage 3 complete: creative plus production, right in the middle.");
    await wait(500);
    setJamesState(els.james, "neutral");
    setModState(4, "active");
    enableBtn(4, "lead");
    focusFirstControl(4);
  }

  /* ---------------- STAGE 4: LEADERSHIP ---------------- */
  async function runLeadershipStage() {
    const btn = els.mods[4].querySelector('[data-action="lead"]');
    btn.disabled = true;
    sfx.click();
    setJamesState(els.james, "operating");
    say("Building the team...");
    crt("STAFFING...");

    const team = $("#team", els.mods[4]);
    const teamCount = $("#teamCount", els.mods[4]);
    const counts = [2, 3, 5, 8, 12, 15];
    let shown = 1;
    for (const target of counts) {
      while (shown < target) {
        shown++;
        const dz = document.createElement("span");
        dz.className = "dz";
        dz.innerHTML = '<svg viewBox="0 0 16 20"><use href="#jamesSprite"/></svg>';
        team.appendChild(dz);
        sfx.counter();
      }
      teamCount.textContent = String(shown).padStart(2, "0");
      await wait(160);
    }
    await wait(reduceMotion ? 0 : 300);
    sfx.stamp();
    setModState(4, "done");
    setJamesState(els.james, "celebrating");
    say("15 designers. One deadline.");
    crt("TEAM: 15 DESIGNERS");
    lightOn(4);
    announce("Stage 4 complete: fifteen designer team, team leadership.");
    await wait(500);
    setJamesState(els.james, "neutral");
    setModState(5, "active");
    await revealProblems();
  }

  /* ---------------- STAGE 5: MAKE IT WORK ---------------- */
  async function revealProblems() {
    const warnList = $("#warn", els.mods[5]);
    warnList.innerHTML = "";
    const problems = [
      "MISSING FONT", "LOW RES IMAGE", "BROKEN LINK", "NO BLEED",
      "RGB", "LAST-MINUTE REVISION", "WRONG SIZE", "IMPOSSIBLE DEADLINE"
    ];
    say("Uh oh.");
    crt("⚠ 8 ISSUES FOUND");
    for (const p of problems) {
      const li = document.createElement("li");
      li.textContent = p;
      li.dataset.label = p;
      warnList.appendChild(li);
      sfx.warn();
      await wait(90);
    }
    announce("Eight production problems appeared.");
    enableBtn(5, "fix");
    focusFirstControl(5);
  }

  async function runProblemSolvingStage() {
    const btn = els.mods[5].querySelector('[data-action="fix"]');
    btn.classList.add("pulled");
    btn.disabled = true;
    sfx.lever();
    setJamesState(els.james, "working");
    say("Figuring it out...");
    crt("RESOLVING...");
    els.mods[5].classList.add("shake-host");

    const fixes = {
      "MISSING FONT": "FIXED",
      "LOW RES IMAGE": "FIXED",
      "BROKEN LINK": "FIXED",
      "NO BLEED": "FIXED",
      "RGB": "CMYK",
      "LAST-MINUTE REVISION": "DONE",
      "WRONG SIZE": "FIXED",
      "IMPOSSIBLE DEADLINE": "DELIVERED"
    };
    const items = $$("li", $("#warn", els.mods[5]));
    for (const li of items) {
      await wait(110);
      li.classList.add("fixed");
      li.textContent = fixes[li.dataset.label] || "FIXED";
      sfx.counter();
    }
    await wait(reduceMotion ? 0 : 350);
    sfx.ding();
    setModState(5, "done");
    setJamesState(els.james, "celebrating");
    say("Somehow, it shipped.");
    crt("PROBLEM SOLVING: DONE");
    lightOn(5);
    announce("Stage 5 complete: problem solving. Somehow, it shipped.");
    await wait(600);
    setJamesState(els.james, "neutral");
    await runFinalSequence();
  }

  /* ---------------- FINAL SEQUENCE ---------------- */
  async function runFinalSequence() {
    crt("ASSEMBLY COMPLETE.");
    say("Almost there...");
    setModState(6, "active");
    $$(".gear", els.grid).forEach((g) => g.classList.add("spin"));
    const banner = $("#banner", els.mods[6]);
    banner.textContent = "PRINTING...";
    sfx.click();
    await wait(500);
    banner.textContent = "FEEDING PAPER...";
    await wait(500);
    sfx.ding();
    setModState(6, "done");
    banner.textContent = "COMPLETE";
    announce("Assembly complete. Producing final resume.");
    await wait(700);
    $$(".gear", els.grid).forEach((g) => g.classList.remove("spin"));
    state.done = true;
    showResume();
  }

  /* ---------------- RESUME / NAV ---------------- */
  function showResume() {
    els.finale.hidden = false;
    document.body.classList.add("lock");
    const heading = $("#fTitle");
    if (heading) heading.focus({ preventScroll: false });
    announce("Resume ready. View full resume, download PDF, or view portfolio.");
  }

  function skipToResume(evt) {
    if (evt) evt.preventDefault();
    state.running = false;
    // Light every stage instantly, then show resume — no animation debt.
    for (let n = 1; n <= 5; n++) { lightOn(n); setModState(n, "done"); }
    setModState(6, "done");
    els.intro.style.display = "none";
    document.body.classList.remove("lock");
    showResume();
  }

  function resetMachine() {
    state = { stage: 0, running: false, done: false };
    els.finale.hidden = true;
    $$(".mod").forEach((m) => { if (m.id) m.dataset.state = "dormant"; });
    els.lights.forEach((li) => {
      delete li.dataset.done;
      li.querySelector(".lst").textContent = "○";
      li.querySelector(".st-text").textContent = "not complete";
    });
    $$("[data-action]").forEach((b) => {
      if (b === els.startBtn) return; // start button must stay enabled for the next play
      b.disabled = true;
      b.classList.remove("pulled", "pressed");
    });
    $("#odo", els.mods[1]).textContent = "----";
    $("#prodCount", els.mods[2]).textContent = "000";
    $("#belt", els.mods[2]).innerHTML = "";
    $("#dial", els.mods[3]).style.setProperty("--a", "-70deg");
    $("#team", els.mods[4]).innerHTML = "";
    $("#teamCount", els.mods[4]).textContent = "01";
    $("#warn", els.mods[5]).innerHTML = "";
    $("#banner", els.mods[6]).textContent = "STANDBY";
    setJamesState(els.james, "neutral");
    say("Ready when you are.");
    crt("READY.");
    els.intro.style.display = "";
    document.body.classList.add("lock");
  }

  /* ---------------- START ---------------- */
  async function startMachine() {
    if (state.running) return;
    state.running = true;
    sfx.click();
    els.intro.style.display = "none";
    document.body.classList.remove("lock");
    setModState(1, "active");
    enableBtn(1, "exp");
    focusFirstControl(1);
    announce("Machine started. Stage 1: experience.");
  }

  /* ---------------- init / wiring ---------------- */
  function initializeMachine() {
    wireLinks();

    els.startBtn.addEventListener("click", startMachine);
    els.skipBtn.addEventListener("click", skipToResume);
    els.soundBtn.addEventListener("click", toggleSound);
    els.btnAgain.addEventListener("click", () => {
      els.finale.hidden = true;
      resetMachine();
    });

    els.mods[1].querySelector('[data-action="exp"]').addEventListener("click", (e) => {
      e.currentTarget.blur();
      runExperienceStage();
    });
    els.mods[2].querySelector('[data-action="prod"]').addEventListener("click", runProductionStage);
    els.mods[3].querySelector('[data-action="sweet"]').addEventListener("click", (e) => {
      e.currentTarget.blur();
      runCreativeStage();
    });
    els.mods[4].querySelector('[data-action="lead"]').addEventListener("click", runLeadershipStage);
    els.mods[5].querySelector('[data-action="fix"]').addEventListener("click", (e) => {
      e.currentTarget.blur();
      runProblemSolvingStage();
    });

    // A hiring manager should never be blocked from the actual resume.
    // Skip link works at every point, including before JS finishes stages.
  }

  document.addEventListener("DOMContentLoaded", initializeMachine);
})();
