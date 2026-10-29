// ===== 共用 =====
const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const mod = (x) => (x + 3) % 3;
const setBg = (el, src) => { el.style.backgroundImage = src ? 'url("' + src + '")' : ''; };


// ===== 設定（換素材、調數字改這裡）=====
const FIGS = [
  { name: 'SAKUPANG', img: 'img/fig1.png', xray: 'img/bone1.png', card: 'img/card1.png', btn: '', chip: '武器與道具專家', text: '年紀最小的忙內，性格充滿活力與奇思妙想。在特務人設中是負責研發各種「戀愛秘密道具」的搞笑擔當，為嚴肅的偵探任務增添了 WISH 標誌性的清爽搞笑與活力。' },
  { name: 'Name 2', img: 'img/fig2.png', xray: 'img/bone2.png', card: '', btn: '' },
  { name: 'Name 3', img: 'img/fig3.png', xray: '', card: '', btn: '' }
];

const CARD = { back: 'back' };
const BAG = { hits: 4 };
const GLOW = [
  'brightness(1.1) drop-shadow(0 0 10px #fff)',
  'brightness(1.25) drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px #ffd6ea)',
  'brightness(1.5) drop-shadow(0 0 30px #fff) drop-shadow(0 0 60px #fff) drop-shadow(0 0 110px #ff8fc8)'
];

const WIPE = { points: 80, amp: 0.1, pad: 60, soft: 50, lag: 30 };

const LINES = [
  { from: 'card', x: 0.27, y: 0.55, diag: 40 },
  { from: 'info', x: 0.74, y: 0.60, diag: 32 }
];
const DOT = 5;
const HIT = { w: 0.5, h: 0.5, cx: 0.5, cy: 0.55 };

const STAR = {
  skipTop: 1,
  gap: 6,
  rowStep: 5.2,
  size: 2.8,
  radius: 14,
  max: 1.8,
  edge: 1.1,
  feather: 0.3,
  spinCount: 8,
  spinEvery: [1500, 2500],
  spinTime: 1000
};

const PAGES = [{ y: 0 }, { y: 1 }, null, null, null];


// ===== 元素 =====
const book = $('book');
const sheets = document.querySelectorAll('.sheet');
const cdEl = $('cd');
const goodsEl = $('goods');
const wipe = $('wipe');
const wipeFill = $('wipeFill');
const bag = $('bag');
const flash = $('flash');
const gallery = $('gallery');
const det = $('detail');
const dfig = $('dfig');
const cardEl = $('card');
const cv = $('scratch');
const ctx = cv.getContext('2d');
const starsEl = $('stars');
const navItems = [...document.querySelectorAll('.nav_item')];
const caption = document.querySelector('.caption');


// ===== 書本翻頁 =====
const total = sheets.length;
let flipped = 0;
let drag = null;

function render(moving) {
  sheets.forEach((sheet, i) => {
    if (i < flipped) {
      sheet.style.transform = 'rotateY(-180deg)';
      sheet.style.zIndex = i + 1;
    } else {
      sheet.style.transform = 'rotateY(0deg)';
      sheet.style.zIndex = total - i;
    }
    if (i === moving) sheet.style.zIndex = 100;
  });

  book.classList.toggle('closed', flipped === 0);
  document.body.classList.toggle('opened', flipped > 0);
}

function flip(dir) {
  const target = flipped + dir;
  if (target < 0 || target > total) return;

  const moving = dir > 0 ? flipped : flipped - 1;
  flipped = target;
  render(moving);
  setTimeout(() => render(), 800);
}

$('nextPage').addEventListener('click', () => {
  if (flipped === 0) flip(1);
});

book.addEventListener('pointerdown', (e) => {
  const rect = book.getBoundingClientRect();
  const dir = (e.clientX - rect.left > rect.width / 2) ? 1 : -1;

  if (dir > 0 && flipped >= total) return;
  if (dir < 0 && flipped <= 0) return;

  const index = dir > 0 ? flipped : flipped - 1;
  drag = {
    dir: dir,
    sheet: sheets[index],
    startX: e.clientX,
    half: rect.width / 2,
    progress: 0,
    moved: false
  };
  book.setPointerCapture(e.pointerId);
});

book.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.startX;
  if (Math.abs(dx) > 6) drag.moved = true;
  if (!drag.moved) return;

  const amount = drag.dir > 0 ? -dx : dx;
  drag.progress = Math.max(0, Math.min(1, amount / drag.half));

  const angle = drag.dir > 0
    ? -180 * drag.progress
    : -180 + 180 * drag.progress;

  drag.sheet.classList.add('dragging');
  drag.sheet.style.zIndex = 100;
  drag.sheet.style.transform = 'rotateY(' + angle + 'deg)';
});

function endDrag() {
  if (!drag) return;
  const d = drag;
  drag = null;
  d.sheet.classList.remove('dragging');

  if (!d.moved || d.progress > 0.35) {
    flip(d.dir);
  } else {
    d.sheet.style.transform = 'rotateY(' + (d.dir > 0 ? 0 : -180) + 'deg)';
    setTimeout(() => render(), 800);
  }
}

book.addEventListener('pointerup', endDrag);
book.addEventListener('pointercancel', endDrag);

render();


// ===== CD =====
let hero = null;
let returning = false;
let discCX = 0, discCY = 0;

cdEl.addEventListener('click', () => {
  if (flipped === total) takeCD();
});

function takeCD() {
  const r = cdEl.getBoundingClientRect();

  const fly = document.createElement('div');
  fly.className = 'fly';
  const disc = cdEl.cloneNode(true);
  disc.removeAttribute('id');
  fly.appendChild(disc);
  document.body.appendChild(fly);

  const b = disc.getBoundingClientRect();
  discCX = b.left + b.width / 2;
  discCY = b.top + b.height / 2;
  const dx = r.left + r.width / 2 - discCX;
  const dy = r.top + r.height / 2 - discCY;
  const s = r.width / b.width;

  cdEl.style.visibility = 'hidden';
  book.classList.add('out');
  goodsPop(discCX, discCY, 700);

  const anim = disc.animate([
    { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')' },
    { transform: 'translate(0,0) scale(1) rotate(360deg)' }
  ], { duration: 1700, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });

  anim.onfinish = () => {
    anim.cancel();
    spin(disc);
  };
}

function spin(disc) {
  const base = 24;
  const TILT = 42;
  let angle = 0;
  let speed = base;
  let tiltX = 0, tiltY = 0;
  let mx = 0, my = 0;
  let dragging = false;
  let lastAngle = 0, lastTime = 0;
  let last = performance.now();
  let stopped = false;

  function angleOf(e) {
    const r = disc.getBoundingClientRect();
    return Math.atan2(
      e.clientY - (r.top + r.height / 2),
      e.clientX - (r.left + r.width / 2)
    ) * 180 / Math.PI;
  }

  function onMove(e) {
    mx = e.clientX / innerWidth * 2 - 1;
    my = e.clientY / innerHeight * 2 - 1;
    if (!dragging) return;
    const now = performance.now();
    const newAngle = angleOf(e);
    let diff = newAngle - lastAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    angle += diff;
    speed = diff / Math.max(1, now - lastTime) * 1000;
    lastAngle = newAngle;
    lastTime = now;
  }
  window.addEventListener('pointermove', onMove);

  function release() {
    dragging = false;
    disc.style.cursor = 'grab';
  }

  disc.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastAngle = angleOf(e);
    lastTime = performance.now();
    disc.setPointerCapture(e.pointerId);
    disc.style.cursor = 'grabbing';
  });
  disc.addEventListener('pointerup', release);
  disc.addEventListener('pointercancel', release);

  hero = {
    disc: disc,
    get: () => ({ angle: angle, tiltX: tiltX, tiltY: tiltY }),
    stop: () => {
      stopped = true;
      window.removeEventListener('pointermove', onMove);
    }
  };
  makeBackButton();

  function loop(now) {
    if (stopped) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    if (!dragging) {
      angle += speed * dt;
      speed += (base - speed) * Math.min(1, dt * 0.8);
    } else if (now - lastTime > 80) {
      speed *= 0.9;
    }
    speed = Math.max(-2500, Math.min(2500, speed));

    tiltX += (my * TILT - tiltX) * 0.08;
    tiltY += (-mx * TILT - tiltY) * 0.08;

    disc.style.transform =
      'rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) rotateZ(' + angle + 'deg)';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function makeBackButton() {
  const b = document.createElement('button');
  b.className = 'cdback';
  b.id = 'cdback';
  b.textContent = 'Back';
  b.addEventListener('click', returnToBook);
  document.body.appendChild(b);
}

function returnToBook() {
  if (!hero || returning) return;
  returning = true;

  const state = hero.get();
  const disc = hero.disc;
  const fly = disc.parentNode;
  hero.stop();
  hero = null;
  $('cdback').remove();

  book.style.transition = 'opacity .7s ease .4s, filter .7s ease .4s';
  book.classList.remove('out');

  const r = cdEl.getBoundingClientRect();
  const dx = r.left + r.width / 2 - discCX;
  const dy = r.top + r.height / 2 - discCY;
  const s = r.width / disc.offsetWidth;
  goodsHide(discCX, discCY);

  const anim = disc.animate([
    { transform: 'translate(0,0) scale(1) rotateX(' + state.tiltX + 'deg) rotateY(' + state.tiltY + 'deg) rotateZ(' + state.angle + 'deg)' },
    { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ') rotateX(0deg) rotateY(0deg) rotateZ(' + (state.angle - 200) + 'deg)' }
  ], { duration: 1400, easing: 'cubic-bezier(.55,0,.2,1)', fill: 'forwards' });

  anim.onfinish = () => {
    fly.remove();
    cdEl.style.visibility = '';
    book.style.transition = '';
    returning = false;
  };
}


// ===== 小卡與貼紙（CD 旁邊）=====
function goodsPop(cx, cy, delay) {
  goodsEl.classList.add('on');

  goodsEl.querySelectorAll('.good_img').forEach((img, i) => {
    const r = img.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const rot = i === 0 ? -30 : 30;

    img.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.25) rotate(' + rot + 'deg)', opacity: 0 },
      { transform: 'none', opacity: 1 }
    ], { duration: 1000, delay: delay, easing: 'cubic-bezier(.34,1.45,.64,1)', fill: 'backwards' });
  });

  goodsEl.querySelectorAll('.good_label').forEach((l) => {
    l.animate([
      { opacity: 0, transform: 'translateY(14px)' },
      { opacity: 1, transform: 'none' }
    ], { duration: 500, delay: delay + 900, easing: 'ease-out', fill: 'backwards' });
  });
}

function goodsHide(cx, cy) {
  goodsEl.getAnimations({ subtree: true }).forEach((a) => a.cancel());

  const imgs = goodsEl.querySelectorAll('.good_img');
  let done = 0;
  imgs.forEach((img, i) => {
    const r = img.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    const rot = i === 0 ? -30 : 30;

    img.animate([
      { transform: 'none', opacity: 1 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(0.25) rotate(' + rot + 'deg)', opacity: 0 }
    ], { duration: 800, easing: 'cubic-bezier(.55,0,.2,1)', fill: 'forwards' })
      .onfinish = () => {
        if (++done === imgs.length) {
          goodsEl.getAnimations({ subtree: true }).forEach((a) => a.cancel());
          goodsEl.classList.remove('on');
        }
      };
  });

  goodsEl.querySelectorAll('.good_label').forEach((l) => {
    l.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
  });
}

document.querySelectorAll('.good_img').forEach((box) => {
  const tilt = box.querySelector('.tilt');
  if (!tilt) return;
  const MAX = 18;

  box.addEventListener('pointermove', (e) => {
    const r = box.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.setProperty('--rx', ny * MAX * 2 + 'deg');
    tilt.style.setProperty('--ry', -nx * MAX * 2 + 'deg');
  });
  box.addEventListener('pointerleave', () => {
    tilt.style.setProperty('--rx', '0deg');
    tilt.style.setProperty('--ry', '0deg');
  });
});


// ===== 換頁 =====
function drawWipe() {
  const H = innerHeight, W = innerWidth, A = H * WIPE.amp;
  const p = Math.max(0, Math.min(1, scrollY / H));
  const pts = [], bpts = [];

  for (let i = 0; i <= WIPE.points; i++) {
    const t = i / WIPE.points;
    const noise = (
      Math.sin(t * 7 + p * 9) * 0.5 +
      Math.sin(t * 17 - p * 14) * 0.35 +
      Math.sin(t * 31 + p * 5) * 0.25
    ) / 1.1;
    const y = (1 - p) * (H + 2 * A + 2 * WIPE.soft) - A - WIPE.soft + noise * A;
    pts.push((t * W).toFixed(1) + 'px ' + (y + WIPE.lag).toFixed(1) + 'px');
    bpts.push((t * (W + 2 * WIPE.pad)).toFixed(1) + 'px ' + (y + WIPE.pad).toFixed(1) + 'px');
  }

  wipe.style.clipPath = 'polygon(' + pts.join(',') + ',100% 100%,0 100%)';
  wipeFill.style.clipPath = 'polygon(' + bpts.join(',') + ',100% 100%,0 100%)';
}

addEventListener('scroll', drawWipe, { passive: true });
addEventListener('resize', drawWipe);
drawWipe();


// ===== 紙袋 =====
let hits = 0;
let locked = false;

function burst(x, y, count) {
  const colors = ['#c9a074', '#a9784a', '#e2c49a', '#8a5d36'];
  const big = count > 30;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('i');
    const size = rand(5, big ? 22 : 14);
    const ang = rand(0, 6.283);
    const dist = (big ? 300 : 150) * rand(0.4, 1);
    s.className = 'shard';
    s.style.cssText =
      'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + size +
      'px;background:' + colors[i % colors.length];
    document.body.appendChild(s);
    s.animate([
      { transform: 'translate(0,0) rotate(0)', opacity: 1 },
      { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist + 170) + 'px) rotate(' + rand(-360, 360) + 'deg)', opacity: 0 }
    ], { duration: rand(700, 1400), easing: 'cubic-bezier(.2,.6,.4,1)' })
      .onfinish = () => s.remove();
  }
}

bag.addEventListener('click', (e) => {
  if (locked) return;
  hits++;

  if (hits < BAG.hits) {
    const h = hits;
    bag.animate([
      { transform: 'none' },
      { transform: 'translate(' + -6 * h + 'px,0) rotate(' + -2 * h + 'deg)' },
      { transform: 'translate(' + 6 * h + 'px,0) rotate(' + 2 * h + 'deg)' },
      { transform: 'none' }
    ], { duration: 380 });
    burst(e.clientX, e.clientY, 14);
    bag.style.filter = GLOW[h - 1];
  } else {
    explode();
  }
});

function explode() {
  locked = true;
  const r = bag.getBoundingClientRect();

  bag.style.filter = GLOW[2];
  burst(r.left + r.width / 2, r.top + r.height / 2, 70);

  flash.animate([
    { opacity: 0 },
    { opacity: 1, offset: 0.3 },
    { opacity: 1, offset: 0.5 },
    { opacity: 0 }
  ], { duration: 2200, easing: 'ease-in-out' });

  setTimeout(() => {
    bag.style.display = 'none';
    gallery.classList.add('on');
    layout();
    setTitle(FIGS[cur].name, gtitle, 0.9);
  }, 800);
}


// ===== 角色選擇 =====
const gtitle = document.createElement('div');
gtitle.className = 'dtitle gtitle';
gallery.appendChild(gtitle);

let cur = 0;
let moved = false;

function setTitle(name, el = $('dtitle'), base = 0.9) {
  el.innerHTML = '';
  el.style.setProperty('--base', base + 's');
  [...name].forEach((ch, i) => {
    const s = document.createElement('span');
    s.style.setProperty('--i', i);
    s.textContent = ch === ' ' ? '\u00a0' : ch;
    el.appendChild(s);
  });
}

const figs = FIGS.map((f, i) => {
  const el = document.createElement('div');
  const circle = document.createElement('div');
  const btn = document.createElement('button');
  el.className = 'fig';
  circle.className = 'circle';
  btn.className = 'fig_btn';
  if (f.img) circle.style.backgroundImage = 'url("' + f.img + '")';
  btn.textContent = f.btn;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (i === cur) enter(i);
    else select(i);
  });
  el.addEventListener('click', () => {
    if (moved) return;
    select(i);
  });

  el.append(circle, btn);
  gallery.appendChild(el);
  return el;
});

function layout() {
  figs.forEach((el, i) => {
    const d = (i - cur + 4) % 3 - 1;
    el.style.setProperty('--d', d);
    el.style.zIndex = d ? 1 : 3;
    el.classList.toggle('sel', d === 0);
  });
}

function select(i) {
  i = mod(i);
  if (i === cur) return;
  cur = i;
  layout();
  setTitle(FIGS[cur].name, gtitle, 0);
}

gallery.addEventListener('click', (e) => {
  if (e.target.closest('.arrow_prev')) select(cur - 1);
  if (e.target.closest('.arrow_next')) select(cur + 1);
});

let startX = null;
gallery.addEventListener('pointerdown', (e) => { startX = e.clientX; });
gallery.addEventListener('pointerup', (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;
  if (Math.abs(dx) > 50) {
    moved = true;
    select(cur + (dx < 0 ? 1 : -1));
    setTimeout(() => { moved = false; }, 0);
  }
});

layout();


// ===== 角色詳細頁 =====
let opened = -1;

function enter(i) {
  const f = FIGS[i];
  const s = figs[i].querySelector('.circle').getBoundingClientRect();
  opened = i;

  setBg($('dfigBase'), f.img);
  setBg($('dfigXray'), f.xray);
  setBg($('cardFront'), f.card);

  setTitle(f.name);
  $('infoChip').textContent = f.chip || '';
  $('infoText').textContent = f.text || '';
  $('cardText').textContent = CARD.back;
  cardEl.classList.remove('flip');

  det.classList.add('on');
  gallery.classList.add('away');
  resetScratch();
  drawLines();

  const d = dfig.getBoundingClientRect();
  const k = s.width / d.width;
  const dx = s.left + s.width / 2 - d.left - d.width / 2;
  const dy = s.top + s.height / 2 - d.top - d.height / 2;
  dfig.animate([
    { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')' },
    { transform: 'translate(-50%,-50%)' }
  ], { duration: 900, easing: 'cubic-bezier(.3,1.15,.4,1)' });
}

function leave() {
  if (opened < 0) return;
  opened = -1;
  det.classList.remove('on');
  gallery.classList.remove('away');
}

$('back').addEventListener('click', leave);
addEventListener('keydown', (e) => { if (e.key === 'Escape') leave(); });

function drawLines() {
  const W = innerWidth, H = innerHeight;
  const fw = dfig.offsetWidth, fh = dfig.offsetHeight;
  const left = dfig.offsetLeft - fw / 2, top = dfig.offsetTop - fh / 2;
  const cw = $('cardWrap'), info = $('info'), chip = $('infoChip');
  let html = '';

  LINES.forEach((L) => {
    const end = [left + fw * L.x, top + fh * L.y];
    let pts;
    if (L.from === 'card') {
      const sx = cw.offsetLeft + cw.offsetWidth;
      const sy = cw.offsetTop - cw.offsetHeight / 2 + cardEl.offsetHeight / 2;
      pts = [[sx, sy], [sx + L.diag, sy], end];
    } else {
      const ix = info.offsetLeft + chip.offsetLeft + chip.offsetWidth / 2;
      const iy = info.offsetTop + chip.offsetTop;
      pts = [[ix, iy], [ix - L.diag, end[1]], end];
    }
    html += '<polyline pathLength="1" points="' + pts.map(p => p.join(',')).join(' ') + '"/>' +
            '<circle cx="' + end[0] + '" cy="' + end[1] + '" r="' + DOT + '"/>';
  });

  $('lines').setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  $('lines').innerHTML = html;
}

addEventListener('resize', () => { if (opened >= 0) drawLines(); });

/* 放大鏡 */
det.addEventListener('pointermove', (e) => {
  if (opened < 0) return;
  const r = dfig.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width;
  const ny = (e.clientY - r.top) / r.height;
  const inside = Math.abs(nx - HIT.cx) <= HIT.w / 2 && Math.abs(ny - HIT.cy) <= HIT.h / 2;
  dfig.classList.toggle('hover', inside);
  det.classList.toggle('nocursor', inside);
  if (inside) {
    dfig.style.setProperty('--mx', nx * dfig.offsetWidth + 'px');
    dfig.style.setProperty('--my', ny * dfig.offsetHeight + 'px');
  }
});

det.addEventListener('pointerleave', () => {
  dfig.classList.remove('hover');
  det.classList.remove('nocursor');
});

/* 小卡翻面 */
const flipCard = () => cardEl.classList.toggle('flip');
$('cardFront').addEventListener('click', flipCard);
$('flipBtn').addEventListener('click', flipCard);

/* 刮刮卡 */
let scratchPos = null;

function resetScratch() {
  const p = cv.parentElement;
  cv.width = p.offsetWidth;
  cv.height = p.offsetHeight;
  cv.style.opacity = 1;
  cv.style.pointerEvents = 'auto';
  ctx.globalCompositeOperation = 'source-over';

  const g = ctx.createLinearGradient(0, 0, cv.width, cv.height);
  g.addColorStop(0, '#c9ccd3');
  g.addColorStop(0.5, '#eceef2');
  g.addColorStop(1, '#a9adb7');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cv.width, cv.height);

  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = 'rgba(255,255,255,' + rand(0.1, 0.35) + ')';
    ctx.fillRect(rand(0, cv.width), rand(0, cv.height), 2, 2);
  }
}

function spot(e) {
  const r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height];
}

function erase(a, b) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = 34;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
}

function checkScratch() {
  const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
  let cleared = 0, count = 0;
  for (let i = 3; i < data.length; i += 160) {
    count++;
    if (data[i] < 128) cleared++;
  }
  if (cleared / count > 0.5) {
    cv.style.opacity = 0;
    cv.style.pointerEvents = 'none';
  }
}

cv.addEventListener('pointerdown', (e) => {
  scratchPos = spot(e);
  cv.setPointerCapture(e.pointerId);
  erase(scratchPos, scratchPos);
});

cv.addEventListener('pointermove', (e) => {
  if (!scratchPos) return;
  const p = spot(e);
  erase(scratchPos, p);
  scratchPos = p;
});

cv.addEventListener('pointerup', () => {
  scratchPos = null;
  checkScratch();
});


// ===== 星星背景 =====
let starList = [];
const mouse = { x: -9999, y: -9999 };

function buildStars() {
  starsEl.innerHTML = '';
  starList = [];
  const vw = innerWidth / 100, gap = STAR.gap * vw, size = STAR.size * vw;
  starsEl.style.setProperty('--star', size + 'px');

  const yBottom = innerHeight - size * 0.6;
  let rows = [];
  for (let r = 0, y = yBottom; y > -size; r++, y = yBottom - r * STAR.rowStep * vw) rows.push(y);
  rows = rows.slice(0, rows.length - STAR.skipTop);

  rows.forEach((y, r) => {
    const off = (r % 2) * gap / 2;
    for (let x = off; x < innerWidth + gap; x += gap) {
      const el = document.createElement('div');
      const inner = document.createElement('i');
      el.className = 'star';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.appendChild(inner);
      starsEl.appendChild(el);
      starList.push({ el, inner, x, y, s: 1, spinning: false });
    }
  });
}

function targetScale(d) {
  const t = d / (STAR.radius * innerWidth / 100);
  if (t < 1) return STAR.edge + (STAR.max - STAR.edge) * Math.pow(1 - t, 1.5);
  if (t < 1 + STAR.feather) return 1 + (STAR.edge - 1) * (1 + STAR.feather - t) / STAR.feather;
  return 1;
}

function starLoop() {
  if (scrollY < innerHeight * 0.95) {
    starList.forEach((st) => {
      const d = Math.hypot(mouse.x - st.x, mouse.y - st.y);
      st.s += (targetScale(d) - st.s) * 0.15;
      st.el.style.transform = 'scale(' + st.s.toFixed(3) + ')';
    });
  }
  requestAnimationFrame(starLoop);
}

function spinRandomStar() {
  if (scrollY < innerHeight * 0.5 && starList.length) {
    const idle = starList.filter((st) => !st.spinning);
    for (let k = 0; k < STAR.spinCount && idle.length; k++) {
      const st = idle.splice(Math.floor(Math.random() * idle.length), 1)[0];
      st.spinning = true;
      st.inner.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
        { duration: STAR.spinTime, easing: 'cubic-bezier(.22,1,.36,1)' }
      ).onfinish = () => { st.spinning = false; };
    }
  }
  setTimeout(spinRandomStar, rand(STAR.spinEvery[0], STAR.spinEvery[1]));
}

addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
document.documentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
addEventListener('resize', buildStars);

buildStars();
starLoop();
spinRandomStar();


// ===== 導覽列與說明文字 =====
let navIdx = 0;

function moveBar() {
  const a = navItems[navIdx], bar = $('navBar');
  bar.style.width = a.offsetWidth + 'px';
  bar.style.transform = 'translateX(' + a.offsetLeft + 'px)';
}

function setNav(i) {
  navIdx = i;
  navItems.forEach((a, k) => a.classList.toggle('active', k === i));
  moveBar();
}

navItems.forEach((a, i) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    setNav(i);
    const t = PAGES[i];
    if (t) scrollTo({ top: t.y * innerHeight, behavior: 'smooth' });
  });
});

$('navLogo').addEventListener('click', (e) => {
  e.preventDefault();
  setNav(0);
  scrollTo({ top: 0, behavior: 'smooth' });
});

addEventListener('scroll', () => {
  if (navIdx < 2) setNav(scrollY > innerHeight * 0.5 ? 1 : 0);
}, { passive: true });

addEventListener('resize', moveBar);
document.fonts.ready.then(moveBar);
moveBar();

document.body.appendChild(caption);

function placeCaption() {
  caption.style.top = (book.getBoundingClientRect().bottom + 18) + 'px';
}

addEventListener('resize', placeCaption);
placeCaption();
