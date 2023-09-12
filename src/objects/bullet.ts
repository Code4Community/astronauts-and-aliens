import * as Phaser from 'phaser';
import { image } from '../utils';
import { bullets, images } from '../consts';
  // parent for fired bullet
  export default class Bullet extends Phaser.Physics.Arcade.Sprite {
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