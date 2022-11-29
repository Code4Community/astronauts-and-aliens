import "./style.css";
import * as Phaser from "phaser";

// screen size and camera
const screenWidth = 1000;
const screenHeight = 600;

// asteroid parameters
const asteroidScreenMargin = 40;
const asteroidCount = 6;
const asteroidSpawnXMin = screenWidth / 2 - 200;
const asteroidSpawnXMax = screenWidth / 2 + 200;
const asteroidSpawnYMin = 0;
const asteroidSpawnYMax = screenHeight;

// spaceship parameters
const spaceshipSpawnY = screenHeight / 2;
const spaceshipSpawnX = screenWidth / 2;
const spaceshipVelocity = 140;

//ufo parameters
const ufoSpawnY = screenHeight / 2;
const ufoSpawnX = screenWidth / 2;
const ufoVelocity = 140;

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
    this.setCollideWorldBounds(true);
    bullets.push(this);
  }
}
class UFOLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("lazerUFO"));
  }
}

class SpaceshipLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("lazerSpaceship"));
  }
}

class Vehicle extends Phaser.Physics.Arcade.Sprite {
  alive: boolean = true;
  velo: number;
  bulletType: typeof Bullet;

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

  shoot(angle: number) {
    // 'bullet' argument is only there bc Bullet constructor has 4 parameters. SpaceshipLaser and UFOLaser each have 3 parameters.
    // However, this.bulletType should never be Bullet, it should always be SpaceshipLaser or UFOLaser.
    const laser = new this.bulletType(this.scene, this.x, this.y, "bullet");
    laser.setVelocityX(200 * Math.cos((angle / 360) * 2 * Math.PI));
    laser.setVelocityY(200 * Math.sin((angle / 360) * 2 * Math.PI));
  }
}

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

const blackHoles: BlackHole[] = [];

class BlackHole extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("blackhole"));
    scene.add.existing(this);
    blackHoles.push(this);
    scene.physics.add.existing(this);
  }
}

// Define the game
var game = new Phaser.Game(config);

const images = {
  spaceship: "assets/Space Ship 3 Hearts.png",
  ufo: "assets/UFO 3 Hearts.png",
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
    if (event.key === "w") spaceship.moveUp();
    if (event.key === "a") spaceship.moveLeft();
    if (event.key === "s") spaceship.moveDown();
    if (event.key === "d") spaceship.moveRight();
    if (event.key === "q") spaceship.shoot(45);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") ufo.moveUp();
    if (event.key === "ArrowLeft") ufo.moveLeft();
    if (event.key === "ArrowDown") ufo.moveDown();
    if (event.key === "ArrowRight") ufo.moveRight();
    if (event.key === "p") ufo.shoot(45);
  });

  // placing the asteroids
  for (let i = 0; i < asteroidCount; i++) {
    asteroids[i] = new Asteroid(
      this,
      getRandomInt(asteroidSpawnXMin, asteroidSpawnXMax),
      getRandomInt(asteroidSpawnYMin, asteroidSpawnYMax)
    );

    this.physics.add.collider(spaceship, asteroids[i]);
    this.physics.add.collider(ufo, asteroids[i]);
    this.physics.add.collider(spaceship, ufo);
  }

  const input = document.querySelector("#angle") as HTMLInputElement;
  const runButton = document.querySelector("#run") as HTMLButtonElement;

  runButton.addEventListener("click", () => {
    spaceship.shoot(-parseInt(input.value));
  });

  // for (let i = 0; i < 10; i++) {
  //   new BlackHole(this, getRandomInt(1, 1000), getRandomInt(1, 1000));
  // }
}

function update(this: Phaser.Scene) {
  spaceship.body.velocity.x *= 0.98;
  spaceship.body.velocity.y *= 0.98;
  ufo.body.velocity.x *= 0.98;
  ufo.body.velocity.y *= 0.98;

  bullets.forEach((bullet) => {
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
