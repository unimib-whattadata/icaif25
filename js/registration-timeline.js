(() => {
  const timeline = document.querySelector('.registration-timeline');
  if (!timeline || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    timeline.classList.add('is-tracing');
    observer.disconnect();
  }, { rootMargin: '80px 0px' });

  observer.observe(timeline);
})();
