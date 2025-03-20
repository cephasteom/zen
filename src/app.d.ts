// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Window {
			isApp: boolean;
		}
	}
}

export {} // Ensure this file can only be a module
