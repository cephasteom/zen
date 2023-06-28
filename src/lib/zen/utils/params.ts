export const parseScale = (name: string) => {
    const array = name.split("`")
    return name.indexOf("`") > -1
        ? [array[0], array[1]]
        : ['c', array[0]]
}