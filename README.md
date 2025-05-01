# Zen

Zen is a live coding environment for the browser, with an emphasis on the use of quantum algorithms for music generation. You can use it at [https://zen.cephasteom.co.uk/](https://zen.cephasteom.co.uk/) or download a version for desktop at [https://github.com/cephasteom/zen-electron](https://github.com/cephasteom/zen-electron).

This project was built with, amongst other things, SvelteKit.

## Developing

Install dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Docs
We use TSDocs to generate documentation for all Zen classes and synths. These generate each time you run a build. If you want to refresh them manually see the scripts in `package.json`.
