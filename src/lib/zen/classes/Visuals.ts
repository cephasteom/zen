import { Pattern } from "./Pattern";
type position = {x: number, y: number}

export class Visuals {
    _stack = []
    _s: number = 16;
    data = new Uint8Array(this._s * this._s * 4);
    colours = [
        [255, 105, 90],
        [229, 0, 127],
        [0, 163, 153],
    ]
    mColour = [51, 51, 51, 255];

    /** @hidden */
    _xPattern: null | Pattern = null
    /**
     * A Pattern for setting the stream's position in space
     * @example
     * s0.x.saw(0,16,1) // move the stream across the x axis of the canvas with a saw wave between 0 and 16
     */ 
    get x() {
        this._xPattern = this._xPattern || new Pattern()
        return this._xPattern
    }
    
    constructor(s: number = 16) {
        this.resize(s);
        this.clear();
    }

    resize(s: number) {
        if(s === this._s) return;
        this.data = new Uint8Array(s * s * 4);
        this._s = s;
    }

    clear() {
        for (let i = 0; i < this._s * this._s; i++) {
            this.data[i * 4 + 0] = 0;
            this.data[i * 4 + 1] = 0;
            this.data[i * 4 + 2] = 0;
            this.data[i * 4 + 3] = 0;
        }
    }

    blur() {
        for (let i = 0; i < this._s * this._s; i++) {
            this.data[i * 4 + 0] = this.data[i * 4 + 0] > 1 ? Math.floor(this.data[i * 4 + 0]*0.75) : 0;
            this.data[i * 4 + 1] = this.data[i * 4 + 1] > 1 ? Math.floor(this.data[i * 4 + 1]*0.75) : 0;
            this.data[i * 4 + 2] = this.data[i * 4 + 2] > 1 ? Math.floor(this.data[i * 4 + 2]*0.75) : 0;
            this.data[i * 4 + 3] = this.data[i * 4 + 3] > 1 ? Math.floor(this.data[i * 4 + 3]*0.75) : 0;
        }
    }

    streams(positions: {x: number, y: number}[], isEvent: boolean) {
        let streamID = 0;
        for (const { x, y } of positions) {
            const i = ((Math.floor(y) * this._s) + Math.floor(x)) * 4;
            const colour = isEvent 
                ? this.colours[streamID%this.colours.length]
                : this.mColour;
            for (let j = 0; j < 4; j++) {
                this.data[i + j] = colour[j];
            }
            this.data[i + 3] = 255;
            streamID++;
        }
    }

    get(events: position[], mutations: position[]): Uint8Array {
        if(!this._stack.length) {
            this.clear();
            this.streams(events, true);
            this.streams(mutations, false);
        }
        
        return this.data;
    }
}