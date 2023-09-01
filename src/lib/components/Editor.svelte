<script lang="ts">
    import loader from '@monaco-editor/loader';
    import { onDestroy, onMount } from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import { setCode, play, stop } from '$lib/zen';
    import { error, isPlaying, editorValue } from '$lib/stores/zen';
    import { activePreset, presets } from '$lib/stores/presets';
    import { examples } from '../examples/examples';

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    let options: Monaco.editor.IStandaloneEditorConstructionOptions = {
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
        suggestOnTriggerCharacters: false,
        acceptSuggestionOnEnter: "off",
        acceptSuggestionOnCommitCharacter: false,
        wordBasedSuggestions: false,
        snippetSuggestions: 'none',
        roundedSelection: false,
        tabSize: 2,
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
            localStorage.getItem("z.code") || 
            "// Welcome to Zen! \n// Press Shift + Enter to run your code. \n// Press Esc to stop. \n// Press Ctrl + S to save your code. \n// Press Ctrl + O to open saved code. \n// Click on the snippets button below to try a few examples. \n// Follow the tutorial to start composing with Zen.",
            undefined,
            monaco.Uri.file('sample.js')
        );
        editor.setModel(model);
        editorValue.set(editor.getValue());

        editor.onKeyDown(e => {
            editorValue.set(editor.getValue());

            if(e.keyCode === 9) {
                stop();
                isPlaying.set(false);
            }
            if(e.keyCode === 3 && e.shiftKey) {
                e.preventDefault();
                error.set('');
                setCode(editor.getValue());
                localStorage.setItem("z.code", editor.getValue());
                play();
                isPlaying.set(true);
                flash = true;
                setTimeout(() => flash = false, 400);
            } 
        })

        activePreset.subscribe(key => {
            if(key && $presets[key]) {
                editor.setValue($presets[key] || '');
                editorValue.set(editor.getValue());
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
        background-color: var(--color-grey-darkest);
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }
    
    .flash {
        animation: flash 0.5s;
    }

    @keyframes flash {
        0% { filter: invert(0.25) }
        100% { filter: invert(0) }
    }
    .editor {
        width: calc(100% - 1rem);
        height: 60vh!important;
        @media (min-width: 500px) {
            height: 75vh!important;
        }
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