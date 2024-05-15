<script>
    import Header from "./Header.svelte";
    import "./styles.css";
</script>

<div class="app">
    <Header />

    <main class="w-full container">
        <slot />
    </main>

    <footer class="footer container">
        <span class="footer__issues">Something wrong? <a target="_blank" href="https://github.com/cephasteom/zen-3/issues">Open an issue</a>.</span>
        <span class="footer__copyright">© <a target="_blank" href="https://cephasteom.co.uk">Cephas Teom</a> {new Date().getFullYear()}</span>
    </footer>
</div>

<style lang="scss">
    .app {
        display: flex;
        flex-direction: column;
        @media all and (display-mode: fullscreen) {
            margin: 2rem;
            margin-bottom: 0;
        }
    }

    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        box-sizing: border-box;
        background-color: var(--color-grey-mid);
    }

    .footer {
        width: calc(100% - 2rem);
        padding: 1rem;
        margin: 0 auto;
        color: var(--color-grey-light);
        text-align: center;
        display: flex;
        justify-content: space-between;
        @media (min-width: 1200px) {
            text-align: right;
            width: calc(100% - 4rem);
            padding: 1rem 2rem;
        }

        @media (min-width: 1600px) {
            width: 100%;
            padding: 1rem 0;
        }

        span {
            font-size: var(--text-sm);
        }

        &__issues {
            display: none;
            @media (min-width: 550px) {
                display: inline-block;
            }
         
            @media all and (display-mode: fullscreen) {
                display: none;
            }
        }

        &__copyright {
            @media (max-width: 549px) {
                width: 100%;
            }
        }

    }

</style>
