import { chapters } from '../chapters';
import { error } from '@sveltejs/kit';

export function load({ params }) {
	const i = chapters.findIndex(c => c.slug === params.slug);
    const chapter = chapters[i];
    const next = chapters[i + 1];
    const prev = chapters[i - 1];

    if (!chapter) throw error(404, 'Not found');

	return { 
        chapter,
        next,
        prev
    };
}