<script lang="ts">
    import 'q5';
    import { onMount } from 'svelte';
  
    let q: any;
    onMount(() => {
        async function initQ5() {
            // @ts-ignore
            q = await Q5.WebGPU();
            q.setup = () => q.createCanvas(q.windowWidth, q.windowHeight);

            q.draw = () => {
                q.background(.25);
                q.noLoop();
            };
        }

        initQ5();
    });
</script>

<style lang="scss">
</style>