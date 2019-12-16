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

    constructor(bar: Element, show_map: () => void) {
        document.querySelector('.return')!.addEventListener('click', () => {
            show_map();
        });
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

    add(el: Element): void {
        el.addEventListener('mouseover', (_) => {
            this.tooltip.set_from(el);
        });
        el.addEventListener('mouseout', (_) => {
            this.tooltip.hide();
        });
    }

    set acceleration(acceleration: Vector) {
        format_acc(Math.sqrt(Math.pow(acceleration.x, 2) + Math.pow(acceleration.y, 2)), this.vel);
    }
}

interface CargoItem {
    name: string,
    amount: number,
}

function color_of(res: string): string {
    if (res == 'hydrogen') {
        return '#ffb61c';
    } else if (res == 'helium') {
        return '#ff831c';
    } else if (res == 'carbon') {
        return '#ffffff';
    } else if (res == 'lithium') {
        return '#ff6b6b';
    } else if (res == 'iron') {
        return '#119999';
    } else if (res == 'silica') {
        return '#ffeaa8';
    } else if (res == 'corundum') {
        return '#be7db2';
    } else if (res == 'hematite') {
        return '#f7a3ab';
    } else if (res == 'cobaltite') {
        return '#8583ba';
    } else if (res == 'ilmenite') {
        return '#ecad80';
    } else if (res == 'oxygen') {
        return '#9CD3DC';
    } else if (res == 'methane') {
        return '#F5AF6E';
    } else if (res == 'ammonia') {
        return '#5B5BAC';
    } else if (res == 'organics') {
        return '#7FD676';
    } else if (res == 'platinum') {
        return '#ff5349';
    } else {
        return '#000';
    }
}

function tooltip_of(res: string): string {
    if (res == 'hydrogen') {
        return 'a gas commonly found on stars, used for fuel';
    } else if (res == 'helium') {
        return 'a gas commonly found on stars, used for fuel';
    } else if (res == 'carbon') {
        return 'a solid uncommonly found on hot mid-size stars, often used as shielding';
    } else if (res == 'lithium') {
        return 'a solid uncommonly found on midsize stars, used for batteries';
    } else if (res == 'iron') {
        return 'a solid rarely found on high temperature stars in large volume, used in structural components and for hull repair';
    } else if (res == 'silica') {
        return 'an ore source of silicon commonly found on moons, used as shielding';
    } else if (res == 'corundum') {
        return 'an ore source of aluminum commonly found on moons, used for structural components';
    } else if (res == 'hematite') {
        return 'an ore source of iron uncommonly found on moons, used for structural components';
    } else if (res == 'cobaltite') {
        return 'an ore source of cobalt uncommonly found on moons, used for batteries';
    } else if (res == 'ilmenite') {
        return 'an ore source of titanium rarely found on moons, used for structural components';
    } else if (res == 'oxygen') {
        return 'a gas commonly found on planets, used to sustain human life';
    } else if (res == 'methane') {
        return 'a gas commonly found on planets, used as a low density fuel';
    } else if (res == 'ammonia') {
        return 'a gas uncommonly found on planets, used as a defouling agent';
    } else if (res == 'organics') {
        return 'a liquid uncommonly found on planets, used as a high density fuel';
    } else if (res == 'platinum') {
        return 'a solid rarely found on planets, used as a catalyst';
    } else {
        return 'missing tooltip';
    }
}

function format_mass(mass: number): string {
    let unit;
    if (mass >= 1000000) {
        mass /= 1000000;
        unit = 't';
    } else if (mass >= 1000) {
        mass /= 1000;
        unit = 'kg';
    } else if (mass == 0) {
        unit = '';
    } else {
        unit = 'g';
    }
    return `${mass} ${unit}`;
}

export class Cargo {
    private el: Element;
    private total_cap: number;
    private used: number;
    private bar: Bar;
    private resources: CargoItem[];

    constructor(total_cap: number, bar: Bar) {
        this.el = document.querySelector('.arrange')!;
        this.total_cap = total_cap;
        this.used = 0;
        this.bar = bar;
        this.update_cap_display();
        this.resources = [];
    }

    private update_cap_display() {
        this.el.querySelector('.rcap')!.innerHTML = `remaining capacity<div><span class="content">${format_mass(this.total_cap - this.used)}</span> of total <span class="content">${format_mass(this.total_cap)}</span></div>`;
    }

    set capacity(cap: number) {
        this.total_cap = this.capacity;
    }

    push(item: CargoItem): void {
        if (this.used + item.amount > this.total_cap) {
            return;
        }
        this.used += item.amount;
        this.update_cap_display();
        this.resources.push(item);
        let el = document.createElement('div');
        el.setAttribute('class', 'module res a');
        el.setAttribute('tooltip', tooltip_of(item.name));
        this.bar.add(el);
        el.innerHTML = `<span style="color: ${color_of(item.name)};">silica</span><div class="content">${format_mass(item.amount)}</div>`;
        this.el.querySelector('.rcap')!.before(el);
    }
}