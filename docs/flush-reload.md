---
title: FLUSH+RELOAD
description: An interactive introduction to the FLUSH+RELOAD cache side-channel technique.
---

# FLUSH+RELOAD

FLUSH+RELOAD is a cache side-channel technique that allows an attacker to infer whether a victim accessed a particular memory location by measuring memory access times.

## Why Does It Work?

Modern processors use caches to store recently accessed data. Accessing data that is already in the cache is much faster than retrieving the same data from main memory.

FLUSH+RELOAD takes advantage of this timing difference. If an attacker and victim share a memory page, the attacker can monitor a specific memory location and determine whether the victim accessed it.

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

The example below demonstrates the basic behavior behind FLUSH+RELOAD.

```c { runnable=true title="FLUSH+RELOAD Simulation" editable=true }
#include <stdio.h>

int main(void) {
    int cached = 0;
    int victim_accesses = 1;

    // FLUSH
    cached = 0;
    printf("1. FLUSH: Cache line removed.\n");

    // VICTIM
    if (victim_accesses) {
        cached = 1;
        printf("2. VICTIM: Victim accesses the memory location.\n");
    } else {
        printf("2. VICTIM: Victim does not access the memory location.\n");
    }

    // RELOAD
    printf("3. RELOAD: Attacker reloads the memory location.\n");

    // INFER
    if (cached) {
        printf("4. RESULT: Fast access (cache hit).\n");
        printf("   Inference: Victim likely accessed the location.\n");
    } else {
        printf("4. RESULT: Slow access (cache miss).\n");
        printf("   Inference: Victim likely did not access the location.\n");
    }

    return 0;
}
```