# Spaceship Vs UFO

## Current Structure
- Written primarily in TypeScript
- Four TypeScript files in /src
    - main.ts: contains bulk of program, including preload(), create(), update()
    - objects.ts: contains classes, including Vehicle, Spaceship, UFO, Bullet, SpaceshipLaser, UFOLaser, BlackHole, Asteroid.
    - consts.ts: contains most constants and global variables
    - utils.ts: contains most miscellaneous functions
- SpaceshipLaser and UFOLaser inherit Bullet
- Spaceship and UFO inherit Vehcile
- Bullets held in bullets[]
- asteroids held in asteroids[]

## Need to do:
- See Issues on GitHub page

## Possible ideas:
- move at an angle instead of left,right,up,down?
- Black hole
- shaders for background objects
