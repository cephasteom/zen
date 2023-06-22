<script lang="ts">
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
	
	let code = `// Welcome to Zen!`
	let editor
</script>

<CodeMirror bind:editor {options} bind:value={code}/>