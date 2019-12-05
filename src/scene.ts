export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static origin(): Point {
        return new Point(0, 0);
    }
}

export type Vector = Point;

export enum ContentType { Ship }

export type Updater = (delta: number) => void;

export abstract class Content {
    type: ContentType;
    update?: Updater;
    private handlers: Map<string, () => void>;
    constructor() {
        this.handlers = new Map();
    }
    on(event: string, callback: () => void) {
        this.handlers.set(event, callback);
    }
    call_handler(event: string) {
        this.handlers.get(event)!();
    }
}

export class Ship extends Content {
    type = ContentType.Ship;
    private _heading: number;
    private _position: Point;
    velocity: Vector;
    set heading(heading: number) {
        this._heading = heading;
    }
    set position(position: Point) {
        this._position = position;
        super.call_handler('position');
    }
    get position(): Point {
        return this._position;
    }
    constructor() {
        super();
        this.velocity = new Point(0, 0);
        this._position = new Point(0, 0);
        this.update = (delta: number) => {
            this.position = new Point(this._position.x + this.velocity.x * delta, this._position.y + this.velocity.y * delta);
        }
    }
}