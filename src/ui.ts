import { Vector } from './scene';
import { Game } from './game';
import { Planet, System, StarResource, MoonResource, Resource } from './render/render';

export class Data {
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
    private time_emathh_elapsed: Data;
    private time_ship_elapsed: Data;
    private emathh_date: Data;
    private fuel: Data;
    private fuel_percentage: Data;
    tooltip: Tooltip;

    constructor(bar: Element, show_map: () => void) {
        document.querySelector('.return')!.addEventListener('click', () => {
            show_map();
        });
        this.vel = new Data(bar, 'vel');
        this.time_emathh_elapsed = new Data(bar, 'emathh_elapsed');
        this.time_ship_elapsed = new Data(bar, 'ship_elapsed');
        this.emathh_date = new Data(bar, 'emathh_date')
        this.fuel = new Data(bar, "fuel");
        this.fuel_percentage = new Data(bar, "fuel_per");
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

    set emathh_time(date: Date) {
        let time = date.getTime() - new Date('January 1, 5032 00:00:00').getTime();
        this.time_emathh_elapsed.data = Math.floor(time / (365 * 24 * 3600 * 1000)).toString().concat(" years ",
            Math.floor((time % (365 * 24 * 3600 * 1000)) / (24 * 3600 * 1000)).toString(), " days ", Math.floor((time % (24 * 3600 * 1000)) / (3600 * 1000)).toString(), " hours ")
        this.emathh_date.data = date.toString().slice(0, -32).concat(" PST");
    }

    set ship_time(date: Date) {
        let time = date.getTime() - new Date('January 1, 5032 00:00:00').getTime();
        this.time_ship_elapsed.data = Math.floor(time / (365 * 24 * 3600 * 1000)).toString().concat(" years ",
            Math.floor((time % (365 * 24 * 3600 * 1000)) / (24 * 3600 * 1000)).toString(), " days ", Math.floor((time % (24 * 3600 * 1000)) / (3600 * 1000)).toString(), " hours ")
    }

    set fuel_set(fuel: number) {
        this.fuel_percentage.data = (fuel / 500000 * 100).toFixed(0);
        console.log(document.body.style);
        document.body.style.setProperty('--fuel-p', `${(100 - (fuel / 500000 * 100)).toFixed(0)}%`);
        if (fuel >= 1000) {
            this.fuel.data = Math.floor((fuel / 1000)).toFixed(0);
            this.fuel.unit = " kg";
        }
        else {
            this.fuel.data = fuel.toFixed(2);
            this.fuel.unit = " g"
        }
    }




}

interface CargoItem {
    name: string,
    amount: number,
}

function name_of(res: StarResource | MoonResource | Resource): string {
    if (res < 100) {
        let r = res as StarResource;
        if (r == StarResource.Hydrogen) {
            return 'hydrogen';
        } else if (r == StarResource.Helium) {
            return 'helium';
        } else if (r == StarResource.Carbon) {
            return 'carbon';
        } else if (r == StarResource.Lithium) {
            return 'lithium';
        } else if (r == StarResource.Iron) {
            return 'iron';
        } else if (r == StarResource.MetallicHydrogen) {
            return 'metallic hydrogen';
        }
    } else if (res < 200) {
        let r = res as Resource;
        if (r == Resource.Oxygen) {
            return 'oxygen';
        } else if (r == Resource.Methane) {
            return 'methane';
        } else if (r == Resource.Ammonia) {
            return 'ammonia';
        } else if (r == Resource.Organics) {
            return 'organics';
        } else if (r == Resource.Platinum) {
            return 'platinum';
        }
    } else {
        let r = res as MoonResource;
        if (r == MoonResource.Silica) {
            return 'silica';
        } else if (r == MoonResource.Corundum) {
            return 'corundum'
        } else if (r == MoonResource.Hematite) {
            return 'hematite';
        } else if (r == MoonResource.Cobaltite) {
            return 'cobaltite';
        } else if (r == MoonResource.Ilmenite) {
            return 'ilmenite'
        }
    }
    return 'unknown';
}

function color_of(res: string): string {
    if (res == 'hydrogen') {
        return '#ffb61c';
    } else if (res == 'helium') {
        return '#ff831c';
    } else if (res == 'carbon') {
        return '#ffffff';
    } else if (res == 'metallic hydrogen') {
        return '#c4cace';
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
    return `${Math.round(mass)} ${unit}`;
}

function format_time(time: number): string {
    let unit;
    if (time >= 524160) {
        time /= 524160;
        if (Math.round(time) == 1) {
            unit = 'year';
        } else {
            unit = 'years';
        }
    } else if (time >= 10080) {
        time /= 10080;
        if (Math.round(time) == 1) {
            unit = 'week';
        } else {
            unit = 'weeks';
        }
    } else if (time >= 1440) {
        time /= 1440;
        if (Math.round(time) == 1) {
            unit = 'day';
        } else {
            unit = 'days';
        }
    } else if (time >= 60) {
        time /= 60;
        if (Math.round(time) == 1) {
            unit = 'hour';
        } else {
            unit = 'hours';
        }
    } else if (time == 0) {
        unit = '';
    } else {
        if (Math.round(time) == 1) {
            unit = 'minute';
        } else {
            unit = 'minutes';
        }
    }
    return `${Math.round(time)} ${unit}`;
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

    is_full(): boolean {
        return this.total_cap == this.used;
    }

    push(item: CargoItem): void {
        if (this.used + item.amount > this.total_cap) {
            this.push({ amount: this.total_cap - this.used, name: item.name });
            return;
        }
        let rcap = this.el.querySelector('.rcap')!;
        let t = document.querySelector(`[data-res-name="${item.name}"]`);
        if (t != null) {
            let n = this.resources.find((el) => el.name == item.name)!;
            n.amount += item.amount;
            this.used += item.amount;
            t.querySelector('.at')!.textContent = format_mass(n.amount)
            this.update_cap_display();
            return;
        }
        this.used += item.amount;
        this.update_cap_display();
        this.resources.push(item);
        let el = document.createElement('div');
        el.setAttribute('class', 'module res a');
        el.setAttribute('tooltip', tooltip_of(item.name));
        el.setAttribute('data-res-name', item.name);
        this.bar.add(el);
        el.innerHTML = `<span style="color: ${color_of(item.name)};">${item.name}</span><div class="content at">${format_mass(item.amount)}</div>`;
        rcap.before(el);
    }
}

interface Action {
    description: string,
    name: string,
    uses: CargoItem[],
}

interface Module {
    name: string,
    info: [string, string][],
    actions: Action[];
}

export class Modules {
    private before: Element;
    private cargo: Cargo;
    private modules: Module[];
    private bar: Bar;
    private add_time: (t: number, sf: number) => void;

    constructor(cargo: Cargo, bar: Bar, add_time: (t: number, sf: number) => void) {
        this.modules = [];
        this.cargo = cargo;
        this.before = document.querySelector('.add-info')!;
        this.bar = bar;
        this.add_time = add_time;
    }

    move(loc: Planet | System): void {
        if (!!(loc as any).orbit) {
            let planet = loc as Planet;
            let md = document.querySelector('.mdrone')!;
            document.querySelectorAll('.kres').forEach(e => {
                e.remove();
            });
            planet.resources.forEach(res => {
                let n_kres = document.createElement('div');
                n_kres.classList.add('kres');
                n_kres.classList.add('action');
                n_kres.classList.add('a');
                n_kres.setAttribute('tooltip', 'hold to mine <span class="content">100g/h</span>');
                let name = name_of(res);
                let int: NodeJS.Timeout;
                let amt_mined = 0;
                let time_elapsed = 0;
                let i_rate = 1.66666667;
                let rate_mul = 1;
                n_kres.addEventListener('mousedown', () => {
                    if (this.cargo.is_full()) {
                        document.querySelector('.tooltip.content')!.innerHTML = `cargo bay full`;
                    } else {
                        rate_mul = 1;
                        document.querySelector('.tooltip.content')!.innerHTML = `mined <span class="content amt">${format_mass(amt_mined)}</span> <span style="color: ${color_of(name)};">${name}</span><br/><span class="content time">${format_time(time_elapsed)}</span> elapsed<br/>hold to accelerate`;
                        let amt = document.querySelector('.tooltip.content .amt')!;
                        let time = document.querySelector('.tooltip.content .time')!;
                        clearInterval(int);
                        int = setInterval(() => {
                            rate_mul *= 1.1;
                            amt_mined += i_rate * rate_mul;
                            time_elapsed += rate_mul;
                            this.add_time(rate_mul, 1);
                            this.cargo.push({ name: name, amount: i_rate * rate_mul });
                            if (this.cargo.is_full()) {
                                document.querySelector('.tooltip.content')!.innerHTML = `cargo bay full`;
                                clearInterval(int);
                                return;
                            }
                            amt.textContent = format_mass(amt_mined);
                            time.textContent = format_time(time_elapsed);
                        }, 100);
                    }
                });
                n_kres.addEventListener('mouseup', () => {
                    document.querySelector('.tooltip.content')!.innerHTML = `mined <span class="content amt">${format_mass(amt_mined)}</span> <span style="color: ${color_of(name)};">${name}</span><br/><span class="content time">${format_time(time_elapsed)}</span> elapsed<br/>hold to resume`;
                    clearInterval(int);
                });
                n_kres.addEventListener('mouseout', () => {
                    amt_mined = 0;
                    time_elapsed = 0;
                    clearInterval(int);
                });
                n_kres.innerHTML = `<div>mine <span style="color: ${color_of(name)}">${name}</span></div>`;
                this.bar.add(n_kres);
                md.appendChild(n_kres);
            });
            planet.moons.forEach(res => {
                let n_kres = document.createElement('div');
                n_kres.classList.add('kres');
                n_kres.classList.add('action');
                n_kres.classList.add('a');
                let name = name_of(res.resource);
                n_kres.setAttribute('tooltip', 'hold to mine <span class="content">100g/h</span>');
                let int: NodeJS.Timeout;
                let amt_mined = 0;
                let time_elapsed = 0;
                let i_rate = 1.66666667;
                let rate_mul = 1;
                n_kres.addEventListener('mousedown', () => {
                    if (this.cargo.is_full()) {
                        document.querySelector('.tooltip.content')!.innerHTML = `cargo bay full`;
                    } else {
                        rate_mul = 1;
                        document.querySelector('.tooltip.content')!.innerHTML = `mined <span class="content amt">${format_mass(amt_mined)}</span> <span style="color: ${color_of(name)};">${name}</span><br/><span class="content time">${format_time(time_elapsed)}</span> elapsed<br/>hold to accelerate`;
                        let amt = document.querySelector('.tooltip.content .amt')!;
                        let time = document.querySelector('.tooltip.content .time')!;
                        clearInterval(int);
                        int = setInterval(() => {
                            rate_mul *= 1.1;
                            amt_mined += i_rate * rate_mul;
                            time_elapsed += rate_mul;
                            this.add_time(rate_mul, 1);
                            this.cargo.push({ name: name, amount: i_rate * rate_mul });
                            if (this.cargo.is_full()) {
                                document.querySelector('.tooltip.content')!.innerHTML = `cargo bay full`;
                                clearInterval(int);
                                return;
                            }
                            amt.textContent = format_mass(amt_mined);
                            time.textContent = format_time(time_elapsed);
                        }, 100);
                    }
                });
                n_kres.addEventListener('mouseup', () => {
                    document.querySelector('.tooltip.content')!.innerHTML = `mined <span class="content amt">${format_mass(amt_mined)}</span> <span style="color: ${color_of(name)};">${name}</span><br/><span class="content time">${format_time(time_elapsed)}</span> elapsed<br/>hold to resume`;
                    clearInterval(int);
                });
                n_kres.addEventListener('mouseout', () => {
                    amt_mined = 0;
                    time_elapsed = 0;
                    clearInterval(int);
                });
                n_kres.innerHTML = `<div>mine <span style="color: ${color_of(name)}">${name}</span></div>`;
                this.bar.add(n_kres);
                md.appendChild(n_kres);
            });
        } else {
            let system = loc as System;
            document.querySelectorAll('.kres').forEach(e => {
                e.remove();
            });
            let md = document.querySelector('.mdrone')!;
            let n_kres = document.createElement('div');
            n_kres.classList.add('kres');
            n_kres.classList.add('action');
            n_kres.classList.add('a');
            n_kres.setAttribute('tooltip', 'hold to extract <span class="content">100g/h</span>');
            let int: NodeJS.Timeout;
            let amt_mined = 0;
            let time_elapsed = 0;
            let i_rate = 1.66666667;
            let rate_mul = 1;
            n_kres.addEventListener('mousedown', () => {
                if (this.cargo.is_full()) {
                    document.querySelector('.tooltip.content')!.innerHTML = `cargo bay full`;
                } else {
                    rate_mul = 1;
                    document.querySelector('.tooltip.content')!.innerHTML = `mined <span class="content amt">${format_mass(amt_mined)}</span> <span style="color: ${color_of(name)};">${name}</span><br/><span class="content time">${format_time(time_elapsed)}</span> elapsed<br/>hold to accelerate`;
                    let amt = document.querySelector('.tooltip.content .amt')!;
                    let time = document.querySelector('.tooltip.content .time')!;
                    clearInterval(int);
                    int = setInterval(() => {
                        rate_mul *= 1.1;
                        amt_mined += i_rate * rate_mul;
                        time_elapsed += rate_mul;
                        this.add_time(rate_mul, 1);
                        this.cargo.push({ name: name, amount: i_rate * rate_mul });
                        if (this.cargo.is_full()) {
                            document.querySelector('.tooltip.content')!.innerHTML = `cargo bay full`;
                            clearInterval(int);
                            return;
                        }
                        amt.textContent = format_mass(amt_mined);
                        time.textContent = format_time(time_elapsed);
                    }, 100);
                }
            });
            n_kres.addEventListener('mouseup', () => {
                document.querySelector('.tooltip.content')!.innerHTML = `mined <span class="content amt">${format_mass(amt_mined)}</span> <span style="color: ${color_of(name)};">${name}</span><br/><span class="content time">${format_time(time_elapsed)}</span> elapsed<br/>hold to resume`;
                clearInterval(int);
            });
            n_kres.addEventListener('mouseout', () => {
                amt_mined = 0;
                time_elapsed = 0;
                clearInterval(int);
            });
            let name = name_of(system.star.resource);
            n_kres.innerHTML = `extract <span style="color: ${color_of(name)};">${name}</span>`;
            this.bar.add(n_kres);
            md.appendChild(n_kres);
        }
    }

    push(m: Module): void {
        this.modules.push(m);
        let el = document.createElement('div');
        el.setAttribute('class', 'module');
        let name = document.createElement('div');
        name.textContent = m.name;
        el.appendChild(name);
        m.info.forEach((m) => {
            let i_div = document.createElement('div');
            i_div.innerHTML = `${m[0]}: <span class="content">${m[1]}</span>`;
            el.appendChild(i_div);
        })
        m.actions.forEach((a) => {
            let i_div = document.createElement('div');
            i_div.setAttribute('class', 'action a');
            i_div.textContent = a.name;
            i_div.setAttribute('tooltip', 'press to ' + a.description);
            this.bar.add(i_div);
            el.appendChild(i_div);
        });
        this.before.before(el);
    }
}