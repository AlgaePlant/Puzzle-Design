# Plan: Moveable Comic Panels

## Project

Phone as moveable comic panels, to let players create different narratives by rearranging animated panels, for multiple phones in one space.

## Questions

- Can rearranging animated panels create different narratives?
- Can changes on one phone influence the animation displayed on another phone in a meaningful way?

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

Playtest 1 is four phones with four independent looping panels, and it has
been run. Playtest 2 keeps the room and the four phones, replaces the drawn
panels with framed animations, and adds one cross-phone interaction: the
balloon. Proximity detection is still out, so the player aims the balloon by
tapping. Manual pairing and the visitor crossing stay parked under "Later".

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

Step 2: Four independent looping panels (done)

- Input: Nothing beyond opening the page.
- Transformation: Four hand-drawn loops, each on its own clock: walking,
  reacting, falling, running. The phone draws whichever panel it claimed.
- Output: One animation per phone, edge to edge, looping continuously. No
  tap, no pairing, no visitor.
- Fallback: Same on the laptop.
- Check: Four phones show four different loops; each loops cleanly; no two
  phones show the same panel while the room has four or fewer phones.

Step 3: Playtest 1 and fixes (done)

- Input: Four players arranging the phones in different orders.
- Transformation: None in code; players move the phones and read the order.
- Output: A four-panel comic sequence whose meaning changes as the phones
  are rearranged.
- Fallback: Laptop windows stand in for missing phones.
- Check: Whether players read different stories from different arrangements,
  and whether the four panels feel like one comic.

Step 4: Framed panels, still (done)

- Input: Nothing beyond opening the page and joining the room.
- Transformation: Each phone loads the art for the panel it claimed, from
  `assets/`, with `await loadImage()` in `async setup()`. Every panel holds
  its first frame: a floating balloon, a cat, a cactus, a person.
- Output: Four still panels, edge to edge, matching the exported art. No
  movement, no tap.
- Fallback: Laptop windows in the same room get the same stills.
- Check: Four phones show four different stills and nothing animates. If one
  asset fails to load, that phone still draws something instead of a blank
  screen.

Step 5: One seam, aimed by tap (done)

- Input: A tap on the left half of the balloon panel sends the balloon left;
  a tap on the right half sends it right.
- Transformation: The balloon lifts off and leaves that edge, writes the
  handoff to the room, and the neighbour in that direction plays the entry
  from its opposite edge after a fixed lead-in. At the end of the chain the
  balloon bounces back.
- Output: The balloon visibly crosses one seam, phone to phone. The cat and
  the cactus still ignore it.
- Fallback: Taps on a laptop window work the same way, so one person can walk
  the balloon along a row of windows.
- Check: The crossing has no gap or stutter at the seam, left and right both
  work, and the balloon never disappears.

Step 6: Cat and cactus

- Input: Taps that steer the balloon into the cat or the cactus.
- Transformation: When the balloon arrives at the cat, the cat plays its
  reaction once and then holds the balloon, so the next player can pass it
  on. When it arrives at the cactus, the cactus plays the pop, the trip ends,
  and after a few seconds every panel returns to its still.
- Output: A three-beat trip — balloon, cat reacts, cactus pops — or the pop
  before the cat if the players aim that way.
- Fallback: Same on the laptop.
- Check: The cat's reaction is unmistakable; the pop ends the trip; the room
  resets without a reload; ten trips in a row leave nothing stuck.

Step 7: Playtest 2

- Input: Four players placing the phones and tapping left or right.
- Transformation: None in code; the players choose the route.
- Output: Different tellings from different aims. The tap chooses the order;
  the table only decides whether the crossings look continuous.
- Fallback: Laptop windows stand in for missing phones.
- Check: Whether players aim on purpose to get a different telling, and
  whether they read the balloon's trip as one story. One spoken instruction:
  "tap the side of the screen you want the balloon to fly towards."

Later (parked, not built now)

- Manual pairing A/B — built, works, code is parked.
- Tap-to-pass visitor: the walking panel sends its figure across the seam to
  the partner's panel, temporarily over that panel's loop. Future
  refinement: the visitor continues from the walker's current position
  instead of a fixed point.
- Automatic proximity and relative position (left, right, top or bottom).
- Cat hears the pop: if the balloon pops before it reaches the cat, the cat
  reacts to the pop. Parked for Playtest 2 because the reaction has to look
  different from the balloon reaction, or it reads as random.

## Changes

- Initial plan based on the Phase 2 proposal.
- Interaction mechanisms and animation content are subject to revision after prototyping and playtesting.
