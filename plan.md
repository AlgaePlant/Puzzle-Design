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

Each step is checked on two phones first (two browser windows on the laptop as
the fallback), then on four phones for the playtest.

Step 1: Panel shell and room join (done)

- Input: A player taps the join prompt.
- Transformation: The phone joins the shared room `a1-ridge` through the class
  Share host. A full-screen placeholder panel appears.
- Output: One black-line placeholder drawing, edge to edge, with a small join
  status and a pairing control.
- Fallback: Two browser windows on the laptop join the same room.
- Check: The phone joins by tapping (or by scanning the desktop QR); both
  windows show the panel and count each other.

Step 2: Manual pairing, left and right (done)

- Input: A "Pair" tap on each of two phones.
- Transformation: The first phone to pair becomes A (left), the second becomes
  B (right). Each phone is told who it is paired with. The pair clears when
  either phone unpairs or leaves.
- Output: Each panel shows its role and partner briefly, then clears to the
  full-screen panel.
- Fallback: The Pair control works with a mouse click in a browser window.
- Check: Pair a phone and a browser window; one shows A, the other B;
  unpairing or closing one clears both.

Step 3: Two independent panels, tap to pass the element

- Input: A tap on A, or on B.
- Transformation: Each phone runs its own looping placeholder animation: A
  walks, B reacts. The loops run independently and a crossing never restarts
  them. A tap makes a visitor element leave A's right edge and enter B's left
  edge on the same schedule; it crosses B's panel and disappears. A tap on B
  sends it back.
- Output: Two different panels looping side by side, with one temporary
  element crossing over the receiving panel and leaving it unchanged
  underneath.
- Fallback: A mouse click in either browser window does the same.
- Check: With the two phones side by side, the element reads as one movement
  from screen to screen while both loops keep running.

Step 4: Make the crossing read as continuous

- Input: The same taps.
- Transformation: Exit and entry share the same speed, size and vertical
  position, and meet exactly at the screen edge. Role labels and status fade
  during a crossing. Loop phase is unaffected.
- Output: The seam becomes hard to see.
- Fallback: Same behaviour on the laptop.
- Check: Hold two phones edge to edge; the element should look like one
  drawing moving across both screens.
- Note: Trimmable if time is short; Step 3 already gives a rough crossing.

Step 5: Four independent panels

- Input: Four phones join the same room; any two pair, then taps pass the
  element either way.
- Transformation: Add the remaining two loops (falling, running). Each phone
  is assigned a distinct panel by join order (walking, reacting, falling,
  running) and remembers it across reloads. Unpaired phones keep looping.
- Output: Four different looping panels, any pair crossed on tap, each panel
  staying with its phone when the phones are rearranged.
- Fallback: Four browser windows on the laptop, opened in a known order.
- Check: Four phones show four different loops; any pair crosses in either
  direction; moving phones keeps each panel with its own phone.

Step 6: Playtest 1 and fixes

- Input: Four players pairing phones, crossing the element, and rearranging
  the panels.
- Transformation: Fix only what breaks during the playtest. No new features.
- Output: A working two-phone pairing and crossing prototype, and four
  independent panels rearranged into sequences by hand.
- Fallback: Laptop windows stand in for missing phones.
- Check: Whether pairing works, whether the crossing looks continuous, and
  whether rearranging changes how players read the story.

Later (not built now): automatic proximity and arrangement

- Input: Physical movement or rearrangement of phones.
- Transformation: Phones detect each other and their relative position
  (left, right, top or bottom) and respond without a tap.
- Output: The animation changes as phones are moved or reordered.
- Check: To be defined after Playtest 1.

## Changes

- Initial plan based on the Phase 2 proposal.
- Interaction mechanisms and animation content are subject to revision after prototyping and playtesting.
