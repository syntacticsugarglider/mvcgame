import { Render, Viewport } from './render';

import { PaperScope, Matrix } from 'paper';

export class PaperJS extends Render {
    private paper: PaperScope;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.paper = new PaperScope();
        this.paper.setup(canvas);
    }

    render(delta: number): void {
        this.paper.view.update();
    }

    set_viewport(viewport: Viewport): void {
        this.paper.view.matrix = new Matrix(viewport.scale, 0, 0, viewport.scale, viewport.offset.x, viewport.offset.y);
    }
}