import * as Phaser from 'phaser';
import { image } from '../utils';
import Bullet from './bullet';
// child ufo laser class
export default class UFOLaser extends Bullet {
    constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, image('lazerUFO'));
    }
  }