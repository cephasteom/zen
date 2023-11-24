import { Gain } from 'tone';
// TODO: set back to 0
export const buses = new Array(4).fill(0).map(() => new Gain(1))