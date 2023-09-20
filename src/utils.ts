import Vehicle from './objects/vehicle'
import { screenWidth, screenHeight, images } from './consts'
// 1

// compile time image name checking
export function image(name: keyof typeof images) {
    return name;
  }

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
    
export function getRandomDouble(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function endGame(scene: Phaser.Scene, vehicle: Vehicle) {
    scene.scene.pause("default");
    // bullets.forEach(function (bullet) {
    //     bullet.destroy();
    // });
    // Display words "GAME OVER"
    console.log("GAME OVER!");
    scene.add.text(screenWidth/2, screenHeight/2, 'GAME OVER', { fontSize: '75px' }).setOrigin(0.5);
    let textMessage: [string, string]
    textMessage = (vehicle.type == "spaceship") ? ['BUMMER! YOU LOST!', 'red']: ['CONGRATULATIONS! YOU WIN!', 'green'];
    scene.add.text(screenWidth/2, screenHeight/2 + 100, textMessage[0], { fontSize: '50px', color: textMessage[1] }).setOrigin(0.5);
    return;
}