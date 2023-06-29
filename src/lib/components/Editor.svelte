<script lang="ts">
    import loader from '@monaco-editor/loader';
    import { onDestroy, onMount } from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import { setCode, start, stop } from '$lib/zen';
    import { error } from '$lib/stores/zen';

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    let options = {
        language: 'javascript',
        theme: 'vs-dark',
        lineNumbers: {
            type: 'off'
        },
        minimap: {
            enabled: false
        },
        automaticLayout: true,
        renderLineHighlight: 'none',
        quickSuggestions: false,
        wordWrap: "on",
        gutter: "off",
        scrollbar: {
            vertical: "hidden",
            horizontal: "hidden",
            verticalScrollbarSize: 0,
            horizontalScrollbarSize: 0,
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            arrowSize: 0
        },
    };
    let flash = false

    onMount(async () => {

        // Remove the next two lines to load the monaco editor from a CDN
        // see https://www.npmjs.com/package/@monaco-editor/loader#config
        // const monacoEditor = await import('monaco-editor');
        // loader.config({ monaco: monacoEditor.default });

        monaco = await loader.init();

        // Your monaco instance is ready, let's display some code!
        const editor = monaco.editor.create(editorContainer, options);
        const model = monaco.editor.createModel(
            localStorage.getItem("z.code") || "// Welcome to Zen!",
            undefined,
            monaco.Uri.file('sample.js')
        );
        editor.setModel(model);

        editor.onKeyDown(e => {
            e.keyCode === 9 && stop();
            if(e.keyCode === 3 && e.shiftKey) {
                e.preventDefault();
                error.set('');
                setCode(editor.getValue());
                localStorage.setItem("z.code", editor.getValue());
                start();
                flash = true;
                setTimeout(() => flash = false, 400);
            } 
        })
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
    });
</script>

<svelte:window on:resize={() => editor?.layout({})} />

<div class="container" class:flash={flash}>
    <div class="editor" bind:this={editorContainer} />
    <div class="notices">
        <ul>
            <li class:hidden={!$error}>Error: <span>{$error}</span></li>
        </ul>
    </div>
</div>

<style lang="scss">
    .container {
        position: relative;
    }
    
    .flash {
        animation: flash 0.5s;
    }

    @keyframes flash {
        0% { filter: invert(0.25) }
        100% { filter: invert(0) }
    }
    .editor {
        width: 100%;
        height: 75vh!important;
    }

    .notices {
        position: absolute;
        bottom: 0;
        left: 26px;
        padding: 1rem 0;
        font-size: var(--text-sm);
        color: var(--color-grey-light);
        background-color: var(--color-grey-darkest);

        ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        span {
            color: var(--color-theme-1);
        }
    }

    .hidden {
        display: none;
    }
</style>