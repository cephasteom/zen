<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { presets, activePreset } from "$lib/stores/presets";
</script>

<div class="presets">
    <h3>Presets</h3>
    {#if Object.keys($presets).length === 0}
        <p>No presets saved</p>
    {:else}
        <ul>
            {#each Object.entries($presets) as [key, preset]}
            
            <li class:active={$activePreset === key}>
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
            &:hover {
                background-color: var(--color-yellow);
                & button { color: var(--color-grey-dark) }
            }

            &.active button {
                color: var(--color-theme-1);
                font-weight: bold;
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