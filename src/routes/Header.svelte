<script lang="ts">
    // @ts-ignore
    import { page } from '$app/stores';
    // @ts-ignore
    import logo from '$lib/images/karma.png';
    import Icon from 'svelte-awesome';
    import { faBars, faXmark, faDownload } from '@fortawesome/free-solid-svg-icons';
    import { isApp } from '$lib/electronAPI/index';

    import { version } from '$app/environment';

    let showMobileMenu = false;
    let menu: HTMLUListElement;

    const toggleMenu = () => {
        showMobileMenu = !showMobileMenu;
        menu && (menu.style.display = showMobileMenu ? 'flex' : 'none');
    }

    const closeMenu = () => {
        if(window.innerWidth > 599) return (menu.style.display = 'flex');
        showMobileMenu = false;
        menu && (menu.style.display = 'none');
    }
</script>

<svelte:window on:resize={closeMenu} />

<header>
    <nav class="container">
        {#if isApp()}
            <span class="icon">
                <img
                    src={logo}
                    class="mr-3 h-6 sm:h-6"
                    alt="Zen Logo"
                />
                <p>zen <span>{version}</span></p>
            </span>
        {:else}
            <a 
                href={(isApp() ? "https://zen.cephasteom.co.uk" : "") + "/"}
                target={isApp() ? "_blank" : ""}
                class="icon" on:click={closeMenu}
            >
                <img
                    src={logo}
                    class="mr-3 h-6 sm:h-6"
                    alt="Zen Logo"
                />
                <p>zen <span>{version}</span></p>
            </a>
        {/if}
        <button on:click={toggleMenu} class="menu-toggle">
            <Icon data="{showMobileMenu ? faXmark : faBars}" />
        </button>
    
        <ul class="menu" bind:this={menu}>
            <li 
                class="menu__item"><a on:click={closeMenu} 
                class={$page.url.pathname === '/about' ? 'active' : ''} 
                href={(isApp() ? "https://zen.cephasteom.co.uk" : "") + "/about"}
                target={isApp() ? "_blank" : ""}
            >About</a></li>
            <li 
                class="menu__item"><a on:click={closeMenu} 
                class={$page.url.pathname.includes('/learn') ? 'active' : ''} 
                href={(isApp() ? "https://zen.cephasteom.co.uk" : "") + "/learn"}
                target={isApp() ? "_blank" : ""}
            >Learn</a></li>
            <li 
                class="menu__item"><a on:click={closeMenu} 
                class={$page.url.pathname === '/docs' ? 'active' : ''} 
                href={(isApp() ? "https://zen.cephasteom.co.uk" : "") + "/docs"}
                target={isApp() ? "_blank" : ""}
            >Docs</a></li>
            <li class="menu__item">
                <a 
                    href="https://github.com/cephasteom/zen-electron/releases" 
                    target="_blank"
                    class="icon"
                >
                    <Icon data={faDownload} />
                </a>
            </li>
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
            & > nav { display: none }
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

        @media (min-width: 1664px) {
            padding-left: 0rem;
            padding-right: 0rem;
        }
    }
    
    .icon {
        height: 2rem;
        @media(min-width: 600px) {
            height: 1.5rem;
        }
        display: flex;
        align-items: center;
        font-size: var(--text-sm);
        z-index: 200;
        img {
            height: 100%;
            object-fit: contain;
            filter: invert(1);
            margin-right: 0.125rem;
            transform: rotate(-45deg);
        }
        p {
            position: relative;
            top: -1.5px;
            margin: 0;
            font-size: var(--text-sm);
            color: white;

            & span {
                font-size: 8px;
                position: relative;
                color: var(--color-theme-2);
                opacity: 0.8;
            }
        }
    }

    .menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        padding: 0;
        z-index: 100;
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background-color: var(--color-theme-1);

        &__item a {
            text-transform: uppercase;
            text-decoration: none;
            color: #FFF;
            font-size: var(--text-xs);
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
            background-color: transparent;
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
        height: 2rem;
        font-family: var(--font-family);
        padding: 0;
        cursor: pointer;
        z-index: 200;

        @media (min-width: 600px) {
            display: none;
        }
    }
</style>
