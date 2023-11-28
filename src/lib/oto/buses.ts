import { Gain } from 'tone';

export const buses = new Array(4).fill(0).map(() => new Gain(0))