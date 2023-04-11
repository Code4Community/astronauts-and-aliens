import { Bullet, BlackHole } from './objects';

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

//array for black holes
export const blackHoles: BlackHole[] = [];