import * as Phaser from 'phaser';
import { image } from '../utils';
import Bullet from './bullet';
// child spaceship laser class
export default class SpaceshipLaser extends Bullet {
    constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y, image('lazerSpaceship'));
    }
  }