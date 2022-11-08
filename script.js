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
    this.load.image('lazer', 'assets/lazer space ship.png');
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
    for(var i = 0;i < 10; i++) {
        // asteroids.create(500 + getRandomInt(-200, 200), 300 + getRandomInt(-300, 300), 'asteroid').setScale(0.1);
        //asteroids.create(getRandomInt(0+asteroidScreenMargin,screenWidth-asteroidScreenMargin),getRandomInt(0+asteroidScreenMargin,screenHeight-asteroidScreenMargin), 'asteroid').setScale(0.1);
        asteroids[i] = new Asteroid(this,getRandomInt(0+asteroidScreenMargin,screenWidth-asteroidScreenMargin),getRandomInt(0+asteroidScreenMargin,screenHeight-asteroidScreenMargin));
        
        this.physics.add.collider(spaceship, asteroids[i]);
    }
    

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

function degreesToRadians(degrees) {
    radians = degrees * Math.PI / 180;
    return radians;
}
