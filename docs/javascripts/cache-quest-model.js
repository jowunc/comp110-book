window.CacheQuest = {
  trace(victimUsesX, target = 2) {
    const victim = victimUsesX ? 2 : 1;
    const label = target === 2 ? "X" : "Y";
    const cache = [false, false, false, false];
    const steps = [];
    let cycles = 0;
    function record(phase, cost, subtitle, touched = null, measurement = null) {
      cycles += cost;
      const result = measurement === null ? null : measurement < 100 ? "hit" : "miss";
      const inference = phase === "INFER"
        ? "Victim likely accessed " + (result === "hit" ? label : target === 2 ? "Y" : "X")
        : "Awaiting inference";
      steps.push({ phase, title: phase, cost, cycles, subtitle, touched,
        cache: [...cache], measurement, result, inference });
    }
    cache[target] = true;
    record("READY", 0, label + " starts in cache. Advance to flush its copy.");
    cache[target] = false;
    record("FLUSH", 36, label + " is invalid in cache. Its data remains in memory.", target);
    cache[victim] = true;
    record("VICTIM", 32, "The victim loads " + (victimUsesX ? "X" : "Y") + " into line " + victim + ".", victim);
    const latency = cache[target] ? 42 : 186;
    cache[target] = true;
    record("RELOAD", latency, "Reloading " + label + " leaves its line valid. Latency reflects the state before reload.", target, latency);
    record("INFER", 0, "Compare the reload latency with the 100-cycle threshold.", null, latency);
    return steps;
  }
};
