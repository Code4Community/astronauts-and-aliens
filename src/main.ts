import "./style.css";
import * as Phaser from "phaser";
// @ts-ignore
import C4C from "c4c-lib";
import { Level, createLevelFromGameObjects } from "./level";
import level1 from "./levels/level1.json?raw";

declare const C4C: {
  Editor: {
    create(b: HTMLElement): { dom: HTMLDivElement };
    getText(): string;
  };
  Interpreter: {
    define(name: string, f: () => void): void;
    run(programCode: string): void;
  };
};

type GameState = "PLAYING" | "UFO_WIN" | "SPACESHIP_WIN";

let gameState: GameState = "PLAYING";

const editor = C4C.Editor.create(document.querySelector(".code")!);

editor.dom.style.height = "200px";

const interpreterFunctions: Record<string, () => void> = {
  shoot() {
    spaceship.shoot(0, 0, 0);
  },
  up() {
    spaceship.moveUp();
  },
  down() {
    spaceship.moveDown();
  },
  left() {
    spaceship.moveLeft();
  },
  right() {
    spaceship.moveRight();
  },
};

const actionQueue: typeof interpreterFunctions[keyof typeof interpreterFunctions][] =
  [];

(
  Object.keys(interpreterFunctions) as (keyof typeof interpreterFunctions)[]
).forEach((key) => {
  C4C.Interpreter.define(key, () =>
    actionQueue.push(interpreterFunctions[key])
  );
});

// screen size and camera
const screenWidth = 1000;
const screenHeight = 600;

// spaceship parameters
const spaceshipSpawnY = screenHeight / 2;
const spaceshipSpawnX = screenWidth / 2 - screenWidth / 2.5;
const spaceshipVelocity = 1400;

//ufo parameters
const ufoSpawnY = screenHeight / 2;
const ufoSpawnX = screenWidth / 2 + screenWidth / 2.5;
const ufoVelocity = 1400;

// asteroid spawn parameters
const asteroidSpawnXMin = screenWidth / 2 - screenWidth / 4;
const asteroidSpawnXMax = screenWidth / 2 + screenWidth / 4;

const asteroidSpawnYMin = 50;
const asteroidSpawnYMax = screenHeight - 50;

const asteroidCount = 8;
const asteroidHeight = (asteroidSpawnYMax - asteroidSpawnYMin) / asteroidCount;
let asteroidSpawnChance = 90; //percent chance to spawn asteroid

let GameOver: boolean = false;

let editorMode = false;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: screenWidth,
  height: screenHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const loadObjectsFromLevel = (scene: Phaser.Scene, level: Level) => {
  spaceship.x = level.spaceshipPosition.x;
  spaceship.y = level.spaceshipPosition.y;

  ufo.x = level.ufoPosition.x;
  ufo.y = level.ufoPosition.y;

  level.objects.forEach((object) =>
    asteroids.push(new Asteroid(scene, object.x, object.y))
  );
};

// array of bullets, each fired bullet is appended here
const bullets: Bullet[] = [];
let bulletsToRemove: Bullet[] = [];

// parent for fired bullet
class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    picture: keyof typeof images
  ) {
    super(scene, x, y, image(picture));
    scene.add.existing(this);
    this.setScale(0.3);
    scene.physics.add.existing(this);
    bullets.push(this);
  }
}

// child ufo laser class
class UFOLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("lazerUFO"));
  }
}

// child spaceship laser class
class SpaceshipLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("lazerSpaceship"));
  }
}

// parent class for ufo/spaceship
export class Vehicle extends Phaser.Physics.Arcade.Sprite {
  alive: boolean = true;
  velo: number;
  bulletType: typeof Bullet;
  health: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    picture: keyof typeof images,
    velo: number,
    bulletType: typeof Bullet = Bullet
  ) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, image(picture));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0);
    this.setBounceX(0);
    this.setCollideWorldBounds(true);
    this.velo = velo;
    this.bulletType = bulletType;
    this.health = 3;
  }

  moveUp() {
    this.body.velocity.y = -this.velo;
  }

  moveDown() {
    this.body.velocity.y = this.velo;
  }

  moveLeft() {
    this.body.velocity.x = -this.velo;
  }

  moveRight() {
    this.body.velocity.x = this.velo;
  }

  moveAngle(angle: number) {
    this.body.velocity.x = this.velo * Math.cos((angle * Math.PI) / 180);
    this.body.velocity.y = this.velo * Math.sin((angle * Math.PI) / 180);
  }

  shoot(angle: number, xOffset = 0, yOffset = 0) {
    // 'bullet' argument is only there bc Bullet constructor has 4 parameters. SpaceshipLaser and UFOLaser each have 3 parameters.
    // However, this.bulletType should never be Bullet, it should always be SpaceshipLaser or UFOLaser.
    const laser = new this.bulletType(
      this.scene,
      this.x - xOffset,
      this.y - yOffset,
      "bullet"
    );
    laser.setVelocityX(200 * Math.cos((angle / 360) * 2 * Math.PI));
    laser.setVelocityY(200 * Math.sin((angle / 360) * 2 * Math.PI));
  }
}

// child class for spaceship vehicle
class Spaceship extends Vehicle {
  alive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, image("spaceship"), spaceshipVelocity, SpaceshipLaser);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
  }
}

// child class for UFO vehicle
class UFO extends Vehicle {
  alive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, image("ufo"), ufoVelocity, UFOLaser);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
  }
}

// class for asteroids
export class Asteroid extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, image("asteroid"));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }
}

//array for black holes
const blackHoles: BlackHole[] = [];

// black hole class
// experimental feature
class BlackHole extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("blackhole"));
    scene.add.existing(this);
    blackHoles.push(this);
    scene.physics.add.existing(this);
  }
}

// Define the game
const game = new Phaser.Game(config);

// asset locations
const images = {
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

// compile time image name checking
function image(name: keyof typeof images) {
  return name;
}

function preload(this: Phaser.Scene) {
  for (const name in images) {
    this.load.image(name, images[name as keyof typeof images]);
    this.load.spritesheet("SpaceS2", "assets/Space Ship 2 Hearts.png", {
      frameWidth: 250,
      frameHeight: 250,
    });
    this.load.spritesheet("UFO2", "assets/UFO 2 Hearts.png", {
      frameWidth: 250,
      frameHeight: 250,
    });
    this.load.spritesheet("SUEXPLODE", "assets/Exploding object.png", {
      frameWidth: 250,
      frameHeight: 250,
    });
    this.load.spritesheet("AEXPLODE", "assets/ASTEROID BREAK.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
  }
}

let spaceship: Spaceship;
let ufo: UFO;
const asteroids: Asteroid[] = [];
let asteroidsToRemove: Asteroid[] = [];

const stars: Phaser.GameObjects.Arc[] = [];

let scene: Phaser.Scene;

function create(this: Phaser.Scene) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "e") {
      editorMode = !editorMode;
    } else if (event.key === "a") {
      asteroids.push(
        new Asteroid(
          this,
          this.game.input.mousePointer.x,
          this.game.input.mousePointer.y
        )
      );
    } else if (event.key === "s") {
      prompt(
        "level code:",
        createLevelFromGameObjects(spaceship, ufo, asteroids)
      );
    } else if (event.key === "d") {
      safeRemove(getClosestObject(this) as Asteroid, asteroids);
    }
  });

  scene = this;
  for (let i = 0; i < 100; i++)
    stars.push(
      this.add.circle(
        getRandomInt(0, this.renderer.width),
        getRandomInt(0, this.renderer.height),
        getRandomDouble(0.5, 3),
        0xffffff
      )
    );

  spaceship = new Spaceship(this, spaceshipSpawnX, spaceshipSpawnY);
  ufo = new UFO(this, ufoSpawnX, ufoSpawnY);

  loadObjectsFromLevel(this, JSON.parse(level1) as Level);

  // for (let i = 0; i < asteroidCount; i++) {
  //   // if an asteroid is chosen to be spawned
  //   if (getRandomInt(0, 99) < asteroidSpawnChance) {
  //     asteroidSpawnChance -= 10;
  //     // create asteroid and add colliders
  //     asteroids.push(
  //       new Asteroid(
  //         this,
  //         getRandomInt(asteroidSpawnXMin, asteroidSpawnXMax),
  //         asteroidSpawnYMin + i * asteroidHeight
  //       )
  //     );
  //   } else {
  //     asteroidSpawnChance += 10;
  //   }
  // }

  this.physics.add.collider(spaceship, asteroids);
  this.physics.add.collider(ufo, asteroids);
  this.physics.add.collider(spaceship, ufo);

  // const moveInput = document.querySelector("#angleMove") as HTMLInputElement;
  // const moveButton = document.querySelector("#move") as HTMLButtonElement;

  // moveButton.addEventListener("click", () => {
  //   // move at x degrees,
  //   // offset bullet position so it appears to emerge from sprite's gun
  //   spaceship.moveAngle(-parseInt(moveInput.value));
  // });

  smartCollider(this, bullets, asteroids, (bullet, astroid) => {
    safeRemove(bullet, bulletsToRemove);
    safeRemove(astroid, asteroidsToRemove);
  });
  smartCollider(this, bullets, spaceship, (bullet, spaceship) => {
    if (bullet instanceof UFOLaser) {
      spaceship.health--;
      if (spaceship.health == 2) {
      } /*
      if(spaceship.health == 1){
        
      }
      if(spaceship.health == 0){

      }*/
      if (spaceship.health == 0) {
        this.anims.create({
          key: "SUEXPLODE",
          frames: this.anims.generateFrameNumbers("SUEXPLODE", {
            start: 0,
            end: 8,
          }),
          frameRate: 20,
          repeat: 0,
          hideOnComplete: true,
        });
        spaceship.play("SUEXPLODE");
        //spaceship.setVisible(false);
        spaceship.disableBody(true, true);
        GameOver = true;
        endGame("UFO_WIN");
      }
      safeRemove(bullet, bulletsToRemove);
    }
  });
  smartCollider(this, bullets, ufo, (bullet, ufo) => {
    if (bullet instanceof SpaceshipLaser) {
      ufo.health--;
      if (ufo.health == 2) {
      }
      if (ufo.health == 1) {
      }
      if (ufo.health == 0) {
        ufo.disableBody(true, true);
        var manCamera = this.cameras.main;
        manCamera.shake(250);
        endGame("SPACESHIP_WIN");
      }
      safeRemove(bullet, bulletsToRemove);
    }
  });

  const allActions = {
    up(v: Vehicle) {
      v.moveUp();
    },
    down(v: Vehicle) {
      v.moveDown();
    },
    left(v: Vehicle) {
      v.moveLeft();
    },
    right(v: Vehicle) {
      v.moveRight();
    },
    shoot(v: Vehicle) {
      v.shoot(getRandomInt(0, 360));
    },
  } satisfies Record<string, (v: Vehicle) => void>;

  // the list of actions as a static union
  type Action = keyof typeof allActions;

  const runButton = document.querySelector("#run") as HTMLButtonElement;
  runButton.addEventListener("click", () => {
    C4C.Interpreter.run(C4C.Editor.getText().replace(/forever/, "100000"));
  });
}

const smartCollider = <
  A extends Phaser.Types.Physics.Arcade.GameObjectWithBody,
  B extends Phaser.Types.Physics.Arcade.GameObjectWithBody
>(
  scene: Phaser.Scene,
  a: A | A[],
  b: B | B[],
  callback: (a: A, b: B) => void
) => {
  scene.physics.add.collider(a, b, callback as ArcadePhysicsCallback);
};

const smartOverlap = <
  A extends Phaser.Types.Physics.Arcade.GameObjectWithBody,
  B extends Phaser.Types.Physics.Arcade.GameObjectWithBody
>(
  scene: Phaser.Scene,
  a: A | A[],
  b: B | B[],
  callback: (a: A, b: B) => void
) => {
  scene.physics.add.overlap(a, b, callback as ArcadePhysicsCallback);
};

const safeRemove = <T extends { destroy(): void }>(t: T, toRemove: T[]) => {
  t.destroy();
  toRemove.push(t);
};

let lastCodeAction = 0;

let clicking = false;
let selectedObject: Phaser.Physics.Arcade.Sprite | undefined = undefined;

function update(this: Phaser.Scene) {
  if (gameState !== "PLAYING") return;
  if (clicking && selectedObject !== undefined) {
    selectedObject.x = game.input.mousePointer.x;
    selectedObject.y = game.input.mousePointer.y;
  }
  var x;
  var y;
  if (game.input.mousePointer.isDown) {
    if (!clicking) {
      clicking = true;
      if (editorMode) {
        selectedObject = getClosestObject(this);
      }
    }
    x = game.input.mousePointer.x;
    y = game.input.mousePointer.y;
    const box = document.getElementById("XY") as HTMLDivElement;
    box.innerHTML = "x" + Math.round(x) + "y" + Math.round(y);
  } else {
    if (clicking) {
      clicking = false;
      console.log("not clicking");
    }
  }

  if (Date.now() - lastCodeAction > 500 && actionQueue.length > 0) {
    actionQueue[0]();
    actionQueue.splice(0, 1);
    lastCodeAction = Date.now();
  }

  var decelerationFactor = 0.6;

  spaceship.body.velocity.x *= decelerationFactor;
  spaceship.body.velocity.y *= decelerationFactor;
  ufo.body.velocity.x *= decelerationFactor;
  ufo.body.velocity.y *= decelerationFactor;

  bulletsToRemove.forEach((b) => bullets.splice(bullets.indexOf(b), 1));
  asteroidsToRemove.forEach((a) => asteroids.splice(asteroids.indexOf(a), 1));

  bulletsToRemove = [];
  asteroidsToRemove = [];

  if (GameOver == true) {
    game.destroy(true);
  }

  bullets.forEach((bullet) => {
    if (
      bullet.body.position.x < -bullet.body.width ||
      bullet.body.position.x > this.renderer.width + bullet.body.width ||
      bullet.body.position.y < -bullet.body.height ||
      bullet.body.position.y > this.renderer.height + bullet.body.height
    ) {
      safeRemove(bullet, bulletsToRemove);
    }
    blackHoles.forEach((hole) => {
      const holePos = hole.body.position
        .clone()
        .add(new Phaser.Math.Vector2(hole.width / 2, hole.height / 2));
      const rHat = holePos.clone().subtract(bullet.body.position).normalize();
      bullet.body.velocity.add(rHat);
    });
  });

  stars.forEach((star) => {
    star.x -= star.radius * 0.2;
    if (star.x < 0) star.x += this.renderer.width;
  });
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomDouble(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// todo: convert to new interpreter actions
// function ufoTurn() {
//   const actions: Action[] = [];
//   for (let i = 0; i < 20; i++) {
//     actions.push(randomAction());
//   }
//   runActions(actions, ufo);
// }

// testing code:
/*
10 times
  25 times
    down
    shoot
  end
  25 times
    up
    shoot
  end
end
*/

const endGame = (state: GameState) => {
  gameState = state;
  document.querySelector(".status")!.innerHTML =
    state === "SPACESHIP_WIN" ? "YOU WIN!" : "YOU LOSE!";
};

const getClosestObject = (scene: Phaser.Scene) => {
  const closestObject = [spaceship, ufo, ...asteroids]
    .map((o) => ({
      distance: Math.sqrt(
        Math.pow(game.input.mousePointer.x - o.body.x, 2) +
          Math.pow(game.input.mousePointer.y - o.body.y, 2)
      ),
      o,
    }))
    .reduce((currentClosest, o) =>
      o.distance < currentClosest.distance ? o : currentClosest
    ).o;
  return closestObject;
};
