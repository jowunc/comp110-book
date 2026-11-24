---
title: FLUSH+RELOAD
description: An interactive introduction to the FLUSH+RELOAD cache side-channel technique.
---

# FLUSH+RELOAD

Justin Owusu · COMP 495 mentored research

FLUSH+RELOAD is a cache side-channel technique that allows an attacker to infer whether a victim accessed a particular memory location by measuring memory access times.

## Why Does It Work?

Modern processors use caches to store recently accessed data. Accessing data that is already in the cache is much faster than retrieving the same data from main memory.

FLUSH+RELOAD takes advantage of this timing difference. If an attacker and victim map the same underlying physical memory line, the attacker can monitor a specific memory location and infer whether the victim accessed it.

## How Does FLUSH+RELOAD Work?

The attack consists of four main steps:

1. **FLUSH** — The attacker removes the cached copy of the shared line so it starts out absent. Otherwise, a fast reload could come from an earlier access, even if the victim never touched the line during this observation.

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

## Step through a cache reload

X is a memory location. Watch the value of `cached` when the program chooses a reload time: 42 simulated cycles for a hit or 186 for a miss.

<div data-quest-experiment></div>

```c { runnable=true title="Cache reload" editable=true }
#include <stdio.h>

int main(void) {
    int cached = 1;
    cached = 0;                         // Flush X
    cached = 1;                         // Victim reads X
    int latency = cached ? 42 : 186;    // Time the reload
    cached = 1;                         // Reload brings X into cache
    puts(latency < 100 ? "Hit" : "Miss");
    return 0;
}
```

[Open Cache Quest](../cache-quest.html)
