/* =====================================================================
   Moveable Comic Panels — Playtest 1
   Four phones, four independent looping panels. The room hands each
   phone a different panel, and players rearrange the phones by hand to
   read different comic sequences.

     1 walking · 2 reacting · 3 falling · 4 running

   Manual pairing and the visitor crossing are parked for later.
   ===================================================================== */

const SHARE_HOST = 'https://p5-phone-share.npuckett.workers.dev'; // class server
const ROOM = 'a1-ridge';                                          // our room
const NAMES = ['otter', 'heron', 'moth', 'fox', 'newt', 'crow'];

const INK = '#111111';
const PAPER = '#ffffff';
const GREY = '#8a8a8a';
const OK = '#2f9e44';

const GROUND = 0.78;      // the ground line, as a fraction of height
const PANEL_NAMES = ['', 'walking', 'reacting', 'falling', 'running'];

let myPanel = 0;          // 1..4, claimed from the room after joining
let claimAt = 0;          // small random delay, so two phones do not grab the same number
let lastPrune = 0;
let labelAt = 0;          // when the panel name was last announced

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui');

  const wanted = new URLSearchParams(location.search).get('name');

  shareSetup({
    host: SHARE_HOST,
    room: ROOM,
    app: 'moveable-panels',
    shared: { panels: {} },                       // who shows which panel
    me: { name: wanted || random(NAMES) }
  });

  lockGestures();
  enablePermissionsTap(['share'], 'Tap to join the room');
  showDesktopQr();   // laptop only: scan to open the same room on a phone
}

function draw() {
  background(PAPER);
  claimPanel();
  drawMyPanel();
  drawStatus();
  drawPanelName();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* ---------- 1. MY PANEL ---------- */

/* One loop per panel, each on its own clock. Every drawing uses the same
   line weight, figure height and ground line, so four phones can read as
   panels of one comic. */
function drawMyPanel() {
  if (!myPanel) return;

  const now = millis();
  const s = min(width / 390, height / 700);

  push();
  stroke(INK);
  strokeWeight(3 * s);
  strokeCap(ROUND);
  noFill();

  if (myPanel === 2) drawReacting(now);
  else if (myPanel === 3) drawFalling(now);
  else if (myPanel === 4) drawRunning(now);
  else drawWalking(now);

  pop();
}

/* Panel 1: a figure walks across the panel, left to right, on a loop. */
function drawWalking(now) {
  const u = (now % 4500) / 4500;
  const x = 0.12 * width + u * 0.76 * width;
  drawWalker(x, GROUND * height, 0.20 * height, sin(u * TAU * 5), 1);
}

/* Panel 2: a figure stands still, then recoils with raised arms. */
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

/* Panel 3: a figure drops through the panel, accelerating. */
function drawFalling(now) {
  const u = (now % 2600) / 2600;
  const t = constrain(map(u, 0, 0.80, 0, 1), 0, 1);
  const y = -0.15 * height + t * t * 1.25 * height;
  drawFaller(0.5 * width, y, 0.22 * height, now);
}

function drawFaller(cx, cy, h, now) {
  const flail = sin(now / 110);

  circle(cx, cy - 0.32 * h, 0.22 * h);
  line(cx, cy - 0.21 * h, cx, cy + 0.12 * h);                              // body
  line(cx, cy - 0.15 * h, cx - 0.18 * h, cy - 0.30 * h - 0.05 * h * flail); // arm
  line(cx, cy - 0.15 * h, cx + 0.18 * h, cy - 0.30 * h + 0.05 * h * flail); // arm
  line(cx, cy + 0.12 * h, cx - 0.15 * h, cy + 0.32 * h);                   // leg
  line(cx, cy + 0.12 * h, cx + 0.15 * h, cy + 0.32 * h);                   // leg
}

/* Panel 4: a figure runs across the panel, leaning forward. */
function drawRunning(now) {
  const u = (now % 2200) / 2200;
  const x = 0.10 * width + u * 0.80 * width;
  drawRunner(x, GROUND * height, 0.20 * height, sin(u * TAU * 8));
}

function drawRunner(cx, groundY, h, swing) {
  const lean = 0.065 * h;
  const neckY = groundY - 0.67 * h;
  const hipY = groundY - 0.34 * h;

  circle(cx + lean, groundY - 0.80 * h, 0.22 * h);
  line(cx + lean, neckY, cx, hipY);
  line(cx + lean, neckY, cx + 0.16 * h, groundY - 0.50 * h);              // front arm
  line(cx + lean, neckY, cx - 0.14 * h, groundY - 0.52 * h);              // back arm
  line(cx, hipY, cx - 0.17 * h * swing, groundY);                         // leg back
  line(cx, hipY, cx + 0.17 * h * swing, groundY - 0.03 * h * abs(swing)); // leg front
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

/* ---------- 2. PANEL CLAIM ---------- */

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
  if (n > 4) n = 1;   // room full of panels: show one anyway

  myPanel = n;
  labelAt = millis();
  shareSet('panels', Object.assign({}, map, { [window.shareClientId]: n }));
}

function guestPresent(id) {
  return (window.guests || []).some(function (g) { return g.id === id; });
}

/* ---------- 3. STATUS ---------- */

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

/* The panel's name, faded in for a few seconds and then gone. */
function drawPanelName() {
  if (!myPanel || !labelAt) return;

  const age = millis() - labelAt;
  if (age > 4500) return;

  const a = age < 2600 ? 1 : constrain(map(age, 2600, 4500, 1, 0), 0, 1);
  const s = min(width / 390, height / 700);

  noStroke();
  fill(138, 138, 138, 255 * a);
  textAlign(LEFT, CENTER);
  textSize(13 * s);
  text(myPanel + ' · ' + PANEL_NAMES[myPanel], 34 * s, 54 * s);
}
