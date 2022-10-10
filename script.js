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

//Define the game
var game = new Phaser.Game(config);

function preload() {

    this.load.image('asteroid', 'assets/Spaceship.png');
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
