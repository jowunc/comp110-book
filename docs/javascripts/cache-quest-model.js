// Only these four Boolean slots and illustrative costs exist inside the model.
window.CacheQuest = {
  trace(victimUsesX) {
    const cache = [false, false, true, false];
    const target = 2;
    const steps = [];
    let cycles = 0;
    function record(phase, cost, subtitle, measurement = null) {
      cycles += cost;
      const result = measurement === null ? null : measurement < 100 ? "hit" : "miss";
      steps.push({ phase, title: phase, cost, cycles, subtitle, cache: [...cache], measurement, result,
        inference: phase === "INFER" ? (result === "hit" ? "Victim likely accessed X" : "Victim likely accessed Y") : "Awaiting inference" });
    }
    record("READY", 0, "X starts in cache. Step forward to invalidate its copy.");
    cache[target] = false;
    record("FLUSH", 36, "X is invalid in cache. Its data still exists in memory.");
    cache[victimUsesX ? target : 1] = true;
    record("VICTIM", 32, victimUsesX ? "The victim loads X into line 2." : "The victim loads Y into line 1.");
    const latency = cache[target] ? 42 : 186;
    cache[target] = true;
    record("RELOAD", latency, "Reloading X fills line 2. Its earlier state determines the latency.", latency);
    record("INFER", 0, "Compare the reload time with the 100-cycle threshold.", latency);
    return steps;
  }
};
