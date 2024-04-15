type position = {x: number, y: number, z: number, id: string, e: boolean, m: boolean}
import type { vector } from '../types'

export class Visuals {
    data: vector[] = [];
    history: position[] = [];
    activeStreams: string[] = [];
    colours = [
        [255, 105, 90],
        [229, 0, 127],
        [0, 163, 153],
    ]
    mColour = [51, 51, 51, 255];

    convertPositionToVector(position: position, i: number): vector {
        return {
            x: position.x,
            y: position.y,
            z: position.z,
            colour: this.colours[i%this.colours.length],
            weight: position.e ? 1 : 0.5
        }
    }

    get(positions: position[]) {
        const hasChanged = positions.filter((p, i) => {
            const prevPosition = this.history[i];
            return prevPosition && (p.x !== prevPosition.x || p.y !== prevPosition.y || p.z !== prevPosition.z);
        }).map(({id}) => id);

        this.activeStreams = [...new Set([...this.activeStreams, ...hasChanged])];
        
        this.history = positions;
        
        this.data = positions
            .filter(({id}) => this.activeStreams.includes(id))
            .map((p, i) => this.convertPositionToVector(p, i))
        return this.data;
    }
}