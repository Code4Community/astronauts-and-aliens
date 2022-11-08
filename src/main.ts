import "./style.css";
import * as Phaser from "phaser";

// screen size and camera
const screenWidth = 1000;
const scrollWidth = 2 * screenWidth; // width of the rolling screen
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
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("bullet"));
    scene.add.existing(this);
    this.setScale(0.3);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    bullets.push(this);
  }
}

class Spaceship extends Phaser.Physics.Arcade.Sprite {
  vx: number = 0;
  vy: number = 0;
  alive: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // When we determine the file name of the sprite for spaceship we need
    // to replace 'Spaceship' with the file name
    super(scene, x, y, image("spaceship"));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.8, 0.8);
    this.setBounce(0.3);
    this.setCollideWorldBounds(true);
  }

  moveUp() {
    this.setVelocityY(-spaceshipVelocity);
    this.vy = -spaceshipVelocity;
  }

  moveDown() {
    this.setVelocityY(spaceshipVelocity);
    this.vy = spaceshipVelocity;
  }

  moveLeft() {
    this.setVelocityX(-spaceshipVelocity);
    this.vx = -spaceshipVelocity;
  }

  moveRight() {
    this.setVelocityX(spaceshipVelocity);
    this.vx = spaceshipVelocity;
  }

  shoot(angle: number) {
    const bullet = new Bullet(this.scene, this.x, this.y);
    bullet.setVelocityX(200 * Math.cos((angle / 360) * 2 * Math.PI));
    bullet.setVelocityY(200 * Math.sin((angle / 360) * 2 * Math.PI));
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

// Define the game
var game = new Phaser.Game(config);

const images = {
  nightSky: "assets/BACKROUND.png",
  ground: "assets/Obstacle.png",
  rover: "assets/Rover.png",
  num1: "assets/numbers/number1.png",
  num2: "assets/numbers/number2.png",
  num3: "assets/numbers/number3.png",
  spaceship: "assets/Space Ship 3 Hearts.png",
  asteroid: "assets/Small Asteroid.png",
  bullet: "assets/bullet.png",
} as const;

// compile time image name checking
function image(name: keyof typeof images) {
  return name;
}

function preload(this: Phaser.Scene) {
  for (const name in images) {
    this.load.image(name, images[name as keyof typeof images]);
  }
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
const asteroids: Asteroid[] = [];

function create(this: Phaser.Scene) {
  for (let i = 0; i < 100; i++)
    this.add.circle(
      getRandomInt(0, this.renderer.width),
      getRandomInt(0, this.renderer.height),
      getRandomDouble(0.5, 3),
      0xffffff
    );

  spaceship = new Spaceship(this, spaceshipSpawnX, spaceshipSpawnY);

  document.addEventListener("keydown", (event) => {
    if (event.key === "w") spaceship.moveUp();
    if (event.key === "a") spaceship.moveLeft();
    if (event.key === "s") spaceship.moveDown();
    if (event.key === "d") spaceship.moveRight();
    if (event.key === "q") spaceship.shoot(45);
  });

  // placing the asteroids
  for (let i = 0; i < asteroidCount; i++) {
    asteroids[i] = new Asteroid(
      this,
      getRandomInt(asteroidSpawnXMin, asteroidSpawnXMax),
      getRandomInt(asteroidSpawnYMin, asteroidSpawnYMax)
    );

    this.physics.add.collider(spaceship, asteroids[i]);
  }

  // this.physics.add.collider(ufo, asteroids);
  // this.physics.add.collider(laser, asteroids);

  const input = document.querySelector("#angle") as HTMLInputElement;
  const runButton = document.querySelector("#run") as HTMLButtonElement;

  runButton.addEventListener("click", () => {
    spaceship.shoot(-parseInt(input.value));
  });
}

function update(this: Phaser.Scene) {
  spaceship.vx *= 0.98;
  spaceship.vy *= 0.98;
  spaceship.setVelocityX(spaceship.vx);
  spaceship.setVelocityY(spaceship.vy);

  // this.physics.collide(laser, asteroids, impact);
}

//  function impact(laser, asteroid) {
//  asteroid.destroy();
//  laser.setActive(false).setVisible(false);
//  }

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getRandomDouble(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
