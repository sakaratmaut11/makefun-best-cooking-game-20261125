// KEBAB NIGHTS — all drawing. One canvas, no images: the night-market
// stall is painted in code — midnight-blue boards, amber lamps, the
// turning spit, the counter bins, the assembly plate and the pass.

import { INGREDIENTS, SAUCES, ingredientById, sauceById } from './recipes.js';

export const W = 1280;
export const H = 800;

export const LAYOUT = {
  spit:   { x: 36,  y: 118, w: 280, h: 356 },
  tray:   { x: 36,  y: 492, w: 280, h: 62 },
  grill:  { x: 36,  y: 586, w: 280, h: 118 },
  binsY: 104, binsH: 86,
  sauceY: 210, sauceH: 74,
  counterX: 344, counterW: 492,
  plate:  { cx: 590, cy: 478, r: 118 },
  board:  { x: 864, y: 84, w: 384 },
  pass:   { x: 864, y: 540, w: 384, h: 150 },
  rollBtn:  { x: 360, y: 716, w: 150, h: 48 },
  trashBtn: { x: 526, y: 716, w: 130, h: 48 },
  serveBtn: { x: 880, y: 716, w: 340, h: 48 },
};

export function clickZones() {
  const z = [
    { action: 'carve', x: LAYOUT.spit.x, y: LAYOUT.spit.y, w: LAYOUT.spit.w, h: LAYOUT.spit.h + 80 },
    { action: 'pita', x: LAYOUT.grill.x, y: LAYOUT.grill.y, w: LAYOUT.grill.w, h: LAYOUT.grill.h },
    { action: 'roll', ...LAYOUT.rollBtn },
    { action: 'trash', ...LAYOUT.trashBtn },
    { action: 'serve', ...LAYOUT.serveBtn },
  ];
  INGREDIENTS.forEach((ing, i) => {
    z.push({ action: 'ingredient', arg: i, x: LAYOUT.counterX + i * 100, y: LAYOUT.binsY, w: 92, h: LAYOUT.binsH });
  });
  SAUCES.forEach((s, i) => {
    z.push({ action: 'sauce', arg: i, x: LAYOUT.counterX + i * 100, y: LAYOUT.sauceY, w: 92, h: LAYOUT.sauceH });
  });
  return z;
}

const INK = '#0d1830';
const PANEL = '#16294d';
const PANEL_EDGE = '#2c4a7c';
const CREAM = '#f7ead2';
const AMBER = '#f6a821';
const EMBER = '#ff7847';
const MUTED = '#9db4d8';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 600) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Verdana, Geneva, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function bar(ctx, x, y, w, h, frac, fill, back = '#0a1428') {
  ctx.fillStyle = back;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = fill;
    rr(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fill();
  }
}

// --- pieces ---------------------------------------------------------------

function drawSpit(ctx, spit, trayMeat) {
  const { x, y, w, h } = LAYOUT.spit;
  ctx.fillStyle = PANEL;
  rr(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = PANEL_EDGE;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'THE SPIT', x + w / 2, y + 24, 17, AMBER, 'center', 700);
  // heat glow behind the meat
  const cx = x + w / 2;
  const glow = ctx.createRadialGradient(cx, y + 190, 20, cx, y + 190, 150);
  glow.addColorStop(0, 'rgba(255,120,60,0.5)');
  glow.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y + 40, w, 300);
  // rod
  ctx.fillStyle = '#c8ccd4';
  ctx.fillRect(cx - 3, y + 52, 6, 268);
  // meat stack: layered ellipses, offset wobbles with the spin angle
  for (let i = 0; i < 11; i++) {
    const ly = y + 84 + i * 21;
    const wob = Math.sin(spit.spin + i * 0.7) * 5;
    const rw = 74 - Math.abs(i - 5) * 4;
    ctx.fillStyle = i % 2 ? '#8a4b26' : '#a05a2c';
    ctx.beginPath();
    ctx.ellipse(cx + wob, ly, rw, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,190,120,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx + wob - rw * 0.3, ly - 4, rw * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // carve progress
  if (spit.busy) {
    bar(ctx, x + 24, y + h - 34, w - 48, 12, spit.progress, EMBER);
    text(ctx, 'CARVING…', x + w / 2, y + h - 52, 13, CREAM, 'center');
  } else {
    text(ctx, 'click the spit / Q — carve', x + w / 2, y + h - 44, 13, MUTED, 'center');
  }
  // tray with shaved portions waiting
  const t = LAYOUT.tray;
  ctx.fillStyle = '#1d3560';
  rr(ctx, t.x, t.y, t.w, t.h, 10);
  ctx.fill();
  text(ctx, `carved meat on tray: ${trayMeat}`, t.x + 16, t.y + 20, 14, CREAM);
  for (let i = 0; i < trayMeat; i++) {
    ctx.fillStyle = '#a05a2c';
    ctx.beginPath();
    ctx.ellipse(t.x + 40 + i * 34, t.y + 44, 15, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGrill(ctx, grill) {
  const { x, y, w, h } = LAYOUT.grill;
  ctx.fillStyle = PANEL;
  rr(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = PANEL_EDGE;
  ctx.stroke();
  text(ctx, 'PITA GRILL — click / W to warm', x + w / 2, y + 20, 14, AMBER, 'center', 700);
  ctx.fillStyle = '#0a1428';
  rr(ctx, x + 18, y + 36, w - 36, 52, 8);
  ctx.fill();
  if (grill.state !== 'empty') {
    const cx = x + w / 2;
    const cy = y + 62;
    ctx.fillStyle = grill.state === 'burnt' ? '#3a2c22' : '#eed9a8';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,110,50,0.5)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(cx - 40 + i * 20, cy - 5 + (i % 2) * 9, 5, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const label = grill.state === 'warming' ? 'WARMING…' : grill.state === 'ready' ? 'READY — click to plate' : 'BURNT — click to toss';
    text(ctx, label, cx, y + h - 14, 13, grill.state === 'ready' ? '#8fe388' : CREAM, 'center');
  }
  bar(ctx, x + 18, y + h - 30, w - 36, 9, grill.progress, grill.state === 'burnt' ? '#d13438' : AMBER);
}

function drawCounter(ctx, build) {
  const x0 = LAYOUT.counterX;
  text(ctx, 'SALAD BINS — keys 1–5', x0, 88, 14, AMBER, 'left', 700);
  INGREDIENTS.forEach((ing, i) => {
    const x = x0 + i * 100;
    const y = LAYOUT.binsY;
    ctx.fillStyle = '#1d3560';
    rr(ctx, x, y, 92, LAYOUT.binsH, 10);
    ctx.fill();
    ctx.strokeStyle = build && build.items.has(ing.id) ? AMBER : PANEL_EDGE;
    ctx.lineWidth = build && build.items.has(ing.id) ? 3 : 1.5;
    ctx.stroke();
    // the pile itself
    for (let j = 0; j < 7; j++) {
      const px = x + 16 + ((j * 23) % 62);
      const py = y + 26 + ((j * 13) % 22);
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.ellipse(px, py, 8, 5, j, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, ing.name, x + 46, y + LAYOUT.binsH - 14, 12.5, CREAM, 'center');
  });
  text(ctx, 'SAUCE BOTTLES — keys 6–8', x0, 196, 14, AMBER, 'left', 700);
  SAUCES.forEach((s, i) => {
    const x = x0 + i * 100;
    const y = LAYOUT.sauceY;
    ctx.fillStyle = '#1d3560';
    rr(ctx, x, y, 92, LAYOUT.sauceH, 10);
    ctx.fill();
    ctx.strokeStyle = build && build.sauce === s.id ? AMBER : PANEL_EDGE;
    ctx.lineWidth = build && build.sauce === s.id ? 3 : 1.5;
    ctx.stroke();
    ctx.fillStyle = s.color;
    rr(ctx, x + 33, y + 10, 26, 38, 6);
    ctx.fill();
    ctx.fillStyle = '#0a1428';
    ctx.fillRect(x + 41, y + 4, 10, 8);
    text(ctx, s.name.split(' ')[0], x + 46, y + LAYOUT.sauceH - 12, 12.5, CREAM, 'center');
  });
}

function drawPlate(ctx, build) {
  const { cx, cy, r } = LAYOUT.plate;
  text(ctx, 'ASSEMBLY PLATE', cx, cy - r - 26, 14, AMBER, 'center', 700);
  ctx.fillStyle = '#223d6e';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2e7cf';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  if (!build || !build.pita) {
    text(ctx, 'warm a pita to begin', cx, cy, 15, '#8a7a5c', 'center');
    return;
  }
  // pita base
  ctx.fillStyle = '#eed9a8';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
  ctx.fill();
  // meat portions as shaved strips
  for (let m = 0; m < build.meat; m++) {
    for (let j = 0; j < 8; j++) {
      const a = (j / 8) * Math.PI * 2 + m * 0.5;
      const d = 26 + (j % 3) * 14;
      ctx.fillStyle = m ? '#7c3f1f' : '#a05a2c';
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 13, 5, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // salad scatter, one cluster per chosen item
  let k = 0;
  for (const id of build.items) {
    const ing = ingredientById(id);
    const a = (k / 5) * Math.PI * 2 + 0.4;
    const d = 58;
    for (let j = 0; j < 5; j++) {
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * d + (j - 2) * 7, cy + Math.sin(a) * d * 0.8 + (j % 2) * 6 - 3, 7, 4, j, 0, Math.PI * 2);
      ctx.fill();
    }
    k++;
  }
  // sauce line: a zigzag across the middle
  if (build.sauce) {
    const s = sauceById(build.sauce);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let j = 0; j <= 6; j++) {
      const px = cx - 66 + j * 22;
      const py = cy + (j % 2 ? -13 : 13);
      if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

function drawWrapFigure(ctx, cx, cy, scale, build) {
  // a rolled wrap: a fat cylinder with a spiral end
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#eed9a8';
  rr(ctx, -78, -26, 156, 52, 24);
  ctx.fill();
  ctx.fillStyle = '#e2c78f';
  ctx.beginPath();
  ctx.ellipse(66, 0, 20, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b98d4f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(66, 0, 11, 0.4, Math.PI * 1.7);
  ctx.stroke();
  if (build) {
    for (let m = 0; m < build.meat; m++) {
      ctx.fillStyle = '#a05a2c';
      ctx.beginPath();
      ctx.ellipse(58 - m * 8, -6 + m * 10, 7, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    let k = 0;
    for (const id of build.items) {
      ctx.fillStyle = ingredientById(id).color;
      ctx.fillRect(44 + (k % 3) * 9, -14 + Math.floor(k / 3) * 16, 6, 6);
      k++;
    }
  }
  ctx.restore();
}

function drawTicket(ctx, t, x, y, w) {
  const h = 138;
  ctx.fillStyle = '#f7ead2';
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = '700 17px Verdana, Geneva, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`#${t.id}  ${t.wrap.name}`, x + 14, y + 22);
  ctx.font = '600 12px Verdana, Geneva, sans-serif';
  const parts = [`meat ×${t.wrap.meat}`, ...t.wrap.items, sauceById(t.wrap.sauce).name.split(' ')[0] + ' sauce'];
  ctx.fillStyle = '#3c4c66';
  ctx.fillText(parts.join(' · '), x + 14, y + 48);
  ctx.font = '600 13px Verdana, Geneva, sans-serif';
  ctx.fillText(t.wrap.blurb, x + 14, y + 72);
  ctx.fillStyle = INK;
  ctx.fillText(`${t.wrap.price} coins`, x + 14, y + 96);
  const frac = Math.max(0, t.patienceLeft / t.patienceMax);
  bar(ctx, x + 110, y + 88, w - 124, 13, frac, frac > 0.45 ? '#4c9a52' : frac > 0.22 ? AMBER : '#d13438', '#d8c9a8');
  text(ctx, 'patience', x + w - 14, y + 118, 11.5, '#3c4c66', 'right');
}

function drawBoard(ctx, board) {
  const { x, y, w } = LAYOUT.board;
  text(ctx, 'ORDER BOARD', x + 6, y - 14, 15, AMBER, 'left', 700);
  if (!board.tickets.length) {
    text(ctx, 'waiting for the night crowd…', x + 6, y + 30, 14, MUTED);
  }
  board.tickets.forEach((t, i) => drawTicket(ctx, t, x, y + 6 + i * 148, w));
}

function drawPass(ctx, readyWrap) {
  const { x, y, w, h } = LAYOUT.pass;
  ctx.fillStyle = PANEL;
  rr(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = PANEL_EDGE;
  ctx.stroke();
  text(ctx, 'THE PASS', x + 18, y + 24, 15, AMBER, 'left', 700);
  if (readyWrap) {
    drawWrapFigure(ctx, x + w / 2, y + 88, 1.05, readyWrap);
    text(ctx, 'READY TO SERVE', x + w / 2, y + 26, 14, '#8fe388', 'center', 700);
  } else {
    text(ctx, 'rolled wraps land here', x + w / 2, y + 88, 14, MUTED, 'center');
  }
}

function drawButton(ctx, rect, label, color, enabled) {
  ctx.fillStyle = enabled ? color : '#33475f';
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, 16, enabled ? INK : MUTED, 'center', 700);
}

export function drawScene(ctx, S) {
  // night sky backdrop with a string of lamps
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#0a1428';
  ctx.fillRect(0, 58, W, H - 58);
  for (let i = 0; i < 9; i++) {
    const lx = 70 + i * 145;
    ctx.strokeStyle = 'rgba(157,180,216,0.35)';
    ctx.beginPath();
    ctx.moveTo(lx - 60, 58);
    ctx.quadraticCurveTo(lx, 84, lx + 60, 58);
    ctx.stroke();
    ctx.fillStyle = 'rgba(246,168,33,0.9)';
    ctx.beginPath();
    ctx.arc(lx, 76, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // HUD
  ctx.fillStyle = PANEL;
  ctx.fillRect(0, 0, W, 58);
  text(ctx, 'KEBAB NIGHTS', 24, 29, 22, AMBER, 'left', 700);
  const mm = Math.max(0, Math.ceil(S.shiftLeft));
  const clock = `${Math.floor(mm / 60)}:${String(mm % 60).padStart(2, '0')}`;
  text(ctx, `SHIFT ${clock}`, 330, 29, 21, S.shiftLeft <= 30 ? EMBER : CREAM, 'left', 700);
  text(ctx, `coins ${S.coins}`, 620, 29, 19, CREAM);
  text(ctx, `served ${S.served}`, 790, 29, 19, CREAM);
  text(ctx, `strikes ${S.strikes}/3`, 950, 29, 19, S.strikes ? EMBER : CREAM);
  text(ctx, `rush ×${(1 + S.pressure).toFixed(1)}`, 1120, 29, 16, MUTED);

  drawSpit(ctx, S.spit, S.trayMeat);
  drawGrill(ctx, S.grill);
  drawCounter(ctx, S.build);
  drawPlate(ctx, S.build);
  drawBoard(ctx, S.board);
  drawPass(ctx, S.readyWrap);
  drawButton(ctx, LAYOUT.rollBtn, 'ROLL (R)', '#f6a821', !!(S.build && S.build.pita && S.build.meat > 0 && !S.readyWrap));
  drawButton(ctx, LAYOUT.trashBtn, 'TRASH', '#c8ccd4', !!(S.build && (S.build.pita || S.build.meat > 0 || S.build.items.size)));
  drawButton(ctx, LAYOUT.serveBtn, 'SERVE (Space)', '#8fe388', !!S.readyWrap);

  if (S.message) {
    ctx.fillStyle = 'rgba(10,20,40,0.82)';
    rr(ctx, W / 2 - 330, 646, 660, 44, 12);
    ctx.fill();
    text(ctx, S.message, W / 2, 668, 17, CREAM, 'center', 700);
  }
  if (S.banner) {
    // Cover banner sits over the counter only, so the spit, the order
    // board and the pass stay fully visible around it.
    ctx.fillStyle = 'rgba(10,20,40,0.88)';
    rr(ctx, 336, 268, 508, 138, 14);
    ctx.fill();
    text(ctx, 'KEBAB NIGHTS', 590, 318, 44, AMBER, 'center', 700);
    text(ctx, 'vertical spit grill house — carve, warm, roll, serve', 590, 368, 16.5, CREAM, 'center');
  }
  if (S.over) {
    ctx.fillStyle = 'rgba(10,20,40,0.85)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'SHIFT OVER', W / 2, 330, 52, AMBER, 'center', 700);
    text(ctx, `you served ${S.served} wraps and banked ${S.coins} coins`, W / 2, 396, 22, CREAM, 'center');
    text(ctx, 'press Enter to work another night', W / 2, 448, 17, MUTED, 'center');
  }
}
