import { formatSlug, formatTitle } from "$lib/utils/utils";
import intro from "./intro.js";
import javascript_basics from "./javascript-basics.js";
import streams from "./streams.js";
import patterns from "./patterns.js";
import mini_notation from "./mini-notation.js";
import instruments from "./instruments.js";
import effects from "./effects.js";
import mutations from "./mutations.js";

const content = {
    intro,
    javascript_basics,
    streams,
    patterns,
    instruments,
    effects,
    mini_notation,
    mutations,
};

export const chapters = Object.entries(content).map(([key, markdown]) => ({
    title: formatTitle(key),
    slug: formatSlug(key),
    markdown
}))