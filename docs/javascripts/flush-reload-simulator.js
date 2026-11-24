(() => {
  const lines = [
    { id: 0, label: "Line 0", address: "0x1000" },
    { id: 1, label: "Line 1", address: "0x1C00" },
    { id: 2, label: "Line 2", address: "0x2400", monitored: true },
    { id: 3, label: "Line 3", address: "0x3800" },
  ];
  const phases = ["FLUSH", "VICTIM", "RELOAD", "INFER"];
  const trace = window.CacheQuest.trace;
  function initialize(container) {
    if (!container || container.dataset.ready === "true") return;
    container.dataset.ready = "true";

    container.innerHTML = `
      <section class="frq" aria-label="FLUSH+RELOAD cache side-channel simulator">
        <header class="frq__header">
          <div class="frq__brand"><span class="frq__brand-icon" aria-hidden="true">🎮</span><strong>FLUSH+RELOAD · Cache Side-Channel Simulator</strong></div>
          <select class="frq__mode" aria-label="Experiment mode" data-mode><option value="hit">Demo · Victim accesses X</option><option value="miss">Demo · Victim accesses Y</option><option value="challenge">Hidden bit challenge</option></select>
        </header>

        <div class="frq__dashboard">
          <aside class="frq__left">
            <article class="frq__card">
              <span class="frq__card-icon" aria-hidden="true">◎</span>
              <div><h3>Objective</h3><p>Determine if the victim accessed memory <b data-target-name>X</b> using cache timing.</p></div>
            </article>
            <article class="frq__card frq__controls-card">
              <span class="frq__card-icon" aria-hidden="true">☷</span>
              <div><h3>Controls</h3><label>Monitor <select data-target><option value="2">X · line 2</option><option value="1">Y · line 1</option></select></label><button type="button" data-fr-play><span data-fr-play-icon>▶</span><span data-fr-play-label>Play</span></button><button type="button" data-fr-next><span>»</span>Step Next</button><button type="button" data-fr-prev><span>«</span>Step Prev</button><button type="button" data-fr-reset><span>↻</span>Reset</button></div>
            </article>
          </aside>

          <section class="frq__arena">
            <div class="frq__stage"><span class="frq__chevrons">»»</span><strong data-fr-stage>Step 1: FLUSH</strong><span class="frq__chevrons">««</span></div>
            <div class="frq__workspace">
              <div class="frq__actor frq__attacker"><div class="frq__avatar">◉<span>▰</span></div><strong>Attacker</strong><small>(Observer)</small></div>
              <div class="frq__cache"><h3>Cache (L3)</h3><div data-fr-cache></div></div>
              <div class="frq__actor frq__victim"><div class="frq__avatar">●<span>▰</span></div><strong>Victim</strong><small>(Target)</small></div>
            </div>
          </section>

          <aside class="frq__right">
            <article class="frq__card"><span class="frq__card-icon" aria-hidden="true">◷</span><div><h3>Reload latency</h3><strong class="frq__value" data-fr-cycles>—</strong></div></article>
            <article class="frq__card frq__result"><span class="frq__card-icon" aria-hidden="true">▣</span><div><h3>Result</h3><strong data-fr-result class="frq__result-value">Waiting</strong></div></article>
            <article class="frq__card"><span class="frq__card-icon" aria-hidden="true">◉</span><div><h3>Inference</h3><strong class="frq__inference" data-fr-inference>No inference yet</strong></div></article>
          </aside>
        </div>

        <p class="frq__guide" aria-live="polite" data-guide></p>
        <div class="frq__quiz" hidden><strong>Bit 1 selects X. Bit 0 selects Y. Which bit fits the reload?</strong> <button data-bit="0">Bit 0</button> <button data-bit="1">Bit 1</button> <button data-round>New round</button><p aria-live="polite" data-feedback></p></div>
        <div class="frq__timeline" aria-label="FLUSH+RELOAD stage timeline">
          ${phases.map((phase, index) => `<button type="button" data-fr-phase-index="${index}" class="frq__phase ${index === 0 ? "is-active" : ""}"><span class="frq__phase-dot">${index + 1}</span><strong>${phase}</strong></button>`).join("")}
        </div>

        <div class="frq__timing">
          <div><span>TOTAL SIMULATED CPU CYCLES</span><strong data-total>0</strong></div>
          <div class="frq__scale" aria-label="Reload latency scale"><span>0</span><span>300 cycles</span><i></i><b data-fr-marker></b></div>
          <small data-fr-timing-caption>Educational timing model—not real CPU hardware measurements.</small>
        </div>
      </section>
    `;

    const state = { hit: true, index: 0, target: 2, steps: trace(true), timer: null };

    function stop() {
      if (state.timer !== null) window.clearInterval(state.timer);
      state.timer = null;
      container.querySelector("[data-fr-play-label]").textContent = "Play";
      container.querySelector("[data-fr-play-icon]").textContent = "▶";
      container.querySelector("[data-fr-play]").setAttribute("aria-pressed", "false");
    }

    function setHit(hit) {
      stop();
      state.hit = hit;
      state.steps = trace(hit, state.target);
      state.index = 0;
      state.answered = false;
      container.querySelector("[data-feedback]").textContent = "";
      render();
    }

    function render() {
      const step = state.steps[state.index];
      const challenge = container.querySelector("[data-mode]").value === "challenge";
      const blind = challenge && !state.answered;
      const prompts = ["Start by flushing the monitored line.", "Next, let the victim act.", "The victim chose a location. Reload your monitored line.", "Below 100 cycles suggests a hit. Advance to INFER.", "A hit suggests the monitored location. A miss suggests the other location. Choose the secret bit."];
      container.querySelector(".frq__quiz").hidden = !challenge;
      container.querySelectorAll("[data-bit]").forEach(b => b.disabled = state.index !== 4 || state.answered);
      container.querySelector("[data-guide]").textContent = (blind ? prompts[state.index] : step.subtitle) + "  +" + step.cost + " simulated cycles";
      container.querySelector("[data-fr-stage]").textContent = `${state.index ? "Step " + state.index + ": " : ""}${step.title}`;
      container.dataset.phase = step.phase;
      container.querySelector("[data-fr-cycles]").textContent = step.measurement === null ? "—" : step.measurement + " cycles";
      container.querySelector("[data-total]").textContent = step.cycles;
      container.querySelector("[data-target-name]").textContent = state.target === 2 ? "X" : "Y";
      container.querySelector("[data-fr-inference]").textContent = blind ? "Make your prediction" : step.inference;

      const cache = container.querySelector("[data-fr-cache]");
      cache.innerHTML = lines.map((line) => {
        const cached = !blind && Boolean(step.cache[line.id]);
        const monitored = line.monitored ? " <em>X</em>" : line.id === 1 ? " <em>Y</em>" : "";
        return `<div class="frq__line ${cached ? "is-cached" : ""} ${(!blind || step.phase !== "VICTIM") && line.id === step.touched ? "touch-" + step.phase : ""}"><span>${line.label}${monitored}</span><b>${blind ? "?" : cached ? "✓" : "–"}</b></div>`;
      }).join("");

      const result = container.querySelector("[data-fr-result]");
      result.className = "frq__result-value";
      if (!step.result) result.textContent = state.index === 0 ? "Waiting" : "Analyzing";
      else {
        result.textContent = step.result === "hit" ? "Cache Hit" : "Cache Miss";
        result.classList.add(step.result === "hit" ? "is-hit" : "is-miss");
      }

      container.querySelectorAll("[data-fr-phase-index]").forEach((button) => {
        const index = 1 + Number(button.dataset.frPhaseIndex);
        button.setAttribute("aria-current", index === state.index ? "step" : "false");
        button.classList.toggle("is-active", index === state.index);
        button.classList.toggle("is-complete", index < state.index);
        button.querySelector(".frq__phase-dot").textContent = index < state.index ? "✓" : String(index);
      });

      container.querySelector("[data-fr-prev]").disabled = state.index === 0;
      container.querySelector("[data-fr-next]").disabled = state.index === state.steps.length - 1;


      const marker = container.querySelector("[data-fr-marker]");
      const caption = container.querySelector("[data-fr-timing-caption]");
      if (step.measurement) {

        marker.style.left = `${Math.min(100, step.measurement / 3)}%`;
        marker.className = step.result;
        caption.textContent = step.result === "hit" ? "Below the 100-cycle threshold: cache HIT" : "Above the 100-cycle threshold: cache MISS";
      } else {

        marker.style.left = "0%";
        marker.className = "";
        caption.textContent = "Educational timing model—not real CPU hardware measurements.";
      }
    }

    container.querySelector("[data-fr-prev]").addEventListener("click", () => { stop(); state.index = Math.max(0, state.index - 1); render(); });
    container.querySelector("[data-fr-next]").addEventListener("click", () => { stop(); state.index = Math.min(state.steps.length - 1, state.index + 1); render(); });
    container.querySelector("[data-fr-reset]").addEventListener("click", () => setHit(state.hit));
    container.querySelectorAll("[data-fr-phase-index]").forEach((button) => button.addEventListener("click", () => { stop(); state.index = 1 + Number(button.dataset.frPhaseIndex); render(); }));

    const mode = container.querySelector("[data-mode]");
    const target = container.querySelector("[data-target]");
    target.addEventListener("change", () => {
      state.target = Number(target.value);
      setHit(state.hit);
    });
    function newRound() { target.disabled = mode.value === "challenge"; setHit(mode.value === "challenge" ? Math.random() < 0.5 : mode.value === "hit"); }
    mode.addEventListener("change", newRound);
    container.querySelector("[data-round]").addEventListener("click", newRound);
    container.querySelectorAll("[data-bit]").forEach(button => button.addEventListener("click", () => {
      state.answered = true;
      const correct = Number(button.dataset.bit) === Number(state.hit);
      container.querySelector("[data-feedback]").textContent = (correct ? "Correct. " : "Try another round. ") + state.steps[3].measurement + " cycles is a " + state.steps[3].result + " on the monitored line. " + (state.hit ? "The victim chose X, so the bit was 1." : "The victim chose Y, so the bit was 0.");
      render();
    }));
    container.querySelector("[data-fr-play]").addEventListener("click", () => {
      if (state.timer !== null) { stop(); return; }
      if (state.index === state.steps.length - 1) { state.index = 0; render(); }
      container.querySelector("[data-fr-play-label]").textContent = "Pause";
      container.querySelector("[data-fr-play-icon]").textContent = "Ⅱ";
      container.querySelector("[data-fr-play]").setAttribute("aria-pressed", "true");
      state.timer = window.setInterval(() => {
        if (state.index >= state.steps.length - 1) { stop(); return; }
        state.index += 1;
        if (state.index === state.steps.length - 1 || !container.isConnected) stop();
        render();
      }, 900);
    });

    const params = new URLSearchParams(location.search);
    if (params.get("monitor") === "Y") {
      target.value = "1";
      state.target = 1;
      setHit(state.hit);
    }
    if (location.hash === "#trial-x" || location.hash === "#trial-y") {
      mode.value = location.hash === "#trial-x" ? "hit" : "miss";
      setHit(mode.value === "hit");
      state.index = 3;
    }
    render();
  }

  function boot() {
    document.querySelectorAll("#flush-reload-visualizer[data-fr-ready]").forEach(initialize);
  }
  document.addEventListener("DOMContentLoaded", boot);
  if (window.document$?.subscribe) window.document$.subscribe(boot);
  boot();
})();
