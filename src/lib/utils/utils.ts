export function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max)
}

export function formatTitle(title: string) {
    return title.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

export function formatSlug(slug: string) {
    return slug.replace(/_/g, '-').toLowerCase()
}

export function min(a: number, b: number) {
    return a < b ? a : b
}