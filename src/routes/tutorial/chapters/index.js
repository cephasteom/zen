import { formatSlug, formatTitle } from "$lib/utils/utils";
import intro from "./intro.js";
import javascript_basics from "./javascript-basics.js";
import streams from "./streams.js";
import patterns from "./patterns.js";
import mini_notation from "./mini-notation.js";
import instruments from "./instruments.js";
import effects from "./effects.js";
import mutations from "./mutations.js";
import project_1_beatslicer from "./project-1-beatslicer.js"; 
import project_2_sequencing from "./project-2-sequencing.js";
import project_3_harmony from "./project-3-harmony.js";
import project_4_text_to_music from "./project-4-text-to-music.js";

const content = {
    intro,
    javascript_basics,
    streams,
    patterns,
    instruments,
    effects,
    mini_notation,
    mutations,
    project_1_beatslicer,
    project_2_sequencing,
    project_3_harmony,
    project_4_text_to_music
};

export const chapters = Object.entries(content).map(([key, markdown]) => ({
    title: formatTitle(key),
    slug: formatSlug(key),
    markdown
}))