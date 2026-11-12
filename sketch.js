/* =====================================================================
   Moveable Comic Panels
   Step 1: full-screen panel, joined to the shared room.
   Step 2: manual pairing — A (left), B (right).
   Step 3: each phone runs its own looping panel (walking, reacting).
           A tap on a paired phone sends a visitor across the seam: it
           leaves the tapped phone, crosses the partner's panel and
           disappears. The partner's loop keeps running underneath.

   One pair at a time; automatic proximity is not built yet.
   ===================================================================== */

const SHARE_HOST = 'https://p5-phone-share.npuckett.workers.dev'; // class server
const ROOM = 'a1-ridge';                                          // our room
const NAMES = ['otter', 'heron', 'moth', 'fox', 'newt', 'crow'];

const INK = '#111111';
const PAPER = '#ffffff';
const GREY = '#8a8a8a';
const OK = '#2f9e44';

const LEAD_MS = 450;     // both phones wait this long after the tap
const CROSS_MS = 3200;   // one crossing, measured in pair space (1.5 screens)
const GROUND = 0.78;     // the shared ground line, as a fraction of height

let pill = { x: 0, y: 0, w: 0, h: 0 };   // hit box for the Pair control
let notice = '';                          // short message, fades out
let noticeUntil = 0;
let lastPairKey = 'null||';                // detect changes to role/partner
let missingSince = { a: 0, b: 0 };        // when a paired phone stopped answering
let lastClean = 0;

let myPanel = 0;       // 1 = walking, 2 = reacting (claimed after joining)
let claimAt = 0;       // small random delay, so two phones do not grab the same number
let lastPrune = 0;
let crossing = null;   // { dir, side, start } while a visitor is on its way

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui');

  const wanted = new URLSearchParams(location.search).get('name');

  shareSetup({
    host: SHARE_HOST,
    room: ROOM,
    app: 'moveable-panels',
    // Shared: the pair, and who shows which panel.
    shared: { pair: null, panels: {} },
    me: { name: wanted || random(NAMES), hue: floor(random(360)) }
  });

  lockGestures();
  enablePermissionsTap(['share'], 'Tap to join the room');
  showDesktopQr();   // laptop only: scan to open the same room on a phone
}

function draw() {
  background(PAPER);
  claimPanel();
  drawMyPanel();
  drawVisitor();
  drawStatus();
  drawPairControl();
  drawNotice();
  watchPair();
  cleanPair();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* ---------- 1. MY PANEL ---------- */

/* Each phone shows one panel of its own. Panel 1 walks, panel 2 reacts,
   and both loops run on their own clock. */
function drawMyPanel() {
  const s = min(width / 390, height / 700);
  push();
  stroke(INK);
  strokeWeight(3 * s);
  strokeCap(ROUND);
  noFill();
  if (myPanel === 2) drawReacting(millis());
  else drawWalking(millis());
  pop();
}

/* Panel 1: a figure walks across the panel, left to right, on a loop. */
function drawWalking(now) {
  const u = (now % 4500) / 4500;
  const x = 0.12 * width + u * 0.76 * width;
  drawWalker(x, GROUND * height, 0.20 * height, sin(u * TAU * 5), 1);
}

/* Panel 2: a figure stands still, then recoils on a loop. */
function drawReacting(now) {
  const u = (now % 3600) / 3600;
  const r = u > 0.40 && u < 0.90 ? sin(map(u, 0.40, 0.90, 0, PI)) : 0;
  const cx = 0.5 * width;
  const gy = GROUND * height;
  const h = 0.22 * height;

  const lean = 0.16 * h * r;
  const headY = gy - 0.80 * h - 0.02 * h * r;

  circle(cx - lean, headY, 0.22 * h);
  line(cx - lean, gy - 0.67 * h, cx, gy - 0.34 * h);
  line(cx - lean, gy - 0.67 * h, cx - lean - 0.16 * h, gy - (0.58 + 0.16 * r) * h);
  line(cx - lean, gy - 0.67 * h, cx - lean + 0.16 * h, gy - (0.58 + 0.16 * r) * h);
  line(cx, gy - 0.34 * h, cx - 0.07 * h, gy);
  line(cx, gy - 0.34 * h, cx + 0.07 * h, gy);

  if (r > 0.5) {
    line(cx - lean - 0.05 * h, headY - 0.19 * h, cx - lean - 0.09 * h, headY - 0.27 * h);
    line(cx - lean + 0.05 * h, headY - 0.19 * h, cx - lean + 0.09 * h, headY - 0.27 * h);
  }
}

/* A walking stick figure: feet on groundY, h tall, legs and arms swung
   by swing (-1 to 1), facing left (face -1) or right (face 1). */
function drawWalker(cx, groundY, h, swing, face) {
  const headY = groundY - 0.80 * h;
  const neckY = groundY - 0.67 * h;
  const hipY = groundY - 0.34 * h;

  circle(cx, headY, 0.22 * h);
  line(cx, neckY, cx, hipY);
  line(cx, neckY, cx - 0.10 * h * swing * face, groundY - 0.42 * h); // arm back
  line(cx, neckY, cx + 0.10 * h * swing * face, groundY - 0.42 * h); // arm front
  line(cx, hipY, cx - 0.10 * h * swing * face, groundY);             // leg back
  line(cx, hipY, cx + 0.10 * h * swing * face, groundY);             // leg front
}

/* ---------- 2. THE VISITOR ---------- */

/* Pair space is two panels wide: A is 0..1, B is 1..2. A tap starts the
   visitor in the middle of the tapped panel, so both phones see it move
   toward the seam and across. */
function launchCrossing() {
  const role = myRole();
  const p = pairState();
  if (!role || !p || !p.b || crossing) return;

  const dir = role === 'A' ? 1 : -1;   // A sends to the right, B to the left
  shareEmit('cross', { dir });
  startCrossing(dir);
}

function startCrossing(dir) {
  if (!myRole() || crossing) return;
  crossing = { dir, side: myRole(), start: millis() + LEAD_MS };
}

/* Runs on the other phone when a crossing is announced. */
function shareEvent(name, data) {
  if (name !== 'cross' || !data) return;
  if (data.dir === 1 || data.dir === -1) startCrossing(data.dir);
}

function drawVisitor() {
  if (!crossing) return;

  const now = millis();
  if (now < crossing.start) return;

  const u = (now - crossing.start) / CROSS_MS;
  if (u >= 1) { crossing = null; return; }

  const pairX = crossing.dir > 0 ? 0.5 + 1.5 * u : 1.5 - 1.5 * u;
  const originX = crossing.side === 'B' ? 1 : 0;
  const x = (pairX - originX) * width;

  if (x < -0.2 * width || x > 1.2 * width) return;

  const s = min(width / 390, height / 700);
  push();
  stroke(INK);
  strokeWeight(3 * s);
  strokeCap(ROUND);
  noFill();
  drawWalker(x, GROUND * height, 0.20 * height, sin(now / 90), crossing.dir);
  pop();
}

/* ---------- 3. PANEL CLAIM ---------- */

/* Each phone claims a panel number in the room's shared map, so phones
   in the same room show different panels. Numbers left behind by phones
   that have gone are pruned, so the next phone gets a free one. */
function claimPanel() {
  if (!window.shareConnected) return;

  const map = (window.shared && window.shared.panels) || {};
  const now = millis();

  if (now - lastPrune > 3000) {
    lastPrune = now;
    const keep = {};
    for (const id in map) {
      if (id === window.shareClientId || guestPresent(id)) keep[id] = map[id];
    }
    if (Object.keys(keep).length !== Object.keys(map).length) shareSet('panels', keep);
  }

  if (myPanel) return;
  if (!claimAt) claimAt = millis() + random(250, 1200);
  if (millis() < claimAt) return;

  const used = Object.values(map);
  let n = 1;
  while (n <= 4 && used.indexOf(n) >= 0) n++;
  if (n > 4) n = 1;   // room full of panels: show something rather than nothing

  myPanel = n;
  shareSet('panels', Object.assign({}, map, { [window.shareClientId]: n }));
}

function guestPresent(id) {
  return (window.guests || []).some(function (g) { return g.id === id; });
}

/* ---------- 4. STATUS ---------- */

function drawStatus() {
  const s = min(width / 390, height / 700);
  const connected = !!window.shareConnected;
  const n = phoneCount();

  noStroke();
  fill(connected ? OK : GREY);
  circle(20 * s, 28 * s, 10 * s);

  fill(GREY);
  textAlign(LEFT, CENTER);
  textSize(15 * s);
  text(connected ? 'connected · ' + n + (n === 1 ? ' phone' : ' phones')
                 : joinLabel(), 34 * s, 28 * s);
}

function joinLabel() {
  const status = window.shareStatus;
  if (status === 'connecting' || status === 'requesting') return 'joining…';
  return 'tap to join · ' + ROOM;
}

/* Me plus everyone else in the room. */
function phoneCount() {
  if (!window.shareConnected) return 0;
  const others = Array.isArray(window.guests) ? window.guests.length : 0;
  return 1 + others;
}

/* ---------- 5. PAIRING ---------- */

/* The room's pairing record: { a: id, b: id or null }. A is left. */
function pairState() {
  return (window.shared && window.shared.pair) || null;
}

function myRole() {
  const p = pairState();
  if (!p || !p.a) return null;
  if (p.a === window.shareClientId) return 'A';
  if (p.b === window.shareClientId) return 'B';
  return null;
}

function pillLabel() {
  const p = pairState();
  const role = myRole();
  if (role === 'A') return p.b ? 'Unpair' : 'Cancel';
  if (role === 'B') return 'Unpair';
  return 'Pair';
}

function onPairTap() {
  if (!window.shareConnected) return;
  const p = pairState();
  const id = window.shareClientId;

  if (!p || !p.a) { shareSet('pair', { a: id, b: null }); return; }  // become A
  if (p.a === id || p.b === id) { shareSet('pair', null); return; }  // unpair
  if (!p.b) { shareSet('pair', { a: p.a, b: id }); return; }         // become B
  say('pairing is taken — unpair the other two first');
}

function drawPairControl() {
  const s = min(width / 390, height / 700);
  const label = pillLabel();

  if (!window.shareConnected) {
    pill = { x: 0, y: 0, w: 0, h: 0 };
    return;
  }

  const w = 132 * s;
  const h = 46 * s;
  const x = width / 2 - w / 2;
  const y = height - 84 * s;
  pill = { x, y, w, h };

  push();
  noFill();
  stroke(INK);
  strokeWeight(2 * s);
  rect(x, y, w, h, h / 2);

  noStroke();
  fill(INK);
  textAlign(CENTER, CENTER);
  textSize(16 * s);
  text(label, x + w / 2, y + h / 2);
  pop();
}

/* A short line above the Pair control: role and partner, or "unpaired". */
function drawNotice() {
  const left = noticeUntil - millis();
  if (!notice || left <= 0) return;

  const s = min(width / 390, height / 700);
  noStroke();
  fill(GREY);
  textAlign(CENTER, CENTER);
  textSize(15 * s);
  text(notice, width / 2, height - 112 * s);
}

function say(text, ms = 4000) {
  notice = text;
  noticeUntil = millis() + ms;
}

/* Watch the room's pair and announce when this phone's role or partner
   changes. The announcement fades, leaving the panel clean. */
function watchPair() {
  const p = pairState();
  const role = myRole();
  const partnerId = !role ? null : role === 'A' ? p.b : p.a;
  const partner = partnerId
    ? (window.guests || []).find(function (g) { return g.id === partnerId; })
    : null;
  const key = role + '|' + (partnerId || '') + '|' + (partner ? partner.name : '');

  if (key === lastPairKey) return;
  lastPairKey = key;

  if (!role) { say('unpaired', 2000); return; }
  if (!partnerId) { say('you are ' + role + (role === 'A' ? ' · left' : ' · right') + ' · waiting', 4000); return; }
  say('you are ' + role + (role === 'A' ? ' · left' : ' · right') +
      ' · with ' + (partner ? partner.name : 'a phone that left'), 5000);
}

/* If a paired phone disappears (closed, reloaded, walked away), clear
   its slot after a few seconds so the pair does not stay stuck. */
function cleanPair() {
  const now = millis();
  if (now - lastClean < 500 || !window.shareConnected) return;
  lastClean = now;

  const p = pairState();
  if (!p) { missingSince.a = 0; missingSince.b = 0; return; }

  const present = function (id) {
    if (!id || id === window.shareClientId) return true;
    return (window.guests || []).some(function (g) { return g.id === id; });
  };

  for (const slot of ['a', 'b']) {
    if (present(p[slot])) { missingSince[slot] = 0; continue; }
    if (!missingSince[slot]) { missingSince[slot] = now; continue; }
    if (now - missingSince[slot] < 3000) continue;

    const next = { a: p.a, b: p.b };
    next[slot] = null;
    shareSet('pair', next.a ? next : null);
    missingSince[slot] = 0;
    return;
  }
}

/* ---------- 6. INPUT ---------- */

function mousePressed() {
  if (!window.shareConnected) return false;

  const onPill = pill.w > 0 &&
    mouseX > pill.x && mouseX < pill.x + pill.w &&
    mouseY > pill.y && mouseY < pill.y + pill.h;

  if (onPill) onPairTap();
  else launchCrossing();

  return false;
}
