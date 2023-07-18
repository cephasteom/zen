<svelte:head>
	<title>Zen | Learn</title>
	<meta name="description" content="Learn how to make music with Zen, a musical live coding language that runs in your browser." />
</svelte:head>

<script lang="ts">
	import { marked } from "marked";
	import { tutorial } from "./tutorial";
</script>

<section class="content">
    {@html marked.parse(tutorial)}
</section>
