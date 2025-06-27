type position = {x: number, y: number, z: number, id: string, e: boolean, m: boolean}
import type { vector } from '../types'

export class Visuals {
    data: vector[] = [];
    activeStreams: string[] = [];
    colours = [
        // --color-theme-1: #00f6ff; /* Laser Cyan */ as rgb
        [0, 246, 255],
        // --color-theme-2: #00ff9f; /* Hyper Neon Green */
        [0, 255, 159],
        // --color-theme-3: #ff1fff; /* Ultraviolet Magenta */
        [255, 31, 255],
    ]

    convertPositionToVector(position: position, i: number): vector {
        return {
            x: position.x,
            y: position.y,
            z: position.z,
            colour: [
                ...this.colours[i%this.colours.length], 
                (position.e ? 1 : 0.25) * 255
            ],
            weight: position.e ? 1 : 0.5
        }
    }

    get(streams: position[]) {
        this.activeStreams = [...new Set([
            ...this.activeStreams, 
            ...streams.filter(({e,m}) => !!e || !!m).map(({id}) => id)])
        ];
        
        this.data = streams
            .filter(({id}) => this.activeStreams.includes(id))
            .map((p, i) => this.convertPositionToVector(p, i))
        return this.data;
    }
}