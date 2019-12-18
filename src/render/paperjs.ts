import { Render, Viewport, StarMap, Resource, MoonResource, StarResource, Planet, System } from './render';
import { Content, ContentType, Ship } from '../scene';
import { Tooltip, Modules, Data, Bar } from '../ui';

import { PaperScope, Matrix, Point, Path, Color, Group, PointText, Tween, Rectangle, Size } from 'paper';
import { start } from 'repl';

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
        document.querySelector('.ico')!.classList.add('hidden');
        document.querySelector('.return')!.textContent = 'hide starmap';
        (map as PaperMap).scene.visible = true;
    }

    new_map(sol: System, bar: Bar): StarMap {
        let sol_map = new PaperMap(this.paper, this.tooltip!, sol, bar)
        sol_map.add(sol)
        return sol_map;
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

export class PaperMap extends StarMap {
    private paper: PaperScope;
    scene: Group;
    private tooltip: Tooltip;
    private h: (loc: System | Planet) => void;
    private current_system: System;
    private bar: Bar;
    private emathh: Date;
    private ship: Date;
    private fuel: number;
    private distance: number;
    public on_planet: boolean;
    public current_planet: Planet;

    constructor(paper: PaperScope, tooltip: Tooltip, sol: System, bar: Bar) {
        super();
        this.scene = new Group();
        this.paper = paper;
        this.tooltip = tooltip;
        this.current_system = sol;
        this.on_planet = false;
        this.h = (_) => { };
        this.bar = bar;
        this.ship = new Date('January 1, 5032 00:00:00');
        this.emathh = new Date('January 1, 5032 00:00:00');
        this.fuel = 20000;
        this.bar.fuel_set = this.fuel;
    }

    r_move_handler(h: (loc: System | Planet) => void): void {
        this.h = h;
    }

    to_star(star: System, dist_scale: number): boolean {
        if (star.star.known && !this.on_planet && this.current_system != star) {
            if (dist_scale * Math.sqrt((star.location.x - this.current_system.location.x) ** 2 + (star.location.y - this.current_system.location.y) ** 2) > 30) {
                return false;
            }
            return true;
        }

        if (this.on_planet && star == this.current_system) {
            return true;
        }


        return false;

    }



    to_planet(star: System, planet: Planet): boolean {
        if (this.current_system == star && ((this.current_planet != planet) || !this.on_planet)) {
            return true;
        }
        return false;

    }

    add_time(ship_duration: number, scale_factor: number): void {
        this.ship = new Date(this.ship.getTime() + ship_duration * 60000);
        this.emathh = new Date(this.emathh.getTime() + ship_duration * scale_factor * 60000);
        this.bar.emathh_time = this.emathh;
        this.bar.ship_time = this.ship;
    }

    add_fuel(fuel: number): void {
        this.fuel += fuel;
        this.bar.fuel_set = this.fuel;
    }

    hide(): void {
        this.scene.visible = false;
    }

    add(star: System): void {
        let loc = new Point(star.location.x, star.location.y);
        let dist_scale = 1 / 20;
        let planet_dist_scale = 0.761035 * 2;
        let ion_scaler = 2;
        let fuel_scale = 100000000;
        let label = new PointText(new Point(loc.x!, loc.y! + 32.5));
        let circ = new Path.Circle(loc, 15);
        circ.strokeColor = new Color('#777');
        circ.fillColor = new Color('#000');
        let surround = new Path.RegularPolygon(loc, 9, 11);
        let was_active = false;
        if (star.active) {
            circ.fillColor = new Color('#777');
            surround.strokeColor = new Color('#777');
            surround.fillColor = new Color('#111');
        }


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
        let sq_target = 0;
        let sq11 = new Path.Arc(loc.add(new Point(0, 150)), loc.add(new Point(150, 0)), loc.subtract(new Point(0, 150)));
        let sq12 = new Path.Circle(loc, 25);
        let sq13 = new Path.Circle(loc, 1);
        let sq14 = new Path.Arc(loc.add(new Point(0, 150)), loc.add(new Point(150, 0)), loc.subtract(new Point(0, 150)));
        let current_growing_planet: Planet;
        let current_planet: Planet;
        sq13.strokeColor = new Color("#aaa")
        sq13.strokeWidth = 3;
        sq12.strokeColor = new Color("#aaa")
        sq12.strokeWidth = 3;

        sq11.strokeWidth = 3;

        let jumping = false;
        let planet_loc = new Point(0, 0);
        let growing = false;
        let on_planet = false;
        let incr = 5;
        let arc_rad = 25;
        let scaler = 1;
        let planet_radius = 0;
        let temp_sun = false;
        let trace_visibility = true;
        let mouseenter = () => {
            if (!star.star.known) {
                this.tooltip.text = `<span class="content">${star.star.name}</span>\nno data`;
                this.tooltip.show();
                return;
            }
            trace_visibility = true;
            geometry.bringToFront()
            surround.opacity = 0;
            sun.visible = true;
            this.tooltip.show();
            planets.visible = true;
            planet_buffers.visible = true;
            h_geo.visible = true;
            moons.visible = true;
            sq11.visible = false;
            sq14.visible = false;
            circ.fillColor = new Color('#111');
            sun.bringToFront();
            planets.bringToFront();
            moons.bringToFront();
            if (star.active && !on_planet && !temp_sun) {
                sq12.visible = true;
                sq12.bringToFront();
            }
            if (on_planet) {
                sq13.visible = true;
                sq12.bringToFront();
            }
            planet_buffers.bringToFront();
            circ.scale(10);
        };
        let mouseleave = () => {
            if (!star.star.known) {
                this.tooltip.text = "Unknown"
                return;
            }
            incr = -5;
            trace_visibility = false;
            planet_buffers.visible = false;
            surround.opacity = 1;
            sun.visible = false;
            circ.fillColor = new Color('#000');
            if (star.active) {
                circ.fillColor = new Color('#777');
            }
            planets.visible = false;
            h_geo.visible = false;
            moons.visible = false;
            sun.sendToBack();
            circ.scale(1 / 10);
            sq12.visible = false;
            sq11.visible = true;
            sq14.visible = true;


        };
        this.paper.view.on('frame', () => {
            if (this.current_system != star) {
                on_planet = false;
            }
            if (!growing || temp_sun) {
                if (!was_active && star.active) {
                    if (this.current_system != star) {
                        star.active = false;
                        was_active = true;
                        sq12.visible = false;
                        circ.fillColor = new Color('#000');
                    }
                }
                if (!jumping || (star.active && !temp_sun)) {
                    return;
                }
                let target = (sq_target - 90) % 360;
                sq14.remove();
                sq14 = new Path.Arc(loc.add(new Point(0, -arc_rad)), loc.add(new Point(arc_rad * Math.cos((target - 90) / 2 * (Math.PI / 180)), arc_rad * Math.sin((target - 90) / 2 * (Math.PI / 180)))), loc.add(new Point(arc_rad * Math.cos(target * (Math.PI / 180)) + 0.00001, arc_rad * Math.sin(target * (Math.PI / 180)))));
                sq14.on('mouseenter', mouseenter);
                sq14.on('mouseleave', mouseleave);
                sq14.strokeWidth = 3;
                sq14.strokeColor = new Color('#aaa');
                if (!trace_visibility) {
                    sq14.visible = false;
                }
                sq_target += incr;
                if (sq_target - incr < 0) {
                    temp_sun = false;
                    jumping = false;
                    sq14.remove();
                    return;
                }
                if (sq_target + incr > 360) {
                    if (temp_sun) {
                        this.add_fuel(-this.distance * fuel_scale);
                        this.add_time(this.distance * 365 * 60 ** 2 * 24 ** 2 * 2, 1);
                    }
                    else {
                        this.add_time(this.distance * 0.2127 * 365 * 24 * 60, 4.807);
                    }
                    this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich`;
                    this.current_system = star;
                    jumping = false;
                    star.active = true;
                    was_active = false;
                    this.on_planet = false;
                    on_planet = false;
                    temp_sun = false;

                    sq14.remove();
                    sq13.visible = false;
                    sq12.visible = true;
                    sq12.bringToFront();
                    surround.strokeColor = new Color('#777');
                    surround.fillColor = new Color('#111');

                    this.h(star);

                    return;
                }
                sq_target = sq_target % 360;
            }
            else {
                if (!jumping || !star.active) {
                    return;
                }
                planet_radius = current_growing_planet.size + current_growing_planet.resources.length * 3 + 1;
                let target = (sq_target - 90) % 360;
                planet_loc = planet_loc.rotate(current_growing_planet.orbit.speed / 50, loc);
                sq11.remove();
                sq11 = new Path.Arc(planet_loc.add(new Point(0, -planet_radius)), planet_loc.add(new Point(planet_radius * Math.cos((target - 90) / 2 * (Math.PI / 180)), planet_radius * Math.sin((target - 90) / 2 * (Math.PI / 180)))), planet_loc.add(new Point(planet_radius * Math.cos(target * (Math.PI / 180)) + 0.00001, planet_radius * Math.sin(target * (Math.PI / 180)))));
                sq11.on('mouseenter', mouseenter);
                sq11.on('mouseleave', mouseleave);
                sq11.strokeWidth = 3;
                sq11.strokeColor = new Color('#aaa');
                if (!trace_visibility) {
                    sq11.visible = false;
                }
                sq_target += incr;
                if (sq_target - incr < 0) {
                    jumping = false;
                    growing = false;
                    sq11.remove();
                    return;
                }
                if (sq_target + incr > 360) {
                    this.add_time(this.distance * 365 * 60 ** 2 * 24 ** 2 * 2, 1);
                    this.add_fuel(-this.distance * fuel_scale);
                    this.on_planet = true;
                    jumping = false;
                    sq11.remove();
                    sq12.visible = false;
                    sq13.scale(scaler);
                    sq13.scale(planet_radius);
                    current_planet = current_growing_planet;
                    this.current_planet = current_planet;
                    this.tooltip.text = `<span class="content">${current_planet.name}</span>\n${planet_texts.get(current_planet)}`;
                    scaler = 1 / planet_radius;
                    growing = false;
                    on_planet = true;
                    sq13.position = planet_loc;
                    sq13.visible = true;
                    sq13.bringToFront();

                    this.h(current_planet);

                    return
                }
                sq_target = sq_target % 360;

            }

        });
        let sq2_centroid = centroid(sq2);
        let sq3_centroid = centroid(sq3);
        let sq4_centroid = centroid(sq4);
        let sq_zone = new Path.Circle(loc, 25);
        sq_zone.fillColor = new Color("fff");
        sq_zone.opacity = 0;
        sq5.fillColor = new Color('#444');
        let sun = new Group([sq1, sq2, sq3, sq4, sq5, sq6, sq10, sq_zone]);
        let resource_html = "";
        let s_resource_name = "";
        let s_resource_color = "";
        if (star.star.resource == StarResource.Hydrogen) {
            s_resource_name = 'hydrogen';
            s_resource_color = '#ffb61c';
        } else if (star.star.resource == StarResource.Helium) {
            s_resource_name = 'helium';
            s_resource_color = '#ff831c';
        } else if (star.star.resource == StarResource.Carbon) {
            s_resource_name = 'carbon';
            s_resource_color = '#ffffff';
        } else if (star.star.resource == StarResource.Lithium) {
            s_resource_name = 'lithium';
            s_resource_color = '#ff6b6b';
        } else if (star.star.resource == StarResource.Iron) {
            s_resource_name = 'iron';
            s_resource_color = '#119999';
        }
        sun.on('mouseenter', () => {
            let first_point: Point;
            let second_point: Point;
            let time: number;
            let duration_text: string;
            let duration_emathh_text: string;
            let fuel_text: string;
            first_point = new Point(this.current_system.location.x, this.current_system.location.y);
            second_point = new Point(star.location.x, star.location.y);
            this.distance = dist_scale * Math.sqrt((first_point.x! - second_point.x!) ** 2 + (first_point.y! - second_point.y!) ** 2);

            if (on_planet && this.current_system == star) {
                this.distance = this.current_planet.orbit.radius * dist_scale / 60 / 24 / 365;
                if (this.distance * fuel_scale >= 1000) fuel_text = Math.floor((this.distance * fuel_scale / 1000)).toFixed(0).concat(" kg");
                else fuel_text = (this.distance * fuel_scale).toFixed(2).concat(" g");
            }
            time = this.distance * 0.2127 * 365 * 24 * 3600 * 1000;
            duration_text = Math.floor(time / (365 * 24 * 3600 * 1000)).toString().concat(" years ",
                Math.floor((time % (365 * 24 * 3600 * 1000)) / (24 * 3600 * 1000)).toString(), " days ")
            time = this.distance * 0.2127 * 4.807 * 365 * 24 * 3600 * 1000;
            duration_emathh_text = Math.floor(time / (365 * 24 * 3600 * 1000)).toString().concat(" years ",
                Math.floor((time % (365 * 24 * 3600 * 1000)) / (24 * 3600 * 1000)).toString(), " days ")
            if (this.to_star(star, dist_scale)) {
                this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich\n${this.distance.toFixed(2)} light years away\n${duration_text}expended for ship\n${duration_emathh_text}expended for emathh\nlong press to jump`;
            }
            else {
                this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich\n${this.distance.toFixed(2)} light years away\nunable to jump`;
            }
            if (star.active) {
                if (on_planet) {
                    time = this.distance * 365 * 60 ** 2 * 24 ** 2 * ion_scaler * 60000;
                    duration_text = Math.floor(time / (365 * 24 * 3600 * 1000)).toString().concat(" years ",
                        Math.floor((time % (365 * 24 * 3600 * 1000)) / (24 * 3600 * 1000)).toString(), " days ")
                    if (this.distance * fuel_scale > this.fuel) {
                        this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich\n${(this.distance * planet_dist_scale * 24 * 60 * 365).toFixed(2)} light minutes away\nnot enough fuel`;
                    }
                    else if (this.to_star(star, dist_scale)) {
                        this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich\n${(this.distance * planet_dist_scale * 24 * 60 * 365).toFixed(2)} light minutes away\n${fuel_text!} of fuel lost\n${duration_text}expended for ship\n${duration_text}expended for emathh\nlong press to travel`;
                    }

                    else {
                        this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich\n${(this.distance * planet_dist_scale * 24 * 60 * 365).toFixed(2)} light minutes away\nunable to travel`;
                    }
                }
                else {
                    this.tooltip.text = `<span class="content">${star.star.name}</span>\n<span style="color: ${s_resource_color}">${s_resource_name}</span>-rich`;
                }
            }

        });

        sun.strokeColor = new Color('#444');
        sq6.fillColor = new Color('#111');
        sq7.strokeWidth = 0;
        sq7.fillColor = new Color(s_resource_color);
        sq10.fillColor = new Color(s_resource_color);
        sun.visible = false;
        sq12.visible = false;
        sq13.visible = false;
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
        let planet_buffers = new Group();
        let planet_texts = new Map();
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
            sq.on("mouseenter", () => {
                this.tooltip.text = `${star.name} system`;
            });
            let p_loc = new Point(loc.x! + planet.orbit.radius, loc.y!);
            let base = new Path.Circle(p_loc, planet.size);
            planet.moons.sort((n1, n2) => n1.orbit.radius - n2.orbit.radius);
            let max_moon_radius = planet.size;
            if (planet.moons.length > 0) {
                max_moon_radius = (planet.moons[planet.moons.length - 1]).orbit.radius
            }

            let planet_buffer = new Path.Circle(base.position!, max_moon_radius);


            planet_buffer.fillColor = new Color("fff");
            planet_buffer.opacity = 0;
            planet_buffers.addChild(planet_buffer);

            ordered_planet_geos.push(base);
            base.fillColor = new Color('#444');
            planet_buffer.on('mousedown', () => {
                if (!this.to_planet(star, planet)) {
                    return;
                }
                if (this.distance * fuel_scale > this.fuel) {
                    return;
                }
                if (temp_sun) {
                    sq_target = 0;
                    temp_sun = false;
                    sq14.remove();
                }
                if (current_growing_planet != planet) {
                    sq_target = 0;
                }

                incr = 5;
                temp_sun = false;
                jumping = true;
                growing = true;

                planet_loc = base.position!;
                current_growing_planet = planet;

                if (sq_target % 360 < incr) {
                    sq_target = 0;
                }
            });
            planet_buffer.on('mouseup', () => {
                incr = -5;
            });
            let accu = 0;
            planet.resources.forEach((resource) => {
                let resource_geo = new Path.Circle(p_loc, planet.size + accu + 3);
                planet_geometry.insertChild(0, resource_geo);
                let rec;
                if (resource == Resource.Oxygen) {
                    resource_geo.fillColor = new Color('#9CD3DC');
                    rec = `<span style="color: #9CD3DC">oxygen</span>`;
                } else if (resource == Resource.Methane) {
                    resource_geo.fillColor = new Color('#F5AF6E');
                    rec = `<span style="color: #F5AF6E">methane</span>`;
                } else if (resource == Resource.Ammonia) {
                    resource_geo.fillColor = new Color('#5B5BAC');
                    rec = `<span style="color: #5B5BAC">ammonia</span>`;
                } else if (resource == Resource.Organics) {
                    resource_geo.fillColor = new Color('#7FD676');
                    rec = `<span style="color: #7FD676">organics</span>`;
                } else if (resource == Resource.Platinum) {
                    resource_geo.fillColor = new Color('#ff5349');
                    rec = `<span style="color: #ff5349">platinum</span>`;
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
            let moon_set = new Set(planet.moons.map(x => x.resource));
            planet.moons.forEach(moon => {
                let m_orbit = new Path.Circle(p_loc, moon.orbit.radius);
                let m_loc = new Point(loc.x! + planet.orbit.radius + moon.orbit.radius, loc.y!);
                let m_base = new Path.Circle(m_loc, moon.size);
                m_orbit.strokeColor = new Color('#555');
                let rec;
                if (moon.resource == MoonResource.Silica) {
                    m_base.fillColor = new Color('#ffeaa8');
                    rec = `<span style="color: #ffeaa8">silica</span>`;
                } else if (moon.resource == MoonResource.Corundum) {
                    rec = `<span style="color: #be7db2">corundum</span>`;
                    m_base.fillColor = new Color('#be7db2');
                } else if (moon.resource == MoonResource.Hematite) {
                    rec = `<span style="color: #f7a3ab">hematite</span>`;
                    m_base.fillColor = new Color('#f7a3ab');
                } else if (moon.resource == MoonResource.Cobaltite) {
                    rec = `<span style="color: #8583ba">cobaltite</span>`;
                    m_base.fillColor = new Color('#8583ba');
                } else if (moon.resource == MoonResource.Ilmenite) {
                    rec = `<span style="color: #ecad80">ilmenite</span>`;
                    m_base.fillColor = new Color('#ecad80');
                }
                moons.addChild(m_base);
                h_geo.addChild(m_orbit);
                if (!rec2.includes(`${rec}`)) {
                    if (moon_set.size < 3) {
                        if (moon_idx == 0) {
                            rec2 += `${rec}`
                        }
                        else {
                            rec2 += ` and ${rec}`
                        }
                    }

                    if (moon_set.size >= 3) {
                        if (moon_idx < planet.moons.length - 1) {
                            rec2 += `${rec}, `
                        }
                        if (moon_idx == planet.moons.length - 1) {
                            rec2 += `and ${rec}`
                        }
                    }
                }


                this.paper.view.on('frame', () => {
                    m_base.rotate(moon.orbit.speed / 10, base.position!);
                });
                planet_geometry.addChildren([m_orbit, m_base]);
                moon_idx += 1;
            })

            if (planet.moons.length == 1) {
                resource_html += `\nmoon abounds with ${rec2}`;
            } else if (planet.moons.length != 0) {
                resource_html += `\nmoons abound with ${rec2}`
            }
            planet_texts.set(planet, resource_html);
            planet_buffer.on('mouseenter', () => {
                let first_point: Point;
                let second_point: Point;
                let time: number;
                let duration_text: string;
                let fuel_text: string;

                first_point = new Point(this.current_system.location.x, this.current_system.location.y);


                second_point = new Point(star.location.x, star.location.y);
                this.distance = dist_scale * Math.sqrt((first_point.x! - second_point.x!) ** 2 + (first_point.y! - second_point.y!) ** 2);

                if (star == this.current_system) {
                    if (on_planet) {
                        this.distance = Math.sqrt((planet.orbit.radius * Math.cos(planet.position * Math.PI / 180) - this.current_planet.orbit.radius * Math.cos(this.current_planet.position * Math.PI / 180)) ** 2 + (planet.orbit.radius * Math.sin(planet.position * Math.PI / 180) - this.current_planet.orbit.radius * Math.sin(this.current_planet.position * Math.PI / 180)) ** 2);
                        this.distance = this.distance * dist_scale / 60 / 24 / 365;
                        if (this.distance * fuel_scale >= 1000) fuel_text = Math.floor((this.distance * fuel_scale / 1000)).toFixed(2).concat(" kg");
                        else fuel_text = (this.distance * fuel_scale).toFixed(2).concat(" g");

                    }
                    else {
                        this.distance = planet.orbit.radius * dist_scale / 60 / 24 / 365;
                        if (this.distance * fuel_scale >= 1000) fuel_text = Math.floor((this.distance * fuel_scale / 1000)).toFixed(2).concat(" kg");
                        else fuel_text = (this.distance * fuel_scale).toFixed(2).concat(" g");
                    }
                }
                if (planet == current_planet && on_planet) {
                    this.tooltip.text = `<span class="content">${planet.name}</span>\n${planet_texts.get(planet)}`;
                }
                else {
                    if (this.distance * fuel_scale > this.fuel) {
                        this.tooltip.text = `<span class="content">${planet.name}</span>\n${planet_texts.get(planet)}\n${(this.distance * planet_dist_scale * 60 * 24 * 365).toFixed(2)} light minutes away\nnot enough fuel`;
                    }
                    else if (this.to_planet(star, planet)) {
                        time = this.distance * 365 * 60 ** 2 * 24 ** 2 * ion_scaler * 1000 * 60;
                        duration_text = Math.floor(time / (365 * 24 * 3600 * 1000)).toString().concat(" years ",
                            Math.floor((time % (365 * 24 * 3600 * 1000)) / (24 * 3600 * 1000)).toString(), " days ")
                        this.tooltip.text = `<span class="content">${planet.name}</span>\n${planet_texts.get(planet)}\n${(this.distance * planet_dist_scale * 60 * 24 * 365).toFixed(2)} light minutes away\n${fuel_text!} of fuel lost\n${duration_text}expended for ship\n${duration_text}expended for emathh\nlong press to travel`;
                    }
                    else {
                        if (star == this.current_system) {
                            this.tooltip.text = `<span class="content">${planet.name}</span>\n${planet_texts.get(planet)}\n${(this.distance * planet_dist_scale * 60 * 24 * 365).toFixed(2)} light minutes away\nunable to travel`;
                        }
                        else {
                            this.tooltip.text = `<span class="content">${planet.name}</span>\n${planet_texts.get(planet)}\n${this.distance.toFixed(2)} light years away\nunable to jump`;
                        }
                    }
                }
            });

            planet_buffer.on('mouseleave', () => {
                incr = -5;
            });

            planet_geometry.addChild(base);
            planet_geometry.rotate(planet.position, loc);
            planet_buffer.rotate(planet.position, loc);
            sq.rotate(planet.position, loc);
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
        geometry.addChild(planet_buffers);
        geometry.addChild(sq11);
        geometry.addChild(sq12);
        geometry.addChild(sq13);
        geometry.addChild(sq14);
        planets.visible = false;
        moons.visible = false;
        h_geo.visible = false;
        planet_buffers.visible = false;
        sq12.visible = false;
        surround.fillColor = new Color('#111');
        circ.on('mouseenter', () => {
            this.tooltip.text = `${star.name} system`;
        });

        sun.on('mousedown', () => {
            if (sq12.visible || !this.to_star(star, dist_scale)) {
                return;
            }
            if (on_planet && (this.distance * fuel_scale) > this.fuel) {
                return;
            }

            incr = 5;
            jumping = true;
            sq11.remove();
            if (on_planet) {
                temp_sun = true;
            }
            if (growing) {
                growing = false;
                sq_target = 0;
            }
            if (sq_target % 360 < incr) {
                sq_target = 0;
            }

        });
        sun.on('mouseup', () => {
            incr = -5;
        });
        geometry.on('mouseenter', mouseenter);
        geometry.on('mouseleave', () => {
            this.tooltip.hide();
            sq13.visible = false;
        });
        this.scene.addChildren([geometry]);
        circ.on('mouseleave', () => {
            this.tooltip.hide();
        });
        geometry.on('mouseleave', mouseleave);
        this.paper.view.on('frame', () => {
            surround.rotate(2);
            sq2.rotate(0.4, sq2_centroid);
            sq3.rotate(0.8, sq3_centroid);
            sq4.rotate(1.2, sq4_centroid);
            sq8.rotate(0.05);
            sq9.rotate(0.1);
            star.planets.forEach((planet) => {
                if (current_planet == planet && on_planet == true) {
                    sq13.rotate(current_planet.orbit.speed / 50, loc);
                }
                planet.position += planet.orbit.speed / 50;
                planet.moons.forEach((moon) => {
                    moon.position = (moon.position + moon.orbit.speed / 50) % 360;
                })
            });
        });
    }
}