import "./style.css";
import * as Phaser from "phaser";
// @ts-ignore
import C4C from "c4c-lib";

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

type GameState = "PLAYING" | "UFO_WIN" | "SPACESHIP_WIN" | "END_GAME" | "CLOSE_GAME";

let gameState: GameState = "PLAYING";

let pauseGameText = null;

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
class Vehicle extends Phaser.Physics.Arcade.Sprite {
  alive: boolean = true;
  velo: number;
  bulletType: typeof Bullet;
  health: number;
  initX: number;
  initY: number;
  initPicture: keyof typeof images;
  initVelo: number;

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

    this.initX = x;
    this.initY = y;
    this.initPicture = picture;
    this.initVelo = velo;
  }

  resetVehicle() {
    this.health = 3;
    this.alive = true;
    this.enableBody(true, this.initX, this.initY, true, true);
    this.setVisible(true);
    this.velo = this.initVelo;

    this.type;
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
    this.type = "spaceship";
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
    this.type = "ufo";
  }
}

// class for asteroids
class Asteroid extends Phaser.Physics.Arcade.Sprite {
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

  const resetButton = document.querySelector("#restart") as HTMLButtonElement;
  resetButton.addEventListener("click", () => {restartGame});
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

function restartGame(){
      if(gameState != "END_GAME"){
        return;
      }  
      gameState = "PLAYING";
      game.scene.resume("default");
      pauseGameText.setVisible(false);
  /*
    * This is the place to implement ability to play a new game
    */
    //game.destroy(true);
    
          //Delete All Asteroids, Stars, and Black Holes 
          GameOver=false;
          //Delete ASTEROIDS
          for(let i = 0; i<asteroidCount; i++){
            try {
              asteroids[i].disableBody(true,true);
            }
            catch(err) {
              //Catching Error that body is already disabled
              //Do Nothing Here
            }
            
          }
          asteroids.splice(0,asteroids.length)
          asteroidsToRemove = [];
          asteroidSpawnChance = 90;
          for (let i = 0; i < asteroidCount; i++) {
            // if an asteroid is chosen to be spawned
            asteroids[i] ;
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
          //Re-Enable UFO and Asteroid
          

          ufo.resetVehicle();
          spaceship.resetVehicle();

}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomDouble(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function endGame(scene: Phaser.Scene, vehicle: Vehicle) {
  game.scene.pause("default");
  // bullets.forEach(function (bullet) {
  //     bullet.destroy();
  // });
  // Display words "GAME OVER"
  console.log("GAME OVER!");
  scene.add
    .text(screenWidth / 2, screenHeight / 2, "GAME OVER", { fontSize: "75px" })
    .setOrigin(0.5);
  let textMessage: [string, string];
  textMessage =
    vehicle.type == "spaceship"
      ? ["BUMMER! YOU LOST!", "red"]
      : ["CONGRATULATIONS! YOU WIN!", "green"];
  pauseGameText = scene.add
    .text(screenWidth / 2, screenHeight / 2 + 100, textMessage[0], {
      fontSize: "50px",
      color: textMessage[1],
    })
    .setOrigin(0.5);
    gameState = "END_GAME";
  return;
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

