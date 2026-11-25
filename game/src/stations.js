// KEBAB NIGHTS — the two timed stations: the vertical spit you carve
// from, and the flat grill where pita warms. Both expose a 0..1 progress
// so the renderer can draw honest timer bars.

export const CARVE_SECONDS = 0.7;
export const WARM_SECONDS = 3.0;
export const BURN_SECONDS = 6.5; // pita left too long after warming chars

export class SpitStation {
  constructor() {
    this.carving = 0; // seconds left on the current carve, 0 = idle
    this.spin = 0;    // spit rotation for the drawing
  }

  get busy() {
    return this.carving > 0;
  }

  get progress() {
    return this.busy ? 1 - this.carving / CARVE_SECONDS : 0;
  }

  startCarve() {
    if (this.busy) return false;
    this.carving = CARVE_SECONDS;
    return true;
  }

  // Returns 'carved' on the frame a portion lands on the tray.
  tick(dt) {
    this.spin = (this.spin + dt * 0.55) % (Math.PI * 2);
    if (!this.busy) return null;
    this.carving -= dt;
    if (this.carving <= 0) {
      this.carving = 0;
      return 'carved';
    }
    return null;
  }
}

export class PitaGrill {
  constructor() {
    this.state = 'empty'; // empty | warming | ready | burnt
    this.t = 0;
  }

  get progress() {
    if (this.state === 'warming') return this.t / WARM_SECONDS;
    if (this.state === 'ready' || this.state === 'burnt') return 1;
    return 0;
  }

  place() {
    if (this.state !== 'empty') return false;
    this.state = 'warming';
    this.t = 0;
    return true;
  }

  // Returns 'warmed' or 'burnt' on the frame the state flips.
  tick(dt) {
    if (this.state === 'warming') {
      this.t += dt;
      if (this.t >= WARM_SECONDS) {
        this.state = 'ready';
        this.t = 0;
        return 'warmed';
      }
    } else if (this.state === 'ready') {
      this.t += dt;
      if (this.t >= BURN_SECONDS) {
        this.state = 'burnt';
        return 'burnt';
      }
    }
    return null;
  }

  take() {
    if (this.state !== 'ready') return false;
    this.state = 'empty';
    this.t = 0;
    return true;
  }

  clear() {
    this.state = 'empty';
    this.t = 0;
  }
}
