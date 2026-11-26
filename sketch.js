/* =====================================================================
   Moveable Comic Panels — Playtest 2, step 6: cat and cactus

   Four phones, four framed panels. The room hands each phone a different
   panel and the balloon starts on panel 1. Whoever holds the balloon sends
   it one panel along:

     tap the left half of the screen  -> the balloon goes left
     tap the right half of the screen -> the balloon goes right

   When it arrives somewhere:
     on the cat    the cat crouches and lunges, then sits back up after a
                   second, and holds the balloon so it can be passed on
     on the cactus the balloon pops; after a beat the room puts a new balloon
                   back on panel 1, so the trip can be run again

     balloon · cat · cactus · person

   The balloon and the cat are frame strips cut from the exported GIFs by
   the project's asset step; assets/strips.json says where each frame sits
   in panel coordinates (1080 x 1920). The stills in assets/ are phone-sized
   crops of the same drawings; the originals (2732 x 2048) are untouched.
   ===================================================================== */

const SHARE_HOST = 'https://p5-phone-share.npuckett.workers.dev'; // class server
const ROOM = 'a1-ridge';                                          // our room
const NAMES = ['otter', 'heron', 'moth', 'fox', 'newt', 'crow'];

/* Testing switch, not part of the design: ?panel=3 makes this phone claim
   panel 3 instead of taking the first free one, so one phone can be walked
   through all four panels. Leave it off for a playtest. */
const FORCED_PANEL = Math.min(
  4,
  Math.max(0, parseInt(new URLSearchParams(location.search).get('panel'), 10) || 0)
);

/* ?debug prints what this phone believes about the room, on screen, so a
   phone without a console can be checked. Leave it off normally. */
const DEBUG = new URLSearchParams(location.search).has('debug');

const PAPER = '#ffffff';
const GREY = '#8a8a8a';
const OK = '#2f9e44';
const BALLOON_INK = [239, 105, 97];

const PANEL_NAMES = ['', 'balloon', 'cat', 'cactus', 'person'];

/* Panels 1 and 2 have no still of their own: their art is a strip, so it
   can move and change frame. */
const PANEL_ART = [
  '',
  null,
  null,
  'assets/panel-cactus.png?v=2',
  'assets/panel-person.png?v=2'
];
const STRIP_FILE = 'assets/strips.json';

const CAT_PANEL = 2;
const CACTUS_PANEL = 3;

/* Travel is measured in panel widths so it looks the same on any phone.
   0.70 of a width clears the balloon past the edge with room to spare. */
const TRAVEL = 0.70;
const EXIT_MS = 420;      // resting place to off the edge
const ENTRY_MS = 420;     // off the edge to the resting place
const LEAD_MS = 120;      // the receiver waits, so the sender leaves first
const BOUNCE_MS = 260;    // a tap towards no phone

/* The balloon rides a little above the middle of the panel, so on the cat's
   panel it passes over the ears instead of covering the face. */
const BALLOON_LIFT = 0.16;

/* Frame timings. The source GIFs run at 170 ms a frame. */
const BALLOON_FRAME_MS = 170;
const CAT_FRAME_MS = 170;
const CAT_HOLD_MS = 1000;    // stays crouched before sitting back up
const CAT_BACK_MS = 400;     // reversed frames, slow enough to read
const POP_DELAY_MS = 180;    // a beat after landing, so the arrival reads
const POP_MS = 360;          // the burst itself
const RESET_AFTER_POP_MS = 2600;  // then a fresh balloon on panel 1

let myPanel = 0;          // 1..4, claimed from the room after joining
let claimAt = 0;          // small random delay, so two phones do not grab the same number
let lastPrune = 0;
let labelAt = 0;          // when the panel name was last announced
let readyAt = 0;          // ignore taps for a moment after claiming
let claimWriteAt = 0;     // last time we put our panel back in the room

let panelImg = null;      // the still for the panel we claimed
let panelLoading = false;
let panelFailed = false;

let stripData = null;     // assets/strips.json
let balloonStrip = null;  // the balloon frames, on every phone
let catStrip = null;      // the cat frames, only on the cat's phone
let stripLoading = false;
let stripFailed = false;

let anim = null;          // { kind: 'exit' | 'entry' | 'bounce', dir, start, dur }
let lastTrip = '';        // "1>2" of the last trip we reacted to
let tripBusy = false;     // we sent a trip and have not seen it come back yet
let busyAt = 0;

let catReactAt = 0;       // when the cat started reacting, 0 when sitting
let popAt = 0;            // when the balloon pops on the cactus
let popFrame = 0;         // which balloon frame was showing at that moment
let resetAt = 0;          // when to put a fresh balloon back on panel 1

async function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('system-ui');

  const wanted = new URLSearchParams(location.search).get('name');

  shareSetup({
    host: SHARE_HOST,
    room: ROOM,
    app: 'moveable-panels',
    shared: {
      panels: {},                               // who shows which panel
      balloon: { from: 0, to: 1 }               // resting on panel 1, no trip yet
    },
    me: { name: wanted || random(NAMES) }
  });

  lockGestures();
  enablePermissionsTap(['share'], 'Tap to join the room');
  showDesktopQr();   // laptop only: scan to open the same room on a phone

  try {
    stripData = await loadJSON(STRIP_FILE);
  } catch (e) {
    stripData = null;
    stripFailed = true;
  }
}

function draw() {
  background(PAPER);
  claimPanel();
  loadArt();

  ageAnim();
  readTrip();
  tickReset();

  drawMyPanel();
  drawStatus();
  drawPanelName();
  drawDebug();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/* ---------- 1. MY PANEL ---------- */

function drawMyPanel() {
  if (!myPanel) return;

  const art = PANEL_ART[myPanel];

  if ((art && panelFailed) || (myPanel === CAT_PANEL && stripFailed)) {
    drawMissingPanel();
  } else if (art && panelImg) {
    const r = coverRect(1080, 1920);
    image(panelImg, r.x, r.y, r.w, r.h);
  }

  if (myPanel === CAT_PANEL) drawCat();
  if (myPanel === CACTUS_PANEL) drawPop();
  drawBalloon();
}

function drawCat() {
  if (!catStrip || !stripData || !stripData.cat) return;
  drawStrip(stripData.cat, catStrip, catFrame(), 0, 0);
}

/* Sit, crouch, lunge, hold the pose, then the frames run backwards so the
   cat sits back up instead of cutting. */
function catFrame() {
  const meta = stripData && stripData.cat;
  if (!meta) return 0;
  if (!catReactAt) return 0;

  const t = millis() - catReactAt;
  const last = meta.frames - 1;
  const forward = meta.frames * CAT_FRAME_MS;

  if (t < forward) return floor(t / CAT_FRAME_MS);

  const hold = t - forward;
  if (hold < CAT_HOLD_MS) return last;

  const back = hold - CAT_HOLD_MS;
  if (back < CAT_BACK_MS) {
    return last - floor(back / (CAT_BACK_MS / meta.frames));
  }

  catReactAt = 0;
  return 0;
}

function drawBalloon() {
  if (!balloonStrip || !stripData || !stripData.balloon) return;

  const trip = window.shared && window.shared.balloon;
  const resting = !!trip && trip.to === myPanel;
  const leaving = !!anim && anim.kind === 'exit';
  if (!resting && !leaving) return;

  // Once the pop has started, the balloon is gone; drawPop draws the burst.
  if (popAt && millis() >= popAt) return;

  const f = floor(millis() / BALLOON_FRAME_MS) % stripData.balloon.frames;
  drawStrip(stripData.balloon, balloonStrip, f, balloonOffset(), -BALLOON_LIFT * height);
}

/* One frame of a strip, positioned by the anchor in strips.json. dx and dy
   are screen offsets, used to move the balloon across the seam. */
function drawStrip(meta, img, frame, dx, dy) {
  const r = coverRect(1080, 1920);
  const k = r.w / 1080;
  const f = constrain(Math.round(frame), 0, meta.frames - 1);
  const sx = (f % meta.cols) * meta.w;
  const sy = floor(f / meta.cols) * meta.h;

  image(
    img,
    r.x + meta.x * k + dx,
    r.y + meta.y * k + dy,
    meta.w * k,
    meta.h * k,
    sx,
    sy,
    meta.w,
    meta.h
  );
}

/* The balloon bursting on the cactus: it is already hidden, so this is just
   the burst of ink, centred where the balloon was. */
function drawPop() {
  if (!popAt || !stripData || !stripData.balloon) return;

  const t = millis() - popAt;
  if (t < 0 || t > POP_MS) return;

  const meta = stripData.balloon;
  const r = coverRect(1080, 1920);
  const k = r.w / 1080;
  const cx = r.x + meta.bx[popFrame] * k;
  const cy = r.y + meta.by[popFrame] * k - BALLOON_LIFT * height;

  const p = t / POP_MS;
  const a = 255 * (1 - p);
  const R = (14 + 70 * p) * k;

  push();
  noFill();
  stroke(BALLOON_INK[0], BALLOON_INK[1], BALLOON_INK[2], a);
  strokeWeight(3 * k);
  strokeCap(ROUND);

  for (let i = 0; i < 7; i++) {
    const ang = i * TAU / 7 + 0.4;
    line(
      cx + cos(ang) * R * 0.45, cy + sin(ang) * R * 0.5,
      cx + cos(ang) * R, cy + sin(ang) * R
    );
  }
  circle(cx, cy, R * 1.5);
  pop();
}

function balloonOffset() {
  if (!anim) return 0;

  const p = constrain((millis() - anim.start) / anim.dur, 0, 1);
  const far = TRAVEL * width;

  if (anim.kind === 'exit') return anim.dir * far * p;
  if (anim.kind === 'entry') return -anim.dir * far * (1 - p);
  return anim.dir * 0.12 * width * sin(p * PI);   // bounce off the end
}

function ageAnim() {
  if (anim && millis() - anim.start >= anim.dur) {
    const kind = anim.kind;
    anim = null;
    if (kind === 'entry') onArrived();
  }
  if (tripBusy && millis() - busyAt > 2000) tripBusy = false;
}

/* The balloon has finished arriving on this phone. */
function onArrived() {
  if (myPanel === CAT_PANEL) {
    catReactAt = millis();
  } else if (myPanel === CACTUS_PANEL) {
    popAt = millis() + POP_DELAY_MS;
    popFrame = floor(millis() / BALLOON_FRAME_MS) % (stripData ? stripData.balloon.frames : 1);
    resetAt = popAt + RESET_AFTER_POP_MS;
  }
}

/* After a pop, a fresh balloon goes back to panel 1 so the trip can run
   again. from 0 means "placement, not a journey", so nothing animates. */
function tickReset() {
  if (!resetAt || millis() < resetAt) return;
  resetAt = 0;
  shareSet('balloon', { from: 0, to: 1 });
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

/* Same cover maths as image(..., COVER), in a form that also gives the
   balloon somewhere to be offset from. */
function coverRect(w, h) {
  const k = max(width / w, height / h);
  const dw = w * k;
  const dh = h * k;
  return { x: (width - dw) / 2, y: (height - dh) / 2, w: dw, h: dh };
}

/* The panel number only exists once the room has claimed it, so the art is
   loaded then, not in setup(). Each phone fetches its own still plus the
   balloon strip, which every phone may have to show. */
function loadArt() {
  if (!myPanel) return;

  const art = PANEL_ART[myPanel];
  if (art && !panelImg && !panelLoading && !panelFailed) {
    panelLoading = true;
    loadImage(art)
      .then(function (img) { panelImg = img; panelLoading = false; })
      .catch(function () { panelFailed = true; panelLoading = false; });
  }

  if (stripData && !balloonStrip && !stripLoading && !stripFailed) {
    stripLoading = true;

    const jobs = [loadImage('assets/' + stripData.balloon.file)];
    if (myPanel === CAT_PANEL) jobs.push(loadImage('assets/' + stripData.cat.file));

    Promise.all(jobs)
      .then(function (imgs) {
        balloonStrip = imgs[0];
        if (imgs[1]) catStrip = imgs[1];
        stripLoading = false;
      })
      .catch(function () {
        stripFailed = true;
        stripLoading = false;
      });
  }
}

/* ---------- 2. THE TRIP ---------- */

/* Everyone reacts to the same room value, the sender included: the worker
   echoes the change to every phone at once, so both ends start together
   and there is no clock to compare. */
function readTrip() {
  const trip = window.shared && window.shared.balloon;
  if (!trip) return;

  const key = trip.from + '>' + trip.to;
  if (key === lastTrip) return;

  const first = !lastTrip;
  lastTrip = key;
  tripBusy = false;
  popAt = 0;
  resetAt = 0;

  // Whatever the room was doing when we joined is already settled.
  if (first) return;
  // from 0 is the room's first placement, not a journey.
  if (!trip.from) return;

  const dir = trip.to > trip.from ? 1 : -1;

  if (trip.to === myPanel) {
    anim = { kind: 'entry', dir: dir, start: millis() + LEAD_MS, dur: ENTRY_MS };
  } else if (trip.from === myPanel) {
    anim = { kind: 'exit', dir: dir, start: millis(), dur: EXIT_MS };
  }
}

function holdsBalloon() {
  const trip = window.shared && window.shared.balloon;
  return !!trip && trip.to === myPanel;
}

function sendBalloon(dir) {
  if (!holdsBalloon()) return;

  const target = myPanel + dir;

  // No phone on that side: bump the edge and stay, so the chain is never
  // lost on the table.
  if (!panelClaimed(target)) {
    anim = { kind: 'bounce', dir: dir, start: millis(), dur: BOUNCE_MS };
    return;
  }

  tripBusy = true;
  busyAt = millis();
  shareSet('balloon', { from: myPanel, to: target });
}

function panelClaimed(n) {
  const map = (window.shared && window.shared.panels) || {};
  return Object.values(map).indexOf(n) >= 0;
}

/* A tap is the only input: the half of the screen is the direction. */
function mousePressed() {
  if (millis() < readyAt) return false;
  if (tripBusy || anim) return false;
  if (popAt && millis() >= popAt) return false;   // the balloon is gone

  sendBalloon(mouseX < width / 2 ? -1 : 1);
  return false;
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

  if (myPanel) {
    // A phone that hides its page leaves the room and comes back with the
    // same panel, but the room has pruned its entry by then. Put it back, or
    // no phone can send the balloon here. Only if the number is still free:
    // a newcomer may have taken it while this phone was away.
    const takenByOther = Object.keys(map).some(function (id) {
      return id !== window.shareClientId && map[id] === myPanel;
    });
    if (window.shareConnected && !takenByOther &&
        map[window.shareClientId] !== myPanel && millis() - claimWriteAt > 1000) {
      claimWriteAt = millis();
      shareSet('panels', Object.assign({}, map, { [window.shareClientId]: myPanel }));
    }
    return;
  }

  if (!claimAt) claimAt = millis() + (FORCED_PANEL ? 0 : random(250, 1200));
  if (millis() < claimAt) return;

  let n;
  if (FORCED_PANEL) {
    n = FORCED_PANEL;
  } else {
    const used = Object.values(map);
    n = 1;
    while (n <= 4 && used.indexOf(n) >= 0) n++;
    if (n > 4) n = 1;   // room full of panels: show one anyway
  }

  myPanel = n;
  labelAt = millis();
  readyAt = millis() + 1200;
  claimWriteAt = millis();
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

/* ?debug: what this phone believes, for a phone with no console. */
function drawDebug() {
  if (!DEBUG || !myPanel) return;

  const trip = window.shared && window.shared.balloon;
  const claims = Object.values((window.shared && window.shared.panels) || {}).sort().join(',');
  const s = min(width / 390, height / 700);

  const lines = [
    'panel ' + myPanel + '  balloon at ' + (trip ? trip.to : '-') +
      '  hold ' + (holdsBalloon() ? 'yes' : 'no'),
    'anim ' + (anim ? anim.kind : '-') +
      '  balloon ' + (balloonStrip ? 'ok' : '-') +
      '  cat ' + (myPanel === CAT_PANEL ? (catStrip ? 'ok' : '-') : 'n/a'),
    'claimed ' + (claims || '-') +
      '  phones ' + phoneCount() +
      '  forced ' + FORCED_PANEL
  ];

  noStroke();
  fill(120);
  textAlign(LEFT, BOTTOM);
  textSize(11 * s);
  textLeading(15 * s);
  text(lines.join('\n'), 16 * s, height - 16 * s);
}
