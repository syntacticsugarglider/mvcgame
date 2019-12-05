import { Point, Content } from '../scene';

export class Viewport {
    center: Point;
    scale: number;

    constructor(center: Point, scale: number) {
        this.center = center;
        this.scale = scale;
    }
}

export abstract class Render {
    protected __viewport: Viewport;
    constructor(canvas: HTMLCanvasElement) {
        this.__viewport = new Viewport(new Point(0, 0), 1);
    }
    abstract render(delta: number): void;
    protected abstract set _viewport(viewport: Viewport);
    set viewport(viewport: Viewport) {
        this.__viewport = viewport;
        this._viewport = viewport;
    }
    set center(center: Point) {
        this.viewport = new Viewport(center, this.__viewport.scale);
    }
    abstract add(geometry: Content): void;
}