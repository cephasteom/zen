import { chapters } from '../tutorial.js';
import { formatSlug, formatTitle } from "$lib/utils/utils";
import { error } from '@sveltejs/kit';

const data = Object.entries(chapters).map(([key, markdown]) => ({
    title: formatTitle(key),
    slug: formatSlug(key),
    markdown
}))

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