<svelte:head>
	<title>Zen | Changelog</title>
	<meta name="description" content="Changelog for Zen, a quantum computer music programming language, using quantum simulations to make music in your browser." />
</svelte:head>

<section class="content">
    <div class="content__inner">
        <h1>Changelog</h1>
        <h2>Zen 5</h2>

        <h3>Release Notes: 5.2.0: October 15th 2025</h3>
        <ul>
            <li><strong>Feature</strong>: Added 4 Tone.js synths. See "instruments()" and help files.</li>
        </ul>   

        <h3>Release Notes: 5.1.0: October 13th 2025</h3>
        <ul>
            <li><strong>Feature</strong>: help system, using auto-generated html docs from type annotations.</li>
        </ul>   
        
        <h3>Release Notes: 5.0.0: October 7th 2025</h3>
        
        <ul>
            <li><strong>Syntax</strong>: remove <code>s0.p.</code> prefix from all parameters. E.g. <code>s0.banana.sine()</code>, rather than <code>s0.p.banana.sine()</code>.</li>
            <li><strong>Syntax</strong>: remove <code>$</code> prefix when nesting patterns. E.g. <code>s0.banana.every(3).or(every(4))</code>, rather than <code>s0.banana.every(3).or($every(4))</code>.</li>
            <li><strong>Syntax</strong>: reorder arguments in waveform generator pattern methods. E.g. <code>s0.banana.sine(freq, min, max)</code>, rather than <code>s0.banana.sine(min, max, freq)</code>.</li>
            <li><strong>UI</strong>: redesigned interface for better usability and accessibility.</li>
            <li><strong>Feature</strong>: Zmod modular synthesis language for live coding the audio graph. See <a href="/learn/zmod" target="_blank">/learn/zmod</a>.</li>
            <li><strong>Feature</strong>: Zmod Looper. See <a href="/learn/zmod" target="_blank">/learn/zmod</a>.</li>
            <li><strong>Feature</strong>: Q5.js integration. See <a href="/learn/q5js" target="_blank">/learn/q5js</a>.</li>

            <li><strong>Syntax</strong>: rename filters for consistency with Zmod. E.g. <code>lpf()</code> rather than <code>hicut()</code>.</li>

        </ul>
    </div>
</section>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        &__inner {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto 2rem;
        }
    }
    ul {
        padding-left: 0;
    }

    strong {
        color: var(--color-grey-darkest);
    }
</style>