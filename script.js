// screen size and camera
var screenWidth = 1000;
var scrollWidth = 2*screenWidth; // width of the rolling screen
var screenHeight = 600;

// asteroid parameters
var asteroidScreenMargin=40;
var asteroidCount=6;
var asteroidSpawnXMin=(screenWidth/2)-200;
var asteroidSpawnXMax=(screenWidth/2)+200;
var asteroidSpawnYMin=0;
var asteroidSpawnYMax=screenHeight;

// spaceship parameters
var spaceshipSpawnY=screenHeight/2;
var spaceshipSpawnX=screenWidth/2;
var spaceshipSpawnY=screenHeight/2;
var spaceshipVelocity=140;
var SpaceshipLife = 3;

// UFO parameters
var UFOSpawnY=screenHeight/2;
var UFOSpawnX=screenWidth/2;
var UFOSpawnY=screenHeight/2;
var UFOVelocity=140;
var UFOLife = 3;

var config = {
    type: Phaser.AUTO,
    parent: "game",
    width: screenWidth,
    height: screenHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet')
        scene.add.existing(this)
        this.setScale(0.3)
        scene.physics.add.existing(this)
        this.setCollideWorldBounds(true)
    }
}

class Spaceship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        
        // When we determine the file name of the sprite for spaceship we need
        // to replace 'Spaceship' with the file name
        super(scene, x, y, 'spaceship');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.8, 0.8);
        this.setBounce(0.3);
        this.setCollideWorldBounds(true);

        // alive is when the spaceship is alive
        this.alive = true;
    }
}

class Asteroid extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        
        // When we determine the file name of the sprite for spaceship we need
        // to replace 'Spaceship' with the file name
        super(scene, x, y, 'asteroid');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.8, 0.8);
        this.setBounce(0.3);
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
    }
}

Spaceship.prototype.vx = 0
Spaceship.prototype.vy = 0

Spaceship.prototype.moveUp = function() {
    this.setVelocityY(-spaceshipVelocity);
    this.vy = -spaceshipVelocity;
}

Spaceship.prototype.moveDown = function() {
    this.setVelocityY(spaceshipVelocity);
    this.vy = spaceshipVelocity;
}

Spaceship.prototype.moveLeft = function() {
    this.setVelocityX(-spaceshipVelocity);
    this.vx = -spaceshipVelocity;
}

Spaceship.prototype.moveRight = function() {
    this.setVelocityX(spaceshipVelocity);
    this.vx = spaceshipVelocity;
}

Spaceship.prototype.shoot = function () {
    var angleDegrees = document.getElementById("angle").value;
    var angleRadians = degreesToRadians(angleDegrees);
    const bullet = new Bullet(this.scene, this.x, this.y)
    bullet.setVelocityX(200 * Math.cos(angle / 360 * 2 * Math.PI))
    bullet.setVelocityY(200 * Math.sin(angle / 360 * 2 * Math.PI))
}

// Define the game
var game = new Phaser.Game(config);

function preload() {
    this.load.image('spaceship', 'assets/Space Ship 3 Hearts.png');
    this.load.image('asteroid', 'assets/Small Asteroid.png');
<<<<<<< HEAD
    this.load.image('lazer', 'assets/lazer space ship.png');
=======
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('SpaceS2', 'assets/Space Ship 2 Hearts.png', { frameWidth: 250, frameHeight: 250 });
    this.load.spritesheet('UFO2', 'assets/UFO 2 Hearts.png', { frameWidth: 250, frameHeight: 250 });
    this.load.spritesheet('SUEXPLODE', 'assets/Exploding object.png', { frameWidth: 250, frameHeight: 250 });
    this.load.spritesheet('AEXPLODE', 'assets/ASTEROID BREAK.png', { frameWidth: 200, frameHeight: 200 });
    this.load.image('UFO1', 'assets/UFO 1 Hearts.png');
    this.load.image('SpaceS1', 'assets/Space Ship 1 Hearts.png');
>>>>>>> origin/master
}

let spaceship;
const asteroids = [];
function create() {

    spaceship = new Spaceship(this, spaceshipSpawnX, spaceshipSpawnY)
    this.input.keyboard.on('keydown_W', () => spaceship.moveUp(), this);
    this.input.keyboard.on('keydown_A', () => spaceship.moveLeft(), this);
    this.input.keyboard.on('keydown_S', () => spaceship.moveDown(), this);
    this.input.keyboard.on('keydown_D', () => spaceship.moveRight(), this);
    this.input.keyboard.on('keydown_Q', () => spaceship.shoot(), this);


    // placing the asteroids
    for(var i = 0; i < asteroidCount; i++) {
        asteroids[i] = new Asteroid(this,getRandomInt(asteroidSpawnXMin, asteroidSpawnXMax),getRandomInt(asteroidSpawnYMin, asteroidSpawnYMax));
        
        this.physics.add.collider(spaceship, asteroids[i]);
    }
    
    //this.physics.add.collider(ufo, asteroids);
    //this.physics.add.collider(laser, asteroids);
    function LSAnimation(){
        if(SpaceshipLife === 2){
          this.anims.create({
              frames: this.anims.generateFrameNumbers('SpaceS2', { start: 0, end: 3 }),
              frameRate: 8,
              repeat: -1
          });
        }
        if(SpaceshipLife === 1){
          this.anims.create({
              frames: this.anims.generateFrameNumbers('SpaceS1', { start: 0, end: 0 }),
              frameRate: 8,
              repeat: -1
          });
      }
      if(SpaceshipLife === 0){
          this.anims.create({
              frames: this.anims.generateFrameNumbers('SUEXPLODE', { start: 0, end: 8 }),
              frameRate: 20,
              repeat: 0
          });
      }
      }
      
}

function update() {
    spaceship.vx *= 0.98
    spaceship.vy *= 0.98
    spaceship.setVelocityX(spaceship.vx)
    spaceship.setVelocityY(spaceship.vy)



    //this.physics.collide(laser, asteroids, impact);
}

function impact(laser, asteroid) {
    asteroid.destroy();
    laser.setActive(false).setVisible(false);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function degreesToRadians(degrees) {
    radians = degrees * Math.PI / 180;
    return radians;
}
