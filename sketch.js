/* =====================================================================
   Moveable Comic Panels — Playtest 2, step 4: framed panels, still
   Four phones, four framed panels. The room hands each phone a different
   panel, and every panel holds its first frame.

     balloon · cat · cactus · person

   Step 4 has no tap and no movement yet. The room join, the panel claim
   and the status line are unchanged from Playtest 1.

   The art in assets/ is a phone-sized crop of the exported drawings; the
   originals (2732 x 2048) stay in assets/ untouched.
   ===================================================================== */

const SHARE_HOST = 'https://p5-phone-share.npuckett.workers.dev'; // class server
const ROOM = 'a1-ridge';                                          // our room
const NAMES = ['otter', 'heron', 'moth', 'fox', 'newt', 'crow'];

const PAPER = '#ffffff';
const GREY = '#8a8a8a';
const OK = '#2f9e44';

const PANEL_NAMES = ['', 'balloon', 'cat', 'cactus', 'person'];
const PANEL_ART = [
  '',
  'assets/panel-balloon.png',
  'assets/panel-cat.png',
  'assets/panel-cactus.png?v=2',
  'assets/panel-person.png?v=2'
];

let myPanel = 0;          // 1..4, claimed from the room after joining
let claimAt = 0;          // small random delay, so two phones do not grab the same number
let lastPrune = 0;
let labelAt = 0;          // when the panel name was last announced

let panelImg = null;      // the still for the panel we claimed
let panelLoading = false;
let panelFailed = false;

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
  loadPanelArt();
  drawMyPanel();
  drawStatus();
  drawPanelName();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* ---------- 1. MY PANEL ---------- */

/* The still, edge to edge. Every panel art is 1080 x 1920, so COVER crops
   a little from the sides rather than stretching the drawing. */
function drawMyPanel() {
  if (!myPanel) return;

  if (panelFailed) {
    drawMissingPanel();
    return;
  }

  // Blank paper for the moment between claiming a panel and its image
  // arriving; the status line already says connected.
  if (!panelImg) return;

  image(panelImg, 0, 0, width, height, 0, 0, panelImg.width, panelImg.height, COVER);
}

/* A missing asset must be visible, not a silent white phone. */
function drawMissingPanel() {
  const s = min(width / 390, height / 700);

  push();
  noFill();
  stroke(GREY);
  strokeWeight(1.5 * s);
  drawingContext.setLineDash([6 * s, 6 * s]);
  rect(24 * s, 24 * s, width - 48 * s, height - 48 * s);
  drawingContext.setLineDash([]);
  pop();

  noStroke();
  fill(GREY);
  textAlign(CENTER, CENTER);
  textSize(15 * s);
  text('no image for ' + PANEL_NAMES[myPanel], width / 2, height / 2);
}

/* The panel number only exists once the room has claimed it, so the image
   is loaded then, not in setup(). Each phone fetches one file. */
function loadPanelArt() {
  if (!myPanel || panelImg || panelLoading || panelFailed) return;

  panelLoading = true;
  loadImage(PANEL_ART[myPanel])
    .then(function (img) {
      panelImg = img;
      panelLoading = false;
    })
    .catch(function () {
      panelFailed = true;
      panelLoading = false;
    });
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

/* The panel's name, faded in for a few seconds and then gone. No number:
   the number announced an order in Playtest 1. */
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
  text(PANEL_NAMES[myPanel], 34 * s, 54 * s);
}
