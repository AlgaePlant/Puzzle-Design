# Progress

Last updated: Thu Nov 12 2026

## Where things are

- `plan.md` — Playtest 1: three steps (join + panel claim, four independent
  loops, playtest). Manual pairing and the visitor crossing are parked under
  "Later".
- `sketch.js` — the Playtest 1 build: room join, panel claim (1–4), four
  looping panels, and a panel-name label that fades out. The pairing and
  visitor code has been removed.
- `index.html` — p5 2.2.3, compatibility `preload.js` shim, p5-phone 1.16.1,
  full-screen canvas, no other UI.
- `together/` — the user's Share example, unchanged. Source of the class host
  `https://p5-phone-share.npuckett.workers.dev` and room `a1-ridge`.
- `style.css` is unused. Nothing is committed; the user commits.

## What works, and how it was checked

All checks so far were in the in-app browser on a laptop. No physical-phone
result has been reported back yet.

- **Room join** — tap-to-join overlay, desktop QR, status dot with phone
  count. Verified: page loads with no console errors, the tap joins
  (`shareStatus` = connected), the canvas draws.
- **Panel claim** — phones claim a free number in `shared.panels`
  (first free, 250–1200 ms random delay), stale entries pruned every 3 s.
  Verified: the phone claimed panel 1 and wrote it to the shared map.
- **Panels 1–4** — walking (4.5 s), reacting (3.6 s), falling (2.6 s, drops
  through the panel), running (2.2 s, leaning forward). Each on its own
  clock; shared line weight, figure height and ground line. Verified by
  screenshots of panels 1, 3 and 4; panel 2 is unchanged from the earlier
  build.
- **Panel name** — "1 · walking" style label under the status line, fades
  after ~4.5 s. Seen in the screenshot.

The visitor crossing and manual pairing were checked in the previous build
and are now removed from the code.

## Known limitations

- Reloading a phone can give it a different panel (the claim is per
  connection).
- A fifth phone in the room repeats panel 1.
- The QR card only appears on a laptop, which is what you want.

## What's next

1. Open four browser windows in the room and confirm panels 1–4 all appear,
   then repeat on four phones.
2. Playtest 1: players rearrange the phones and read the sequences.
3. Fix only what breaks during the playtest.

## How to run

`npm run phone` (cloudflared tunnel + QR), or with Live Server already on
port 5500. Four phones scan the same code and tap to join; each should show
a different panel.
