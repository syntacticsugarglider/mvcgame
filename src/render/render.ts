import { Point } from '../geometry';

export class Viewport {
    offset: Point;
    scale: number;

    constructor(offset: Point, scale: number) {
        this.offset = offset;
        this.scale = scale;
    }
}

export abstract class Render {
    constructor(canvas: HTMLCanvasElement) { }
    abstract render(delta: number): void;
    abstract set_viewport(viewport: Viewport): void;
}