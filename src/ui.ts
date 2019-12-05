import { Vector } from './scene';

class Data {
    private _data: Element;
    private _unit: Element;

    constructor(root: Element, name: string) {
        this._data = root.querySelector(`.content#${name}`)!;
        this._unit = root.querySelector(`#${name}_unit`)!;
    }

    set data(data: string) {
        this._data.textContent = data;
    }
    set unit(unit: string) {
        this._unit.textContent = unit;
    }
}

function format_speed(speed: number, element: Data) {
    if (speed >= 1000) {
        speed /= 1000;
        element.unit = 'km/s';
    } else {
        element.unit = 'm/s';
    }
    element.data = speed.toFixed(2);
}

export class Bar {
    private vel: Data;

    constructor(bar: Element) {
        this.vel = new Data(bar, 'vel');
    }

    set velocity(velocity: Vector) {
        format_speed(Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)), this.vel);
    }
}