<script>
    import CodeMirror from '@joshnuss/svelte-codemirror'
    import {basicSetup, standardKeymap} from "codemirror"
  
    const options = {
		mode: "javascript",
		lineNumbers: false,
        theme: "material",
        tabSize: 2,
        lineWrapping: true,
        height: "100%",
        keyMaps: [standardKeymap],
        extensions: [basicSetup]
	}
	
	let code = `function test() {\n  return 42\n}`
	let editor
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Zen" />
</svelte:head>

<section class="zen">
    <div class="editor">
        <CodeMirror bind:editor {options} class="editor__editor" bind:value={code}/>
    </div>
    <div class="data">data</div>
    <div class="visuals">
        visuals
    </div>
    <div class="tools">tools</div>
</section>

<style lang="scss">
    .zen {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 9fr 1fr;
        grid-gap: 1rem;
        padding: 1.5rem 2rem;
    }

    .editor {
        grid-column: 1;
        grid-row: 1;
        height: 100%;
        
        &__editor {
            background-color: green;
        }
    }

    .data {
        grid-column: 1;
        grid-row: 2;
        background-color: blue;
    }

    .visuals {
        grid-column: 2;
        grid-row: 1;
        background-color: red;
    }

    .tools {
        grid-column: 2;
        grid-row: 2;
        background-color: yellow;
    }
</style>
