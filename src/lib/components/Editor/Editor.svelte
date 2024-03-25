<script lang="ts">
    import loader from '@monaco-editor/loader';
    import { onDestroy, onMount } from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
    import { setCode, play, stop } from '$lib/zen';
    import { editorConsole, isPlaying, isDrawing, editorValue } from '$lib/stores/zen';
    import { activePreset, presets } from '$lib/stores/presets';
    import { options } from './options';
    import { example } from './example';

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;
    let flash = false

    function setAndPlay() {
        editorConsole.set({});
        setCode(editor.getValue());
        localStorage.setItem("z.code", editor.getValue());
        play();
        isPlaying.set(true);
        flash = true;
        setTimeout(() => flash = false, 400);        
    }

    onMount(async () => {
        monaco = await loader.init();
        editor = monaco.editor.create(editorContainer, options);

        const model = monaco.editor.createModel(
            localStorage.getItem("z.code") || example,
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
                setAndPlay();
            } 
            // alt + v toggle visuals
            if(e.keyCode === 52 && e.altKey) {
                e.preventDefault();
                isDrawing.set(!$isDrawing);
            } 
        })

        activePreset.subscribe(key => {
            if(key && $presets[key]) {
                editor.setValue($presets[key] || '');
                editorValue.set(editor.getValue());
            }
        })

        isPlaying.subscribe(playing => playing ? setAndPlay() : stop());
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
    });

    $: type = $editorConsole.type 
        ? $editorConsole.type.charAt(0).toUpperCase() + $editorConsole.type.slice(1) 
        : null;
</script>

<svelte:window on:resize={() => {
    // @ts-ignore
    editor?.layout({})
}} />

<div class="container" class:flash={flash}>
    <div class="editor" bind:this={editorContainer} />
    <div class="notices">
        <ul>
            <li class:hidden={!type} >
                <span class={type}>{type}:</span> 
                <span>{$editorConsole.message}</span>
            </li>
        </ul>
    </div>
</div>

<style lang="scss">
    .container {
        position: relative;
        background-color: var(--color-grey-darkest);
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
        height: calc(100% - 3rem);
        border-radius: 10px;

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
        height: 100%!important;
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

        .Info {
            color: var(--color-theme-3);
        }

        .Error {
            color: var(--color-theme-1);
        }

        .Success {
            color: var(--color-theme-3);
        }
    }

    .hidden {
        display: none;
    }
</style>