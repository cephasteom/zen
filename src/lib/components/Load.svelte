<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { presetKeys, activePreset, deletePreset } from "$lib/stores/presets";
    let index = 0;
    $: start = index < 5 ? 0 : index - 4
    $: end = start + 5
    $: visiblePresets = $presetKeys.slice(start, end)

    function handleKeydown(e: KeyboardEvent) {
        const key = $presetKeys[index]
        e.stopPropagation()
        
        // handle number keys
        if(!isNaN(Number(e.key))) {
            e.preventDefault()
            const i = Number(e.key)
            index = i % $presetKeys.length
            activePreset.set($presetKeys[index])
            dispatch('load')
            return
        }
        
        switch (e.key) {
            case 'ArrowDown':
                e.stopPropagation()
                index = Math.min(index + 1, $presetKeys.length - 1)
                break;
            case 'ArrowUp':
                e.stopPropagation()
                index = Math.max(index - 1, 0)
                break;
            case 'Enter':
                e.preventDefault()
                activePreset.set(key)
                dispatch('load')
                break;
            case 'Backspace':
                e.preventDefault()
                deletePreset(key)
                break;
        }
    }
</script>

<div class="presets" on:keydown={handleKeydown} >
    {#if $presetKeys.length === 0}
        <p>No presets saved</p>
    {:else}
        <label>Load</label>
    
        <ul>
            {#each visiblePresets as key, i}
            
            <li class:active={$presetKeys[index] === key}>
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