<script lang="ts">
    import { presetKeys, presets, savePreset, activePreset as active } from '$lib/stores/presets';
    import Icon from 'svelte-awesome';
    import { faChevronLeft, faChevronRight, faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

    let current = $active

    const onNext = () => {
        const i = $presetKeys.indexOf($active)
        active.set($presetKeys[(i+1) % $presetKeys.length])
        current = $active
    }
    const onPrev = () => {
        const i = $presetKeys.indexOf($active)
        const size = $presetKeys.length
        active.set($presetKeys[((i-1) + size) % size])
        i > 0 && active.set($presetKeys[i - 1])
        current = $active
    }

    const handleNameChange = (e: Event) => {
        const name = e.target?.value
        if(!name) return

        presets.update(presets => {
            const newPresets = {...presets}
            newPresets[name] = newPresets[current]
            delete newPresets[current]
            current = $active    
            return newPresets
        })
    }

</script>

<div class="presets">
    <button class="presets__chevron" on:click={onPrev}>
        <Icon data="{faChevronLeft}" />
    </button>

    <span class="presets__input">
        <input type="text" class={`presets__input ${!$presets[$active] ? 'presets__input--inactive' : ''}`} bind:value={$active} on:change={handleNameChange}/>
    </span>

    <button class="presets__store" on:click={() => savePreset($active)}>
        <Icon data="{faFloppyDisk}" />
    </button>

    <button class="presets__chevron" on:click={onNext}>
        <Icon data="{faChevronRight}" />
    </button>

</div>

<style lang="scss">
    button {
        background-color: transparent;
        border: none;
        display: flex;
        align-items: center;
        color: var(--color-grey-mid);
    }
    .presets {
        background-color: var(--color-yellow);
        border-radius: 5px;
        font-size: var(--text-sm);
        font-family: var(--font-family);
        padding: 0.5rem;
        color: var(--color-grey-mid);
        border-radius: 5px;
        font-weight: 500;
        display: flex;
        align-items: center;
        &__chevron {
            width: 1.25rem;
            text-align: center;
            cursor: pointer;
        }
        &__input {
            border: none;
            background-color: transparent;
            color: var(--color-grey-mid);
            font-size: var(--text-sm);
            font-weight: 500;

            text-align: center;
            width: 5rem;
            padding: 0;

            &--inactive {
                color: var(--color-grey-light);
            }
        }

        &__store {
            margin: 0 0.5rem;
            cursor: pointer;
        }
    }

    button:disabled {
        opacity: 0.2;
        cursor: not-allowed;
    }
</style>