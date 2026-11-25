// KEBAB NIGHTS — the shift loop. Owns the game state: the plate being
// built, the tray of carved meat, the pass, coins and strikes; feeds
// every frame to render.js and routes input actions into state changes.

import { INGREDIENTS, SAUCES } from './recipes.js';
import { OrderBoard, makeRng } from './orders.js';
import { SpitStation, PitaGrill } from './stations.js';
import { InputRouter } from './input.js';
import { drawScene, clickZones } from './render.js';

const SHIFT_SECONDS = 180;
const MAX_STRIKES = 3;

function emptyBuild() {
  return { pita: false, meat: 0, items: new Set(), sauce: null };
}

class Shift {
  constructor(rng) {
    this.board = new OrderBoard(rng);
    this.spit = new SpitStation();
    this.grill = new PitaGrill();
    this.build = emptyBuild();
    this.readyWrap = null;
    this.trayMeat = 0;
    this.shiftLeft = SHIFT_SECONDS;
    this.coins = 0;
    this.served = 0;
    this.strikes = 0;
    this.message = '';
    this.messageT = 0;
    this.over = false;
    this.banner = false;
  }

  get pressure() {
    const elapsed = SHIFT_SECONDS - this.shiftLeft;
    return Math.min(2, Math.floor(elapsed / 45));
  }

  say(msg, seconds = 2.2) {
    this.message = msg;
    this.messageT = seconds;
  }

  act(action, arg) {
    if (this.over) {
      if (action === 'serve') this.restart();
      return;
    }
    if (action === 'carve') {
      // A click on the tray side loads the plate first when it can.
      if (this.trayMeat > 0 && this.build.pita && this.build.meat < 2) {
        this.trayMeat--;
        this.build.meat++;
        this.say('meat on the pita');
      } else if (this.spit.startCarve()) {
        this.say('carving off the spit…');
      }
    } else if (action === 'pita') {
      if (this.grill.state === 'empty') {
        this.grill.place();
        this.say('pita on the grill');
      } else if (this.grill.state === 'ready') {
        if (!this.build.pita) {
          this.grill.take();
          this.build.pita = true;
          this.say('warm pita on the plate');
        } else {
          this.say('the plate already has a pita');
        }
      } else if (this.grill.state === 'burnt') {
        this.grill.clear();
        this.say('burnt pita tossed');
      }
    } else if (action === 'ingredient') {
      const ing = INGREDIENTS[arg];
      if (!this.build.pita) return this.say('the plate needs a pita first');
      if (this.build.items.has(ing.id)) this.build.items.delete(ing.id);
      else this.build.items.add(ing.id);
    } else if (action === 'sauce') {
      const s = SAUCES[arg];
      if (!this.build.pita) return this.say('the plate needs a pita first');
      this.build.sauce = this.build.sauce === s.id ? null : s.id;
    } else if (action === 'roll') {
      if (this.readyWrap) return this.say('the pass is full — serve first');
      if (!this.build.pita || this.build.meat < 1) return this.say('a wrap needs pita and meat');
      this.readyWrap = {
        meat: this.build.meat,
        items: new Set(this.build.items),
        sauce: this.build.sauce,
      };
      this.build = emptyBuild();
      this.say('rolled — on the pass');
    } else if (action === 'serve') {
      if (!this.readyWrap) return this.say('nothing on the pass yet');
      const ticket = this.board.match(this.readyWrap);
      if (ticket) {
        const tip = Math.round((ticket.patienceLeft / ticket.patienceMax) * 8);
        this.coins += ticket.wrap.price + tip;
        this.served++;
        this.board.remove(ticket);
        this.say(`served #${ticket.id} — ${ticket.wrap.price + tip} coins`);
      } else {
        this.strikes++;
        this.say('no ticket matches that wrap — strike');
      }
      this.readyWrap = null;
    } else if (action === 'trash') {
      this.build = emptyBuild();
      this.say('plate cleared');
    }
  }

  restart() {
    const fresh = new Shift(this.board.rng);
    Object.assign(this, fresh);
    this.say('a new night begins');
  }

  tick(dt) {
    if (this.over) return;
    this.shiftLeft -= dt;
    if (this.messageT > 0) {
      this.messageT -= dt;
      if (this.messageT <= 0) this.message = '';
    }
    if (this.spit.tick(dt) === 'carved') {
      if (this.build.pita && this.build.meat < 2) {
        this.build.meat++;
        this.say('carve landed on the pita');
      } else if (this.trayMeat < 6) {
        this.trayMeat++;
      }
    }
    const g = this.grill.tick(dt);
    if (g === 'warmed') this.say('pita is warm — click the grill');
    if (g === 'burnt') this.say('the pita burnt on the grill');
    this.board.spawnTimer(dt, this.pressure);
    const walked = this.board.tick(dt);
    if (walked.length) {
      this.strikes += walked.length;
      this.say('a guest walked away — strike');
    }
    if (this.strikes >= MAX_STRIKES || this.shiftLeft <= 0) {
      this.over = true;
      this.shiftLeft = Math.max(0, this.shiftLeft);
    }
  }
}

// --- deterministic screenshot scenes --------------------------------------
// ?shot=cover|rush|serve&seed=N freezes one composed frame: order board
// with tickets, ingredients on the counter, a wrap mid-assembly on the
// plate, timers showing, and a finished wrap on the pass.

function shotScene(kind, seed) {
  const rng = makeRng(seed);
  const S = new Shift(rng);
  S.board.spawnIn = 9999;
  const mk = (frac) => {
    const t = S.board.addTicket(0);
    t.patienceLeft = t.patienceMax * frac;
    return t;
  };
  S.build = { pita: true, meat: 1, items: new Set(['tomato', 'onion']), sauce: 'garlic' };
  S.trayMeat = 2;
  S.spit.spin = 0.8;
  if (kind === 'cover') {
    S.board.tickets = [mk(0.82)];
    S.grill.state = 'ready';
    S.readyWrap = { meat: 1, items: new Set(['lettuce', 'tomato', 'pickles']), sauce: 'tahini' };
    S.shiftLeft = 172;
    S.coins = 34;
    S.served = 3;
    S.banner = true;
  } else if (kind === 'rush') {
    S.board.tickets = [mk(0.72), mk(0.38), mk(0.16)];
    S.grill.state = 'warming';
    S.grill.t = 1.7;
    S.spit.carving = 0.3;
    S.shiftLeft = 96;
    S.coins = 118;
    S.served = 9;
    S.strikes = 1;
    S.message = 'the dinner rush is on';
    S.messageT = 99;
  } else {
    S.board.tickets = [mk(0.66), mk(0.5)];
    S.grill.state = 'ready';
    S.readyWrap = { meat: 2, items: new Set(['tomato', 'onion']), sauce: 'garlic' };
    S.build = { pita: true, meat: 1, items: new Set(['chili', 'onion', 'pickles']), sauce: null };
    S.shiftLeft = 41;
    S.coins = 203;
    S.served = 15;
    S.strikes = 1;
    S.message = 'one feast away from a record night';
    S.messageT = 99;
  }
  return S;
}

// --- boot ------------------------------------------------------------------

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

if (shot) {
  const seed = Number(params.get('seed') || 7);
  drawScene(ctx, shotScene(shot, seed));
} else {
  const S = new Shift(makeRng((Date.now() % 100000) + 1));
  const router = new InputRouter(canvas, (a, arg) => S.act(a, arg));
  router.setZones(clickZones());
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    S.tick(dt);
    drawScene(ctx, S);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
