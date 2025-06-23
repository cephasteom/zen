<svelte:head>
	<title>Zen | About</title>
	<meta name="description" content="About Zen, a quantum computer music programming language, using quantum simulations to make music in your browser." />
</svelte:head>

<section class="content">
    <div class="content__inner">
        <h1>Live code quantum computer music in your browser</h1>
        <h2>About</h2>
        <p>Zen is a live coding environment for expressing complex patterns with very little code. It was written to take advantage of JavaScript's flexibility and is primed for pattern interference. Design and run quantum circuits and use the results to trigger musical events. Map musical and sonic parameters across time and space and draw multiple trajectories around a canvas to generate infinitely complex, morphing sounds.</p>

        <p>Zen is built for the browser, but you'd be mad to put your faith in the internet if you're going on stage. And so, Zen can be downloaded as a desktop app for Mac, Windows and Linux - with added features. Have a look at this <a href="https://github.com/cephasteom/zen-electron/releases">link</a>.</p>

        <h3>Credits</h3>
        <p>Zen is the work of Cephas Teom, a musician and coder based in the UK. It was devised, researched, and built at the <a href="https://www.plymouth.ac.uk/research/iccmr" target="_blank">ICCMR, University of Plymouth</a>, as part of the <a href="https://www.plymouth.ac.uk/courses/postgraduate/phd-computer-music" target="_blank">PhD Computer Music</a>, exploring the intersection of quantum computer music, live coding, and the web.</p>
            
        <p>You can see more of his work by following the links below:</p>
        <ul>
            <li><a href="https://cephasteom.co.uk/" target="_blank">Website</a></li>
            <li><a href="https://cephasteom.bandcamp.com/album/automata" target="_blank">Bandcamp</a></li>
            <li><a href="https://metrmusic.com/" target="_blank">Label</a></li>
            <li><a href="https://lunar.build/" target="_blank">Lunar</a></li>
        </ul>
        <p>Zen is built on Svelte and is indebted to the following technologies:</p>
        <ul>
            <li><a href="https://tonejs.github.io/" target="_blank">Tone.js</a></li>
            <li><a href="https://rnbo.cycling74.com/" target="_blank">RNBO (Cycling '74')</a></li>
            <li><a href="https://www.npmjs.com/package/quantum-circuit" target="_blank">Quantum Circuit (Quantastica)</a></li>
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
</style>