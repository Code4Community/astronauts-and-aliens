import * as Phaser from 'phaser';
import { image } from '../utils';
import { images } from '../consts';
import Bullet from './bullet';

// parent class for ufo/spaceship
export default class Vehicle extends Phaser.Physics.Arcade.Sprite {
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
        'bullet'
      );
      laser.setVelocityX(200 * Math.cos((angle / 360) * 2 * Math.PI));
      laser.setVelocityY(200 * Math.sin((angle / 360) * 2 * Math.PI));
    }
  }