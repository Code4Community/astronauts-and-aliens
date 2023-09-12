import * as Phaser from 'phaser';
import { image } from '../utils';
import { ufoVelocity } from '../consts';
import Vehicle from './vehicle';
import UFOLaser from './ufolaser';
  // child class for UFO vehicle
  export default class UFO extends Vehicle {
    alive: boolean = true;
  
    constructor(scene: Phaser.Scene, x: number, y: number) {
      // When we determine the file name of the sprite for spaceship we need
      // to replace 'Spaceship' with the file name
      super(scene, x, y, image('ufo'), ufoVelocity, UFOLaser);
      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.setScale(0.8, 0.8);
      this.setBounce(0.3);
      this.setCollideWorldBounds(true);
      this.type = 'ufo'
    }
  }