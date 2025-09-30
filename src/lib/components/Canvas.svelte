<script lang="ts">
    import 'q5';
    import { onMount } from 'svelte';
    import { q5string } from '$lib/stores/zen';
  
    let q: any;
    onMount(() => {
        async function initQ5() {
            // @ts-ignore
            q = await Q5.WebGPU();
            q.setup = () => {
                q.createCanvas(q.windowWidth, q.windowHeight);
                q.background('#15110f');
                q.noLoop();
            };
            // q5string.subscribe((str) => {
            //     try {
            //         q.draw = () => eval(str);
            //     } catch (e) {
            //         console.warn('Error in q5 sketch:', e);
            //     }
            // });
        }


        initQ5();
    });
</script>

<svelte:window on:resize={() => {
    q?.resizeCanvas(q.windowWidth, q.windowHeight + 20);
}} />

<style lang="scss">
</style>