import { Render, Viewport, StarMap, System, Resource, MoonResource, StarResource } from './render';
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

    hide(): void {
        this.scene.visible = false;
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
        let sq10 = new Path.Circle(loc, 7);
        let sq2_centroid = centroid(sq2);
        let sq3_centroid = centroid(sq3);
        let sq4_centroid = centroid(sq4);
        sq5.fillColor = new Color('#444');
        let sun = new Group([sq1, sq2, sq3, sq4, sq5, sq6, sq10]);
        let resource_html = "";
        let s_resource_name = "";
        let s_resource_color = "";
        if (star.star.resource == StarResource.Caesium) {
            s_resource_name = 'caesium';
            s_resource_color = '#cc241d';
        } else if (star.star.resource == StarResource.Lithium) {
            s_resource_name = 'lithium';
            s_resource_color = '#d79921';
        }
        sun.on('mouseenter', () => {
            this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich`;
        });
        sun.strokeColor = new Color('#444');
        sq6.fillColor = new Color('#111');
        sq7.strokeWidth = 0;
        sq7.fillColor = new Color(s_resource_color);
        sq10.fillColor = new Color(s_resource_color);
        sun.visible = false;
        let h_geo = new Group();
        let geometry = new Group([circ, surround, sun]);
        let planets = new Group();
        let moons = new Group();
        geometry.addChildren([planets, sq7]);
        let ordered_planet_geos: Path[] = [];
        star.planets.sort((n1, n2) => n1.orbit.radius - n2.orbit.radius);
        let sq_co = false;
        if (star.planets.length % 2 == 0) {
            sq_co = true;
        }
        star.planets.forEach((planet) => {
            resource_html = "";
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
            let max_moon_radius = 0
            if (planet.moons.length > 0) {
                max_moon_radius = (planet.moons[planet.moons.length - 1]).orbit.radius
            }

            let planet_buffer = new Path.Circle(base.position!, max_moon_radius);
            planet_buffer.fillColor = new Color("fff");
            planet_buffer.opacity = 0
            geometry.addChild(planet_buffer);
            ordered_planet_geos.push(base);
            base.fillColor = new Color('#444');
            let accu = 0;
            planet.resources.forEach((resource) => {
                let resource_geo = new Path.Circle(p_loc, planet.size + accu + 3);
                planet_geometry.insertChild(0, resource_geo);
                let rec;
                if (resource == Resource.Petroleum) {
                    resource_geo.fillColor = new Color('#b16286');
                    rec = `<span style="color: #b16286">petroleum</span>`;
                } else if (resource == Resource.Cellulose) {
                    resource_geo.fillColor = new Color('#98971a');
                    rec = `<span style="color: #98971a">cellulose</span>`;
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
                accu += 3;
            });
            if (planet.resources.length == 0) {
                resource_html = "barren";
            } else {
                resource_html = `high ${resource_html} content`
            }
            h_geo.insertChild(0, sq);
            sq.rotate(90, sq_centroid);
            let moon_idx = 0;
            let rec2 = "";
            planet.moons.forEach(moon => {
                let m_orbit = new Path.Circle(p_loc, moon.orbit.radius);
                let m_loc = new Point(loc.x! + planet.orbit.radius + moon.orbit.radius, loc.y!);
                let m_base = new Path.Circle(m_loc, moon.size);
                m_orbit.strokeColor = new Color('#555');
                let rec;
                if (moon.resource == MoonResource.Silica) {
                    m_base.fillColor = new Color('#458588');
                    rec = `<span style="color: #458588">silica</span>`;
                } else if (moon.resource == MoonResource.Corundum) {
                    rec = `<span style="color: #698d6a">corundum</span>`;
                    m_base.fillColor = new Color('#698d6a');
                }
                moons.addChild(m_base);
                h_geo.addChild(m_orbit);
                if (moon_idx == 0) {
                    if (planet.moons.length < 3) {
                        rec2 += `${rec}`
                    } else {
                        rec2 += `${rec}, `
                    }
                } else if (planet.moons.length == 2) {
                    rec2 += ` and ${rec}`
                } else if (accu < planet.moons.length - 1) {
                    rec2 += `${rec}`;
                } else {
                    rec2 += `, and ${rec}`;
                }
                this.paper.view.on('frame', () => {
                    m_base.rotate(moon.orbit.speed / 10, base.position!);
                });
                m_orbit.on('mouseenter', () => {
                    this.tooltip.text = `<span class="content">${planet.name}</span>\n${resource_html}`;
                });
                planet_geometry.addChildren([m_orbit, m_base]);
                moon_idx += 1;
            })

            if (planet.moons.length == 1) {
                resource_html += `\nmoon abounds with ${rec2}`;
            } else if (planet.moons.length != 0) {
                resource_html += `\nmoons abound with ${rec2}`
            }
            planet_geometry.on('mouseenter', () => {
                this.tooltip.text = `<span class="content">${planet.name}</span>\n${resource_html}`;
            });
            planet_geometry.addChild(base);
            this.paper.view.on('frame', () => {
                planet_geometry.rotate(planet.orbit.speed / 50, loc);
                planet_buffer.rotate(planet.orbit.speed / 50, loc);
                sq.rotate(planet.orbit.speed / 50, loc);
            });
            orbit.strokeColor = new Color('#444');
            h_geo.addChild(orbit);
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
            geometry.bringToFront()
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
            circ.scale(10);
        });

        geometry.on('mouseleave', () => {
            this.tooltip.hide();
        });


        // geometry.on('mousemove', (event: MouseEvent) => {
        //     console.log(event.delta);
        //     star.planets.forEach((planet) => {
        //         planet.moons.sort((n1, n2) => n1.orbit.radius - n2.orbit.radius);
        //         let max_buffer = (planet.moons[planet.moons.length - 1]).orbit.radius;
        //         let star_dist = (event.clientX - loc.x!) ** 2 + (event.clientY - loc.y!) ** 2;
        //         if (star_dist <= ((planet.orbit.radius + max_buffer) ** 2) && (star_dist >= ((planet.orbit.radius - max_buffer) ** 2))) {
        //             this.tooltip.text = `<span class="content">${planet.name}</span>\n${resource_html}`;
        //         }
        //     });
        // })


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
            circ.scale(1 / 10);
        });
        this.paper.view.on('frame', () => {
            surround.rotate(2);
            sq2.rotate(0.4, sq2_centroid);
            sq3.rotate(0.8, sq3_centroid);
            sq4.rotate(1.2, sq4_centroid);
            sq8.rotate(0.05);
            sq9.rotate(0.1);
            let p_idx = 0;
            star.planets.forEach((planet) => {
                p_idx += 1;
                planet.position += planet.orbit.speed / 50;
                planet.moons.forEach((moon) => {
                    moon.position = (moon.position + moon.orbit.speed / 50) % 360;
                })
            });
        });
    }
}