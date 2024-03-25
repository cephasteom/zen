type position = {x: number, y: number, z: number, id: string}
import type { vector } from '../types'

export class Visuals {
    data: vector[] = [];
    colours = [
        [255, 105, 90],
        [229, 0, 127],
        [0, 163, 153],
    ]
    mColour = [51, 51, 51, 255];

    convertPositionToVector(position: position, i: number): vector {
        return {
            phi: position.y,
            theta: position.z,
            lambda: position.x,
            colour: this.colours[i%this.colours.length]
        }
    }

    get(events: position[], mutations: position[]) {
        const eventIds = events.map(({id}) => id)
        const positions = [
            ...events,
            ...mutations.filter(({id}) => eventIds.includes(id))
        ]
        this.data = positions.map((p, i) => this.convertPositionToVector(p, i))
        return this.data;
    }
}