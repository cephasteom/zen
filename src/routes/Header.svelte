<script lang="ts">
    import { page } from '$app/stores';
    import logo from '$lib/images/karma.png';
    import Icon from 'svelte-awesome';
    import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

    let showMobileMenu = false;
    let mobileMenu: HTMLUListElement;

    const toggleMenu = () => {
        showMobileMenu = !showMobileMenu;
        mobileMenu && (mobileMenu.style.display = showMobileMenu ? 'flex' : 'none');
    }

    const closeMenu = () => {
        showMobileMenu = false;
        mobileMenu && (mobileMenu.style.display = 'none');
    }
</script>

<header>
    <nav class="container">
        <a href="/" class="icon" on:click={closeMenu}>
            <img
                src={logo}
                class="mr-3 h-6 sm:h-6"
                alt="Zen Logo"
            />
            <span>zen</span>
        </a>
        <button on:click={toggleMenu} class="menu-toggle">
            <Icon data="{showMobileMenu ? faXmark : faBars}" />
        </button>
        <ul class="menu" bind:this={mobileMenu}>
            <li class="menu__item"><a on:click={closeMenu} class={$page.url.pathname === '/about' ? 'active' : ''} href="/about">About</a></li>
            <li class="menu__item"><a on:click={closeMenu} class={$page.url.pathname === '/learn' ? 'active' : ''} href="/learn">Learn</a></li>
            <li class="menu__item"><a on:click={closeMenu} class={$page.url.pathname === '/docs' ? 'active' : ''} href="/docs">Docs</a></li>
        </ul>
    
    </nav>
</header>


<style lang="scss">
	header {
		display: flex;
		justify-content: center;
        background-color: var(--color-grey-darkest);

        @media all and (display-mode: fullscreen) {
            background-color: var(--color-grey-darker);
            & > nav > .menu { display: none }
        }
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
        height: 2rem;
        display: flex;
        align-items: center;
        color: white;
        font-size: var(--text-sm);
        z-index: 200;
        img {
            height: 100%;
            object-fit: contain;
            filter: invert(1);
            margin-right: 0.25rem;
        }
        span {
            position: relative;
            top: -1.5px;
        }
    }

    .menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        padding: 0;
        background-color: var(--color-grey-darkest);
        z-index: 100;
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;

        &__item a {
            text-transform: uppercase;
            text-decoration: none;
            color: #FFF;
        }

        @media (min-width: 600px) {
            position: relative;
            height: auto;
            width: auto;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            list-style: none;
            padding: 0;
            margin: 0;
            &__item {
                padding-left: 1rem;
                @media(min-width: 600px) {
                    padding-right: 3rem;
                }
                font-size: var(--text-sm);
                font-weight: 500;
                display: flex;
                align-items: center;
                margin-top: 0;
            }
        
            
        }
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

    .menu-toggle {
        display: block;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-grey-light);
        width: 2rem;
        font-family: var(--font-family);
        padding: 0;
        cursor: pointer;
        z-index: 200;

        @media (min-width: 600px) {
            display: none;
        }
    }
</style>
