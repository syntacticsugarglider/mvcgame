import { Render, Viewport, StarMap, System, Resource, MoonResource } from './render';
import { Content, ContentType, Ship } from '../scene';

import { PaperScope, Matrix, Point, Path, Color, Group, PointText, Tween, Rectangle, Size } from 'paper';

export class PaperJS extends Render {
    private paper: PaperScope;
    private scene: Group;

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
        this.scene.opacity = 0;
    }

    new_map(): StarMap {
        return new PaperMap(this.paper);
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
    private scene: Group;

    constructor(paper: PaperScope) {
        super();
        this.paper = paper;
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
        let sq1 = new Path.Circle(loc, 25);
        let sq2 = new Path.RegularPolygon(loc, 3, 25);
        let sq3 = new Path.RegularPolygon(loc, 3, 25);
        let sq4 = new Path.RegularPolygon(loc, 3, 25);
        let sq5 = new Path.Circle(loc, 12.5);
        let sq6 = new Path.Circle(loc, 12.5);
        let sq7 = new Path.Circle(loc, 2);
        let sq8 = new Path.RegularPolygon(loc, 4, 148);
        let sq9 = new Path.RegularPolygon(loc, 4, 148);
        let sq2_centroid = centroid(sq2);
        let sq3_centroid = centroid(sq3);
        let sq4_centroid = centroid(sq4);
        sq5.fillColor = new Color('#444');
        let sun = new Group([sq1, sq2, sq3, sq4, sq5, sq6, sq7]);
        sun.strokeColor = new Color('#444');
        sq6.fillColor = new Color('#111');
        sq7.strokeWidth = 0;
        sq7.fillColor = new Color("#f00");
        sun.visible = false;
        let system_name = new PointText(new Point(loc.x!, loc.y! - 165));
        system_name.fillColor = new Color('#999');
        system_name.justification = 'center';
        system_name.content = `${star.name} system`;
        system_name.fontFamily = `'Fira Mono', 'Source Code Pro', 'Courier New', Courier, monospace`;
        let h_geo = new Group();
        let geometry = new Group([circ, surround, sun]);
        let planets = new Group();
        let moons = new Group();
        geometry.addChild(planets);
        h_geo.addChild(system_name);
        let rotate_geos = new Map();
        star.planets.forEach((planet) => {
            let planet_geometry = new Group([]);
            let orbit = new Path.Circle(loc, planet.orbit.radius);
            let p_loc = new Point(loc.x! + planet.orbit.radius, loc.y!);
            let base = new Path.Circle(p_loc, planet.size);
            base.fillColor = new Color('#444');

            let accu = 0;
            planet.resources.forEach((resource) => {
                let resource_geo = new Path.Circle(p_loc, planet.size + accu + 1);
                planet_geometry.addChild(resource_geo);
                accu += 1;
                if (resource == Resource.Petroleum) {
                    resource_geo.fillColor = new Color('#0f0');
                }
            });
            planet.moons.forEach(moon => {
                let m_orbit = new Path.Circle(p_loc, moon.orbit.radius);
                let m_loc = new Point(loc.x! + planet.orbit.radius + moon.orbit.radius, loc.y!);
                let m_base = new Path.Circle(m_loc, moon.size);
                m_orbit.strokeColor = new Color('#555');
                if (moon.resource == MoonResource.Silica) {
                    m_base.fillColor = new Color('#ff0');
                }

                else if (moon.resource == MoonResource.Corundum) {
                    m_base.fillColor = new Color('#34d8eb');
                }

                rotate_geos.set(moon, [m_base, m_orbit])

                moons.addChild(m_base);
                h_geo.addChild(m_orbit);

            })
            planet_geometry.addChild(base);
            orbit.strokeColor = new Color('#777');
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
        geometry.on('mouseenter', () => {
            surround.opacity = 0;
            sun.visible = true;
            planets.visible = true;
            h_geo.visible = true;
            moons.visible = true;
            circ.fillColor = new Color('#111');
            sun.bringToFront();
            planets.bringToFront();
            moons.bringToFront();
            circ.matrix = new Matrix(10, 0, 0, 10, 0, 0);
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
                planet.position = (planet.position + planet.orbit.speed / 50) % 360;
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