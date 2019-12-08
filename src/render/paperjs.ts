import { Render, Viewport, StarMap, System, Resource, MoonResource } from './render';
import { Content, ContentType, Ship } from '../scene';
import { Tooltip } from '../ui';

import { PaperScope, Matrix, Point, Path, Color, Group, PointText, Tween, Rectangle, Size } from 'paper';

export class PaperJS extends Render {
    private paper: PaperScope;
    private scene: Group;
    private tooltip?: Tooltip;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.paper = new PaperScope();
        this.paper.setup(canvas);
        this.scene = new Group();
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
                this.scene.addChild(triangle);
                triangle.fillColor = new Color('#555');
                let update = () => {
                    let pos = (content as Ship).position;
                    triangle.position = new Point(pos.x, pos.y);
                };
                update();
                content.on('position', update);
            }
        }
    }

    show_map(map: StarMap): void {
        this.scene.visible = false;
        (map as PaperMap).scene.visible = true;
    }

    new_map(): StarMap {
        return new PaperMap(this.paper, this.tooltip!);
    }

    use_tooltip(tooltip: Tooltip): void {
        this.tooltip = tooltip;
    }
}

function centroid(triangle: Path) {
    let segments = triangle.segments!;
    let vertex = segments[0].point!;
    let opposite = new Point(segments[1].point!.x! - (segments[1].point!.x! - segments[2].point!.x!) / 2, segments[1].point!.y! - (segments[1].point!.y! - segments[2].point!.y!) / 2);
    let c = new Point(vertex.x! + (opposite.x! - vertex.x!) * 2 / 3, vertex.y! + (opposite.y! - vertex.y!) * 2 / 3);
    return c;
}

class PaperMap extends StarMap {
    private paper: PaperScope;
    scene: Group;
    private tooltip: Tooltip;

    constructor(paper: PaperScope, tooltip: Tooltip) {
        super();
        this.scene = new Group();
        this.paper = paper;
        this.tooltip = tooltip;
    }

    add(star: System): void {
        let loc = new Point(star.location.x, star.location.y);
        let label = new PointText(new Point(loc.x!, loc.y! + 32.5));
        let circ = new Path.Circle(loc, 15);
        circ.strokeColor = new Color('#777');
        circ.fillColor = new Color('#000');
        let surround = new Path.RegularPolygon(loc, 9, 11);
        surround.strokeColor = new Color('#777');
        surround.fillColor = new Color('#000');
        label.fillColor = new Color('#999');
        label.justification = 'center';
        label.content = star.name;
        label.fontFamily = `'Fira Mono', 'Source Code Pro', 'Courier New', Courier, monospace`;
        this.scene.addChildren([circ, surround, label]);
        this.scene.visible = false;
        let sq1 = new Path.Circle(loc, 25);
        let sq2 = new Path.RegularPolygon(loc, 3, 25);
        let sq3 = new Path.RegularPolygon(loc, 3, 25);
        sq2.fillColor = new Color('#444');
        sq3.fillColor = new Color('#000');
        let sq4 = new Path.RegularPolygon(loc, 3, 25);
        let sq5 = new Path.Circle(loc, 12.5);
        let sq6 = new Path.Circle(loc, 12.5);
        let sq7 = new Path.Circle(loc, 7);
        let sq8 = new Path.RegularPolygon(loc, 4, 148);
        let sq9 = new Path.RegularPolygon(loc, 4, 148);
        let sq2_centroid = centroid(sq2);
        let sq3_centroid = centroid(sq3);
        let sq4_centroid = centroid(sq4);
        sq5.fillColor = new Color('#444');
        let sun = new Group([sq1, sq2, sq3, sq4, sq5, sq6, sq7]);
        sun.on('mouseenter', () => {
            this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: #d79921">lithium</span>-rich`;
        });
        sun.strokeColor = new Color('#444');
        sq6.fillColor = new Color('#111');
        sq7.strokeWidth = 0;
        sq7.fillColor = new Color("#d79921");
        sun.visible = false;
        let h_geo = new Group();
        let geometry = new Group([circ, surround, sun]);
        let planets = new Group();
        let moons = new Group();
        geometry.addChild(planets);
        let rotate_geos = new Map();
        let sq_co = true;
        star.planets.forEach((planet) => {
            let planet_geometry = new Group([]);
            let orbit = new Path.Circle(loc, planet.orbit.radius);
            let sq = new Path.RegularPolygon(loc, 3, planet.orbit.radius);
            let sq_centroid = centroid(sq);
            if (sq_co) {
                sq.fillColor = new Color('#111');
                sq_co = false;
            } else {
                sq.fillColor = new Color('#000');
                sq_co = true;
            }
            let p_loc = new Point(loc.x! + planet.orbit.radius, loc.y!);
            let base = new Path.Circle(p_loc, planet.size);
            base.fillColor = new Color('#444');
            let accu = 0;
            let resource_html = "";
            planet.resources.forEach((resource) => {
                let resource_geo = new Path.Circle(p_loc, planet.size + accu + 1);
                planet_geometry.addChild(resource_geo);
                let rec;
                switch (resource) {
                    case Resource.Petroleum:
                        resource_geo.fillColor = new Color('#b16286');
                        rec = `<span style="color: #b16286">petroleum</span>`;
                }
                if (accu == 0) {
                    if (planet.resources.length < 3) {
                        resource_html += `${rec}`
                    } else {
                        resource_html += `${rec}, `
                    }
                } else if (planet.resources.length == 2) {
                    resource_html += ` and ${rec}`
                } else if (accu < planet.resources.length - 1) {
                    resource_html += `${rec}`;
                } else {
                    resource_html += `, and ${rec}`;
                }
                accu += 1;
            });
            if (planet.resources.length == 0) {
                resource_html = "barren";
            } else {
                resource_html = `high ${resource_html} content`
            }
            planet_geometry.on('mouseenter', () => {
                this.tooltip.text = `<span class="content">${planet.name}</span>\n${resource_html}`;
            });
            h_geo.insertChild(0, sq);
            sq.rotate(planet.position + 90, sq_centroid);
            this.paper.view.on('frame', () => {
                sq.rotate(planet.orbit.speed / 50, sq_centroid);
            });
            planet.moons.forEach(moon => {
                let m_orbit = new Path.Circle(p_loc, moon.orbit.radius);
                let m_loc = new Point(loc.x! + planet.orbit.radius + moon.orbit.radius, loc.y!);
                let m_base = new Path.Circle(m_loc, moon.size);
                m_orbit.strokeColor = new Color('#555');
                switch (moon.resource) {
                    case MoonResource.Silica:
                        m_base.fillColor = new Color('#458588');
                    case MoonResource.Corundum:
                        m_base.fillColor = new Color('#698d6a');
                }
                rotate_geos.set(moon, [m_base, m_orbit])
                moons.addChild(m_base);
                h_geo.addChild(m_orbit);
                m_orbit.on('mouseenter', () => {
                    this.tooltip.text = `<span class="content">${planet.name}</span>\n${resource_html}`;
                });
            })
            planet_geometry.addChild(base);
            orbit.strokeColor = new Color('#444');
            h_geo.addChild(orbit);
            rotate_geos.set(planet, planet_geometry);
            planets.addChild(planet_geometry);
        });
        geometry.addChild(h_geo);
        geometry.addChild(moons);
        planets.visible = false;
        moons.visible = false;
        h_geo.visible = false;
        surround.fillColor = new Color('#111')
        circ.on('mouseenter', () => {
            this.tooltip.text = `${star.name} system`;
        });
        geometry.on('mouseenter', () => {
            surround.opacity = 0;
            sun.visible = true;
            this.tooltip.show();
            planets.visible = true;
            h_geo.visible = true;
            moons.visible = true;
            circ.fillColor = new Color('#111');
            sun.bringToFront();
            planets.bringToFront();
            moons.bringToFront();
            circ.matrix = new Matrix(10, 0, 0, 10, 0, 0);
        });
        this.scene.addChildren([geometry]);
        circ.on('mouseleave', () => {
            this.tooltip.hide();
        });
        geometry.on('mouseleave', () => {
            surround.opacity = 1;
            sun.visible = false;
            circ.fillColor = new Color('#000');
            planets.visible = false;
            h_geo.visible = false;
            moons.visible = false;
            sun.sendToBack();
            circ.matrix = new Matrix(1 / 10, 0, 0, 1 / 10, 0, 0);
        });
        this.paper.view.on('frame', () => {
            surround.rotate(2);
            sq2.rotate(0.4, sq2_centroid);
            sq3.rotate(0.8, sq3_centroid);
            sq4.rotate(1.2, sq4_centroid);
            sq8.rotate(0.05);
            sq9.rotate(0.1);
            star.planets.forEach((planet) => {
                let planet_center = new Point(planet.orbit.radius * Math.cos(Math.PI / 180 * planet.position), planet.orbit.radius * Math.sin(Math.PI / 180 * planet.position));
                rotate_geos.get(planet).rotate(planet.orbit.speed / 50, loc);
                planet.position += planet.orbit.speed / 50;
                planet.moons.forEach((moon) => {
                    rotate_geos.get(moon)[0].rotate(moon.orbit.speed / 10, planet_center);
                    rotate_geos.get(moon)[0].rotate(planet.orbit.speed / 50, loc);
                    rotate_geos.get(moon)[1].rotate(moon.orbit.speed / 10, planet_center);
                    rotate_geos.get(moon)[1].rotate(planet.orbit.speed / 50, loc);
                    moon.position = (moon.position + moon.orbit.speed / 50) % 360;
                })
            });
        });
    }
}