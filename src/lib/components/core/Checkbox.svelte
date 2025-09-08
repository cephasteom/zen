<!-- a checkbox svelte component with binding to a store that you can pass in, and custom styled checkbox -->
<!-- write some commented docs at the top of the page showing how you would use it externally -->
<script lang="ts">
    /**
     * Usage:
     * <Checkbox
     *     bind:checked={$yourStore.checked}
     *     onChange={newValue => $yourStore.checked = newValue}
     *     label="Your Label"
     * />
     */
    export let checked: boolean = false;
    export let disabled: boolean = false;
    export let id: string = '';
    export let label: string = '';
    export let onChange: (checked: boolean) => void = () => {};
    
    function handleChange(event: Event) {
        const input = event.target as HTMLInputElement;
        checked = input.checked;
        onChange(checked);
    }
</script>
<div class="checkbox">
    {#if label}
        <label for={id}>{label}</label>
    {/if}
    <input 
        type="checkbox" 
        id={id} 
        bind:checked={checked}
        on:change={handleChange} 
        disabled={disabled}
    />
</div>
<style lang="scss">
    .checkbox {
        display: flex;
        align-items: center;
        input[type="checkbox"] {
            width: 1.25rem;
            height: 1.25rem;
            margin: 0;
            margin-right: 0.5rem;
            accent-color: var(--color-theme-1);
            cursor: pointer;
            &:disabled {
                accent-color: var(--color-black);
                cursor: not-allowed;
            }
        }
        label {
            cursor: pointer;
            user-select: none;
            color: var(--color-grey-light);
            margin-right: 0.5rem;
            &:disabled {
                cursor: not-allowed;
                color: var(--color-grey-mid);
            }

        }
    }
</style>
