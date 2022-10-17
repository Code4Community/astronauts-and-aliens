//Screen Seize and Camera
var screenWidth = 1000;
var scrollWidth = 2*screenWidth; // width of the rolling screen
var screenHeight = 600;
var asteroidScreenMargin=40;
var spaceshipSpawnX=screenWidth/2;
var spaceshipSpawnY=screenHeight/2;

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
        this.setScale(0.1, 0.1)
        scene.physics.add.existing(this)
        this.setCollideWorldBounds(true)
    }
}

class Spaceship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        
        // When we determine the file name of the sprite for spaceship we need
        // to replace 'Spaceship' with the file name
        super(scene, x, y, 'Spaceship');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.3, 0.3);
        this.setBounce(0.3);
        this.setCollideWorldBounds(true);

        // alive is when the spaceship is alive
        this.alive = true;
    }
}

Spaceship.prototype.vx = 0
Spaceship.prototype.vy = 0

Spaceship.prototype.moveUp = function() {
    this.setVelocityY(-140);
    this.vy = -140
    // var that = this;
    // setTimeout(function() {
    //     that.setVelocityY(0);
    // }, 2000);
}

Spaceship.prototype.moveDown = function() {
    this.setVelocityY(140);
    this.vy = 140
    // var that = this;
    // setTimeout(function() {
    //     that.setVelocityY(0);
    // }, 2000);
}

Spaceship.prototype.moveLeft = function() {
    this.setVelocityX(-140);
    this.vx = -140
    // var that = this;
    // setTimeout(function() {
    //     that.setVelocityX(0);
    // }, 2000);
}

Spaceship.prototype.moveRight = function() {
    this.setVelocityX(140);
    this.vx = 140
    // var that = this;
    // setTimeout(function() {
    //     that.setVelocityX(0);
    // }, 2000);
}

Spaceship.prototype.shoot = function (angle) {
    const bullet = new Bullet(this.scene, this.x, this.y)
    bullet.setVelocityX(200 * Math.cos(angle / 360 * 2 * Math.PI))
    bullet.setVelocityY(200 * Math.sin(angle / 360 * 2 * Math.PI))
}

// Define the game
var game = new Phaser.Game(config);

function preload() {
    this.load.image('nightSky', 'assets/BACKROUND.png');
    this.load.image('ground', 'assets/Obstacle.png');
    this.load.image('Rover', 'assets/Rover.png');
    this.load.spritesheet('humanobstacle', 'assets/humanObstacles.png', {frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('astronautidle', 'assets/astroidle2.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('alienidle', 'assets/alienidle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('num1', 'assets/numbers/number1.png');
    this.load.image('num2', 'assets/numbers/number2.png');
    this.load.image('num3', 'assets/numbers/number3.png');
    this.load.image('Spaceship', 'assets/Spaceship.png');
    this.load.image('asteroid', 'assets/Spaceship.png');
    this.load.image('bullet', 'assets/bullet.png');
}

let spaceship;

function create() {
    // creating asteroids group
    asteroids = this.physics.add.staticGroup();

    // placing the asteroids
    for(var i = 0;i < 10; i++) {
        // asteroids.create(500 + getRandomInt(-200, 200), 300 + getRandomInt(-300, 300), 'asteroid').setScale(0.1);
        asteroids.create(getRandomInt(0+asteroidScreenMargin,screenWidth-asteroidScreenMargin),getRandomInt(0+asteroidScreenMargin,screenHeight-asteroidScreenMargin), 'asteroid').setScale(0.1);
    }

    spaceship = new Spaceship(this, spaceshipSpawnX, spaceshipSpawnY)
    this.input.keyboard.on('keydown_W', () => spaceship.moveUp(), this);
    this.input.keyboard.on('keydown_A', () => spaceship.moveLeft(), this);
    this.input.keyboard.on('keydown_S', () => spaceship.moveDown(), this);
    this.input.keyboard.on('keydown_D', () => spaceship.moveRight(), this);
    this.input.keyboard.on('keydown_Q', () => spaceship.shoot(45), this);

    // creating colliders for asteroids
    this.physics.add.collider(spaceship, asteroids);
    //this.physics.add.collider(ufo, asteroids);
    //this.physics.add.collider(laser, asteroids);
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
