import { Render, Viewport } from './render';
import { Content, ContentType, Ship } from '../scene';

import { PaperScope, Matrix, Point, Path, Color } from 'paper';

export class PaperJS extends Render {
    private paper: PaperScope;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.paper = new PaperScope();
        this.paper.setup(canvas);
        window.addEventListener('resize', (_) => {
            this.paper.view.center = new Point(this.__viewport.center.x, this.__viewport.center.y);
        });
    }

    render(delta: number): void {
        this.paper.view.update();
    }

    set _viewport(viewport: Viewport) {
        this.paper.view.matrix = new Matrix(viewport.scale, 0, 0, viewport.scale, 0, 0);
        this.paper.view.center = new Point(viewport.center.x, viewport.center.y);
    }

    add(content: Content) {
        switch (content.type) {
            case ContentType.Ship: {
                var triangle = new Path.RegularPolygon(new Point(0, 0), 3, 40);
                triangle.fillColor = new Color('white');
                let update = () => {
                    let pos = (content as Ship).position;
                    triangle.position = new Point(pos.x, pos.y);
                };
                update();
                content.on('position', update);
            }
        }
    }
}