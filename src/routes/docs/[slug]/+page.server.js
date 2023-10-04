import classes from "$lib/docs/classes.json"
import synths from "$lib/docs/synths.json"
import { error } from '@sveltejs/kit';

const data = [
    { title: "Classes", slug: "classes", data: classes },
    { title: "Synths", slug: "synths", data: synths }
]

export function load({ params }) {
	const i = data.findIndex(c => c.slug === params.slug);
    const chapter = data[i];
    const next = data[i + 1];
    const prev = data[i - 1];

    if (!chapter) throw error(404, 'Not found');

	return { 
        chapter,
        next,
        prev
    };
}