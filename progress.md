# Progress

Last updated: Thu Nov 26 2026

## Where things are

- `plan.md` — Playtest 1: three steps. Step 1 (join + panel claim) and
  Step 2 (four independent loops) are marked **(done)**; Step 3 is the
  playtest itself, which has now been run (see below) but is not marked in
  `plan.md` yet. Manual pairing and the visitor crossing are parked under
  "Later".
- `sketch.js` — the Playtest 1 build: room join, panel claim (1–4), four
  looping panels, and a panel-name label that fades out. No pairing, no
  visitor, no tap handling beyond the join overlay.
- `index.html` — p5 2.2.3, compatibility `preload.js` shim, p5-phone 1.16.1,
  full-screen canvas, no other UI. Loads `sketch.js?v=playtest1`.
- `together/` — the user's Share example, unchanged. Source of the class host
  `https://p5-phone-share.npuckett.workers.dev` and room `a1-ridge`.
- `style.css` is unused.
- No framed animations are in the repo yet: there is no `assets/` folder.
  The Playtest 2 art has to be exported and added before the first step can
  be built.
- Working tree is clean, committed up to `93dfdcd play test 1 progress
  added`. `references/mockup.png` is back in place (it had been deleted in
  the working tree; `plan.md`'s References table lists it).

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
- **Playtest 1 (four phones, in person)** — the page and the Share server
  behaved normally throughout; all four phones joined, claimed different
  panels, and looped without breaking. Players did assemble the panels into
  a comic sequence. But they assembled it once and stopped: no one tried a
  different order, and no one talked about what the story might be.
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
- Rearranging the phones currently has no visible consequence: each panel
  loops in isolation, so a swap changes nothing on screen.

## Decisions made this round

- **Playtest 1 tests four independent panels only.** No pairing, no
  cross-phone movement. Players rearrange the phones by hand.
- **The room and QR stay**, because they hand each phone a different panel
  automatically.
- **Playtest 1 panels stayed code-drawn.** Four hand-drawn loops were
  already written, and with 40 minutes before the playtest four mismatched
  drawings would have tested "what do these pictures show" instead of "does
  the order change the story".
- **Correction: p5 2.2.3 does animate GIFs.** An earlier version of this note
  said p5 decodes only the first frame. That is wrong for the build in
  `index.html`: `loadImage()` decodes every GIF frame and exposes
  `numFrames()`, `setFrame()`, `pause()`, `play()` and `reset()`, so a GIF
  can be held on a still frame and triggered on demand. Animated WebP and
  APNG still draw one frame only, and video is the wrong tool (no reliable
  freeze or seek on iOS). A GIF decodes all its frames into memory at once
  (width × height × 4 × frames), so keep the frames small. Playtest 2 uses
  framed animations; see What's next.

## What's next

1. **Playtest 1 result: arrangement was not explored.** Two likely reasons,
   neither tested yet: (a) the "1 · walking" label announces an order, so
   the numeric arrangement looks intended and finished; (b) swapping two
   phones produces no visible change, so rearranging has no payoff. The
   silence about story may also be the absence of a prompt — nobody asked a
   player to read the sequence out loud.
2. **Playtest 2 is decided, not built.** Four phones, framed animations, no
   proximity. A floating balloon is the only panel that takes a tap; a cat
   plays its reaction when the balloon arrives; a cactus pops the balloon; a
   person stays a still. Every panel holds a still frame until it is
   triggered. Whoever holds the balloon can pass it on, and it bounces back
   at the end of the chain. Direction is chosen by the player: **tap the
   left half of the screen to send the balloon left, the right half to send
   it right.** No arrow and no number on screen. "Cat hears the pop" is
   parked.
   Honest scope: the tap chooses the order, the table does not. Physical
   arrangement only changes whether a crossing looks continuous.
3. Fix only what broke. Nothing broke in Playtest 1, so no bug-fix round is
   owed.
4. After that, pick from `plan.md`'s "Later": manual pairing (code exists in
   `31572c2` / `c0e64b3`), the tap-to-pass visitor, or automatic proximity.
5. Asset route for Playtest 2: one GIF per state is the least work, because
   p5 2.2.3 already gives frame control (`setFrame(0)` for the still,
   `play()` to trigger). A PNG sprite strip is the fallback if GIF's 256
   colours dither the art; `await loadImage(...)` in `async setup()` (p5 2
   has no `preload()`). Either way, every frame in a state needs the same
   pixel box and anchor, and the still should be frame 0, or the panel jumps
   when the animation starts.

## How to run

`npm run phone` (cloudflared tunnel + QR), or with Live Server already on
port 5500. Each phone scans the same code and taps to join; each should show
a different panel.
