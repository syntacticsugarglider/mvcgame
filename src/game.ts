import { Render, System, Resource, MoonResource, Moon } from './render/render';
import { Content, Updater, Ship, Point, ContentType } from './scene';
import { Bar } from "./ui";

var vowels = ['a', 'e', 'i', 'o', 'u'];
var consts = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'qu', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', 'tt', 'ch', 'sh'];

function word(len: number): string {
    var word = '';
    var is_vowel = false;
    var arr;
    for (var i = 0; i < len; i++) {
        if (is_vowel) arr = vowels
        else arr = consts
        is_vowel = !is_vowel;
        word += arr[Math.round(Math.random() * (arr.length - 1))];
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

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function select_random<T>(list: T[]): T {
    return list[rand(0, list.length - 1)];
}

function generate_system(): System {
    let system = new System(new Point(0, 0), word(rand(3, 8)));
    let count_options: [number, number][] = [[1, 5], [2, 4], [3, 3]];
    let planet_count = select_random(weighted_list(count_options));
    for (let i = 0; i < planet_count; i++) {
        let count_options: [number, number][] = [[0, 5], [2, 2], [3, 2], [4, 1]];
        let moon_count = select_random(weighted_list(count_options));
        let planet = {
            orbit: { radius: rand(50, 120), speed: rand(-10, 10) },
            name: word(rand(3, 8)),
            position: 0,
            size: rand(10, 20),
            resources: [],
            moons: [] as Moon[],
        };
        for (let i = 0; i < moon_count; i++) {
            let size = rand(2, 5);
            planet.moons.push({
                orbit: { radius: rand(5, 10) + size + planet.size, speed: rand(-5, 5) },
                size: size,
                position: 0,
                resource: MoonResource.Corundum
            });
        }
        system.planets.push(planet);
    }
    return system;
}

export function initialize(game: Game) {
    let map = game.scene.new_map();

    let sol = generate_system();

    map.add(sol);

    handle_pan(game.scene);

    game.scene.show_map(map);
}