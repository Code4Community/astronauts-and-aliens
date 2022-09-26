//Define Variables
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var bullet;
var rover;

// create a place  for astronauts
astronauts = [];
astronautsTotal = 3;
astronautsAlive = [true,true,true];
// create a place for aliens 
aliens = [];
aliensTotal = 3;
aliensAlive = [true,true,true];

//Screen Seize and Camera
var screenWidth = 800;
var scrollWidth = 2*screenWidth; // width of the rolling screen
var screenHeight = 600;

var turnCounter = 0;
var astroTurn = true; // astroTurn is true if it's the player's turn.

//Config data used to build the game
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

//--------------------------------------Entity Definitions --------------------------------------------

// Enitity class that defines movement of the players (astronauts) and enemies (alines)
class Entity extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite, index) {
        super(scene, x, y, sprite);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(0.8, 0.8);
        this.setBounce(0.3);
        this.setCollideWorldBounds(true);
        scene.physics.add.collider(this, platforms);

        // isJumping is true when the player is jumping.
        this.isJumping = false;

        //alive is true when the entity is alive and false when it is dead 
        this.alive = true;

        // Creates number sprites above heads of Entity objects.
        index++;
        this.headNumber = scene.physics.add.sprite(this.x, this.y - 10, 'num'+index);
        this.headNumber.body.allowGravity = false;
        this.headNumber.setScale(1.5);
    }

}

// Astronuats are the players of type entitiy
class Astronaut extends Entity {
    constructor(scene, x, y, index) {
        super(scene, x, y, 'astronautidle', index);
        index++;
        this.name = "Astronaut "+index;

        
    }
}

// Aliens are the computer-controlled enemies of type entity
class Alien extends Entity {
    constructor(scene, x, y, index) {
        super(scene, x, y, 'alienidle', index);
        index++;
        this.name = "Alien "+index;

        
    }
}

// Function to allow entity types to move left
Entity.prototype.moveLeft = function() {
    this.setVelocityX(-140);
    /*
        Next few lines change velocity back to zero after 2 seconds.
        Written this way because the first parameter has to be a function object, not a function's return value.
        Same goes for moveRight.
        - Carter
    */
   var that = this;
    setTimeout(function() {
        that.setVelocityX(0);
    }, 2000);
}

// Function to allow entity types to move right
Entity.prototype.moveRight = function() {
    this.setVelocityX(140);
    var that = this;
    setTimeout(function() {
        that.setVelocityX(0);
    }, 2000);
}

// Function to allow entity types to jump left
Entity.prototype.jumpLeft = function() {
    if(this.body.touching.down) {
        this.setVelocityY(-300);
        this.setVelocityX(-140);
        this.isJumping = true;
    }
}

// Function to allow entity types to jump right 
Entity.prototype.jumpRight = function() {
    if(this.body.touching.down) {
        this.setVelocityY(-300);
        this.setVelocityX(140);
        setTimeout(function () {

            // Trying to use a collider to determine when jumping Entity lands
            // game.physics.add.collider(this, platforms, function() {
            //     this.velocity = 0;
            //     turnCounter++;
            //     masterTurn(turnCounter, astroTurn);
            //});
        }, 100);
        this.isJumping = true;
    }
}

// Function to allow entity types to Fire a bullet
Entity.prototype.fire = function() {
    bullet.setPosition(this.x, this.y);
    bullet.setActive(true).setVisible(true);
    bullet.setVelocityX(-100);
    bullet.setVelocityY(-500);
}

// -------------------------------------End Entity Definitions ------------------------------------------




// -------------------------------------- Turn Based Movement -------------------------------------------

// An easy alien turn that chooses one of the five moves to do
Alien.prototype.easyTurn = function() {
    var min = 1;
    var max = 6;
    var myRand = Math.floor(Math.random() * (max - min)) + min;
    switch(myRand) {
        case 1:
            this.moveLeft();
            break;
        case 2:
            this.moveRight();
            break;
        case 3:
            this.fire();
            break;
        case 4:
            this.jumpLeft();
            break;
        case 5:
            this.jumpRight();
            break;s
    }
}

// Function that takes care of all turns and cycling aliens and astronauts
function masterTurn(turnCounter, astroTurn)
{
    if(turnCounter > 2) {
        astroTurn = !astroTurn;
        turnCounter = 0;
        masterTurn(turnCounter, astroTurn);
        return;
    }
    if(astroTurn) {
        if(astronautsAlive[turnCounter]) {
            // placeholder call
            // user input will come here
            turnCounter++;
            astronauts[0].jumpLeft();
        } else {
            turnCounter++;
            masterTurn(turnCounter, astroTurn);
            return;
        }
    } else {
        if(aliensAlive[turnCounter]) {
            aliens[turnCounter].easyTurn();
        } else {
            turnCounter++;
            masterTurn(turnCounter, astroTurn);
        }
    }
    


    // game over thing

}

// One astronaut turn
function astroTurn(current)
{
    console.log("astro turn");
}

// -----------------------------------End Turn Based Movement---------------------------------------------

  // Run button that does one alien turn
  document.getElementById("run").addEventListener("click", (event) => {
    masterTurn(turnCounter, astroTurn);
  });

//------------------------------------PRELOAD, CREATE & UPDATE -----------------------------------------

// Preload --> Happens before create --> Mostly just loads the images and spritesheets at the moment.  
function preload (){
    // Load all of the images and assign a name to them
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

// Create --> creates the inital image of the level on the screen
function create (){
    // Sets bounds of the level
    this.physics.world.setBounds(0,0,scrollWidth,screenHeight);

    // Background for the game --> there are 2 to stretch across the entire level since it scrolls
    this.add.image(400, 300, 'nightSky');
    this.add.image(1200, 300, 'nightSky');

    // Define Static Groups
    platforms = this.physics.add.staticGroup();
    rover     = this.physics.add.staticGroup();
    Spaceship = this.physics.add.staticGroup();

    // Here we create the big ground platform (0,0) is the top left corner of the screen
    platforms.create(600, 650, 'ground').setScale(3).refreshBody();

    // Places little platforms on the screen 
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Create rover and spaceship obstacles 
    rover.create(700,340, 'Rover').setScale(.1).refreshBody();
    Spaceship.create(750,30, 'Spaceship').setScale(.1).refreshBody();

    // Bullet physics and properties
    bullet = this.physics.add.sprite(200, 500, ''); ///////// NEED TO RENDER SOME TYPE OF PICTURE HERE !!!!!!!!!!!!!!!!!!!!!!
    disappearBullet();
    bullet.body.collideWorldBounds = true;
    bullet.body.onWorldBounds = true;

    // Bullet disappears when it hits the worldbounds 
    this.physics.world.on('worldbounds', (body, up, down, left, right)=>
    {
        if(up || down || left || right) {
        disappearBullet();
    }});

    // It is the player's turn first.
    astroTurn = true;

    
    astronautsLeft = 3;
    for(i=0; i < astronautsTotal; i++) {

        // Here is where we decide where Astronouts start
        astronauts.push(new Astronaut(this, 800 + (i * 50), 450, i));
    }


    aliensLeft = 3;
    for(i=0; i < aliensTotal; i++) {
        // Here is where we decide where Aliens start.
        aliens.push(new Alien(this, 400 + (i * 50), 450, i));
    }

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('astronautidle', { start: 0, end: 29 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers('astronautidle', { start: 0, end: 29 }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('astronautidle', { start: 0, end: 29 }),
        frameRate: 5,
        repeat: -1
    });

    // Input Events
    cursors = this.input.keyboard.createCursorKeys();
    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    keyL = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    // EDIT TO COUNT HOW MANY ALIENS ARE STILL PRESENT  !!!!!!!!!!!!!!!!!!!!!!!!!
    scoreText = this.add.text(16, 16, 'Aliens: 0', { fontSize: '32px', fill: '#FFFFFF' });

    // collider with bullet and platform 
    this.physics.add.collider(bullet, platforms);

    // Create camera which allows to scroll with arrow keys across the screen 
    this.cameras.main.setBounds(0, 0, scrollWidth, screenHeight);

}

// Update --> Continually checks for changes and updates the current state of the game 
  function update (){
    
   // Keeps the numbers over the heads of the astronauts and aliens.
    for(i = 0; i < astronautsLeft; i++) {
        astronauts[i].headNumber.setPosition(astronauts[i].x, astronauts[i].y - 40);
    }
    for(i = 0; i < aliensLeft; i++) {
        
        aliens[i].headNumber.setPosition(aliens[i].x, aliens[i].y - 40);
    }

    /*
    Checks if any of the aliens are in process of jumping.
    If they have started jump and are touching ground,
    the jump is over and they stop moving in X direction.
    */
    for(i = 0; i < aliensTotal; i++) {
        if(aliens[i].isJumping && aliens[i].body.touching.down) {
            aliens[i].isJumping = false;
            aliens[i].setVelocity(0);
        }
    }
    /*  
    Checks if any of the astronauts are in process of jumping.
    If they have started jump and are touching ground,
    the jump is over and they stop moving in X direction.
    */
    for(i = 0; i < astronautsTotal; i++) {
        if(astronauts[i].isJumping && astronauts[i].body.touching.down) {
            astronauts[i].isJumping = false;
            astronauts[i].setVelocity(0);
        }
    }

    //If bullet is touching the platform 
    if(bullet.body.touching.down) {
        disappearBullet();
    }

    bulletTouchingSprite() //EDIT THIS 

    //Conditions to move screen left and right 
    if (cursors.left.isDown){
        this.cameras.main.scrollX -= 5;
    }
    if (cursors.right.isDown){
        this.cameras.main.scrollX += 5;
    }


    //Tests for movements of entitity class 
    if(keyL.isDown) {
        astronauts[0].moveLeft(); 
    }

    if(keyR.isDown) {
        astronauts[1].moveRight();
    }

    if(keyF.isDown) {
        astronauts[1].fire();
    }
    
    if(keyJ.isDown) {
        aliens[0].jumpLeft();
    }

    if(keyK.isDown) {
        aliens[1].jumpRight();
    }

    //EVENTUALLY HAVE TO BE SOME CONDTION TO END THE GAME WHERE ALL 3 ALIENS OR ASTRONAUTS ARE DEAD
    if (gameOver)
    {
        return;
    }
}

//------------------------------- End PRELOAD, CREATE, & UPDATE  ---------------------------------------



//---------------------------------------- Extra Functions ---------------------------------------------

function bulletTouchingSprite(){
    //NEED TO CHANGE TO POSSIBLY 2 BULLETS
    //if it is the astro turn or if alien turn
    //remove the ! when the turns are configured 
    if(!astroTurn){
        //check if alien is intersecting bullet
        for(i = 0; i<aliensTotal; i++)
        {
            var alienBound = aliens[i].getBounds();
            var bulletBounds = bullet.getBounds();
            if(Phaser.Geom.Intersects.RectangleToRectangle(alienBound,bulletBounds))
            {
                disappearBullet();
                astronautsLeft--;
            }
        }
    } else {
        //check if astro is intersecting bullet
        for(i = 0; i<astronautsTotal; i++)
        {
            var astroBound = astronauts[i].getBounds();
            var bulletBounds = bullet.getBounds();
            if(Phaser.Geom.Intersects.RectangleToRectangle(astroBound,bulletBounds))
            {
                disappearBullet();
                aliensLeft--;
            }
        }
    }

}

function disappearBullet() {
    bullet.setActive(false).setVisible(false);
}

//-------------------------------------- End Extra Functions --------------------------------------------