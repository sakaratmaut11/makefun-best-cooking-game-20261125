// KEBAB NIGHTS — input: mouse zones on the counter plus the keyboard
// map printed on the counter front. Zones are registered by main.js as
// plain rectangles with action names; this file only routes events.

export class InputRouter {
  constructor(canvas, onAction) {
    this.canvas = canvas;
    this.onAction = onAction;
    this.zones = [];
    canvas.addEventListener('click', (ev) => this.handleClick(ev));
    window.addEventListener('keydown', (ev) => this.handleKey(ev));
  }

  setZones(zones) {
    this.zones = zones;
  }

  handleClick(ev) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (ev.clientY - rect.top) * (this.canvas.height / rect.height);
    for (const z of this.zones) {
      if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
        this.onAction(z.action, z.arg);
        return;
      }
    }
    this.onAction('none', null);
  }

  handleKey(ev) {
    if (ev.repeat) return;
    const k = ev.key;
    if (k >= '1' && k <= '5') {
      this.onAction('ingredient', Number(k) - 1);
    } else if (k === '6' || k === '7' || k === '8') {
      this.onAction('sauce', Number(k) - 6);
    } else if (k === 'q' || k === 'Q') {
      this.onAction('carve');
    } else if (k === 'w' || k === 'W') {
      this.onAction('pita');
    } else if (k === 'r' || k === 'R') {
      this.onAction('roll');
    } else if (k === ' ' || k === 'Enter') {
      ev.preventDefault();
      this.onAction('serve');
    } else if (k === 'Backspace') {
      ev.preventDefault();
      this.onAction('trash');
    }
  }
}
