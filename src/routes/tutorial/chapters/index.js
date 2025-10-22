import { formatSlug, formatTitle } from "$lib/utils/utils";
import intro from "./intro.js";
import javascript_basics from "./javascript-basics.js";
import streams from "./streams.js";
import patterns from "./patterns.js";

const content = {
    intro,
    javascript_basics,
    streams,
    patterns
};

export const chapters = Object.entries(content).map(([key, markdown]) => ({
    title: formatTitle(key),
    slug: formatSlug(key),
    markdown
}))