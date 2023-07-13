<!-- TODO: Midi, Oto -->

<script lang="ts">
    import Icon from 'svelte-awesome';
    import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
    import Docs from "$lib/components/Docs.svelte"
    import classes from "$lib/docs/classes.json"
    import synths from "$lib/docs/synths.json"

    console.log(classes, synths)

    let expandVariables = false;
    let expandClasses = false;
    let expandSound = false;
    let expandMidi = false;
</script>

<svelte:head>
	<title>Documentation</title>
	<meta name="description" content="Zen Documentation" />
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
        transition: max-height 0.5s ease-in-out;
        &--expanded {
            max-height: auto;
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