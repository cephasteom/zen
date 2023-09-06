export class Visuals {
    // contains rgba data
    _s: number = 16;
    data = new Uint8Array(this._s * this._s * 4);
    colours = [
        [255, 105, 90],
        [229, 0, 127],
        [0, 163, 153],
    ]
    mColour = [51, 51, 51, 255];
    
    constructor(s: number = 16) {
        this.resize(s);
        this.reset();
    }

    resize(s: number) {
        if(s === this._s) return;
        this.data = new Uint8Array(s * s * 4);
        this._s = s;
    }

    reset() {
        for (let i = 0; i < this._s * this._s; i++) {
            this.data[i * 4 + 0] = 0;
            this.data[i * 4 + 1] = 0;
            this.data[i * 4 + 2] = 0;
            this.data[i * 4 + 3] = 0;
        }
    }

    setPositions(positions: {x: number, y: number}[], isEvent: boolean) {
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

    get(): Uint8Array {
        return this.data;
    }
}