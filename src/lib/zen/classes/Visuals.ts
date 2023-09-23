import { Pattern } from "./Pattern";
type position = {x: number, y: number, id: string}

export class Visuals {
    _s: number = 16;
    data = new Uint8Array(this._s * this._s * 4);
    colours = [
        [255, 105, 90],
        [229, 0, 127],
        [0, 163, 153],
    ]
    mColour = [51, 51, 51, 255];
    background = [38, 38, 38, 255];
    
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
            this.data[i * 4 + 0] = this.background[0];
            this.data[i * 4 + 1] = this.background[1];
            this.data[i * 4 + 2] = this.background[2];
            this.data[i * 4 + 3] = this.background[3];
        }
    }

    streams(positions: {x: number, y: number, id: string}[], isEvent: boolean) {
        for (const { x, y, id } of positions) {
            const eColourI = +id.replace('s', '')%this.colours.length;
            const i = ((Math.floor(y) * this._s) + Math.floor(x)) * 4;
            const colour = isEvent 
                ? this.colours[eColourI]
                : this.mColour;
            for (let j = 0; j < 4; j++) {
                this.data[i + j] = colour[j];
            }
            this.data[i + 3] = 255;
        }
    }

    interpolate() {
        // iterate over data and interpolate between current colour and background
        for (let i = 0; i < this.data.length; i++) {
            const c = this.data[i];
            if(c === this.background[i%4]) continue;
            this.data[i] = Math.abs(c - this.background[i%4]) > 32
                ? c > this.background[i%4] ? c - 32 : c + 32
                : this.background[i%4];
        }
    }

    get(events: position[], mutations: position[]): Uint8Array {
        this.clear();
        this.streams(events, true);
        this.streams(mutations, false);

        return this.data;
    }
}