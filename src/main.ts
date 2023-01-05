import "./style.css";
import * as Phaser from "phaser";
import { Peer, DataConnection } from "peerjs";

// screen size and camera
const screenWidth = 1000;
const screenHeight = 600;

// spaceship parameters
const spaceshipSpawnY = screenHeight / 2;
const spaceshipSpawnX = screenWidth / 2 - screenWidth / 2.5;
const spaceshipVelocity = 140;

//ufo parameters
const ufoSpawnY = screenHeight / 2;
const ufoSpawnX = screenWidth / 2 + screenWidth / 2.5;
const ufoVelocity = 140;

let peer: Peer;
let connection: DataConnection;
let player: Player;

enum Player {
  SPACESHIP,
  UFO,
}

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

const bullets: Bullet[] = [];
let bulletsToRemove: Bullet[] = [];

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    picture: keyof typeof images
  ) {
    super(scene, x, y, picture);
    scene.add.existing(this);
    this.setScale(0.3);
    scene.physics.add.existing(this);
    bullets.push(this);
  }
}
class UFOLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "lazerUFO");
  }
}

class SpaceshipLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "lazerSpaceship");
  }
}

type BulletConstructor = {
  new (scene: Phaser.Scene, x: number, y: number): Bullet;
};

// declare global {
//   namespace Phaser.Physics {
//     interface Arcade {
//       Sprite: {
//         new (
//           scene: Phaser.Scene,
//           x: number,
//           y: number,
//           texture: keyof typeof images | Phaser.Textures.Texture,
//           frame?: string | number
//         ): Phaser.Physics.Arcade.Sprite;
//       };
//     }
//   }
// }

class Vehicle extends Phaser.Physics.Arcade.Sprite {
  alive: boolean = true;
  velo: number;
  bulletType: BulletConstructor;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    picture: keyof typeof images,
    velo: number,
    bulletType: BulletConstructor
  ) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, picture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
    this.velo = velo;
    this.bulletType = bulletType;
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

  shoot(angle: number, xOffset = 0, yOffset = 0) {
    // 'bullet' argument is only there bc Bullet constructor has 4 parameters. SpaceshipLaser and UFOLaser each have 3 parameters.
    // However, this.bulletType should never be Bullet, it should always be SpaceshipLaser or UFOLaser.
    const laser = new this.bulletType(
      this.scene,
      this.x - xOffset,
      this.y - yOffset
    );
    laser.setVelocityX(200 * Math.cos((angle / 360) * 2 * Math.PI));
    laser.setVelocityY(200 * Math.sin((angle / 360) * 2 * Math.PI));
  }
}

class Spaceship extends Vehicle {
  alive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, "spaceship", spaceshipVelocity, SpaceshipLaser);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
  }
}

class UFO extends Vehicle {
  alive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, "ufo", ufoVelocity, UFOLaser);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
  }
}

class Asteroid extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, "asteroid");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }
}

const blackHoles: BlackHole[] = [];

class BlackHole extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "blackhole");
    scene.add.existing(this);
    blackHoles.push(this);
    scene.physics.add.existing(this);
  }
}

// Define the game
var game = new Phaser.Game(config);

const images: Record<string, string> = {
  spaceship: "assets/Space Ship 3 Hearts.png",
  ufo: "assets/UFO 3 Hearts.png",
  asteroid: "assets/Small Asteroid.png",
  bullet: "assets/bullet.png",
  blackhole: "assets/blackhole.png",
  lazerSpaceship: "assets/LAZER SPACE SHIP.png",
  lazerUFO: "assets/LAZER UFO.png",
} as const;

function preload(this: Phaser.Scene) {
  for (const name in images) {
    this.load.image(name, images[name as keyof typeof images]);
  }
  this.load.glsl("fireball", "assets/shader0.frag");
  //   this.load.spritesheet("humanobstacle", "assets/humanObstacles.png", {
  //     frameWidth: 64,
  //     frameHeight: 64,
  //   });
  //   this.load.spritesheet("astronautidle", "assets/astroidle2.png", {
  //     frameWidth: 64,
  //     frameHeight: 64,
  //   });
  //   this.load.spritesheet("alienidle", "assets/alienidle.png", {
  //     frameWidth: 64,
  //     frameHeight: 64,
  //   });
}

let spaceship: Spaceship;
let ufo: UFO;
const asteroids: Asteroid[] = [];
let asteroidsToRemove: Asteroid[] = [];

const stars: Phaser.GameObjects.Arc[] = [];

function create(this: Phaser.Scene) {
  for (let i = 0; i < 100; i++)
    stars.push(
      this.add.circle(
        getRandomInt(0, this.renderer.width),
        getRandomInt(0, this.renderer.height),
        getRandomDouble(0.5, 3),
        0xffffff
      )
    );

  // this.add.shader(
  //   "fireball",
  //   this.renderer.width / 2,
  //   this.renderer.height / 2,
  //   this.renderer.width,
  //   this.renderer.height
  // );

  spaceship = new Spaceship(this, spaceshipSpawnX, spaceshipSpawnY);
  ufo = new UFO(this, ufoSpawnX, ufoSpawnY);

  document.addEventListener("keydown", (event) => {
    let cancel = true;
    const vehicle = player === Player.SPACESHIP ? spaceship : ufo;
    if (event.key === "w") {
      vehicle.moveUp();
      connection.send({ type: "up" });
    } else if (event.key === "a") {
      vehicle.moveLeft();
      connection.send({ type: "left" });
    } else if (event.key === "s") {
      vehicle.moveDown();
      connection.send({ type: "down" });
    } else if (event.key === "d") {
      vehicle.moveRight();
      connection.send({ type: "right" });
    } else if (event.key === "q") {
      if (vehicle === spaceship) {
        vehicle.shoot(0, -102, 6);
      } else {
        vehicle.shoot(180, 88, 27);
      }
      connection.send({ type: "shoot" });
    } else cancel = false;
    if (cancel) event.preventDefault();
  }); // placing the asteroids

  const asteroidSpawnXMin = screenWidth / 2 - screenWidth / 4;
  const asteroidSpawnXMax = screenWidth / 2 + screenWidth / 4;

  const asteroidSpawnYMin = 50;
  const asteroidSpawnYMax = screenHeight - 50;

  const asteroidCount = 8;
  const asteroidHeight =
    (asteroidSpawnYMax - asteroidSpawnYMin) / asteroidCount;
  let asteroidSpawnChance = 90; //percent chance to spawn asteroid

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

  const input = document.querySelector("#angle") as HTMLInputElement;
  const runButton = document.querySelector("#run") as HTMLButtonElement;

  runButton.addEventListener("click", () => {
    // shoot at 180 degrees,
    // offset bullet position so it appears to emerge from sprite's gun
    spaceship.shoot(-parseInt(input.value), -102, 6);
  });

  const startMultiplayerButton = document.querySelector(
    "#begin-multiplayer"
  ) as HTMLButtonElement;
  const joinMultiplayerButton = document.querySelector(
    "#join-multiplayer"
  ) as HTMLButtonElement;

  const randomID = (length: number) => {
    const letters = [...Array(26).keys()].map((i) =>
      String.fromCharCode(i + "A".charCodeAt(0))
    );
    return Array(length)
      .fill(0)
      .map((_) => letters[getRandomInt(0, letters.length)])
      .join("");
  };

  const PREFIX = "astronauts-and-aliens-";

  startMultiplayerButton.addEventListener("click", () => {
    const code = randomID(5);
    peer = new Peer(`${PREFIX}${code}`);
    player = Player.SPACESHIP;
    alert(`Your game code is ${code}.`);
    peer.on("open", () => {
      peer.on("connection", (c) => {
        connection = c;
        connection.on("open", () => {
          connection.on("data", (data) =>
            handleData(data as MultiplayerDataPacket)
          );
        });
      });
    });
  });

  joinMultiplayerButton.addEventListener("click", () => {
    const code = prompt(`Enter the game code:`);
    peer = new Peer();
    player = Player.UFO;
    peer.on("open", () => {
      connection = peer.connect(`${PREFIX}${code}`);
      connection.on("open", () => {
        connection.on("data", (data) =>
          handleData(data as MultiplayerDataPacket)
        );
      });
    });
  });

  // for (let i = 0; i < 10; i++) {
  //   new BlackHole(this, getRandomInt(1, 1000), getRandomInt(1, 1000));
  // }

  smartCollider(this, bullets, asteroids, (bullet, asteroid) => {
    bullet.destroy();
    asteroid.destroy();
    bulletsToRemove.push(bullet);
    asteroidsToRemove.push(asteroid);
  });
  smartCollider(this, bullets, spaceship, (bullet, spaceship) => {
    if (bullet instanceof UFOLaser) {
      spaceship.setVisible(false);
      bullet.destroy();
      bulletsToRemove.push(bullet);
    }
  });
  smartCollider(this, bullets, ufo, (bullet, ufo) => {
    if (bullet instanceof SpaceshipLaser) {
      ufo.setVisible(false);
      bullet.destroy();
      bulletsToRemove.push(bullet);
    }
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

function update(this: Phaser.Scene) {
  spaceship.body.velocity.x *= 0.98;
  spaceship.body.velocity.y *= 0.98;
  ufo.body.velocity.x *= 0.98;
  ufo.body.velocity.y *= 0.98;

  bulletsToRemove.forEach((b) => bullets.splice(bullets.indexOf(b), 1));
  asteroidsToRemove.forEach((a) => asteroids.splice(asteroids.indexOf(a), 1));

  bulletsToRemove = [];
  asteroidsToRemove = [];

  bullets.forEach((bullet) => {
    if (
      bullet.body.position.x < -bullet.body.width ||
      bullet.body.position.x > this.renderer.width + bullet.body.width ||
      bullet.body.position.y < -bullet.body.height ||
      bullet.body.position.y > this.renderer.height + bullet.body.height
    ) {
      bullet.destroy();
      bulletsToRemove.push(bullet);
      return;
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

abstract class Action {
  abstract run(): Promise<void>;
}

async function runActions(actions: Action[]) {
  await actions[0].run();
  setTimeout(() => runActions(actions.slice(1)), 1000);
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomDouble(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

type MultiplayerDataPacket =
  | {
      type: "shoot" | "up" | "down" | "left" | "right";
    }
  | {
      type: "asteroid";
      position: { x: number; y: number };
    };

const handleData = (data: MultiplayerDataPacket) => {
  const otherVehicle = player === Player.SPACESHIP ? ufo : spaceship;
  switch (data.type) {
    case "shoot":
      if (player === Player.SPACESHIP) {
        otherVehicle.shoot(180, 88, 27);
      } else {
        otherVehicle.shoot(0, -102, 6);
      }
      break;
    case "up":
      otherVehicle.moveUp();
      break;
    case "down":
      otherVehicle.moveDown();
      break;
    case "left":
      otherVehicle.moveLeft();
      break;
    case "right":
      otherVehicle.moveRight();
      break;
    case "asteroid":
      break;
  }
};
