import 'file-loader?name=[name].[ext]!./index.html';
import { Game } from './src/game'

import { PaperJS } from './src/render/paperjs';

window.onload = () => {
    let game = new Game(new PaperJS(document.querySelector("canvas")!));
    let last_time = 0;
    let update = (time: number) => {
        game.update(time - last_time);
        last_time = time;
        window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
}