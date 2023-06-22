<script>
    import { page } from '$app/stores';
    import logo from '$lib/images/karma.png';
</script>

<header>
    <nav class="container">
        <a href="/" class="icon">
            <img
                src={logo}
                class="mr-3 h-6 sm:h-6"
                alt="Zen Logo"
            />
            Zen
        </a>
        <ul class="menu">
            <li class="menu__item"><a class={$page.url.pathname === '/about' ? 'active' : ''} href="/about">About</a></li>
            <li class="menu__item"><a class={$page.url.pathname === '/docs' ? 'active' : ''} href="/docs">Docs</a></li>
            <li class="menu__item"><a class={$page.url.pathname === '/data' ? 'active' : ''} href="/data">Data</a></li>
        </ul>
    
    </nav>
</header>

<style lang="scss">
	header {
		display: flex;
		justify-content: center;
        background-color: var(--color-grey-darkest);
	}
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;

        @media (min-width: 1200px) {
            padding: 1rem 2rem;
        }

        $var: calc(1600px - 4rem);

        @media (min-width: 1664px) {
            padding-left: 0rem;
            padding-right: 0rem;
        }
    }
    
    .icon {
        width: 2rem;
        height: 1.25rem;
        display: flex;
        align-items: center;
        color: var(--color-yellow);
        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: invert(1);
            margin-right: 0.5rem;
        }
    }

    .menu {
        display: flex;
        justify-content: space-between;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .menu__item {
        padding-right: 3rem;
        font-size: var(--text-sm);
        font-weight: 500;
        display: flex;
        align-items: center;
    }

    .menu__item a {
        text-transform: uppercase;
        text-decoration: none;
        color: #FFF;
    }

    .menu__item a:hover {
        color: var(--color-theme-2);

    }

    a.active {
        color: var(--color-theme-2);
    }

    .menu__item:last-of-type {
        padding-right: 0;
    }
</style>
