//Screen Seize and Camera
var screenWidth = 800;
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

}

function create() {

}

function update() {

}
