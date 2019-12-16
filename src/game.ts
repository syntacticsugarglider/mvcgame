import { Render, System, Resource, MoonResource, Moon, StarResource, Planet } from './render/render';
import { Content, Updater, Ship, Point, ContentType } from './scene';
import { Bar } from "./ui";

var vowels = ['a', 'e', 'i', 'o', 'u'];
var consts = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'qu', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', 'ch', 'sh', 'sv', 'yt', 'bl'];

class RandomProvider {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    random(): number {
        this.seed = ((this.seed + 0x7ED55D16) + (this.seed << 12)) & 0xFFFFFFFF;
        this.seed = ((this.seed ^ 0xC761C23C) ^ (this.seed >>> 19)) & 0xFFFFFFFF;
        this.seed = ((this.seed + 0x165667B1) + (this.seed << 5)) & 0xFFFFFFFF;
        this.seed = ((this.seed + 0xD3A2646C) ^ (this.seed << 9)) & 0xFFFFFFFF;
        this.seed = ((this.seed + 0xFD7046C5) + (this.seed << 3)) & 0xFFFFFFFF;
        this.seed = ((this.seed ^ 0xB55A4F09) ^ (this.seed >>> 16)) & 0xFFFFFFFF;
        return (this.seed & 0xFFFFFFF) / 0x10000000;
    }
}

function word(len: number, source: RandomProvider): string {
    var word = '';
    var is_vowel = false;
    var arr;
    for (var i = 0; i < len; i++) {
        if (is_vowel) arr = vowels
        else arr = consts
        is_vowel = !is_vowel;
        word += arr[Math.round(source.random() * (arr.length - 1))];
    }
    return word;
}

export class Game {
    scene: Render;
    private bar: Bar;
    private updaters: Updater[];

    constructor(render: Render) {
        this.updaters = [];
        this.bar = new Bar(document.querySelector(".bar.container")!);
        this.scene = render;
        this.scene.use_tooltip(this.bar.tooltip);
    }

    update(_delta: number): void {
        let delta = _delta / 1000;
        this.updaters.forEach(updater => {
            updater(delta);
        });
    }

    add(content: Content) {
        this.scene.add(content);
        if (content.type == ContentType.Ship) {
            let ship = content as Ship;
            let update_velocity = () => { };
            ship.on('velocity', update_velocity);
            ship.on('position', () => {
                //this.scene.center = ship.position;
            });
            update_velocity();
        }
        if (content.update) {
            this.updaters.push(content.update!);
        }
    }
}

export function handle_pan(scene: Render) {
    let panning = false;
    let canvas = document.querySelector('canvas')!;
    canvas.addEventListener('mousedown', () => {
        panning = true;
        canvas.classList.add('grabbed');
    });
    canvas.addEventListener('mouseup', () => {
        panning = false;
        canvas.classList.remove('grabbed');
    });
    canvas.addEventListener('mouseleave', () => {
        panning = false;
        canvas.classList.remove('grabbed');
    });
    canvas.addEventListener('blur', () => {
        panning = false;
        canvas.classList.remove('grabbed');

    });
    canvas.addEventListener('mousemove', (e) => {
        if (panning) {
            let center = scene.center;
            center.x -= e.movementX;
            center.y -= e.movementY;
            scene.center = center;
        }
    });
}

function weighted_list<T>(list: [T, number][]): T[] {
    var weighted_list = [];

    for (var i = 0; i < list.length; i++) {
        var multiples = list[i][1] * 100;
        for (var j = 0; j < multiples; j++) {
            weighted_list.push(list[i][0]);
        }
    }

    return weighted_list;
}

function rand(min: number, max: number, source: RandomProvider) {
    return Math.floor(source.random() * (max - min + 1)) + min;
}

function rand_gt(abs_min: number, min: number, max: number, source: RandomProvider) {
    let r = rand(min, max, source);
    while (Math.abs(r) < abs_min) {
        r = rand(min, max, source);
    }
    return r;
}

function select_random<T>(list: T[], source: RandomProvider): T {
    return list[rand(0, list.length - 1, source)];
}

function hash(item: string): number {
    var hash = 0, i, chr;
    if (item.length === 0) return hash;
    for (i = 0; i < item.length; i++) {
        chr = item.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}

function generate_system(b_source: RandomProvider): System {
    let location = new Point(rand(-2000, 2000, b_source), rand(-2000, 2000, b_source));
    let seed = hash(`${location.x}${location.y}`);
    let source = new RandomProvider(seed);
    let resource = select_random(weighted_list([[StarResource.Hydrogen, 5], [StarResource.Helium, 4], [StarResource.Carbon, 3], [StarResource.Lithium, 2], [StarResource.Iron, 1]]), source);
    let system = new System(location, word(rand(3, 8, source), source), resource, true);
    let count_options: [number, number][] = [[0, 0], [1, 5], [2, 4], [3, 3]];
    let planet_count = select_random(weighted_list(count_options), source);
    let orbit_info: [number, number, number][] = [];
    let moon_orbit_info: [number, number][] = [];
    let temp_resources: Resource[];
    for (let i = 0; i < planet_count; i++) {
        temp_resources = [];
        let r_count_options: [number, number][] = [[0, 10], [1, 5], [2, 2]];
        let resource_count = select_random(weighted_list(r_count_options), source);
        let planet: Planet;
        let generated = false;
        let max_distance: number = 0;

        let n_ex = (r: Resource): boolean => {
            for (let res of planet.resources) {
                if (res == r) {
                    return true;
                }
            }
            return false;
        };
        let r_opts = [Resource.Ammonia, Resource.Methane, Resource.Organics, Resource.Oxygen, Resource.Platinum];
        for (let i = 0; i < resource_count; i++) {
            let res = select_random(r_opts, source);
            r_opts.splice(r_opts.indexOf(res), 1);
            if (!temp_resources.includes(res)) {
                temp_resources.push(res);
            }
        }

        for (let i: number = 0; i < 20; i++) {
            planet = {
                orbit: { radius: rand(50, 135, source), speed: rand_gt(1, -10, 10, source) },
                name: word(rand(3, 8, source), source),
                position: rand(0, 360, source),
                size: rand(10, 15, source),
                resources: [] as Resource[],
                moons: [] as Moon[],
            };
            max_distance = Math.min.apply(null, orbit_info.map(val => ((Math.abs(val[0] - planet.orbit.radius) - val[1] - val[2] * 3))));
            if ((max_distance - planet.size - (temp_resources.length + 1) * 3) > 0 && (planet.orbit.radius + planet.size + (temp_resources.length + 1) * 3 < 150) && (planet.orbit.radius + planet.size + (temp_resources.length + 1) * 3 > 25)) {
                planet.resources = temp_resources;
                generated = true;
                break;
            }
        }
        if (!generated) {
            planet_count = i;
            break;
        }


        orbit_info.push([planet!.orbit.radius, planet!.size, planet!.resources.length]);



        system.planets.push(planet!);
    }
    let replace = (num: number) => {
        if (num == 0) {
            return Infinity;
        }
        else {
            return num;
        }
    }
    system.planets.forEach((planet) => {
        moon_orbit_info = [];
        let moon: Moon;
        let count_options: [number, number][] = [[0, 3], [1, 2], [2, 2], [3, 2], [4, 1]];
        let moon_count = select_random(weighted_list(count_options), source);
        let generated: boolean;
        let max_distance: number;
        max_distance = Math.min.apply(null, orbit_info.map(val => ((replace(Math.abs(val[0] - planet.orbit.radius)) - val[1] - val[2] * 3))));
        max_distance = Math.min(max_distance, planet.orbit.radius - 28, 147 - planet.orbit.radius);
        for (let i = 0; i < moon_count; i++) {
            generated = false;
            for (let i: number = 0; i < 20; i++) {
                let size = rand(2, 3, source);
                moon = {
                    orbit: { radius: rand(planet!.size + size + (planet!.resources.length + 1) * 3 + 3, max_distance - size, source), speed: rand_gt(1, -5, 5, source) },
                    size: size,
                    position: rand(0, 360, source),
                    resource: select_random(weighted_list([[MoonResource.Silica, 5], [MoonResource.Corundum, 4], [MoonResource.Hematite, 3], [MoonResource.Cobaltite, 2], [MoonResource.Ilmenite, 1]]), source)
                };
                if ((max_distance - size) < (planet!.size + size + (planet!.resources.length + 1) * 3 + 3)) {
                    break;
                }
                if (moon_orbit_info.every(val => ((Math.abs(val[0] - moon.orbit.radius))) > val[1] + moon.size + 3)) {
                    generated = true;
                    moon_orbit_info.push([moon.orbit.radius, moon.size]);
                    break
                }
            }
            if (!generated) {
                moon_count = i;
                break
            }
            planet!.moons.push(moon!);
        }
    })

    return system;
}

export function initialize(game: Game) {
    let sol = new System(new Point(0, 0), 'sol', StarResource.Hydrogen, true);
    sol.planets = [{
        orbit: {
            radius: 60,
            speed: 10,
        },
        name: "emathh",
        position: 0,
        size: 10,
        resources: [],
        moons: [{
            orbit: {
                radius: 20,
                speed: 2,
            }, position: 0, size: 2, resource: MoonResource.Silica
        }]


    }]

    sol.active = true;
    let map = game.scene.new_map(sol);

    let random_source = new RandomProvider(0x2F9E2B1);

    for (let i = 0; i < 100; i++) {
        let system = generate_system(random_source);
        map.add(system);
    }
    handle_pan(game.scene);

    game.scene.show_map(map);
}