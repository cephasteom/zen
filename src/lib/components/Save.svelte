<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import Input from './Input.svelte'
    import { savePreset, presetKeys, activePreset } from '$lib/stores/presets'

    function handleKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case 'ArrowDown':
                index = Math.min(index + 1, $presetKeys.length - 1)
                break;
            case 'ArrowUp':
                e.preventDefault()
                index = Math.max(index - 1, -1)
                break;
        }
    }

    $: index = $presetKeys.indexOf($activePreset)
    $: start = index < 5 ? 0 : index - 4
    $: end = start + 5
    $: visiblePresets = $presetKeys.slice(start, end)
</script>


<div on:keydown={handleKeydown}>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label>Save as</label>
    <Input 
        id="save" 
        placeholder="name" 
        value={$presetKeys[index] || ''} 
        on:enter={({detail}) => {
            dispatch('save')
            savePreset(detail)
        }}
    />
    <ul>
        {#each visiblePresets as key}
            <li 
                class:active={key === $presetKeys[index]}
            ><button 
                on:click={() => {
                    dispatch('save')
                    savePreset(key) 
                }}
            >{key}</button></li>
        {/each}
    </ul>
</div>

<style lang="scss">
    div {
        padding: 1rem 2rem;
    }
    label {
        padding-right: 0.125rem;
        color: var(--color-grey-light);
    }

    ul {
        list-style: none;
        padding-left: 0;
    }

    li {
        padding: 0.5rem 0.5rem;
        margin: 0;
        margin-left: 69.5px;

        &:hover, &.active {
            background-color: var(--color-yellow);
            & button { color: var(--color-grey-dark) }
        }
    }

    button {
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
</style>