/* =====================================================================
   Moveable Comic Panels — Step 1
   One phone shows a full-screen placeholder panel and joins the shared
   room. Pairing and cross-screen movement come in later steps.
   ===================================================================== */

const SHARE_HOST = 'https://p5-phone-share.npuckett.workers.dev'; // class server
const ROOM = 'a1-ridge';                                          // our room

const INK = '#111111';
const PAPER = '#ffffff';
const GREY = '#8a8a8a';
const OK = '#2f9e44';

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui');

  shareSetup({
    host: SHARE_HOST,
    room: ROOM,
    app: 'moveable-panels',
    me: { name: 'phone', hue: floor(random(360)) }
  });

  // App-like gestures, then one tap to join the room (also keeps the
  // screen on while the sketch runs).
  lockGestures();
  enablePermissionsTap(['share'], 'Tap to join the room');
  showDesktopQr();   // laptop only: scan to open the same room on a phone
}

function draw() {
  background(PAPER);
  drawPanel();
  drawStatus();
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

/* A dot and a short line at the top; a hint at the bottom once a
   second phone has joined the room. */
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

  if (!connected) return;

  textAlign(CENTER, CENTER);
  textSize(14 * s);
  text(n > 1 ? 'two phones here — pairing comes next'
             : 'waiting for a second phone',
       width / 2, height - 28 * s);
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
