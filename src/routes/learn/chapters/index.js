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
import midi from './midi'
import global_settings from './global-settings'
import utilities from "./utilities";
import effects from './effects'
import zen_quantum from './quantum'
import data from './data'
import clocks from "./clocks";
import modes from './modes'
import zmod from "./zmod";
import q5js from './q5js'

const content = { 
    intro, 
    getting_started, 
    the_editor, 
    patterns,
    streams, 
    mini_notation,
    mutations,
    zen_quantum,
    instruments,
    effects,
    custom_samples,
    zmod,
    q5js,
    global_settings,
    midi,
    utilities,
    data,
    clocks,
    modes
};

export const chapters = Object.entries(content).map(([key, markdown]) => ({
    title: formatTitle(key),
    slug: formatSlug(key),
    markdown
}))