---
title: FLUSH+RELOAD
description: An interactive introduction to the FLUSH+RELOAD cache side-channel technique.
---

# FLUSH+RELOAD

FLUSH+RELOAD is a cache side-channel technique that allows an attacker to infer whether a victim accessed a particular memory location by measuring memory access times.

## Why Does It Work?

Modern processors use caches to store recently accessed data. Accessing data that is already in the cache is much faster than retrieving the same data from main memory.

FLUSH+RELOAD takes advantage of this timing difference. If an attacker and victim map the same underlying physical memory line, the attacker can monitor a specific memory location and infer whether the victim accessed it.

## How Does FLUSH+RELOAD Work?

The attack consists of four main steps:

1. **FLUSH** — The attacker removes a monitored memory location from the cache.

2. **WAIT** — The attacker allows the victim to execute. If the victim accesses the monitored location, it may be brought back into the cache.

3. **RELOAD** — The attacker accesses the same memory location and measures how long the access takes.

4. **INFER** — The attacker uses the measured access time to infer the victim's behavior.

A fast reload suggests that the memory location was already in the cache, meaning the victim likely accessed it.

A slow reload suggests that the location was not in the cache, meaning the victim likely did not access it.

## How Can This Leak Information?

The attacker does not directly read the victim's private data. Instead, the attacker observes how the victim's execution changes the cache.

If a victim's memory accesses depend on secret information, these cache observations can reveal information about that secret.

In simplified form:

**Secret → Victim Memory Access → Cache State → Timing → Attacker Inference**

## Interactive Example

Enter your hit predictions in the C array (1 for hit, 0 for miss). Run both trials to see your score, then replay the results below. Change the second trial to line 2 and run it again. Both experiments use the lab’s illustrative costs. The C runner executes your edits independently of the visual lab. Try a threshold below 42 and explain why the inference changes even though the latency stays the same.

```c { runnable=true title="FLUSH+RELOAD Simulation" editable=true }
#include <stdio.h>

int main(void) {
    // Change either trial: 2 selects X and 1 selects Y.
    const int victim_line[] = {2, 1};
    const int predict_hit[] = {0, 0};
    int score = 0;
    const int threshold = 100;
    for (int trial = 0; trial < 2; trial++) {
        int valid[4] = {0, 0, 1, 0};
        int selected = victim_line[trial];
        if (selected != 1 && selected != 2) {
            puts("Choose line 2 (X) or 1 (Y).");
            return 1;
        }
        valid[2] = 0;
        printf("Trial %d | FLUSH X (+36 simulated cycles)\n", trial + 1);
        valid[selected] = 1;
        printf("VICTIM loaded line %d (+32)\n", selected);
        int latency = valid[2] ? 42 : 186;
        valid[2] = 1;
        printf("RELOAD X: %d simulated cycles | total %d\n", latency, 68 + latency);
        printf("INFER: X was %s accessed.\n\n",
               latency < threshold ? "likely" : "likely not");
        int inferred_hit = latency < threshold;
        int correct = predict_hit[trial] == inferred_hit;
        score += correct;
        printf("Prediction: %s\n", correct ? "correct" : "try again");
        printf("QUEST %c %d %d %s\n", selected == 2 ? 'X' : 'Y',
               latency, 68 + latency, inferred_hit ? "HIT" : "MISS");
    }
    printf("Score: %d of 2\n", score);
    return 0;
}
```

<button type="button" class="flush-reload-launch-card__button" data-c-replay>Compare my C trials with the lab</button>
<p data-c-trials aria-live="polite"></p>

<div class="flush-reload-launch-card">
  <div>
    <span class="flush-reload-launch-card__eyebrow">Interactive Lab</span>
    <h2>Explore FLUSH+RELOAD visually</h2>
    <p>Step through cache hits and misses, observe cycle counts, and test an inference in the dedicated Cache Quest-style simulator.</p>
  </div>
  <a class="flush-reload-launch-card__button" href="../flush-reload-simulator/">Launch Simulator →</a>
</div>