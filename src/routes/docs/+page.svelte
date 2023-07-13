
<script lang="ts">
    import hljs from 'highlight.js/lib/core';
    import javascript from 'highlight.js/lib/languages/javascript';
    hljs.registerLanguage('javascript', javascript);
    
    import Icon from 'svelte-awesome';
    import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
    import Docs from "$lib/components/Docs.svelte"
    import classes from "$lib/docs/classes.json"
    import synths from "$lib/docs/synths.json"

    let expandVariables = false;
    let expandClasses = false;
    let expandSound = false;
    let expandMidi = false;
</script>

<svelte:head>
	<title>Zen | Docs</title>
	<meta name="description" content="Documentation for Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<div class="content">
	<h1>Documentation</h1>
    <p>The following documentation provides a comprehensive list of all Zen variables, classes and methods. It is intended as a reference whilst using Zen. If you are new to Zen, we recommend that you follow the <a href="/learn">tutorial</a> or load some examples in the <a href="/">code editor</a> first.</p>

    <section class="variables">
        <h2>Variables <button on:click={() => expandVariables = !expandVariables}><Icon data="{faCaretDown}" /></button></h2>

        <div class="expandable{expandVariables ? '--expanded' : ''}">
            <p>Zen exposes the following read-only variables:</p>
            <ul>
                <li><code class="inline-code">t</code> an integer representing time.</li>
                <li><code class="inline-code">q</code> the number of divisions per cycle. <code class="inline-code">t</code> increments <code class="inline-code">q</code> times per cycle.</li>
                <li><code class="inline-code">s</code> the size of the canvas.</li>
                <li><code class="inline-code">c</code> the current cycle.</li>
            </ul>
            <p><code class="inline-code">t</code>, <code class="inline-code">q</code>, and <code class="inline-code">s</code> can be manipulated using the Zen class <code class="inline-code">z</code>, see below.</p>
        </div>
    </section>

    <section class="classes">
        <h2>Classes <button on:click={() => expandClasses = !expandClasses}><Icon data="{faCaretDown}" /></button></h2>
        {#if classes}
            <div class="expandable{expandClasses ? '--expanded' : ''}">
                <Docs json={classes} />
            </div>
        {/if}
    </section>

    <section class="Sound">
        <h2>Instruments | Effects <button on:click={() => expandSound = !expandSound}><Icon data="{faCaretDown}" /></button></h2>
        {#if synths}
            <div class="expandable{expandSound ? '--expanded' : ''}">
                <Docs json={synths} />
            </div>
        {/if}
    </section>

    <section class="Midi">
        <h2>Midi <button on:click={() => expandMidi = !expandMidi}><Icon data="{faCaretDown}" /></button></h2>
        <div class="expandable{expandMidi ? '--expanded' : ''}">
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

</div>

<style lang="scss">
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
</style>