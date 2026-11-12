# Progress

Last updated: Thu Nov 12 2026

## Where things are

- `plan.md` — Steps 1–6. Steps 1 and 2 are marked done.
  Everything outside Steps is the user's; the Steps are the agent's.
- `index.html` — p5 2.2.3, compatibility `preload.js` shim, p5-phone 1.16.1.
  Full-screen canvas, no other UI.
- `sketch.js` — the whole prototype: room join, pairing, panels, crossing.
- `together/` — the user's Share example (do not edit); source of the class
  host and room name: `https://p5-phone-share.npuckett.workers.dev`,
  room `a1-ridge`.
- `plan-template.md` is no longer present. `style.css` is unused now.

Nothing is committed. The user commits.

## What works, and how it was checked

### Step 1 — panel shell and room join

- Tap-to-join overlay (`enablePermissionsTap(['share'], ...)`), desktop QR
  (`showDesktopQr`), green status dot with phone count, `lockGestures()`.
- Checked in the in-app browser on 12 Nov: page loads with no console
  errors, the tap joins (`shareStatus` = connected), the canvas draws, and
  other phones in the room are counted. Not re-checked on a physical phone
  since the very first build.

### Step 2 — manual pairing

- Pair pill at the bottom. First tap claims A (left), second phone claims B
  (right). The pair lives in `shared.pair`. Cancel/Unpair from either phone.
  A third phone tapping Pair is told the pairing is taken. A partner that
  disappears (close, reload, leave) has its slot cleared after ~3 s.
- Checked by driving the pair state in the browser; the pill and notices
  changed as expected. Two real phones pairing has not been confirmed by the
  user yet.

### Step 3 — two independent panels, tap to pass the element

- Panel 1: walking figure, 4.5 s loop. Panel 2: figure that recoils with
  raised arms, 3.6 s loop. Independent clocks; crossings never restart them.
- Phones claim panel numbers in `shared.panels` (first free, 250–1200 ms
  random delay). Stale numbers from absent phones are pruned every 3 s.
- Tap on a paired phone (anywhere but the pill) sends a visitor across:
  pair space is A = 0–1, B = 1–2; it starts mid-panel, leaves the tapped
  phone's edge, enters the partner's left edge, crosses and vanishes. Same
  ground line (0.78 of height) on both panels. Lead 450 ms, crossing 3.2 s.
  Tap on the partner sends it back.
- Checked in the in-app browser: a canvas tap launches the crossing
  (`dir`, `side`, `start` set), and screenshots of forced crossing states show
  the visitor drawn mid-panel on the sending side and entering the receiving
  side. Not yet seen running between two physical phones.
- Fixed during the check: panel numbers were briefly read from
  `localStorage`, which gave two laptop windows the same panel. Now first
  free in the room, with pruning.

## Known limitations (deliberate, for now)

- Reloading a phone can give it a different panel (persistence was planned
  for Step 5).
- One pair at a time; other phones just loop their own panel.
- Seam timing can be off by the network latency (roughly 50–150 ms).
- The visitor walks faster than panel 1's own figure.
- Automatic proximity / relative position is not built (listed as "Later"
  in `plan.md`).

## What's next

1. Step 4 — continuity polish: match exit/entry speed and size, fade chrome
   during a crossing. Trimmable if time is short.
2. Step 5 — add the falling and running loops, plus remembering a phone's
   panel across reloads. Four phones, any pair crosses.
3. Step 6 — Playtest 1: pairing, continuity, rearranging the four panels and
   reading the story. Fix only what breaks.

The user had roughly three hours before the playtest, so Steps 4 and 5 are
the flexible ones; Step 3's prototype is the thing to test.

## How to run

`npm run phone` (cloudflared tunnel + QR), or `npm run phone` with Live
Server already running on port 5500. Two phones: scan the same code, tap to
join, pair, tap the screen to cross.
