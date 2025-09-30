<script lang="ts">
    import 'q5';
    import { onMount } from 'svelte';
    import { canvas, isPlaying } from '$lib/stores/zen';
  
    let q: any;
    onMount(() => {
        async function initQ5() {
            // @ts-ignore
            q = await Q5.WebGPU();
            q.setup = () => {
                q.createCanvas(q.windowWidth, q.windowHeight);
                q.colorMode(q.RGB, 255);
                q.background('#15110f');
                q.noLoop();
            };

            // q.draw = () => {
            //     q.background(q.frameCount%255,0,0)
            // };

            canvas.subscribe((str) => {
                try {
                    q.draw = str 
                    ? () => {
                        // Create a sandbox object pointing to the sketch API
                        // allows access to p5 functions directly without q. prefix
                        const sandbox = new Proxy(q, {
                            get(target, prop) {
                                if (prop in target) return target[prop];
                                throw new Error(`Property "${String(prop)}" not found in Q5 API`);
                            }
                        });
                        const fn = new Function(str);
                        fn.call(sandbox);
                    }
                    : () => {
                        q.background('#15110f');
                        q.noLoop();
                    }
                } catch (e) {
                    console.warn('Error in q5 sketch:', e);
                }
            });
            isPlaying.subscribe((playing) => {
                playing ? q.loop() : q.noLoop();
            });
        }


        initQ5();
    });
</script>

<svelte:window on:resize={() => {
    q?.resizeCanvas(q.windowWidth, q.windowHeight + 20);
}} />

<style lang="scss">
</style>