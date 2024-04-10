import { formatSlug, formatTitle } from "$lib/utils/utils";

import intro from './intro'
import getting_started from './getting-started'
import the_editor from './the-editor'
import streams from './streams'
import patterns from './patterns'
import mini_notation from './mini-notation'
import mutations from './mutations'
import custom_samples from './custom-samples'
import instruments from './instruments'
import the_canvas from './the-canvas'
import midi from './midi'
import global_settings from './global-settings'
import utilities from "./utilities";
import effects from './effects'
import zen_quantum from './quantum'

const content = { 
    intro, 
    getting_started, 
    the_editor, 
    streams, 
    patterns,
    mini_notation,
    mutations,
    the_canvas,
    zen_quantum,
    instruments,
    effects,
    custom_samples,
    global_settings,
    midi,
    utilities,
    // networking
};

export const chapters = Object.entries(content).map(([key, markdown]) => ({
    title: formatTitle(key),
    slug: formatSlug(key),
    markdown
}))