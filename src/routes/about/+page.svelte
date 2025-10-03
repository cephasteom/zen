<svelte:head>
	<title>Zen | About</title>
	<meta name="description" content="About Zen, a quantum computer music programming language, using quantum simulations to make music in your browser." />
</svelte:head>

<section class="content">
    <div class="content__inner">
        <h1>Live code music in your browser</h1>
        <h2>About</h2>
        <p>Zen is a live coding application for expressing complex, interference patterns. It provides a holistic environment for algorithm design, sound synthesis, and real-time performance, requiring no further dependencies outside of the browser. Although it can be approached as a standard live coding language, its most unique feature is the ability to leverage quantum computing principles to create and manipulate sound.</p>

        <p>Zen can be downloaded as a desktop app for Mac, Windows and Linux. See the <a href="https://github.com/cephasteom/zen-electron/releases">releases</a> page.</p>

        <h3>Credits</h3>
        <p>Zen is the work of Cephas Teom / Peter Thomas, an artist, researcher, and software developer based in the UK. It was devised, researched, and built at the <a href="https://www.plymouth.ac.uk/research/iccmr" target="_blank">ICCMR, University of Plymouth</a>, while studying for the <a href="https://www.plymouth.ac.uk/courses/postgraduate/phd-computer-music" target="_blank">PhD Computer Music</a>. The thesis can be read in full on the <a href="https://researchportal.plymouth.ac.uk/en/studentTheses/zen-and-the-art-of-praxis" target="_blank">university archive</a> and provides a comprehensive overview of the project's development and underlying concepts, as well as a useful primer on quantum computing.</p>
            
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
            <li><a href="https://q5js.org/home/" target="_blank">Q5.js</a></li>
        </ul>
    </div>
</section>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 0;
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