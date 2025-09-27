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
        <span class="footer__copyright">© <a target="_blank" href="https://cephasteom.co.uk">CTeom / PThomas</a> {new Date().getFullYear()}</span>
    </footer>
</div>

<style lang="scss">
    .app {
        display: flex;
        flex-direction: column;
        @media all and (display-mode: fullscreen) {
            min-height: 100vh;
        }
    }

    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        box-sizing: border-box;
        background-color: var(--color-grey-light);
    }

    .footer {
        border-top: 0.25px solid var(--color-grey-light);
        width: calc(100% - 3rem);
        padding: 1.5rem;
        margin: 0;
        color: var(--color-grey-light);
        text-align: center;
        display: flex;
        justify-content: space-between;

        @media (min-width: 1200px) {
            text-align: right;
        }

        @media (min-width: 1600px) {
            width: 100%;
            padding: 1rem 0;
        }

        @media all and (display-mode: fullscreen) {
            display: none;
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
