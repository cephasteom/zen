
<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import hljs from 'highlight.js/lib/core';
    import javascript from 'highlight.js/lib/languages/javascript';
    hljs.registerLanguage('javascript', javascript);
    
    import Icon from 'svelte-awesome';
    import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
    import Docs from "$lib/components/Docs.svelte"
    import classes from "$lib/docs/classes.json"
    import synths from "$lib/docs/synths.json"

    import { scales } from "$lib/zen/data/scales";
    import { chords } from "$lib/zen/data/chords";

    let expanded: string | boolean = false

    const handleExpand = (section: string) => {
        expanded = expanded === section 
            ? false 
            : section
        const route = $page.url.searchParams.get('route').split(',')
        route[0] = expanded || ''
        window.history.pushState({}, '', `?route=${route.join(',')}`)
    }

    onMount(() => {
        const route = $page.url.searchParams.get('route').split(',')
        route.length > 0 && handleExpand(route[0])
    })
</script>

<svelte:head>
	<title>Zen | Docs</title>
	<meta name="description" content="Documentation for Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<div class="content">
	<h1>Documentation</h1>
    <p>The following documentation provides a comprehensive list of all Zen variables, classes and methods. It is intended as a reference whilst using Zen. If you are new to Zen, we recommend that you follow the <a href="/learn">tutorial</a> or load some examples in the <a href="/">code editor</a> first.</p>
    
    <section class="controls">
        <h2>Controls <button on:click={() => handleExpand('controls')}><Icon data="{faCaretDown}" /></button></h2>

        <div class="expandable{expanded === 'controls' ? '--expanded' : ''}">
            <p>Zen exposes the following read-only variables:</p>
            <ul>
                <li><code class="inline-code">shift + enter</code> executes the code and starts playback.</li>
                <li><code class="inline-code">esc</code> stops playback. Pressing <code class="inline-code">esc</code> twice resets <code class="inline-code">t</code> to 0.</li>
                <li><code class="inline-code">cmd + o</code> opens a list of presets.</li>
                <li><code class="inline-code">cmd + s</code> saves your code.</li>
            </ul>
        </div>
    </section>

    <section class="variables">
        <h2>Variables <button on:click={() => handleExpand('variables')}><Icon data="{faCaretDown}" /></button></h2>

        <div class="expandable{expanded === 'variables' ? '--expanded' : ''}">
            <p>Zen exposes the following read-only variables:</p>
            <ul>
                <li><code class="inline-code">t</code> an integer representing time.</li>
                <li><code class="inline-code">q</code> the number of divisions per cycle. <code class="inline-code">t</code> increments <code class="inline-code">q</code> times per cycle.</li>
                <li><code class="inline-code">s</code> the size of the canvas.</li>
                <li><code class="inline-code">c</code> the current cycle.</li>
            </ul>
            <p><code class="inline-code">t</code>, <code class="inline-code">q</code>, and <code class="inline-code">s</code> cannot be changed directly, but must be manipulated on the global Zen settings class, represented as <code class="inline-code">z</code> in your code.</p>
            <pre><code>{@html
                hljs.highlight(`z.q = 11 // set the number of divisions per cycle to 11
z.s = 15 // set the canvas size to 15
z.t.sine(0,128,1) // t is an instance of Pattern, so you can have some serious fun with it`,
                    {language: 'javascript'}).value
            }</code></pre>
            <p>See Classes for more information about Patterns and the Zen global settings class.</p>

        </div>
    </section>

    <section class="classes">
        <h2>Classes <button on:click={() => handleExpand('classes')}><Icon data="{faCaretDown}" /></button></h2>
        {#if classes}
            <div class="expandable{expanded === 'classes' ? '--expanded' : ''}">
                <Docs json={classes} />
            </div>
        {/if}
    </section>

    <section class="Sound">
        <h2>Instruments | Effects <button on:click={() => handleExpand('sound')}><Icon data="{faCaretDown}" /></button></h2>
        {#if synths}
            <div class="expandable{expanded === 'sound' ? '--expanded' : ''}">
                <Docs json={synths} />
            </div>
        {/if}
    </section>

    <section class="Midi">
        <h2>Midi <button on:click={() => handleExpand('midi')}><Icon data="{faCaretDown}" /></button></h2>
        <div class="expandable{expanded === 'midi' ? '--expanded' : ''}">
            <p>Midi is simple to use in Zen. On page load, all available midi inputs and outputs are printed in your console for reference. These strings can be assigned to a stream's <code class="inline-code">midi</code> parameter in order to send messages to that device. The following parameters control midi routing in Zen:</p>
            <ul>
                <li><code class="inline-code">midi</code> the midi device to send messages to.</li>
                <li><code class="inline-code">midichan</code> the midi channel to send messages to. Sends to all channels if not included.</li>
                <li><code class="inline-code">latency</code> delay midi messages by n milliseconds. Useful for synchronising midi and audio.</li>
                <li><code class="inline-code">cc1</code>, <code class="inline-code">cc2</code> etc. Send control change messages. If you wish to use more memorable names, you can map keys to other keys using a stream's map property. See Classes > Stream > map. CC values are normalised (0 - 1).</li>
            </ul>
            <pre><code>{@html
                hljs.highlight(`s0.set({midi: 'Nord1a', midichan: 1}) 
s0.p.cc1.range(0, 1, 1)
s0.p.cc2.noise(0, 0.5)
s0.e.every(4)`,
                    {language: 'javascript'}).value
            }</code></pre>
        </div>
    </section>

    <section class="data">
        <h2>Scales and Chords <button on:click={() => handleExpand('data')}><Icon data="{faCaretDown}" /></button></h2>
        <div class="expandable{expanded === 'data' ? '--expanded' : ''}">
            <p>All of the scales that you can use in the <code class="inline-code">scales</code> pattern method (exported from TidalCycles - with thanks.):</p>
            <p class="scales">{ Object.keys(scales).join(', ') }</p>
            
            <p>All of the chords that you can use in the <code class="inline-code">chords</code> pattern method (exported from TidalCycles - with thanks.):</p>
            <p class="chords">{ Object.keys(chords).join(', ') }</p>

    </section>
</div>

<style lang="scss">
    .content {
        padding-bottom: 3rem;
    }
    p, li {
        margin-top: 1rem;
    }

    .class {
        margin-bottom: 4rem;
    }

    .path {
        margin-top: 0.25rem;
        font-size: var(--text-xs);
    }

    .expandable {
        max-height: 0;
        overflow: hidden;
        transition: height 1s ease-in-out;
        &--expanded {
            max-height: auto;
            transition: height 1s ease-in-out;
        }
    }

    button {
        background-color: transparent;
        border: none;
        cursor: pointer;
        color: var(--color-theme-2);
        padding: 0;
    }

    .scales, .chords {
        color: var(--color-theme-3);
    }
</style>