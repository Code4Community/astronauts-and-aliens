# Spaceship Vs UFO

## Current Structure
- Written in TypeScript
- Bullet class with children SpaceshipLaser and UFOLaser
- Vehicle class with children Spaceship and UFO
- Bullets held in bullets[]
- asteroids held in asteroids[]

## Ideas:
- Have event caller in safeRemove() to pop next instruction of of queue
- Have event caller when spaceship/ufo decrease speed to zero (near zero)

## Need to do:
- Work out player and CPU turns
- Work out colliders between vehicles and enemy's lasers
- Work out collider between asteroids and all lasers
- Make UFO and Spaceship spawn in acceptable places
- Add in animations for when vehicles get hit
- Add in animations for when asteroids get hit with laser
- Make sure asteroids spawn in "cleaner," not overlapping and spread nicely

## Possible ideas:
- move at an angle instead of left,right,up,down?
- Black hole
- shaders for background objects
