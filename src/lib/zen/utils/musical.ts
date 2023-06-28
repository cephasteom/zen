export function letterToInteger(letter: string) {
    return { 
        c: 0, 
        cs: 1, df: 1, 
        d: 2, 
        ds: 3, ef: 3, 
        e: 4,
        f: 5, 
        fs: 6, gf:6, 
        g: 7, 
        gs: 8, af: 8,
        a: 9,
        as: 10, bf: 10,
        b: 11
    }[letter] || 0
}