
// import adapter from "@ptkdev/sveltekit-electron-adapter"; // for when you want to build an electron app
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() }
};

export default config;