<script lang="ts">
    import { visualsData } from "$lib/stores/zen";
</script>

<div class="visuals">
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect stroke="none" stroke-width="2"  />
    </svg>
</div>

<style lang="scss">
    .visuals {
        width: 80%;
        height: 0;
        padding-bottom: 80%;
        & rect {
            width: 100%;
            height: 100%;
            fill: var(--color-grey-light);
        }
    }
</style>