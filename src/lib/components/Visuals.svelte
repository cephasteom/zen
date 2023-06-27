<script lang="ts">
    import { onMount } from 'svelte';
    import { SVG } from '@svgdotjs/svg.js'
    import { visualsData } from "$lib/stores/zen";

    let draw: SVG.Doc;
    let s: number = 16;

    function initSVG() {
        const w = 100 / s;
        draw.clear();
        draw.rect('100%', '100%').fill('var(--color-grey-darkest)');
        for(let i = 0; i < s*s; i++) {
            draw.rect(`${w}%`, `${w}%`)
                .attr({x: `${w * (i%s)}%`, y: `${w * Math.floor((s*s-(i+1))/s)}%`})
                .stroke({color: 'var(--color-grey-dark)', width: 1})
                .fill('transparent')
                .addClass(`rect--${i}`);
        }
    }

    onMount(() => {
        draw = SVG().addTo('.visuals__svg').size('100%', '100%');
        initSVG();
        
        visualsData.subscribe((data) => {
            const size = Math.sqrt(data.length / 4);
            size !== s && (s = size, initSVG());
            for(let i = 0; i < s*s; i++) {
                const r = data[i*4];
                const g = data[i*4+1];
                const b = data[i*4+2];
                const a = data[i*4+3];
                const element = SVG(`rect.rect--${i}`)
                element && element.fill(`rgba(${r},${g},${b},${a})`);
            }
        });
    })
</script>

<div class="visuals">
    <div class="visuals__svg"></div>
</div>

<style lang="scss">
    .visuals {
        width: 80%;
        height: 0;
        padding-bottom: 80%;
        position: relative;
        &__svg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            & > svg {
                width: 100%;
                height: 100%;
            }
        }
    }
</style>