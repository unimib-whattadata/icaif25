(function () {
    'use strict';

    function setExpanded(button, isExpanded) {
        if (button) {
            button.setAttribute('aria-expanded', String(isExpanded));
        }
    }

    function createDisclosure(buttonId, panelId, chevronId, options = {}) {
        const button = document.getElementById(buttonId);
        const panel = document.getElementById(panelId);
        const chevron = chevronId ? document.getElementById(chevronId) : null;
        let hideTimer;

        if (!button || !panel) {
            return { button, panel, close: () => undefined };
        }

        button.setAttribute('aria-controls', panelId);
        panel.classList.add('disclosure-panel');
        setExpanded(button, false);

        const close = () => {
            window.clearTimeout(hideTimer);
            panel.classList.remove('is-open');
            chevron?.classList.remove('rotate-180');
            setExpanded(button, false);

            if (panel.classList.contains('hidden')) {
                return;
            }

            hideTimer = window.setTimeout(() => {
                panel.classList.add('hidden');
            }, 160);
        };

        const open = () => {
            if (typeof options.beforeOpen === 'function') {
                options.beforeOpen();
            }

            window.clearTimeout(hideTimer);
            panel.classList.remove('hidden');
            window.requestAnimationFrame(() => panel.classList.add('is-open'));
            chevron?.classList.add('rotate-180');
            setExpanded(button, true);
        };

        button.addEventListener('click', (event) => {
            if (options.stopPropagation) {
                event.stopPropagation();
            }

            if (button.getAttribute('aria-expanded') === 'true') {
                close();
            } else {
                open();
            }
        });

        return { button, panel, close };
    }

    function initCurrentPage() {
        const normalizePagePath = (pathname) => {
            const decodedPath = decodeURIComponent(pathname);
            return decodedPath.endsWith('/') ? `${decodedPath}index.html` : decodedPath;
        };
        const currentPath = normalizePagePath(window.location.pathname);

        document.querySelectorAll('nav a[href]').forEach((link) => {
            const linkUrl = new URL(link.getAttribute('href'), window.location.href);
            const linkPath = normalizePagePath(linkUrl.pathname);

            if (linkPath === currentPath) {
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    function initRevealAnimations() {
        const revealGroups = [
            { selector: '#tracks .card-shadow', stagger: 70, columns: 3 },
            { selector: '#updates', stagger: 0, columns: 1 },
            { selector: '#linkedin .linkedin-embed', stagger: 90, columns: 3 },
            { selector: '.workshop-list > article', stagger: 80, columns: 2 },
            { selector: '#contact .card-shadow', stagger: 70, columns: 3 },
        ];
        const revealItems = [];

        revealGroups.forEach(({ selector, stagger, columns }) => {
            document.querySelectorAll(selector).forEach((item, index) => {
                item.classList.add('reveal-item');
                item.style.setProperty('--reveal-delay', `${(index % columns) * stagger}ms`);
                revealItems.push(item);
            });
        });

        if (!revealItems.length) {
            return;
        }

        document.documentElement.classList.add('reveal-enabled');

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            revealItems.forEach((item) => item.classList.add('reveal-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.12,
        });

        revealItems.forEach((item) => observer.observe(item));
    }

    function initNavigation() {
        const mobileMenu = createDisclosure('mobile-menu-btn', 'mobile-menu');
        const desktopDisclosures = [];

        const closeDesktopDisclosures = (except) => {
            desktopDisclosures.forEach((disclosure) => {
                if (disclosure !== except) {
                    disclosure.close();
                }
            });
        };

        const programmeDisclosure = createDisclosure('programme-dropdown-btn', 'programme-dropdown', 'programme-chevron', {
            stopPropagation: true,
            beforeOpen: () => closeDesktopDisclosures(programmeDisclosure),
        });
        const callsDisclosure = createDisclosure('calls-dropdown-btn', 'calls-dropdown', 'calls-chevron', {
            stopPropagation: true,
            beforeOpen: () => closeDesktopDisclosures(callsDisclosure),
        });
        const sponsorsDisclosure = createDisclosure('sponsors-dropdown-btn', 'sponsors-dropdown', 'sponsors-chevron', {
            stopPropagation: true,
            beforeOpen: () => closeDesktopDisclosures(sponsorsDisclosure),
        });

        [programmeDisclosure, callsDisclosure, sponsorsDisclosure].forEach((disclosure) => {
            if (disclosure.button && disclosure.panel) {
                desktopDisclosures.push(disclosure);
            }
        });

        const mobileDisclosures = [
            createDisclosure('mobile-programme-btn', 'mobile-programme-dropdown', 'mobile-programme-chevron'),
            createDisclosure('mobile-calls-btn', 'mobile-calls-dropdown', 'mobile-calls-chevron'),
            createDisclosure('mobile-sponsors-btn', 'mobile-sponsors-dropdown', 'mobile-sponsors-chevron'),
        ];

        const closeMobileNavigation = () => {
            mobileDisclosures.forEach((disclosure) => disclosure.close());
            mobileMenu.close();
        };

        mobileMenu.button?.addEventListener('click', () => {
            if (mobileMenu.button.getAttribute('aria-expanded') === 'true') {
                mobileDisclosures.forEach((disclosure) => disclosure.close());
            }
        });

        if (mobileMenu.panel) {
            mobileMenu.panel.addEventListener('click', (event) => {
                if (event.target.closest('a')) {
                    closeMobileNavigation();
                }
            });
        }

        const desktopBreakpoint = window.matchMedia('(min-width: 1024px)');
        const closeMobileAtDesktop = (event) => {
            if (event.matches) {
                closeMobileNavigation();
            }
        };

        if (typeof desktopBreakpoint.addEventListener === 'function') {
            desktopBreakpoint.addEventListener('change', closeMobileAtDesktop);
        } else if (typeof desktopBreakpoint.addListener === 'function') {
            desktopBreakpoint.addListener(closeMobileAtDesktop);
        }

        document.addEventListener('click', (event) => {
            desktopDisclosures.forEach((disclosure) => {
                if (!disclosure.button.contains(event.target) && !disclosure.panel.contains(event.target)) {
                    disclosure.close();
                }
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const mobileWasOpen = mobileMenu.panel && !mobileMenu.panel.classList.contains('hidden');
                closeDesktopDisclosures();
                closeMobileNavigation();
                if (mobileWasOpen) {
                    mobileMenu.button?.focus();
                }
            }
        });
    }

    function init() {
        initCurrentPage();
        initNavigation();
        initRevealAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
