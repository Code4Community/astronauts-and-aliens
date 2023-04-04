import { Asteroid, Vehicle } from "./main";

export type Level = {
  spaceshipPosition: {
    x: number;
    y: number;
  };
  ufoPosition: {
    x: number;
    y: number;
  };
  // todo: more object types
  objects: { type: "astroid"; x: number; y: number }[];
};

export const createLevelFromGameObjects = (
  spaceship: Vehicle,
  ufo: Vehicle,
  astroids: Asteroid[]
): string =>
  JSON.stringify({
    spaceshipPosition: {
      x: spaceship.x,
      y: spaceship.y,
    },
    ufoPosition: {
      x: ufo.x,
      y: ufo.y,
    },
    objects: astroids.map((astroid) => ({
      type: "astroid",
      x: astroid.x,
      y: astroid.y,
    })),
  } as Level);
