// import adapter from "@ptkdev/sveltekit-electron-adapter"; // for when you want to build an electron app
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
 
const file = fileURLToPath(new URL('package.json', import.meta.url));
const json = readFileSync(file, 'utf8');
const pkg = JSON.parse(json);

const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			strict: false
		}),
		version: {
			name: pkg.version,
		}
	}
};

export default config;