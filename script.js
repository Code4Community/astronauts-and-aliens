//Screen Seize and Camera
var screenWidth = 1000;
var scrollWidth = 2*screenWidth; // width of the rolling screen
var screenHeight = 600;

var config = {
    type: Phaser.AUTO,
    parent: "game",
    width: screenWidth,
    height: screenHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

class Spaceship extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        
        //When we determine the file name of the sprite for spaceship we need
        //to replace 'Spaceship' with the file name
        super(scene, x, y, 'Spaceship');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.8, 0.8);
        this.setBounce(0.3);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this, platforms);


        //alive is when the spaceship is alive
        this.alive = true;
    }
}

//Define the game
var game = new Phaser.Game(config);

function preload() {
    this.load.image('nightSky', 'assets/nightsky.png');
    this.load.image('ground', 'assets/Obstacle.png');
    this.load.image('Rover', 'assets/Rover.png');
    this.load.spritesheet('humanobstacle', 'assets/humanObstacles.png', {frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('astronautidle', 'assets/astroidle2.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('alienidle', 'assets/alienidle.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('num1', 'assets/numbers/number1.png');
    this.load.image('num2', 'assets/numbers/number2.png');
    this.load.image('num3', 'assets/numbers/number3.png');
    this.load.image('Spaceship', 'assets/Spaceship.png');
}

function create() {

    // creating asteroids group
    asteroids = this.physics.add.staticGroup();

    // placing the asteroids
    for(var i = 0;i < 10; i++) {
        asteroids.create(500 + getRandomInt(-200, 200), 300 + getRandomInt(-300, 300), 'asteroid').setScale(0.1);
    }

    // creating colliders for asteroids
    this.physics.add.collider(spaceship, asteroids);
    this.physics.add.collider(ufo, asteroids);
    this.physics.add.collider(laser, asteroids);
}

function update() {
    this.physics.collide(laser, asteroids, impact);
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
