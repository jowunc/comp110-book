(() => {
  function mountWalkthrough(controls, widget) {
    const source = widget.querySelector("pre code")?.textContent;
    if (!source) return;
    const lines = source.trimEnd().split("\n");
    const statements = lines.map((line, i) => line.trim().includes(";") ? i : -1).filter(i => i >= 0);
    const last = statements.length;
    const trace = window.CacheQuest.trace(true, 2);
    const latency = trace[3].measurement;
    const notes = ["", "X starts in the cache.", "Flush removes the cached copy of X.",
      "The victim reads X, bringing it back into the cache.",
      "X is cached, so the simulated reload takes " + latency + " cycles.",
      "After the reload, X is in the cache.", "The latency is below 100 cycles, so the program prints Hit.",
      "main returns 0 and its local variables go out of scope."];
    const panel = document.createElement("section");
    panel.className = "quest-walk";
    panel.setAttribute("aria-label", "Guided C example");
    panel.innerHTML = `<div class="qw-source"><div class="qw-code" tabindex="0" aria-label="C source. Use the left and right arrow keys to step." aria-keyshortcuts="ArrowLeft ArrowRight Home End"></div><aside class="qw-tip" role="status" hidden><strong></strong><p></p></aside></div>
      <div class="qw-tools"><button data-step="0" aria-label="Restart" title="Restart">↺</button>
      <button data-step="-1" aria-label="Previous line" title="Previous line">◀</button>
      <button data-step="1" aria-label="Next line" title="Next line">↓</button>
      <button data-play>Play</button><button data-step="last" aria-label="Last line" title="Last line">▶│</button></div>
      <div class="qw-panels">
      <section><h4>Local variables · main</h4><pre></pre></section>
      <section><h4>Simulated cache</h4><pre></pre></section>
      <section><h4>Printed output</h4><pre></pre></section></div>`;
    controls.after(panel);
    const code = panel.querySelector(".qw-code");
    const rows = new Map();
    for (let i = 0; i < lines.length; i++) {
      const row = document.createElement("div");
      const number = document.createElement("span");
      number.textContent = i + 1;
      row.append(number);
      const tokens = lines[i].split(/(\/\/.*|"[^"]*"|#include|\b(?:int|void|return)\b|\b\d+\b)/g);
      tokens.forEach((token, part) => {
        if (part % 2 === 0) {
          row.append(token);
          return;
        }
        const ink = document.createElement("b");
        ink.className = token.startsWith("//") || token.startsWith('"') ? "qw-string" :
          /^\d/.test(token) ? "qw-number" : "qw-keyword";
        ink.textContent = token;
        row.append(ink);
      });
      code.append(row);
      rows.set(i, row);
    }
    let index = 0;
    let timer;
    const play = panel.querySelector("[data-play]");
    function pause() {
      clearInterval(timer);
      timer = null;
      play.textContent = "Play";
    }
    function render() {
      const [locals, cache, printed] = panel.querySelectorAll(".qw-panels pre");
      const cached = index === 2 ? 0 : 1;
      locals.textContent = index === 0 || index === last ? "No active locals" :
        "cached = " + cached + (index >= 4 ? "\nlatency = " + latency : "");
      cache.textContent = index === 0 ? "Awaiting initialization" : "X   " + (cached ? "present" : "absent");
      printed.textContent = index >= 6 ? "Hit" : "No printed output yet";
      const current = statements[index - 1];
      for (const [i, row] of rows) row.classList.toggle("active", i === current);
      const tip = panel.querySelector(".qw-tip");
      tip.hidden = index === 0;
      tip.querySelector("strong").textContent = index === last ? "Program complete" :
        `Step ${index} of ${last} · Line ${current + 1}`;
      tip.querySelector("p").textContent = notes[index];
      cache.dataset.state = index === 0 ? "empty" : cached ? "present" : "absent";
      printed.classList.toggle("qw-result", index >= 6);
      locals.classList.toggle("qw-frame", index > 0 && index < last);
      for (const button of panel.querySelectorAll("[data-step]")) {
        button.disabled = Number(button.dataset.step) <= 0 ? index === 0 : index === last;
      }
      if (index === last) pause();
    }
    code.addEventListener("keydown", event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const positions = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last };
      if (!Object.hasOwn(positions, event.key)) return;
      event.preventDefault();
      pause();
      index = Math.max(0, Math.min(last, positions[event.key]));
      render();
    });
    panel.querySelector(".qw-tools").addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button === play && !timer) {
        if (index === last) index = 0;
        render();
        play.textContent = "Pause";
        timer = setInterval(() => {
          if (!panel.isConnected) return pause();
          index++;
          render();
        }, 1700);
        return;
      }
      pause();
      if (button !== play) {
        const action = button.dataset.step === "last" ? last : Number(button.dataset.step);
        index = action === 0 || action === last ? action : index + action;
        render();
      }
    });
    render();
  }
  function initialize() {
    const controls = document.querySelector("[data-quest-experiment]");
    const widget = document.querySelector("[data-c-runner]");
    if (!controls || !widget || controls.dataset.ready) return;
    controls.dataset.ready = "true";
    mountWalkthrough(controls, widget);

    const advanced = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "Advanced · edit and run the C source";
    widget.before(advanced);
    const prompt = document.createElement("p");
    prompt.textContent = "Try a miss. Run the original program, then comment out the line marked “Victim reads X” and run it again. Both runs bring X into the cache. Which value did cached hold when latency was assigned?";
    advanced.append(summary, prompt, widget);

  }
  document.addEventListener("DOMContentLoaded", initialize);
  window.document$?.subscribe(initialize);
  initialize();
})();
