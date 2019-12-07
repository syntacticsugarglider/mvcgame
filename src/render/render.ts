import { Point, Content } from '../scene';

export class Viewport {
    center: Point;
    scale: number;

    constructor(center: Point, scale: number) {
        this.center = center;
        this.scale = scale;
    }
}

export interface Orbit {
    radius: number;
    speed: number;
}

export interface Planet {
    orbit: Orbit;
    position: number;
    size: number;
    resources: Resource[],
}

export enum StarResource {
    Lithium
}

export enum Resource {
    Petroleum,
}

export class System {
    location: Point;
    name: string;
    planets: Planet[];

    constructor(location: Point, name: string) {
        this.location = location;
        this.name = name;
        this.planets = [];
    }
}

export abstract class StarMap {
    abstract add(star: System): void;
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
    get center(): Point {
        return this.__viewport.center;
    }
    abstract add(geometry: Content): void;
    abstract show_map(map: StarMap): void;
    abstract new_map(): StarMap;
}