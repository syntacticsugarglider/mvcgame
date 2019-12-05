import 'file-loader?name=[name].[ext]!./index.html';
import { Game, initialize } from './src/game'

import { PaperJS } from './src/render/paperjs';
import { Point } from './src/scene';

window.onload = () => {
    let render = new PaperJS(document.querySelector("canvas")!);
    render.center = new Point(0, 0);
    let game = new Game(render);
    let last_time = 0;
    let update = (time: number) => {
        game.update(time - last_time);
        last_time = time;
        window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
    initialize(game);
}