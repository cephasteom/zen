<script lang="ts">
    import { t, c, q } from '$lib/stores/zen';    

</script>

<div class="data">
    <div>t: <span>{$t}</span></div>
    <div>c: <span>{$c}</span></div>
    <div>q: <span>{$q}</span></div>
</div>

<style lang="scss">
    .data {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: var(--text-sm);
        & div {
            width: 25%;
            &:last-of-type {
                width: fit-content;
            }
            color: var(--color-grey-light);
            
            & span {
                color: var(--color-theme-1);
            }
        }
    }
</style>