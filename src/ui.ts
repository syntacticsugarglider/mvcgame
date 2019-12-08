import { Vector } from './scene';

class Data {
    private _data: Element;
    private _unit: Element;

    constructor(root: Element, name: string) {
        this._data = root.querySelector(`.content#${name}`)!;
        this._unit = root.querySelector(`#${name}_unit`)!;
        root.querySelectorAll('.drvmode .option').forEach((e) =>
            e.addEventListener('click', (e) => {
                document.querySelectorAll('.drvmode .option.active').forEach((e) => {
                    e.classList.remove('active');
                });
                let el = (e.target! as Element);
                el.classList.add('active');
                let type = el.getAttribute('data-name');
                if (type == "rel") {

                }
            })
        );
    }

    set data(data: string) {
        this._data.textContent = data;
    }
    set unit(unit: string) {
        this._unit.innerHTML = unit;
    }
}

function format_acc(speed: number, element: Data) {
    if (speed >= 1000) {
        speed /= 1000;
        element.unit = 'km/s<sup>2</sup>';
    } else {
        element.unit = 'm/s<sup>2</sup>';
    }
    element.data = speed.toFixed(2);
}

export class Tooltip {
    private element: Element;

    constructor(element: Element) {
        this.element = element;
    }

    set text(text: string) {
        this.element.innerHTML = text.replace("\\n", "<br/>");
    }

    set_from(element: Element) {
        this.text = element.getAttribute('tooltip')!;
        this.show();
    }

    show() {
        this.element.classList.add('active');
    }

    hide() {
        this.element.classList.remove('active');
    }
}

export class Bar {
    private vel: Data;
    tooltip: Tooltip;

    constructor(bar: Element) {
        this.vel = new Data(bar, 'vel');
        this.tooltip = new Tooltip(bar.querySelector('.tooltip.content')!);
        bar.querySelectorAll('[tooltip]').forEach((e) => {
            e.addEventListener('mouseover', (_) => {
                this.tooltip.set_from(e);
            });
            e.addEventListener('mouseout', (_) => {
                this.tooltip.hide();
            });
        });
    }

    set acceleration(acceleration: Vector) {
        format_acc(Math.sqrt(Math.pow(acceleration.x, 2) + Math.pow(acceleration.y, 2)), this.vel);
    }
}