ColorPond
=========

An HTML5 Canvas Virtual Life Emulator

Usage
-----

Open index.html in Chrome (Other browsers may work as well), set your desired options, and click "go"!


Options
-------

Detailed description coming soon


About
-----

I made this project for two reasons

1. I wanted to learn about HTML5 Canvas in a fun and exciting way
2. I have always had an intrest in "Virtual Life", and wondered if I could accomplish something simple

After I started, I realized that this is really fun and went way futher than I originally intended. There are some obvious things I probably did "wrong" as far a this type of processing. Things I think I should have done / should do moving forward:

- Create objects instead of flat arrays for Organisms
- Seperate/move all organism actions (share,eat,move,etc) to an organism object
- Less reliance on Math.random and Modulo (although I don't know how I would go about this)

Somethings I would love some help with, but not just code pushes, actual understanding:

- Optimization of mass data crunching. On a 125x125 grid there are up 15625 objects to be processed every tick, on 200x200 tha Is there an effcient way to handle this?
- Optimization of the Consumer Pathfinding algorithm
- HTML5 Canvas drawing optimization (maybe use image data instead of rectangle)

A couple cool thigns I want to eventually implement:

- Implement aggressive organisms
- Implement a more realistic "flow", aka currents and whirlpools