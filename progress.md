# Progress

Last updated: Thu Nov 26 2026

## Where things are

- `plan.md` — Playtest 1: three steps. Step 1 (join + panel claim) and
  Step 2 (four independent loops) are marked **(done)**; Step 3 is the
  playtest itself. Manual pairing and the visitor crossing are parked under
  "Later".
- `sketch.js` — the Playtest 1 build: room join, panel claim (1–4), four
  looping panels, and a panel-name label that fades out. No pairing, no
  visitor, no tap handling beyond the join overlay.
- `index.html` — p5 2.2.3, compatibility `preload.js` shim, p5-phone 1.16.1,
  full-screen canvas, no other UI. Loads `sketch.js?v=playtest1`.
- `together/` — the user's Share example, unchanged. Source of the class host
  `https://p5-phone-share.npuckett.workers.dev` and room `a1-ridge`.
- `style.css` is unused.

Committed up to `a4cdad7 removed pair button`. Still uncommitted:

- `plan.md` — your rewrite of Project / Questions, plus my "(done)" on Step 2.
- `progress.md` — this file.
- `references/mockup.png` — **deleted in the working tree** (was ~12 MB).
  `plan.md`'s References table still lists it. If that deletion was not
  deliberate, restore it with `git checkout -- references/mockup.png`.

## What works, and how it was checked

- **Room join** — tap-to-join overlay, desktop QR, status dot with phone
  count. Checked in the in-app browser: page loads with no console errors,
  the tap joins (`shareStatus` = connected), the canvas draws.
- **Panel claim** — phones claim a free number in `shared.panels`
  (first free, 250–1200 ms random delay), stale entries pruned every 3 s.
  Checked in the browser: the phone claimed panel 1 and wrote it to the
  shared map.
- **Panels 1–4** — walking (4.5 s), reacting (3.6 s), falling (2.6 s, drops
  through the panel), running (2.2 s, leaning forward). Each on its own
  clock; shared line weight, figure height and ground line. Checked on your
  three phones (walking, reacting, falling all looping) and in the laptop
  browser (running, plus the others during development).
- **Panel name** — "1 · walking" style label under the status line, fades
  after ~4.5 s.
- **Stale-cache incident** — a laptop tab kept running the pre-rewrite
  script, so the Pair pill was still drawn and `typeof onPairTap` returned
  `"function"` even though the source no longer had it. Not a code fault:
  the page had never been reloaded. `index.html` now loads
  `sketch.js?v=playtest1`, and the pill disappeared after a real reload.
  Remember this if a screen ever behaves like an older build: reload first,
  then suspect the code.

## Known limitations

- Reloading a phone can give it a different panel (the claim is per
  connection; persistence is not built).
- A fifth phone in the room repeats panel 1.
- The QR card only appears on a laptop.
- If the tunnel is slow, joining takes a few seconds; the status dot stays
  grey until it connects.

## Decisions made this round

- **Playtest 1 tests four independent panels only.** No pairing, no
  cross-phone movement. Players rearrange the phones by hand.
- **The room and QR stay**, because they hand each phone a different panel
  automatically.
- **Panels stay code-drawn, not image/GIF/video.** A GIF would not have
  worked anyway: p5 does not animate GIFs, it decodes only the first frame.
  Using images would mean either converting to short muted MP4s (plus iOS
  autoplay handling, aspect-ratio cover-cropping, network load over the
  tunnel) or building an animated sprite sheet from exported frames. With
  40 minutes before the playtest it was not worth the risk, and four
  mismatched drawings would have tested "what do these pictures show"
  instead of "does the order change the story".

## What's next

1. **Record what happened in the playtest.** Nothing from it is written down
   in this file yet — which arrangements players tried, whether anyone read
   a sequence out loud, whether the four panels felt like one comic, and
   anything that actually broke.
2. **Fix only what broke.** No new features in this round.
3. After that, pick from `plan.md`'s "Later": manual pairing (code exists in
   `31572c2` / `c0e64b3`), the tap-to-pass visitor, or automatic proximity.
4. If you still want hand-drawn panel art, the cheap version is a sprite
   sheet: export a fixed number of frames as one strip, `await
   loadImage(...)` in `async setup()` (p5 2 has no `preload()`), and index
   frames with `floor(millis() / msPerFrame) % frameCount`. Keep the
   `drawWalking` / `drawReacting` / `drawFalling` / `drawRunning` call sites
   so the rest of the sketch does not change.

## How to run

`npm run phone` (cloudflared tunnel + QR), or with Live Server already on
port 5500. Each phone scans the same code and taps to join; each should show
a different panel.
