import * as Phaser from 'phaser';
import { image } from '../utils';
// class for asteroids
export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
      // When we determine the file name of the sprite for spaceship we need
      // to replace 'Spaceship' with the file name
      super(scene, x, y, image('asteroid'));
      scene.add.existing(this);
      scene.physics.add.existing(this);
      this.setScale(0.8, 0.8);
      this.setBounce(0.3);
      this.setCollideWorldBounds(true);
      this.setImmovable(true);
    }
  }