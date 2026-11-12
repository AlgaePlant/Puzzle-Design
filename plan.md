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

Each step is checked on two phones (and on two browser windows on the laptop as
the fallback) before the next one starts.

Step 1: Panel shell and room join

- Input: A player taps the join prompt.
- Transformation: The phone joins the shared room `a1-ridge` through the class
  Share host. A full-screen placeholder panel appears.
- Output: One black-line placeholder drawing, edge to edge, with a small join
  status and a pairing hint.
- Fallback: Two browser windows on the laptop join the same room.
- Check: The phone joins by tapping (or by scanning the desktop QR), the status
  says connected, and both windows on the laptop show the panel.

Step 2: Manual pairing, left and right

- Input: A "Pair" tap on each of two phones.
- Transformation: The first phone to pair becomes A (left), the second becomes
  B (right). Each phone is told who it is paired with.
- Output: Each panel shows its role and partner briefly, then clears to the
  full-screen panel.
- Fallback: The Pair button works with a mouse click in a browser window.
- Check: Pair a phone and a browser window. One shows A, the other B; unpairing
  clears both.

Step 3: Tap to pass the element across

- Input: A tap on A, or on B.
- Transformation: The tapped phone sends a timed event. The element leaves A's
  right edge and enters B's left edge on the same schedule, so the crossing is
  one movement.
- Output: A placeholder element (a small figure or a ball) travels across the
  seam. A tap on B sends it back.
- Fallback: A mouse click in either browser window does the same.
- Check: With the two phones side by side, tapping one sends the element onto
  the other screen; tapping the second sends it back.

Step 4: Make the crossing read as continuous

- Input: The same taps.
- Transformation: Exit and entry share the same speed, size and vertical
  position, and meet exactly at the screen edge.
- Output: The seam becomes hard to see. Role labels and status fade out while
  the element crosses.
- Fallback: Same behaviour on the laptop.
- Check: Hold two phones edge to edge; the element should look like one drawing
  moving across both screens.

Step 5: Four phones in sequence (after the two-phone crossing works)

- Input: Taps along a paired chain of four phones.
- Transformation: Each phone is one panel in the sequence. The element passes
  from neighbour to neighbour in the order the phones were paired.
- Output: A four-panel sequence where the movement follows the pairing order.
- Fallback: Four browser windows on the laptop.
- Check: Four phones in a row; the element travels A, B, C, D and back.

Step 6: Automatic proximity and arrangement (to be explored, not built yet)

- Input: Physical movement or rearrangement of phones.
- Transformation: Phones detect each other and their relative position
  (left, right, top or bottom) and respond without a tap.
- Output: The animation changes as phones are moved or reordered.
- Fallback: Keyboard or mouse controls simulate the movement.
- Check: To be defined once Step 5 works.

## Changes

- Initial plan based on the Phase 2 proposal.
- Interaction mechanisms and animation content are subject to revision after prototyping and playtesting.
