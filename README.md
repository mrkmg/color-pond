ColorPond
=========

An HTML5 Canvas Virtual Life Emulator

Play with it at [mrkmg.github.io/ColorPond](http://mrkmg.github.io/ColorPond)

Usage
-----

Open index.html in Chrome (Other browsers may work as well), set your desired options, and click "go"!


Options
-------

Intial Options:

- **Width/Height** The width and height of the pond- this will be scaled automatically for rendering
- **Best Fit** Check to maintain a x/y scale to best fit your current browser height and width
- **Seed** A random number generator seed. Leave empty for faster computation, really, leave it empty. I will probably remove this later.


Runtime Options:

- **Pre Filter** Run an image filter on the pre-scaled pond
- **Post Filter** Run an image filter on the post-scaled pond - Slows down render time
- **Flow Type** The pattern in which resources and materials flow around the pond.
- **P Spawn Ch** The chance to spawn a producer. 100 would be a 1/100 chance
- **C Spawn CH** The chance to spawn a consumer. 100 would be a 1/100 chance
- **Mutation Ch** The chance for a mutation to occur. 100 would be 1/100 chance
- **Goal R %** The maximum mass of the pond for resources to spawn
- **P Life Gain** The amount of strength each producer gets for converting a resource to a material
- **C Life Gain** The amount of strength each consumer gets for comsuming a material


About
-----

I made this project for two reasons

1. I wanted to learn about HTML5 Canvas in a fun and exciting way
2. I have always had an intrest in "Virtual Life", and wondered if I could accomplish something simple

I plan to keep on working on this indefinitely. I have MANY MANY ideas on how to move forward and I will try to document them below



TODO LIST
=========

- ~~Implement data crunching in a web-worker seperate from ui thread~~
- Implement aggressive organisms
- ~~Implement a more realistic "flow", aka currents and whirlpools~~
- Optimization of the Consumer Pathfinding algorithm
- Create proper objects to represent the Pond, Resources, Materials, and the Organisms