import { Render, System, Resource, MoonResource } from './render/render';
import { Content, Updater, Ship, Point, ContentType } from './scene';
import { Bar } from "./ui";

export class Game {
    scene: Render;
    private bar: Bar;
    private updaters: Updater[];

    constructor(render: Render) {
        this.updaters = [];
        this.scene = render;
        this.bar = new Bar(document.querySelector(".bar.container")!);
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

export function initialize(game: Game) {
    let ship = new Ship();

    ship.velocity = new Point(100, 100);

    game.add(ship);

    let map = game.scene.new_map();

    let sol = new System(new Point(0, 0), "sol");
    sol.planets.push({
        orbit: {
            radius: 100,
            speed: 5
        }, position: 0, size: 10,
        resources: [Resource.Petroleum],
        moons: [{
            orbit: {
                radius: 20,
                speed: -10
            },
            position: 0,
            size: 2,
            resource: MoonResource.Silica,
        }, {
            orbit: {
                radius: 30,
                speed: 5
            },
            position: 0,
            size: 3,
            resource: MoonResource.Corundum,
        }]
    });
    map.add(sol);

    handle_pan(game.scene);

    game.scene.show_map(map);
}