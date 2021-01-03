import * as PIXI from "pixi.js";
import { Sprite, TextStyle, Container, PIXIText } from "../src/utils/overloadedClasses";
import { State, Keyboard, hitTestRectangle, incrementor, randomInt, contain } from "../src/utils/helper";
import "./style.css";

const Application = PIXI.Application,
    loader = new PIXI.Loader(),
    resources = loader.resources;

const app = new Application({
    width: 512,
    height: 512,
    transparent: false,
    resolution: 1,
});

const ids = new incrementor(),
    bounds = { x: 28, y: 10, width: 488, height: 480 };

let state: State,
    explorer: Sprite,
    treasure: Sprite,
    blobs: Sprite[],
    health: PIXI.Graphics,
    dungeon,
    door: Sprite,
    healthBar,
    message: PIXIText,
    gameScene: Container,
    gameOverScene: Container,
    id;

document.body.appendChild(app.view);

loader.add("assets/treasureHunter.json").load(setup);

//Define variables that might be used in more
//than one function

function setup() {
    //Create the `gameScene` group
    gameScene = new Container();
    app.stage.addChild(gameScene);

    gameOverScene = new Container();
    app.stage.addChild(gameOverScene);

    gameOverScene.visible = false;

    //Make the sprites and add them to the `gameScene`
    //Create an alias for the texture atlas frame ids
    id = resources["assets/treasureHunter.json"].textures as PIXI.ITextureDictionary;

    //Dungeon
    dungeon = new Sprite(id["dungeon.png"], ids.get);
    gameScene.addChild(dungeon);

    //Create the `door` sprite
    door = new Sprite(id["door.png"], ids.get);
    door.position.set(32, 0);
    gameScene.addChild(door);

    //Create the `player` sprite
    explorer = new Sprite(id["explorer.png"], ids.get);
    explorer.x = 68;
    explorer.y = gameScene.height / 2 - explorer.height / 2;
    explorer.vx = 0;
    explorer.vy = 0;
    gameScene.addChild(explorer);

    //Create the `treasure` sprite
    treasure = new Sprite(id["treasure.png"], ids.get);
    treasure.x = gameScene.width - treasure.width - 48;
    treasure.y = gameScene.height / 2 - treasure.height / 2;
    gameScene.addChild(treasure);

    //Make the enemies
    const numberOfBlobs = 6,
        spacing = 48,
        xOffset = 150,
        speed = 2;
    let direction = 1;

    //An array to store all the blob monsters
    blobs = [];

    //Make as many blobs as there are `numberOfBlobs`
    for (let i = 0; i < numberOfBlobs; i++) {
        //Make a blob
        const blob = new Sprite(id["blob.png"], ids.get);

        //Space each blob horizontally according to the `spacing` value.
        //`xOffset` determines the point from the left of the screen
        //at which the first blob should be added
        const x = spacing * i + xOffset;

        //Give the blob a random y position
        const y = randomInt(0, app.stage.height - blob.height);

        //Set the blob's position
        blob.x = x;
        blob.y = y;

        //Set the blob's vertical velocity. `direction` will be either `1` or
        //`-1`. `1` means the enemy will move down and `-1` means the blob will
        //move up. Multiplying `direction` by `speed` determines the blob's
        //vertical direction
        blob.vy = speed * direction;

        //Reverse the direction for the next blob
        direction *= -1;

        //Push the blob into the `blobs` array
        blobs.push(blob);

        //Add the blob to the `gameScene`
        gameScene.addChild(blob);
    }

    //Create the health bar
    healthBar = new PIXI.Container();
    healthBar.position.set(app.stage.width - 170, 4);
    gameScene.addChild(healthBar);

    //Create the black background rectangle
    const innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    const outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xff3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);
    health = outerBar;

    //Add some text for the game over message
    const style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white",
    });
    message = new PIXIText("The End!", style);
    message.x = 120;
    message.y = app.stage.height / 2 - 32;
    gameOverScene.addChild(message);

    //Assign the player's keyboard controllers
    //Capture the keyboard arrow keys
    const left = new Keyboard("a"),
        up = new Keyboard("w"),
        right = new Keyboard("d"),
        down = new Keyboard("s");

    //Left
    left.press = function () {
        //Change the explorer's velocity when the key is pressed
        explorer.vx = -5;
        explorer.vy = 0;
    };
    left.release = function () {
        //If the left arrow has been released, and the right arrow isn't down,
        //and the explorer isn't moving vertically:
        //Stop the explorer
        if (!right.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };

    //Up
    up.press = function () {
        explorer.vy = -5;
        explorer.vx = 0;
    };
    up.release = function () {
        if (!down.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };

    //Right
    right.press = function () {
        explorer.vx = 5;
        explorer.vy = 0;
    };
    right.release = function () {
        if (!left.isDown && explorer.vy === 0) {
            explorer.vx = 0;
        }
    };

    //Down
    down.press = function () {
        explorer.vy = 5;
        explorer.vx = 0;
    };
    down.release = function () {
        if (!up.isDown && explorer.vx === 0) {
            explorer.vy = 0;
        }
    };

    //set the game state to `play`
    state = play;

    //Start the game loop
    app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta: number) {
    //Runs the current game `state` in a loop and renders the sprites
    state(delta);
}

function play() {
    let explorerHit = false;

    explorer.x += explorer.vx;
    explorer.y += explorer.vy;
    contain(explorer, bounds);

    blobs.forEach(function (blob) {
        //Move the blob
        blob.y += blob.vy;

        //Check the blob's screen boundaries
        const blobHitsWall = contain(blob, bounds);

        //If the blob hits the top or bottom of the stage, reverse
        //its direction
        if (blobHitsWall === "top" || blobHitsWall === "bottom") {
            blob.vy *= -1;
        }

        //Test for a collision. If any of the enemies are touching
        //the explorer, set `explorerHit` to `true`
        if (hitTestRectangle(explorer, blob)) {
            explorerHit = true;
        }
    });
    //All the game logic goes here

    if (explorerHit) {
        //Make the explorer semi-transparent
        explorer.alpha = 0.5;

        //Reduce the width of the health bar's inner rectangle by 1 pixel
        if (health.width > 0) {
            health.width -= 1;
        }
    } else {
        //Make the explorer fully opaque (non-transparent) if it hasn't been hit
        explorer.alpha = 1;
    }

    if (hitTestRectangle(explorer, treasure)) {
        treasure.x = explorer.x + 8;
        treasure.y = explorer.y + 8;
    }

    if (hitTestRectangle(treasure, door)) {
        state = end;
        message.text = "You won!";
    }

    if (health.width <= 0) {
        state = end;
        message.text = "You lost!";
    }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
}
