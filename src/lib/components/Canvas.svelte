<!-- TODO: parse for frameCount and add loop if present, visuals on off on in Tools -->

<script lang="ts">
    import 'q5';
    import { onMount } from 'svelte';
    import { canvas, isPlaying, t } from '$lib/stores/zen';
    import { print } from '$lib/stores/zen';
  
    let q: any;
    onMount(() => {
        async function initQ5() {
            q = await Q5.WebGPU();
            q.setup = () => {
                q.createCanvas(q.windowWidth, q.windowHeight);
                q.colorMode(q.RGB, 255);
                q.background('#15110f');
                q.noLoop();

            };

            // when canvas code changes, update draw function
            canvas.subscribe((str) => {
                if(!$isPlaying || !q) return;
                try {
                    q.draw = str 
                    ? () => {
                        // Create a sandbox object pointing to the sketch API
                        // allows access to p5 functions directly without q. prefix
                        const sandbox = new Proxy(q, {
                            get(target, prop) {
                                if (prop in target) return target[prop];
                            }
                        });

                        try {
                            const fn = new Function(str);
                            fn.call(sandbox);
                        } catch (e: any) {
                            print('error', 'Error in canvas code: ' + e.message);
                            console.warn('Error in q5 sketch:', e);
                        }
                    }
                    : () => {
                        q.background('#15110f');
                    };

                    // if string includes frameCount, loop, else noLoop
                    /frameCount/.test(str)
                        ? q.loop()
                        : q.noLoop();

                } catch (e: any) {
                    print('error', 'Error in canvas code: ' + e.message);
                    console.warn('Error in q5 sketch:', e);
                }
            });
            
            // when t changes, redraw
            t.subscribe(() => {
                // only redraw if playing and if frameCount is not in the code
                if(!q || !$isPlaying || /frameCount/.test($canvas)) return;
                q.redraw();
            });

            // when isPlaying changes, loop or noLoop
            isPlaying.subscribe((playing) => {
                if(!q) return;
                playing && /frameCount/.test($canvas)
                    ? q.loop()
                    : q.noLoop();
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