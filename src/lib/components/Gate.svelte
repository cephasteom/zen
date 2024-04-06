
<script lang="ts">
    export let type: string;
    export let params: mnumber[];
</script>

<div class="gate">
    <p class="type">{type}</p>
</div>

<style lang="scss">
    .gate {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
        border: 1px solid var(--color-theme-1);
        background-color: var(--color-grey-darker);

        & p {
            margin: 0;
            text-transform: uppercase;
            text-align: center;
            transform: translateX(0.75px);
            font-size: var(--text-xxs);
            color: var(--color-theme-1);
        }
    }
</style>