<script lang="ts">
    import CodeMirror from '@joshnuss/svelte-codemirror'
    import {EditorView, basicSetup, closeBrackets} from "codemirror"
  
    console.log(closeBrackets)
    const options = {
		mode: "javascript",
		lineNumbers: false,
        theme: "material",
        tabSize: 2,
        lineWrapping: true,
        height: "100%",
        // keyMaps: [standardKeymap],
        // extensions: basicSetup
	}
	
	let code = `// Welcome to Zen!`
	let editor

    $: console.log(editor)
</script>

<CodeMirror bind:editor {options} bind:value={code}/>