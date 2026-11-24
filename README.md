# Cache Quest · COMP 495

Justin Owusu’s mentored research project at UNC–Chapel Hill explores what a program can infer from the timing of a shared memory access.

**[Visit the live COMP 495 site](https://jowunc.github.io/comp110-book/)**

## Explore the project

- [**FLUSH+RELOAD lesson**](https://jowunc.github.io/comp110-book/flush-reload/) explains why the observer flushes a shared line and how to interpret its reload time. Step through a C example or edit and run it to compare a hit with a miss.
- [**Cache Quest**](https://jowunc.github.io/comp110-book/cache-quest.html) visualizes the observer, victim and cache through four phases. Revisit a phase on the timeline or use the challenge mode to infer the victim’s access.
- **Timing model** uses illustrative values of 42 cycles for a hit and 186 for a miss, with a 100-cycle decision threshold. Reload latency and cumulative simulated cycles are displayed separately.

A Spectre lesson is planned.

## Run locally

With Python 3.12 and uv available, run:

```sh
make sync
make serve
```

Open http://localhost:8000/flush-reload/ for the lesson or http://localhost:8000/cache-quest.html for the arena. The editable C runner downloads its compiler on demand. Use `make build` to generate the static site in `site/`.

## Source

The lesson lives in `docs/flush-reload.md`. The arena starts at `docs/cache-quest.html` and uses `docs/javascripts/cache-quest-model.js` for its simulated trace. The site builds on the COMP110 book’s Zensical setup and browser-based code runner.
