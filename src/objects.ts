import * as Phaser from "phaser";
import { image } from "./main"
import { screenWidth, screenHeight, spaceshipSpawnY, 
  spaceshipSpawnX, spaceshipVelocity, ufoSpawnY,
  ufoSpawnX, ufoVelocity, asteroidSpawnXMin,
  asteroidSpawnXMax, asteroidSpawnYMin, asteroidSpawnYMax,
  asteroidCount, asteroidHeight, bullets, blackHoles, images } from './consts'

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
  export class Spaceship extends Vehicle {
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
  export class UFO extends Vehicle {
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
      this.type = "ufo"
    }
  }

  // parent for fired bullet
export class Bullet extends Phaser.Physics.Arcade.Sprite {
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
export class UFOLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("lazerUFO"));
  }
}

// child spaceship laser class
export class SpaceshipLaser extends Bullet {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("lazerSpaceship"));
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

// black hole class
// experimental feature
export class BlackHole extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, image("blackhole"));
    scene.add.existing(this);
    blackHoles.push(this);
    scene.physics.add.existing(this);
  }
}