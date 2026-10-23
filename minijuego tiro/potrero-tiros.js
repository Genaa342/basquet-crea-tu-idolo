/**
 * PotreroTiros — minijuego de tiro con timing, pixel art, sin dependencias.
 * Uso: import potreroTiros from './potrero-tiros.js';
 *      const game = potreroTiros(document.getElementById('juego'), { duration: 30, onFinish: r => console.log(r) });
 * El tamaño lo define el contenedor (ancho); el alto sale solo (proporción 3:5).
 * Colores: --ptj-accent y --ptj-ink en el contenedor.
 */
const DEFAULTS = {
  duration: 30,
  storageKey: 'potrero_best', // null para no usar localStorage
  autoStart: false,
  layout: 'wide', // 'wide' (horizontal 16:9, celular de costado y PC) | 'portrait' (vertical) | 'auto' (wide si la pantalla mide 900px o más)
  onStart() {}, onShot() {}, onFinish() {},
  text: { title: 'ENTRENAMIENTO', help: 'Toca la pantalla cuando la marca pase por la zona verde.', helpWide: 'Presiona Espacio o haz clic cuando la marca pase por la zona verde.', play: 'A jugar', again: 'Otra vez', over: 'TIEMPO', points: 'Puntos', rank: 'Rango', best: 'Récord', newBest: '¡Nuevo récord!' },
  labels: { score: 'PUNTOS', streak: 'RACHA', tap: 'TOCA PARA TIRAR' }, // solo letras de la fuente pixel
  ranks: [[60, 'Ídolo del potrero'], [40, 'Capitán'], [20, 'Titular'], [0, 'Pibe']],
};

const CSS = `.ptj{position:relative;width:100%;aspect-ratio:180/300;font-family:"Courier New",monospace;--ptj-accent:#e4572e;--ptj-ink:#14152b;touch-action:manipulation;-webkit-user-select:none;user-select:none}
.ptj canvas{width:100%;height:100%;display:block;image-rendering:pixelated;image-rendering:crisp-edges;border:4px solid var(--ptj-ink);box-sizing:border-box}
.ptj-ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8%;background:rgba(10,10,25,.8);color:#fff;border:4px solid var(--ptj-ink);box-sizing:border-box}
.ptj-ov h1{margin:0 0 .5em;font-size:1.6em;letter-spacing:2px;color:#f2c14e;text-shadow:3px 3px 0 #000}
.ptj-ov p{margin:.3em 0;font-size:.85em;line-height:1.4;font-weight:bold}
.ptj-ov button{margin-top:1.2em;background:var(--ptj-accent);color:#fff;border:3px solid #000;border-radius:0;padding:.7em 1.6em;font:bold 1.05em "Courier New",monospace;text-transform:uppercase;box-shadow:0 5px 0 #000;cursor:pointer}
.ptj-ov button:active{transform:translateY(4px);box-shadow:0 1px 0 #000}
.ptj.ptj-wide{aspect-ratio:320/180}
.ptj{container-type:inline-size}.ptj-ov{font-size:max(14px,3.8cqw)}.ptj-wide .ptj-ov{font-size:max(14px,2cqw)}
.ptj-hide{display:none!important}`;

// fuente pixel 3x5 (letras disponibles: ACEFHILMNOPRSTUX, números, ! y +)
const F = {'0':[7,5,5,5,7],'1':[2,6,2,2,7],'2':[7,1,7,4,7],'3':[7,1,7,1,7],'4':[5,5,7,1,1],'5':[7,4,7,1,7],'6':[7,4,7,5,7],'7':[7,1,1,1,1],'8':[7,5,7,5,7],'9':[7,5,7,1,7],
  A:[2,5,7,5,5],C:[7,4,4,4,7],E:[7,4,6,4,7],F:[7,4,6,4,4],H:[5,5,7,5,5],I:[7,2,2,2,7],L:[4,4,4,4,7],M:[5,7,7,5,5],N:[7,5,5,5,5],O:[7,5,5,5,7],P:[7,5,7,4,4],R:[6,5,6,5,5],S:[7,4,7,1,7],T:[7,2,2,2,2],U:[5,5,5,5,7],X:[5,5,2,5,5],'!':[2,2,2,0,2],'+':[0,2,7,2,0]};

const LAYOUTS = {
  portrait: { W: 180, H: 300, HX: 90, HY: 75, BX: 90, BY: 236, BARY: 268, fl: 190, poleB: 178, ly: 205, arc: [90, 205, 78, 36], popX: 90, popY: 35, tapY: 284, moon: [140, 24], lamp: 160, lampY: 48, tap: 'TOCA PARA TIRAR' },
  wide: { W: 320, H: 180, HX: 250, HY: 50, BX: 70, BY: 138, BARY: 160, fl: 105, poleB: 112, ly: 113, arc: [250, 113, 95, 55], popX: 160, popY: 72, tapY: 172, moon: [100, 24], lamp: 295, lampY: 26, tap: 'ESPACIO O CLIC' },
};
const bgCache = {}; // el fondo se dibuja una sola vez por layout

function makeBackground(key) {
  if (bgCache[key]) return bgCache[key];
  const L = LAYOUTS[key], { W, H, fl } = L, k = fl / 190, base = fl - 40;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const b = c.getContext('2d'); let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const B = (a, y, w, h, col) => { b.fillStyle = col; b.fillRect(a, y, w, h); };
  const cols = ['#161a33', '#1d2245', '#2a2b57', '#3b3163', '#54386b', '#74456f', '#9a5570'], bh = Math.ceil(fl / 7);
  cols.forEach((col, i) => { B(0, i * bh, W, bh, col); if (i) for (let a = 0; a < W; a++) for (let y = i * bh; y < i * bh + 2; y++) if ((a + y) % 2 == 0) B(a, y, 1, 1, cols[i - 1]); });
  for (let i = 0; i < W * fl / 1200; i++) B(Math.floor(rnd() * W), Math.floor(rnd() * fl * .55), 1, 1, rnd() > .5 ? '#f1ece2' : '#8d95c4');
  const [mx, my] = L.moon;
  for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) if (dx * dx + dy * dy <= 64) B(mx + dx, my + dy, 1, 1, '#f4eec8');
  B(mx - 3, my - 3, 3, 3, '#d8d2a8'); B(mx + 3, my + 3, 2, 2, '#d8d2a8');
  for (let a = 0; a < W;) { const w = 14 + Math.floor(rnd() * 12), h = Math.floor((35 + rnd() * 40) * k); B(a, base - h, w, h + 40, '#10122a');
    for (let y = base - h + 4; y < base; y += 5) for (let q = a + 3; q < a + w - 3; q += 5) if (rnd() < .35) B(q, y, 2, 2, '#f2c14e'); a += w; }
  B(0, fl, W, H - fl, '#3e3f52');
  for (let i = 0; i < W * (H - fl) / 47; i++) B(Math.floor(rnd() * W), fl + Math.floor(rnd() * (H - fl)), 1, 1, rnd() > .5 ? '#4a4b60' : '#33344a');
  B(0, fl - 2, W, 3, '#2a2b3c');
  for (let a = 0; a < W; a += 5) B(a, fl - 50, 1, 50, '#323a5c');
  for (let a = 0; a < W; a += 30) B(a, fl - 52, 2, 52, '#5b6488');
  B(0, fl - 52, W, 2, '#6b7499');
  const [cx, cy, rx, ry] = L.arc;
  for (let a = 0; a < Math.PI; a += .008) B(Math.round(cx + rx * Math.cos(a)), Math.round(cy + ry * Math.sin(a)), 1, 1, '#c9c3b0');
  B(12, L.ly, W - 24, 1, '#c9c3b0');
  const lx = L.lamp, ly = L.lampY;
  B(lx, ly + 4, 2, fl - ly - 4, '#2a2d40'); B(lx - 10, ly, 22, 3, '#2a2d40');
  for (let dy = -24; dy <= 24; dy++) for (let dx = -24; dx <= 24; dx++) if (dx * dx + dy * dy < 576 && (dx + dy + 200) % 2 == 0) B(lx + dx, ly + 6 + dy, 1, 1, 'rgba(242,193,78,.13)');
  B(lx - 8, ly + 3, 18, 2, '#f2c14e');
  return (bgCache[key] = c);
}

export default function potreroTiros(el, opts = {}) {
  const o = { ...DEFAULTS, ...opts, text: { ...DEFAULTS.text, ...opts.text }, labels: { ...DEFAULTS.labels, ...opts.labels } };
  const Lk = o.layout === 'auto' ? (window.innerWidth >= 900 ? 'wide' : 'portrait') : (LAYOUTS[o.layout] ? o.layout : 'portrait'), L = LAYOUTS[Lk];
  const { W, H, HX, HY, BX, BY, BARY } = L, BARW = 140, BARX = Math.round((W - BARW) / 2);
  const touch = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches), kb = Lk === 'wide' && !touch;
  if (!(opts.labels && opts.labels.tap)) o.labels.tap = kb ? 'ESPACIO O CLIC' : 'TOCA PARA TIRAR';
  if (!(opts.text && opts.text.help) && kb) o.text.help = o.text.helpWide;
  if (!document.getElementById('ptj-css')) { const st = document.createElement('style'); st.id = 'ptj-css'; st.textContent = CSS; document.head.appendChild(st); }

  el.classList.add('ptj'); el.classList.toggle('ptj-wide', Lk === 'wide'); el.innerHTML = '';
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; el.appendChild(cv);
  const ov = document.createElement('div'); ov.className = 'ptj-ov';
  ov.innerHTML = '<h1></h1><p class="a"></p><p class="b"></p><button type="button"></button>';
  el.appendChild(ov);
  const [h1, pa, pb, btn] = [ov.querySelector('h1'), ov.querySelector('.a'), ov.querySelector('.b'), ov.querySelector('button')];
  h1.textContent = o.text.title; pa.textContent = o.text.help; btn.textContent = o.text.play;
  const x = cv.getContext('2d'), bg = makeBackground(Lk);

  let st = 'idle', left = o.duration, score = 0, streak = 0, mult = 1, p = 0, dir = 1, ball = null, pops = [], best = 0, shake = 0, tm = 0, sway = 0, makes = 0, misses = 0, maxStreak = 0, raf = 0, last = performance.now();
  try { if (o.storageKey) best = +localStorage.getItem(o.storageKey) || 0; } catch (e) {}
  const rank = s => (o.ranks.find(r => s >= r[0]) || o.ranks[o.ranks.length - 1])[1];
  const R = (a, y, w, h, c) => { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(y), w, h); };

  function T(s, px, py, c, k, al) {
    s = String(s).toUpperCase(); const w = s.length * 4 * k - k;
    if (al === 'c') px = Math.round(px - w / 2); else if (al === 'r') px -= w;
    for (const pass of [0, 1]) for (let i = 0, cx = px; i < s.length; i++, cx += 4 * k) { const g = F[s[i]]; if (!g) continue;
      for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (g[r] >> (2 - q) & 1) R(cx + q * k, py + r * k + (pass ? 0 : k), k, k, pass ? c : '#0b0b16'); }
  }
  function ballSpr(bx, by) {
    bx = Math.round(bx); by = Math.round(by);
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.hypot(dx, dy); if (d > 4.6) continue; R(bx + dx, by + dy, 1, 1, d > 3.6 || dx == 0 || dy == 0 ? '#3b1c08' : '#e8742a'); }
    R(bx - 2, by - 2, 1, 1, '#f7a84f');
  }

  function start() {
    st = 'play'; left = o.duration; score = 0; streak = 0; mult = 1; makes = 0; misses = 0; maxStreak = 0; ball = null; pops = [];
    ov.classList.add('ptj-hide'); o.onStart();
  }
  function end() {
    st = 'over'; const isBest = score > best;
    if (isBest) { best = score; try { if (o.storageKey) localStorage.setItem(o.storageKey, best); } catch (e) {} }
    h1.textContent = o.text.over;
    pa.textContent = `${o.text.points}: ${score} · ${o.text.rank}: ${rank(score)}`;
    pb.textContent = isBest ? o.text.newBest : `${o.text.best}: ${best}`;
    btn.textContent = o.text.again; ov.classList.remove('ptj-hide');
    o.onFinish({ score, best, isBest, rank: rank(score), makes, misses, maxStreak, duration: o.duration });
  }
  function shoot() {
    if (st !== 'play' || ball) return;
    const d = Math.abs(p - .5), q = d < .05 ? 'perfect' : d < .15 ? 'good' : 'miss', sd = p < .5 ? -1 : 1;
    ball = { t: 0, q, off: q === 'perfect' ? 0 : q === 'good' ? sd * 5 : sd * 21, ph: 0, x: BX, y: BY, vx: 0, vy: 0 };
  }
  function result() {
    const q = ball.q;
    if (q === 'miss') { misses++; streak = 0; mult = 1; pops.push({ s: 'AFUERA', y: L.popY, a: 1, c: '#ff6b4a' }); shake = 3; }
    else { makes++; streak++; maxStreak = Math.max(maxStreak, streak); mult = Math.min(5, 1 + Math.floor(streak / 3));
      const g = (q === 'perfect' ? 3 : 2) * mult; score += g; sway = 1;
      pops.push({ s: (q === 'perfect' ? 'LIMPIA +' : 'ENTRO +') + g, y: L.popY, a: 1, c: q === 'perfect' ? '#7dff9a' : '#ffd84a' }); }
    o.onShot({ result: q, score, streak, multiplier: mult });
  }
  function upd(dt) {
    tm += dt; if (sway > 0) sway = Math.max(0, sway - dt * 1.2); if (shake > 0) shake = Math.max(0, shake - dt * 8);
    if (st !== 'play') return;
    left -= dt; if (left <= 0) { left = 0; end(); return; }
    if (!ball) { p += dir * dt * (.9 + Math.min(streak, 12) * .07); if (p > 1) { p = 1; dir = -1; } if (p < 0) { p = 0; dir = 1; } } // la marca queda quieta mientras la pelota está en el aire
    if (ball) {
      if (ball.ph === 0) {
        ball.t += dt / .6; const t = Math.min(1, ball.t);
        ball.x = BX + (HX + ball.off - BX) * t; ball.y = BY + (HY - BY) * t - Math.sin(Math.PI * t) * 40;
        if (t >= 1) { ball.ph = 1; result(); if (ball.q === 'miss') { ball.vx = Math.sign(ball.off) * 55; ball.vy = -70; } else { ball.vx = -ball.off; ball.vy = 20; } }
      } else { ball.vy += 350 * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt; if (ball.y > BY + 22) ball = null; }
    }
    pops.forEach(q => { q.y -= 14 * dt; q.a -= dt * .8; }); pops = pops.filter(q => q.a > 0);
  }
  function net() {
    const sw = Math.round(Math.sin(tm * 30) * sway * 2);
    for (let r = 0; r < 10; r++) { const half = 9 - Math.floor(r * .5), off = Math.round(sw * r / 9);
      for (let q = -half; q <= half; q += 3) R(HX + q + off + (r % 2 ? 1 : 0), HY + 2 + r, 1, 1, '#f1ece2'); }
  }
  function draw() {
    x.clearRect(0, 0, W, H); x.save(); if (shake) x.translate(Math.round((Math.random() - .5) * shake * 2), 0);
    x.drawImage(bg, 0, 0);
    const ph = L.poleB - (HY - 12); R(HX - 1, HY - 12, 3, ph, '#59607c'); R(HX - 1, HY - 12, 1, ph, '#7b84a3');
    R(HX - 21, HY - 34, 42, 28, '#e8e2d4'); R(HX - 21, HY - 34, 42, 2, '#fff'); R(HX - 21, HY - 8, 42, 2, '#a39d8c');
    R(HX - 8, HY - 18, 16, 10, '#c0392b'); R(HX - 6, HY - 16, 12, 6, '#e8e2d4');
    const behind = ball && (ball.ph === 0 || ball.y < HY);
    if (ball && behind) ballSpr(ball.x, ball.y);
    R(HX - 11, HY - 1, 22, 2, '#ff5a1f'); R(HX - 11, HY + 1, 22, 1, '#b83a0e'); R(HX - 12, HY - 1, 1, 3, '#ff5a1f'); R(HX + 11, HY - 1, 1, 3, '#ff5a1f');
    if (ball && !behind) ballSpr(ball.x, ball.y);
    net();
    R(BX - 6, BY + 11, 12, 2, 'rgba(0,0,0,.35)');
    if (!ball) ballSpr(BX, BY - Math.abs(Math.sin(tm * 5)) * 10);
    T(o.labels.score + ' ' + score, 5, 5, '#ffe27a', 2, 'l'); T(Math.ceil(left), W - 5, 5, '#fff', 2, 'r');
    T(o.labels.streak + ' ' + streak + ' X' + mult, W / 2, 20, '#9fe8ff', 1, 'c');
    R(BARX - 2, BARY - 2, BARW + 4, 12, '#000'); R(BARX, BARY, BARW, 8, '#2a2d44');
    R(BARX + BARW * .35, BARY, BARW * .3, 8, '#d9a400'); R(BARX + BARW * .45, BARY, BARW * .1, 8, '#2e9e5b');
    const mx = Math.round(BARX + p * BARW); R(mx - 2, BARY - 4, 4, 16, '#000'); R(mx - 1, BARY - 3, 2, 14, ball ? (ball.q === 'perfect' ? '#7dff9a' : ball.q === 'good' ? '#ffd84a' : '#ff6b4a') : '#fff');
    T(o.labels.tap, W / 2, L.tapY, '#f1ece2', 1, 'c');
    pops.forEach(q => { x.globalAlpha = Math.max(0, Math.min(1, q.a * 1.5)); T(q.s, L.popX, Math.round(q.y), q.c, 2, 'c'); });
    x.globalAlpha = 1; x.restore();
  }
  function loop(n) { const dt = Math.min(.05, (n - last) / 1000); last = n; upd(dt); draw(); raf = requestAnimationFrame(loop); }

  const onDown = e => { e.preventDefault(); shoot(); };
  const onKey = e => { if (e.code === 'Space' && st === 'play') { e.preventDefault(); shoot(); } };
  cv.addEventListener('pointerdown', onDown); window.addEventListener('keydown', onKey); btn.addEventListener('click', start);
  raf = requestAnimationFrame(loop);
  if (o.autoStart) start();

  return {
    start,
    getState: () => ({ state: st, score, best, streak, timeLeft: left }),
    destroy() { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); el.innerHTML = ''; el.classList.remove('ptj', 'ptj-wide'); },
  };
}
