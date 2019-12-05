import { Render } from './render/render';
import { Content, Updater, Ship, Point } from './scene';

export class Game {
    private scene: Render;
    private updaters: Updater[];

    constructor(render: Render) {
        this.updaters = [];
        this.scene = render;
    }

    update(_delta: number): void {
        let delta = _delta / 1000;
        this.updaters.forEach(updater => {
            updater(delta);
        });
    }

    add(content: Content) {
        this.scene.add(content);
        if (content.update) {
            this.updaters.push(content.update!);
        }
    }
}

export function initialize(game: Game) {
    let ship = new Ship();
    ship.velocity = new Point(20, 20);

    game.add(ship);
}