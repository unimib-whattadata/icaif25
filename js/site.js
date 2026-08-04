(function () {
    'use strict';

    const assetUrl = (path) => new URL(path, document.baseURI).href;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setExpanded(button, isExpanded) {
        if (button) {
            button.setAttribute('aria-expanded', String(isExpanded));
        }
    }

    function initLogo() {
        const logoContainer = document.getElementById('logo-container');
        if (!logoContainer) return;

        fetch(assetUrl('img/logo.svg'))
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to load logo: ${response.status}`);
                }
                return response.text();
            })
            .then((svg) => {
                logoContainer.innerHTML = svg;
            })
            .catch(() => {
                logoContainer.setAttribute('aria-hidden', 'true');
            });
    }

    function initDynamicAssets() {
        const heroSection = document.querySelector('[data-hero-bg]');
        if (heroSection && !heroSection.style.backgroundImage) {
            heroSection.style.backgroundImage = `url("${assetUrl('img/hero.jpg')}")`;
        }

        const bocconiImg = document.getElementById('bocconi-img');
        if (bocconiImg && !bocconiImg.getAttribute('src')) {
            bocconiImg.src = assetUrl('img/bocconi-campus.jpg');
        }
    }

    function initIcons() {
        if (window.heroicons) {
            window.heroicons.createIcons();
        }
    }

    function createDisclosure(buttonId, panelId, chevronId, options = {}) {
        const button = document.getElementById(buttonId);
        const panel = document.getElementById(panelId);
        const chevron = chevronId ? document.getElementById(chevronId) : null;

        if (!button || !panel) {
            return { button, panel, close: () => undefined };
        }

        button.setAttribute('aria-controls', panelId);
        setExpanded(button, false);

        const close = () => {
            panel.classList.add('hidden');
            chevron?.classList.remove('rotate-180');
            setExpanded(button, false);
        };

        const open = () => {
            if (typeof options.beforeOpen === 'function') {
                options.beforeOpen();
            }
            panel.classList.remove('hidden');
            chevron?.classList.add('rotate-180');
            setExpanded(button, true);
        };

        button.addEventListener('click', (event) => {
            if (options.stopPropagation) {
                event.stopPropagation();
            }

            if (panel.classList.contains('hidden')) {
                open();
            } else {
                close();
            }
        });

        return { button, panel, close };
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

        const callsDisclosure = createDisclosure('calls-dropdown-btn', 'calls-dropdown', 'calls-chevron', {
            stopPropagation: true,
            beforeOpen: () => closeDesktopDisclosures(callsDisclosure),
        });
        const sponsorsDisclosure = createDisclosure('sponsors-dropdown-btn', 'sponsors-dropdown', 'sponsors-chevron', {
            stopPropagation: true,
            beforeOpen: () => closeDesktopDisclosures(sponsorsDisclosure),
        });

        [callsDisclosure, sponsorsDisclosure].forEach((disclosure) => {
            if (disclosure.button && disclosure.panel) {
                desktopDisclosures.push(disclosure);
            }
        });

        createDisclosure('mobile-calls-btn', 'mobile-calls-dropdown', 'mobile-calls-chevron');
        createDisclosure('mobile-sponsors-btn', 'mobile-sponsors-dropdown', 'mobile-sponsors-chevron');

        if (mobileMenu.panel) {
            mobileMenu.panel.addEventListener('click', (event) => {
                if (event.target.closest('a')) {
                    mobileMenu.close();
                }
            });
        }

        const desktopBreakpoint = window.matchMedia('(min-width: 1024px)');
        const closeMobileAtDesktop = (event) => {
            if (event.matches) {
                mobileMenu.close();
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
                closeDesktopDisclosures();
                mobileMenu.close();
            }
        });
    }

    function animateCounter(element, target, duration) {
        if (prefersReducedMotion) {
            element.textContent = String(target);
            return;
        }

        const startTime = performance.now();

        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            element.textContent = String(Math.floor(progress * target));

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function initCounters() {
        const counter = document.getElementById('attendees-counter');
        if (!counter) return;

        const startCounter = () => animateCounter(counter, 600, 2000);

        if (!('IntersectionObserver' in window)) {
            startCounter();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startCounter();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(counter.closest('section') || counter);
    }

    function init() {
        initDynamicAssets();
        initLogo();
        initIcons();
        initNavigation();
        initCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
