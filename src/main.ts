import "./style.css";
import * as Phaser from "phaser";
// @ts-ignore
import C4C from "c4c-lib";
import Asteroid from "./objects/asteroid";
import BlackHole from "./objects/blackhole";
import Bullet from "./objects/bullet";
import Spaceship from "./objects/spaceship";
import SpaceshipLaser from "./objects/spaceshiplaser";
import UFO from "./objects/ufo";
import UFOLaser from "./objects/ufolaser";
import Vehicle from "./objects/vehicle";
import { screenWidth, screenHeight, spaceshipSpawnY, 
  spaceshipSpawnX, ufoSpawnY,
  ufoSpawnX, asteroidSpawnXMin,
  asteroidSpawnXMax, asteroidSpawnYMin,
  asteroidCount, asteroidHeight, asteroids, bullets, blackHoles, images } from './consts'
import { getRandomInt, getRandomDouble, endGame } from './utils'

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

let GameOver: boolean = false;

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

// array of bullets, each fired bullet is appended here
let bulletsToRemove: Bullet[] = [];

let asteroidSpawnChance = 90; // percent chance to spawn asteroid

// Define the game
const game = new Phaser.Game(config);


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
let asteroidsToRemove: Asteroid[] = [];

const stars: Phaser.GameObjects.Arc[] = [];

let scene: Phaser.Scene;

function create(this: Phaser.Scene) {
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

  for (let i = 0; i < asteroidCount; i++) {
    // if an asteroid is chosen to be spawned
    if (getRandomInt(0, 99) < asteroidSpawnChance) {
      asteroidSpawnChance -= 10;
      // create asteroid and add colliders
      asteroids[i] = new Asteroid(
        this,
        getRandomInt(asteroidSpawnXMin, asteroidSpawnXMax),
        asteroidSpawnYMin + i * asteroidHeight
      );
    } else {
      asteroidSpawnChance += 10;
    }
  }

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
      if (ufo.health == 2) {
        this.anims.create({
          key: "UFO2",
          frames: this.anims.generateFrameNumbers("UFO2", { start: 0, end: 6 }),
          frameRate: 20,
          repeat: 0,
        });
      }
      if (spaceship.health == 2) {
        this.anims.create({
          key: "SpaceS2",
          frames: this.anims.generateFrameNumbers("SpaceS2", {
            start: 0,
            end: 0,
          }),
          frameRate: 20,
          repeat: 0,
        });
      }
      if (spaceship.health == 1) {
        this.anims.create({
          key: "SpaceS1",
          frames: this.anims.generateFrameNumbers("SpaceS1", {
            start: 0,
            end: 0,
          }),
          frameRate: 20,
          repeat: 0,
        });
      }
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
        endGame(scene, spaceship);
      }
      safeRemove(bullet, bulletsToRemove);
    }
  });
  smartCollider(this, bullets, ufo, (bullet, ufo) => {
    if (bullet instanceof SpaceshipLaser) {
      ufo.health--;
      if (ufo.health == 2) {
        this.anims.create({
          key: "UFO2",
          frames: this.anims.generateFrameNumbers("UFO2", { start: 0, end: 6 }),
          frameRate: 20,
          repeat: 0,
        });
      }
      if (ufo.health == 1) {
        this.anims.create({
          key: "UFO1",
          frames: this.anims.generateFrameNumbers("UFO1", { start: 0, end: 0 }),
          frameRate: 20,
          repeat: 0,
        });
      }
      if (ufo.health == 0) {
        ufo.disableBody(true, true);
        var manCamera = this.cameras.main;
        manCamera.shake(250);
        endGame(scene, ufo);
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

function update(this: Phaser.Scene) {
  if (gameState !== "PLAYING") return;
  var x;
  var y;
  if (game.input.mousePointer.isDown) {
    x = game.input.mousePointer.x;
    y = game.input.mousePointer.y;
    const box = document.getElementById("XY") as HTMLDivElement;
    box.innerHTML = "x" + Math.round(x) + "y" + Math.round(y);
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
    /*
     * This is the place to implement ability to play a new game
     */
    //game.destroy(true);
    const resetButton = document.querySelector("#restart") as HTMLButtonElement;
    resetButton.addEventListener("click", () => {
      //Delete All Asteroids, Stars, and Black Holes
      GameOver = false;
      //TODO
      //Re-spawn Asteroids, Stars, and Black Holes
      //RESPAWN STARS
      // for (let i = 0; i < 100; i++){
      //   stars.push(
      //   this.add.circle(
      //     getRandomInt(0, this.renderer.width),
      //     getRandomInt(0, this.renderer.height),
      //     getRandomDouble(0.5, 3),
      //     0xffffff
      //     )
      //   );
      // }
      //Delete ASTEROIDS
      for (let i = 0; i < asteroidCount; i++) {
        try {
          asteroids[i].disableBody(true, true);
        } catch (err) {
          //Catching Error that body is already disabled
          //Do Nothing Here
        }
      }
      asteroids.splice(0, asteroids.length);
      asteroidsToRemove = [];
      asteroidSpawnChance = 90;
      for (let i = 0; i < asteroidCount; i++) {
        // if an asteroid is chosen to be spawned
        asteroids[i];
        if (getRandomInt(0, 99) < asteroidSpawnChance) {
          asteroidSpawnChance -= 10;
          // create asteroid and add colliders
          asteroids[i] = new Asteroid(
            this,
            getRandomInt(asteroidSpawnXMin, asteroidSpawnXMax),
            asteroidSpawnYMin + i * asteroidHeight
          );
        } else {
          asteroidSpawnChance += 10;
        }
      }

      //figure out how to do black holes -- Not Needed for now

      //Re-Enable UFO and Asteroid

      ufo.resetVehicle();
      spaceship.resetVehicle();
    });
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

