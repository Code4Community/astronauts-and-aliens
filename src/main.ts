import "./style.css";
import * as Phaser from "phaser";

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
var game = new Phaser.Game(config);

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
  }
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

  spaceship = new Spaceship(this, spaceshipSpawnX, spaceshipSpawnY);
  ufo = new UFO(this, ufoSpawnX, ufoSpawnY);

  document.addEventListener("keydown", (event) => {
    let cancel = true;
    if (event.key === "w") spaceship.moveUp();
    else if (event.key === "a") spaceship.moveLeft();
    else if (event.key === "s") spaceship.moveDown();
    else if (event.key === "d") spaceship.moveRight();
    else if (event.key === "q") spaceship.shoot(0, -102, 6);
    else cancel = false;
    if (cancel) event.preventDefault();
  });

  document.addEventListener("keydown", (event) => {
    let cancel = true;
    if (event.key === "ArrowUp") ufo.moveUp();
    else if (event.key === "ArrowLeft") ufo.moveLeft();
    else if (event.key === "ArrowDown") ufo.moveDown();
    else if (event.key === "ArrowRight") ufo.moveRight();
    // shoot at 180 degrees,
    // offset bullet position so it appears to emerge from sprite's gun
    else if (event.key === "p") ufo.shoot(180, 88, 27);
    else cancel = false;
    if (cancel) event.preventDefault();
  });

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

  const moveInput = document.querySelector("#angleMove") as HTMLInputElement;
  const moveButton = document.querySelector("#move") as HTMLButtonElement;

  moveButton.addEventListener("click", () => {
    // move at x degrees,
    // offset bullet position so it appears to emerge from sprite's gun
    spaceship.moveAngle(-parseInt(moveInput.value));
  });

  smartCollider(this, bullets, asteroids, (bullet, astroid) => {
    safeRemove(bullet, bulletsToRemove);
    safeRemove(astroid, asteroidsToRemove);
  });
  smartOverlap(this, bullets, spaceship, (bullet, spaceship) => {
    if (bullet instanceof UFOLaser) {
      spaceship.health--;
<<<<<<< HEAD
      if(spaceship.health == 2){

      }
      if(spaceship.health == 1){
        
      }
      if(spaceship.health == 0){
=======
      if (spaceship.health == 0) {
>>>>>>> 18d6d1aa65190af30854f6feab56d30b12b9e036
        spaceship.setVisible(false);
      }
      safeRemove(bullet, bulletsToRemove);
    }
  });
  smartOverlap(this, bullets, ufo, (bullet, ufo) => {
    if (bullet instanceof SpaceshipLaser) {
      ufo.health--;
<<<<<<< HEAD
      if(ufo.health == 2){
        
      }
      if(ufo.health == 1){
        
      }
      if(ufo.health == 0){
=======
      if (ufo.health == 0) {
>>>>>>> 18d6d1aa65190af30854f6feab56d30b12b9e036
        ufo.setVisible(false);
        var manCamera = this.cameras.main;
        manCamera.shake(250);
      }
      safeRemove(bullet, bulletsToRemove);
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

function update(this: Phaser.Scene) {
  var decelerationFactor = 0.6;

  spaceship.body.velocity.x *= decelerationFactor;
  spaceship.body.velocity.y *= decelerationFactor;
  ufo.body.velocity.x *= decelerationFactor;
  ufo.body.velocity.y *= decelerationFactor;

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
