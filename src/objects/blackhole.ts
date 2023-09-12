import * as Phaser from 'phaser';
import { image } from '../utils';
import { blackHoles } from '../consts';
// black hole class
// experimental feature
export default class BlackHole extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, image('blackhole'));
      scene.add.existing(this);
      blackHoles.push(this);
      scene.physics.add.existing(this);
    }
  }