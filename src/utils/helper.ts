import { Sprite } from "./overloadedClasses";
export type State = (delta: number) => void;

export class Keyboard {
    key: string;
    isDown: boolean;
    isUp: boolean;
    press?: () => void;
    release?: () => void;

    constructor(value: string) {
        this.key = value;

        this.isDown = false;
        this.isUp = true;

        window.addEventListener("keydown", this.downHandler, false);
        window.addEventListener("keyup", this.upHandler, false);
    }

    downHandler = (event: KeyboardEvent): void => {
        if (event.key === this.key) {
            if (this.isUp && this.press) this.press();
            this.isDown = true;
            this.isUp = false;
            event.preventDefault();
        }
    };

    upHandler = (event: KeyboardEvent): void => {
        if (event.key === this.key) {
            if (this.isDown && this.release) this.release();
            this.isDown = false;
            this.isUp = true;
            event.preventDefault();
        }
    };

    unsubscribe(): void {
        window.removeEventListener("keydown", this.downHandler);
        window.removeEventListener("keyup", this.upHandler);
    }
}

export function hitTestRectangle(r1: Sprite, r2: Sprite): boolean {
    //Define the variables we'll need to calculate
    let hit = false;

    //Calculate the distance vector between the sprites
    const vx = r1.centerX - r2.centerX;
    const vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    const combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    const combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        }
    }

    //`hit` will be either `true` or `false`
    return hit;
}

export class incrementor {
    count = 0;

    get get(): number {
        this.count++;
        return this.count;
    }
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function contain(sprite: Sprite, container: { x: number; y: number; width: number; height: number }): string {
    let collision = "contain";

    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}
