<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { presets, activePreset, deletePreset } from "$lib/stores/presets";
    let index = 0;

    onMount(() => {
        index = Object.keys($presets).indexOf($activePreset)
        index = index === -1 ? 0 : index
    })

    function handleKeydown(e: KeyboardEvent) {
        const key = Object.keys($presets)[index]
        
        switch (e.key) {
            case 'ArrowDown':
                index = Math.min(index + 1, Object.keys($presets).length - 1)
                break;
            case 'ArrowUp':
                index = Math.max(index - 1, 0)
                break;
            case 'Enter':
                e.preventDefault()
                activePreset.set(key)
                dispatch('load')
                break;
            case 'Backspace':
                deletePreset(key)
                break;
        }
    }
</script>

<div class="presets" on:keydown={handleKeydown} >
    {#if Object.keys($presets).length === 0}
        <p>No presets saved</p>
    {:else}
        <label>Load</label>
    
        <ul>
            {#each Object.keys($presets) as key, i}
            
            <li class:active={$activePreset === key || index === i}>
                <button 
                    on:click={() => {
                        index = i
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
        max-height: 50vh;
        height: fit-content;
        min-width: 20vw; 
        display: flex;
        
        & label, & p {
            padding: 0.5rem;
            color: var(--color-grey-light);
        }

        
        & ul {
            margin-top: 0rem;
            display: flex;
            flex-direction: column;
            padding: 0;
            overflow: scroll;
            border-left: 1px solid var(--color-grey-mid);
            font-size: var(--text-sm);
            width: 100%;
        }
        
        & p {
            margin-top: 0rem;
            padding: 0rem;
            color: var(--color-grey-light);
        }
        & li {
            margin-top: 0;
            display: flex;
            align-items: center;
            padding: 0.5rem;
            width: 100%;
            &:hover, &.active {
                background-color: var(--color-yellow);
                & button { color: var(--color-grey-dark) }
            }
        }
        & button {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--color-yellow);
            font-family: var(--font-family);
            padding: 0;
            text-align: left;
            width: 100%;
            height: 100%;
        }
    }
</style>