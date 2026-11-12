# Plan: Moveable Comic Panels

## Project

Phone as moveable comic panels, to let players create different narratives by rearranging and connecting animated panels, for four or more players sharing a physical space.

## The question

Can rearranging phones and connecting animated panels create different narratives?

Can changes on one phone influence the animation displayed on another phone in a meaningful way?

## The experience

Four players each receive a phone displaying a different animated comic panel.

Players place their phones next to one another and experiment with different arrangements to create a comic sequence.

When players move or rearrange their phones, the animations may change or respond to other panels, allowing players to explore different connections between scenes.

Players can experiment with different arrangements without needing to agree on a single correct story.

## Input, transformation, output, fallback

- Input: Touch interactions and physical movement or rearrangement of phones.
- Transformation: Player actions trigger changes in the displayed panels. The exact method of detecting phone arrangements and connecting animations is to be explored.
- Output:Animated comic panels that can form different sequences or connected scenes.
- Fallback:Use mouse clicks or keyboard inputs to simulate interactions when testing on a laptop.

## References

| File | Use it as | Take | Leave |
|---|---|---|---|
| references/[layout-moveable-panels.jpg] | layout: match this | [the animation's size (fits the entire screen)] | [the animation's content (the drawing), the paper color] |
| references/[siftable-1.png], [siftable-2.png], [siftable-4.png] | inspiration: the interactions | [the visuals on the devices change when the devices are placed near each other, the visuals respond to each other, different positions have different changes for the visuals] | [the device shows a person's face, and the face can turn toward the direction of another device] |
| references/[mockup.png] | layout: match this for the arrangement | [five phones in a row on a table, each filled by one panel, slid into a new order] | [the wooden table, the hand, the sketched story content] |

## Limits

- Start with four phones.
- Focus on one interaction between two panels before expanding to four.
- Use simple drawings or placeholder animations for initial testing.
- Not now: Complex narratives, multiple endings, or a complete comic collection.

## How I will check it

- On my laptop: Test whether the panels display correctly and whether simulated interactions trigger the intended changes.
- On my phone: Test whether the interactions work on physical devices.
- With players: Observe whether rearranging the phones produces understandable visual connections and encourages experimentation.

## Steps

Playtest 1 is four phones with four independent looping panels. Manual
pairing and the visitor crossing are parked under "Later".

Step 1: Panel shell and room join (done)

- Input: A player taps the join prompt.
- Transformation: The phone joins the shared room `a1-ridge` through the
  class Share host and claims a free panel number (1–4) in the room, so
  phones in the same room show different panels.
- Output: A full-screen black-line panel. A small status line shows the
  connection; the panel's name (for example "3 · falling") fades in briefly.
- Fallback: Browser windows on the laptop join the same room and claim
  panels too.
- Check: Two phones join by QR and show two different panels; the status
  line says connected and counts the phones.

Step 2: Four independent looping panels

- Input: Nothing beyond opening the page.
- Transformation: Four hand-drawn loops, each on its own clock: walking,
  reacting, falling, running. The phone draws whichever panel it claimed.
- Output: One animation per phone, edge to edge, looping continuously. No
  tap, no pairing, no visitor.
- Fallback: Same on the laptop.
- Check: Four phones show four different loops; each loops cleanly; no two
  phones show the same panel while the room has four or fewer phones.

Step 3: Playtest 1 and fixes

- Input: Four players arranging the phones in different orders.
- Transformation: None in code; players move the phones and read the order.
- Output: A four-panel comic sequence whose meaning changes as the phones
  are rearranged.
- Fallback: Laptop windows stand in for missing phones.
- Check: Whether players read different stories from different arrangements,
  and whether the four panels feel like one comic.

Later (parked, not built now)

- Manual pairing A/B — built, works, code is parked.
- Tap-to-pass visitor: the walking panel sends its figure across the seam to
  the partner's panel, temporarily over that panel's loop. Future
  refinement: the visitor continues from the walker's current position
  instead of a fixed point.
- Automatic proximity and relative position (left, right, top or bottom).

## Changes

- Initial plan based on the Phase 2 proposal.
- Interaction mechanisms and animation content are subject to revision after prototyping and playtesting.
