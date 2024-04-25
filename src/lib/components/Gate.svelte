
<script lang="ts">
    export let gate: any;
    export let row: number;
    export let connectTo: number | null = null;

    // @ts-ignore
    $: params = Object.values(gate.options?.params || {}).map((p: number) => {
        return `${parseFloat((p/Math.PI).toFixed(2))}`;
    });

    $: ellipse = (gate.name === 'cx' && gate.connector === 1)
        || (gate.name === 'ccx' && gate.connector === 2);

    $: circle = ['cx', 'ccx'].includes(gate.name) && !ellipse;

    $: name = gate.name === 'measure' ? '?' : gate.name;
</script>

{#if connectTo !== null}
    <div 
        class="connection"
        style={`transform: translateY(${row > connectTo ? -50 : 50}%); height: ${Math.abs(connectTo - row) * 100}%`}
    />
{/if}

<div 
    class="gate"
    class:ellipse={ellipse}
    class:circle={circle}
>
    <p class="type">{name}</p>
    <div class="params">
        <p>{params.join(',')}</p>
    </div>
</div>

<style lang="scss">
    .gate {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
        border: 2px solid var(--color-theme-2);
        background-color: var(--color-grey-darker);
        z-index: 10;

        & p {
            margin: 0;
            text-transform: uppercase;
            text-align: center;
            transform: translateX(0.75px);
            font-size: var(--text-xxs);
            color: var(--color-theme-2);
            font-weight: bold;
        }

        .params {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            position: absolute;
            bottom: -1.1rem;
            background-color: var(--color-grey-darker);
            & p {
                font-size: var(--text-xxs);
            }
        }
    }

    .ellipse {
        border-radius: 50%;
        & p {
            display: none;
            font-weight: bold;
        }
        &::before,
        &::after {
            content: "";
            position: absolute;
            background-color: var(--color-theme-2);
        }
    
        &::before {
            left: 50%;
            width: 1px;
            height: 100%;
            transform: translateX(-50%);
        }
    
        &::after {
            top: 50%;
            width: 100%;
            height: 1px;
            transform: translateY(-50%);
        }
    }


    .circle {
        border-radius: 50%;
        width: 7.5px;
        height: 7.5px;
        background-color: var(--color-theme-2);
        & p {
            display: none;
            font-weight: bold;
        }
    }

    .connection {
        position: absolute;
        left: calc(50% - 0.5px);
        height: 100%;
        width: 1px; 
        background-color: var(--color-theme-2);
    }
</style>