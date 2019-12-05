import 'file-loader?name=[name].[ext]!./index.html';
import { Game } from "./src/game"

window.onload = () => {
    new Game();
}