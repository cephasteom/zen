<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    export let id: string = '';
    export let placeholder: string = '';
    export let value: string | number = '';
</script>

<input 
    {id} {placeholder} bind:value 
    on:change={() => dispatch('change', value)}
    on:keydown={e => e.key === 'Enter' && value !== '' && dispatch('enter', value)}
/>

<style lang="scss">
    input {
        color: var(--color-yellow);
        padding: 0.5rem 0.5rem;
        border: none;
        background-color: transparent;
        border-left: 1px solid var(--color-grey-mid);
    }

    input::placeholder {
        color: var(--color-grey-mid);
    }
</style>