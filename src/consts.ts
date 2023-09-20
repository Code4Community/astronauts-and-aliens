import Asteroid from "./objects/asteroid";
import Bullet from "./objects/bullet";
import BlackHole from "./objects/blackhole";

// screen size and camera
export const screenWidth = 1000;
export const screenHeight = 600;

// spaceship parameters
export const spaceshipSpawnY = screenHeight / 2;
export const spaceshipSpawnX = screenWidth / 2 - screenWidth / 2.5;
export const spaceshipVelocity = 1400;

//ufo parameters
export const ufoSpawnY = screenHeight / 2;
export const ufoSpawnX = screenWidth / 2 + screenWidth / 2.5;
export const ufoVelocity = 1400;

// asteroid spawn parameters
export const asteroidSpawnXMin = screenWidth / 2 - screenWidth / 4;
export const asteroidSpawnXMax = screenWidth / 2 + screenWidth / 4;

export const asteroidSpawnYMin = 50;
export const asteroidSpawnYMax = screenHeight - 50;

export const asteroidCount = 8;
export const asteroidHeight = (asteroidSpawnYMax - asteroidSpawnYMin) / asteroidCount;

// array of bullets, each fired bullet is appended here
export const bullets: Bullet[] = [];

export const asteroids: Asteroid[] = [];

//array for black holes
export const blackHoles: BlackHole[] = [];

// asset locations
export const images = {
    spaceship: "assets/Space Ship 3 Hearts.png",
    spaceship2hearts: "assets/Space Ship 2 Hearts.png",
    spaceship1hearts: "assets/Space Shop 1 Hearts.png",
    ufo: "assets/UFO 3 Hearts.png",
    ufo2hearts: "assets/UFO 2 Hearts.png",
    ufo3hearts: "assets/UFO 2 Hearts.png",
    asteroid: "assets/Small Asteroid.png",
    bullet: "assets/bullet.png",
    blackhole: "assets/blackhole.png",
    lazerSpaceship: "assets/LAZER SPACE SHIP.png",
    lazerUFO: "assets/LAZER UFO.png",
} as const;