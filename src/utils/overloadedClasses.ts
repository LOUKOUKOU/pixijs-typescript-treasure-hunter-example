import * as PIXI from "pixi.js";

export class Sprite extends PIXI.Sprite {
    id: number;
    vx: number;
    vy: number;
    constructor(texture: PIXI.Texture, id: number | undefined) {
        super(texture);
        if (id != undefined) this.id = id;
        else this.id = new Date().getTime();
        this.vx = 0;
        this.vy = 0;
    }

    get centerX(): number {
        return this.x + this.width / 2;
    }

    get centerY(): number {
        return this.y + this.height / 2;
    }

    get halfWidth(): number {
        return this.width / 2;
    }

    get halfHeight(): number {
        return this.height / 2;
    }
}

export class TextStyle extends PIXI.TextStyle {
    constructor(style?: {
        align?: string;
        breakWords?: boolean;
        dropShadow?: boolean;
        dropShadowAlpha?: number;
        dropShadowAngle?: number;
        dropShadowBlur?: number;
        dropShadowColor?: string | number;
        dropShadowDistance?: number;
        fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
        fillGradientType?: number;
        fillGradientStops?: number[];
        fontFamily?: string | string[];
        fontSize?: number | string;
        fontStyle?: string;
        fontVariant?: string;
        fontWeight?: string;
        leading?: number;
        letterSpacing?: number;
        lineHeight?: number;
        lineJoin?: string;
        miterLimit?: number;
        padding?: number;
        stroke?: string | number;
        strokeThickness?: number;
        trim?: boolean;
        textBaseline?: string;
        whiteSpace?: string;
        wordWrap?: boolean;
        wordWrapWidth?: number;
    }) {
        super(style);
    }
}
export class Container extends PIXI.Container {
    constructor() {
        super();
    }
}

export class PIXIText extends PIXI.Text {
    constructor(text: string, style?: PIXI.TextStyle, canvas?: HTMLCanvasElement) {
        super(text, style, canvas);
    }
}
