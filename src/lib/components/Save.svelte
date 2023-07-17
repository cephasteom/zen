<!-- TODO: command s should update current preset if set -->

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import Input from './Input.svelte'
    import { savePreset } from '$lib/stores/presets'
</script>


<!-- svelte-ignore a11y-label-has-associated-control -->
<label>Save as</label>
<Input id="save" placeholder="name" on:enter={({detail}) => {
    dispatch('save')
    savePreset(detail) 
}} />

<style lang="scss">
    label {
        padding-right: 0.125rem;
        color: var(--color-grey-light);
    }
</style>