/* Only the official orbit carries motion, using the wave renderer's clock. */
(() => {
  'use strict';

  const controllers = new WeakMap();
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);

  window.createScreensaverIdentityMotion = stage => {
    controllers.get(stage)?.dispose();
    const mark = stage.querySelector('.screensaver__mark');
    if (!mark) return { seek() {}, dispose() {} };

    // The original image remains the visible, accessible identity at all times.
    const wrapper = document.createElement('div');
    wrapper.className = 'screensaver__mark-motion';
    mark.before(wrapper);
    wrapper.append(mark);
    const orbit = document.createElement('span');
    orbit.className = 'screensaver__identity-orbit';
    orbit.setAttribute('aria-hidden', 'true');
    const light = document.createElement('span');
    light.className = 'screensaver__identity-orbit-light';
    orbit.append(light);
    wrapper.append(orbit);
    let disposed = false;

    function seek(seconds) {
      if (disposed) return;
      const progress = Number.isFinite(seconds) ? (Math.max(0, seconds) % 12) / 12 : 0;
      const intensity = smooth(clamp(progress * 8)) * smooth(clamp((1 - progress) * 8));
      orbit.style.opacity = (.96 * intensity).toFixed(4);
      light.style.transform = `translate3d(${(-65 + progress * 130).toFixed(3)}%, 0, 0)`;
    }

    const controller = {
      seek,
      dispose() {
        if (disposed) return;
        disposed = true;
        wrapper.before(mark);
        wrapper.remove();
        if (controllers.get(stage) === controller) controllers.delete(stage);
      }
    };
    controllers.set(stage, controller);
    seek(0);
    return controller;
  };
})();
