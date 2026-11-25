// KEBAB NIGHTS — the order board: ticket queue, patience, matching.
// Tickets arrive over the shift; each carries one wrap recipe and a
// patience budget that drains in real time.

import { WRAPS } from './recipes.js';

// Small deterministic random source so screenshot scenes are stable.
export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return function rng() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export class OrderBoard {
  constructor(rng) {
    this.rng = rng;
    this.tickets = [];
    this.nextId = 1;
    this.spawnIn = 1.2; // seconds until the first guest steps up
  }

  spawnTimer(dt, pressure) {
    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.tickets.length < 3) {
      this.addTicket(pressure);
      const base = 13 - pressure * 5;
      this.spawnIn = Math.max(5.5, base + this.rng() * 4);
    }
  }

  addTicket(pressure) {
    const wrap = WRAPS[Math.floor(this.rng() * WRAPS.length)];
    const patience = Math.max(38, wrap.patience - pressure * 9);
    const ticket = {
      id: this.nextId++,
      wrap,
      patienceMax: patience,
      patienceLeft: patience,
    };
    this.tickets.push(ticket);
    return ticket;
  }

  // Drain patience; returns tickets that walked away this frame.
  tick(dt) {
    const walked = [];
    for (const t of this.tickets) {
      t.patienceLeft -= dt;
      if (t.patienceLeft <= 0) walked.push(t);
    }
    if (walked.length) {
      this.tickets = this.tickets.filter((t) => t.patienceLeft > 0);
    }
    return walked;
  }

  // Find the oldest ticket a finished wrap satisfies, or null.
  match(build) {
    for (const t of this.tickets) {
      if (buildMatches(build, t.wrap)) return t;
    }
    return null;
  }

  remove(ticket) {
    this.tickets = this.tickets.filter((t) => t !== ticket);
  }
}

// A build is { meat, items:Set, sauce } — it must equal the recipe.
export function buildMatches(build, wrap) {
  if (!build || build.meat !== wrap.meat) return false;
  if (build.sauce !== wrap.sauce) return false;
  if (build.items.size !== wrap.items.length) return false;
  for (const item of wrap.items) {
    if (!build.items.has(item)) return false;
  }
  return true;
}
