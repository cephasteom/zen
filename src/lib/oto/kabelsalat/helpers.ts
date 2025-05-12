const env = `(midichan = 1, a = 0.01, d = 0.4, s = 0.7, r = 0.1) => midigate(midichan).fork(8).adsr(a, d, s, r)`

export const z = `const z = {
    env: ${env},
};

`