<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { presets, activePreset } from "$lib/stores/presets";

    let index = 0;

    onMount(() => {
        index = Object.keys($presets).indexOf($activePreset)
    })

    function handleKeydown(e: KeyboardEvent) {
        if(!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return
        e.preventDefault()
        if (e.key === 'ArrowDown') {
            index = Math.min(index + 1, Object.keys($presets).length - 1)
        } else if (e.key === 'ArrowUp') {
            index = Math.max(index - 1, 0)
        } else if (e.key === 'Enter') {
            const key = Object.keys($presets)[index]
            activePreset.set(key)
            dispatch('load')
        }
    }

    $: index = Object.keys($presets).indexOf($activePreset)
</script>

<div class="presets" on:keydown={handleKeydown}>
    <h3>Load</h3>
    {#if Object.keys($presets).length === 0}
        <p>No presets saved</p>
    {:else}
        <ul>
            {#each Object.keys($presets) as key, i}
            
            <li class:active={$activePreset === key || index === i}>
                <button 
                    on:click={() => {
                        activePreset.set(key)
                        dispatch('load')
                    }}
                >{key}</button>
            </li>
            {/each}
        </ul>
    {/if}
</div>

<style lang="scss">
    .presets {
        height: 40vh;
        min-width: 25vw; 
        
        overflow: scroll;
        & h3 {
            margin: 0;
        }

        & p {
            color: var(--color-grey-light);
            margin-top: 0.5rem;
        }
        & ul {
            margin-top: 0.5rem;
            display: flex;
            flex-direction: column;
            padding: 0;
        }
        & li {
            margin-top: 0;
            display: flex;
            align-items: center;
            padding: 0.5rem;
            &:hover, &.active {
                padding-left: 0.5rem;
                padding-right: 0.5rem;

                background-color: var(--color-yellow);
                font-weight: bold;
                & button { color: var(--color-grey-dark) }
            }
        }
        & button {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--color-grey-light);
            font-size: var(--text-sm);
            font-family: var(--font-family);
            padding: 0;
            text-align: left;
            width: 100%;
            height: 100%;
        }
    }
</style>