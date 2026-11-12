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
| references/[layout-moveable-panels.png] | layout: match this | [the animation's size (fits the entire screen)] | [the animation's content (the drawing), the paper color] |
| references/[siftable-1.png], [siftable-2.png], [siftable-4.png] | inspiration: the interactions | [the visuals on the devices change when the devices are placed near each other, the visuals respond to each other, different positions have different changes for the visuals] | [the device shows a person's face, and the face can turn toward the direction of another device] |

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

Stage A: Local interaction

- Input: A player taps their phone screen.
- Transformation: The tap changes the animation state on that phone.
- Output: The phone displays a different animation, potentially changing its narrative connection with neighbouring panels.
- Fallback: A mouse click triggers the same change on a laptop.

Stage B: Cross-phone interaction

- Input: A player taps one phone.
- Transformation: The action sends a signal to another phone.
- Output: An animation on the other phone changes.
- Fallback: Simulate the interaction using multiple browser windows.

Stage C: Automatic interaction (to be explored)

- Input: Physical movement or rearrangement of phones.
- Transformation: Detect movement or arrangement changes and trigger animation responses.
- Output: Animations change without requiring players to tap their screens.
- Fallback: Simulate the input using mouse or keyboard controls.

## Changes

- Initial plan based on the Phase 2 proposal.
- Interaction mechanisms and animation content are subject to revision after prototyping and playtesting.
