import { Point, Content, } from '../scene';
import { PaperMap } from './paperjs';
import { Tooltip, Modules } from '../ui';

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

export interface Moon {
    orbit: Orbit;
    position: number;
    size: number;
    resource: MoonResource;
}

export interface Planet {
    orbit: Orbit;
    name: string;
    position: number;
    size: number;
    resources: Resource[],
    moons: Moon[];
}

export enum StarResource {
    Hydrogen,
    Helium,
    Carbon,
    Lithium,
    Iron
}

export enum Resource {
    Oxygen,
    Methane,
    Ammonia,
    Organics,
    Platinum
}

export enum MoonResource {
    Silica,
    Corundum,
    Hematite,
    Cobaltite,
    Ilmenite
}


export interface Star {
    name: string;
    resource: StarResource
    known: boolean;



}

export class System {
    location: Point;
    name: string;
    planets: Planet[];
    star: Star;
    active: boolean;

    constructor(location: Point, name: string, resource: StarResource, known: boolean) {
        this.location = location;
        this.star = { name: name, resource: resource, known: known };
        this.name = name;
        this.planets = [];
        this.active = false;
    }

}

export abstract class StarMap {
    abstract add(star: System): void;
    abstract hide(): void;
    abstract r_move_handler(h: (loc: System | Planet) => void): void;
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
    abstract new_map(sol: System): StarMap;
    abstract use_tooltip(tooltip: Tooltip): void;
}