/* =====================================================================
   Moveable Comic Panels
   Step 1: full-screen placeholder panel, joined to the shared room.
   Step 2: manual pairing — first phone to pair is A (left), second is
           B (right). Unpair from either phone.

   Cross-screen movement comes next.
   ===================================================================== */

const SHARE_HOST = 'https://p5-phone-share.npuckett.workers.dev'; // class server
const ROOM = 'a1-ridge';                                          // our room
const NAMES = ['otter', 'heron', 'moth', 'fox', 'newt', 'crow'];

const INK = '#111111';
const PAPER = '#ffffff';
const GREY = '#8a8a8a';
const OK = '#2f9e44';

let pill = { x: 0, y: 0, w: 0, h: 0 };   // hit box for the Pair control
let notice = '';                          // short message, fades out
let noticeUntil = 0;
let lastPairKey = 'null||';               // detect changes to role/partner
let missingSince = { a: 0, b: 0 };        // when a paired phone stopped answering
let lastClean = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui');

  const wanted = new URLSearchParams(location.search).get('name');

  shareSetup({
    host: SHARE_HOST,
    room: ROOM,
    app: 'moveable-panels',
    // The pair lives in the room, so both phones see the same A and B.
    shared: { pair: null },
    me: { name: wanted || random(NAMES), hue: floor(random(360)) }
  });

  lockGestures();
  enablePermissionsTap(['share'], 'Tap to join the room');
  showDesktopQr();   // laptop only: scan to open the same room on a phone
}

function draw() {
  background(PAPER);
  drawPanel();
  drawStatus();
  drawPairControl();
  drawNotice();
  watchPair();
  cleanPair();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* ---------- 1. THE PLACEHOLDER PANEL ---------- */

/* Black line art, edge to edge. The content is a stand-in: a long
   diagonal, a figure standing on it, and the element that will cross
   the seam in a later step. */
function drawPanel() {
  const s = min(width / 390, height / 700);

  push();
  stroke(INK);
  strokeWeight(3 * s);
  strokeCap(ROUND);
  noFill();

  // A diagonal that leaves both edges, hinting at the seam to come.
  line(-0.06 * width, 0.82 * height, 1.06 * width, 0.28 * height);

  // A figure standing on the diagonal.
  const fx = 0.38 * width;                                        // feet x
  const fy = 0.82 * height - ((fx + 0.06 * width) / (1.12 * width)) * 0.54 * height;

  circle(fx, fy - 0.175 * height, 0.096 * width);                 // head
  line(fx, fy - 0.13 * height, fx, fy - 0.055 * height);          // body
  line(fx, fy - 0.10 * height, fx - 0.05 * width, fy - 0.075 * height); // arm back
  line(fx, fy - 0.10 * height, fx + 0.05 * width, fy - 0.115 * height); // arm forward
  line(fx, fy - 0.055 * height, fx - 0.035 * width, fy);          // leg back
  line(fx, fy - 0.055 * height, fx + 0.04 * width, fy);           // leg forward

  // The element that will travel to the next phone later.
  circle(0.84 * width, 0.40 * height, 0.05 * width);

  pop();
}

/* ---------- 2. STATUS ---------- */

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

/* ---------- 3. PAIRING ---------- */

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

/* What the Pair control says right now, or null when the pair is full
   with two other phones. */
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

  if (!window.shareConnected || label === null) {
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

/* ---------- 4. INPUT ---------- */

function mousePressed() {
  if (window.shareConnected && pill.w > 0 &&
      mouseX > pill.x && mouseX < pill.x + pill.w &&
      mouseY > pill.y && mouseY < pill.y + pill.h) {
    onPairTap();
  }
  return false;
}
