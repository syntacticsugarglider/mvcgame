import { Render } from './render/render';
import { Content, Updater, Ship, Point, ContentType } from './scene';
import { Bar } from "./ui";

export class Game {
    private scene: Render;
    private bar: Bar;
    private updaters: Updater[];

    constructor(render: Render) {
        this.updaters = [];
        this.scene = render;
        this.bar = new Bar(document.querySelector(".bar.container")!);;
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
                this.scene.center = ship.position;
            });
            update_velocity();
        }
        if (content.update) {
            this.updaters.push(content.update!);
        }
    }
}

export function initialize(game: Game) {
    let ship = new Ship();

    ship.velocity = new Point(100, 100);

    game.add(ship);
}