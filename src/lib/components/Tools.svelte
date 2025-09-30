<script lang="ts">
    import { page } from '$app/state';
    import Icon from 'svelte-awesome';
    import { faPlay, faStop, faFloppyDisk, faCode, faGlobe, faChessBoard, faBars, faToggleOff, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
    import { isPlaying, showCircuit, toggleCircuit, toggleVisuals, visualsType } from '$lib/stores/zen';
    import { isApp } from '$lib/electronAPI/index';
    import Dialog from './Dialog.svelte'
    import Save from './Save.svelte'
    import Load from './Load.svelte'
    import Collaborate from './Collaborate.svelte'
    import { debounce } from '$lib/zen/utils/utils';
    import { isCollaborating, toggleCollaborate } from '$lib/stores/collaborative-editing';

    const visualsIcons = {
        'grid': faChessBoard,
        'sphere': faGlobe,
        'none': faToggleOff
    }
    
    let save: HTMLDialogElement;
    let load: HTMLDialogElement;
    let collaborate: HTMLDialogElement
    let isVisible = true;
    let thisElement: HTMLDivElement;

    const show = (show: boolean = true) => {
        if (isVisible === show) return;
        isVisible = show;
        thisElement && (thisElement.style.height = show ? '52px' : '0px');
        thisElement && (thisElement.style.opacity = show ? '1' : '0');
    };
</script>

<div 
    bind:this={thisElement}
    class="tools"
>
    <div class="container">
        <button on:click={e => { e.stopPropagation(); isPlaying.set(!$isPlaying)}}><Icon scale={1.25} data="{$isPlaying ? faStop : faPlay}" /></button>
        {#if !isApp()}
            <button on:click={e => { e.stopPropagation(); save.showModal()}} class:active={false}><Icon scale={1.25} data="{faFloppyDisk}" /></button>
            <button on:click={e => { e.stopPropagation(); load.showModal()}} class:active={false}><Icon scale={1.25} data="{faCode}" /></button>
        {/if}
        
        <button class="tools__visuals" 
            class:active={$visualsType !== 'none'} 
            on:click={e => { e.stopPropagation(); toggleVisuals()}}
        >
            <Icon scale={1.25} data={visualsIcons[$visualsType] || visualsIcons.grid} />
        </button>
        <button class="tools__circuit" on:click={e => { e.stopPropagation(); toggleCircuit()}} class:active={$showCircuit}>
            <Icon scale={1.25} data={faBars} />
        </button>

        <!-- <button class="tools__collaborate" on:click={() => collaborate.showModal()} class:active={$isCollaborating}>
            <Icon scale={1.25} data={faPeopleGroup} />
        </button> -->
    </div>
</div>

<Dialog bind:dialog={save} on:close={() => save.close()}>
    <Save on:save={() => save.close()} />
</Dialog>

<Dialog bind:dialog={load} on:close={() => load.close()}>
    <Load on:load={() => load.close()}/>
</Dialog>

<Dialog bind:dialog={collaborate} on:close={() => collaborate.close()}>
    <Collaborate on:load={() => collaborate.close()}/>
</Dialog>

<svelte:window 
    on:keydown={e => { 
        if(!isApp() && e.metaKey && ['s', 'o'].includes(e.key)) {
            e.preventDefault()
            e.key === 's' && save.showModal();
            e.key === 'o' && load.showModal();
            return;
        }
        // if accessibility keys needed for tabbing etc, hide the header
        if (e?.key && !['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
            show(false);
        }
    }} 

    on:mousemove={debounce((e) => e.clientY < 10 && show(true), 100)}
    on:click={() => page.url.pathname === '/' && show(false)}
    on:keydown={(e) => {
        
    }}
/>

<style lang="scss">
    .tools {
        background-color: var(--color-grey-darker);
        height: 52px;
        opacity: 1;
        transition: height 0.75s ease-in-out, opacity 0.75s ease-in-out;
        overflow: hidden;
        padding: 0 1.5rem;
        border-bottom: 0.25px solid var(--color-grey-light);
        width: calc(100% - 3rem);

        & .container {
            display: flex;
            gap: 3rem;
            align-items: center;
            height: 100%;
        }

        & button {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--color-grey-dark);
            font-size: var(--text-sm);
            font-family: var(--font-family);
            padding: 0;
            color:white;
            display: flex;
            
            &.active {
                color: var(--color-theme-1);
            }

            &:focus {
                color: var(--color-theme-3);
            }
        }

        &__visuals, &__circuit, &__console {
            display: none!important;
            @media (min-width: 800px) {
                display: flex!important;
            }
        }
    }

</style>