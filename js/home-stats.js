(() => {
    const counter = document.querySelector('[data-attendee-count]');

    if (!counter) {
        return;
    }

    const target = Number(counter.dataset.attendeeCount);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setValue = (value) => {
        const currentValue = Math.min(value, target);
        counter.textContent = String(currentValue);
    };

    if (reducedMotion) {
        setValue(target);
        return;
    }

    setValue(0);

    const stat = counter.closest('.stat');
    let animated = false;

    const startAnimation = () => {
        if (animated) {
            return;
        }

        animated = true;

        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 4);

            setValue(Math.round(target * easedProgress));

            if (progress < 1) {
                window.requestAnimationFrame(animate);
            }
        };

        window.requestAnimationFrame(animate);
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) {
                return;
            }

            observer.disconnect();
            startAnimation();
        }, { threshold: 0.6 });

        observer.observe(stat);
        return;
    }

    const startWhenVisible = () => {
        const bounds = stat.getBoundingClientRect();
        const isVisible = bounds.top < window.innerHeight && bounds.bottom > 0;

        if (!isVisible) {
            return;
        }

        window.removeEventListener('scroll', startWhenVisible);
        window.removeEventListener('resize', startWhenVisible);
        startAnimation();
    };

    window.addEventListener('scroll', startWhenVisible, { passive: true });
    window.addEventListener('resize', startWhenVisible);
    window.requestAnimationFrame(startWhenVisible);
})();
