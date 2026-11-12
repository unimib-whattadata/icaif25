/* ICAIF's animated wave field: local WebGL, no network or runtime dependencies. */
(() => {
  'use strict';

  const root = document.body;
  const stage = document.querySelector('.screensaver__stage');
  const canvas = document.querySelector('.screensaver__canvas');
  const controls = document.querySelector('.screensaver__controls');
  const pauseButton = document.querySelector('[data-pause]');
  const fullscreenButton = document.querySelector('[data-fullscreen]');
  const status = document.querySelector('[data-display-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let wakeLock = null;
  let controlTimer;
  let statusTimer;
  let renderer = null;
  let keyboardMode = false;
  let controlsHovered = false;

  function announce(message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    statusTimer = setTimeout(() => { status.textContent = ''; }, 7000);
  }

  function showControls() {
    root.dataset.controls = 'visible';
    clearTimeout(controlTimer);
    if (!controlsHovered && !(keyboardMode && controls.contains(document.activeElement))) {
      controlTimer = setTimeout(() => { root.dataset.controls = 'hidden'; }, 3500);
    }
  }

  function syncPause() {
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
    pauseButton.title = paused ? 'Resume animation (Space)' : 'Pause animation (Space)';
    pauseButton.querySelector('[data-pause-label]').textContent = paused ? 'Resume' : 'Pause';
    pauseButton.querySelector('[data-pause-icon]').toggleAttribute('hidden', paused);
    pauseButton.querySelector('[data-play-icon]').toggleAttribute('hidden', !paused);
    if (paused) stopMotion(); else startMotion();
  }

  async function keepAwake() {
    if (!document.fullscreenElement || document.hidden || !navigator.wakeLock || wakeLock) return;
    try {
      const lock = await navigator.wakeLock.request('screen');
      if (!document.fullscreenElement || document.hidden) { await lock.release(); return; }
      wakeLock = lock;
      lock.addEventListener('release', () => { if (wakeLock === lock) wakeLock = null; });
    } catch { /* Fullscreen and animation still work when the OS denies a lock. */ }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else announce('Fullscreen is unavailable in this browser. Use the browser’s fullscreen command.');
    } catch {
      announce('Fullscreen was blocked. Try the browser’s fullscreen command.');
    }
  }

  function createWaveField() {
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false });
    if (!gl) return null;
    const resources = [];
    function releaseResources() {
      for (const [kind, resource] of resources) gl[kind](resource);
      resources.length = 0;
    }

    // A depth-tested landscape, rather than overlapping transparent wave sheets.
    // Curvature, light and the orbit share a seamless 48-second composition.
    const vertexSource = `
      attribute vec4 aPosition;
      attribute float aAlong;
      uniform float uTime;
      uniform float uAspect;
      uniform float uPixelRatio;
      uniform mediump float uPass;
      varying float vDepth;
      varying float vCrest;
      varying float vSignal;
      varying float vFocus;
      const float TAU = 6.28318530718;
      vec4 surface(vec2 anchor) {
        float phase = uTime * TAU / 48.0;
        float x = anchor.x;
        float z = anchor.y;
        float tide = pow(.5 - .5 * cos(phase), 2.0);
        float bend = sin(z * .095 + phase) * 1.8;
        float broad = sin(x * .14 + z * .14 + phase) * (2.5 + tide * .8);
        float fold = cos(x * .24 - z * .12 - phase) * 1.25;
        float ridge = exp(-pow((x + 12.0 + sin(phase) * 4.0) * .09, 2.0)
                          -pow((z - 13.0) * .075, 2.0)) * 5.8;
        float farRidge = exp(-pow((x - 16.0 + cos(phase) * 4.0) * .075, 2.0)
                             -pow((z - 29.0) * .065, 2.0)) * 4.2;
        float wave = broad + fold + ridge + farRidge;
        float depth = z + 15.0;
        vec2 p = vec2((x + bend) * 2.8 / depth / uAspect,
                      (wave - 7.0) * 2.8 / depth + .06);
        return vec4(p, 1.0 - z / 60.0, clamp((wave + 3.0) / 10.0, 0.0, 1.0));
      }
      void main() {
        float phase = uTime * TAU / 48.0;
        float along = aAlong;
        if (uPass > 3.5) along = fract(uTime / 12.0 + aAlong);
        vec4 p = mix(surface(aPosition.xy), surface(aPosition.zw), along);
        float lift = uPass > 1.5 ? .008 : .001;
        gl_Position = vec4(p.xy, .9 - p.z * 1.8 - lift, 1.0);
        float size = mix(.65, 2.5, p.z);
        if (uPass > 2.5) size = uPass > 3.5 ? 4.5 : mix(4.5, 8.5, p.z);
        gl_PointSize = max(1.0, size * uPixelRatio);
        vDepth = p.z;
        vCrest = p.w;
        // One broad crest of light gathers, crosses the field and gently releases.
        vSignal = pow(.5 + .5 * sin(aPosition.x * .095 + aPosition.y * .13 - phase), 24.0)
                  * (.3 + .7 * pow(.5 - .5 * cos(phase), 2.0));
        vFocus = mix(.32, 1.0, 1.0 - smoothstep(-.52, .08, p.y));
      }
    `;
    const fragmentSource = `
      precision mediump float;
      uniform mediump float uPass;
      varying float vDepth;
      varying float vCrest;
      varying float vSignal;
      varying float vFocus;
      void main() {
        vec3 blue = vec3(.255, .478, .561);
        vec3 ice = vec3(.78, .89, .96);
        vec3 color = mix(blue, ice, .5 + vCrest * .4 + vSignal * .1);
        float fog = smoothstep(.02, .48, vDepth);
        float alpha = (.12 + vDepth * .48) * (.4 + vCrest * 1.2) * vFocus * fog;
        alpha += vSignal * .42 * vDepth * vFocus;
        if (uPass < -.5) {
          gl_FragColor = vec4(vec3(.03137, .08627, .14902), 1.0);
          return;
        }
        if (uPass > .5 && uPass < 1.5) {
          float r = length(gl_PointCoord - vec2(.5));
          alpha *= 1.0 - smoothstep(.28, .5, r);
          alpha *= 2.4;
        }
        if (uPass > 1.5) {
          color = ice;
          alpha = .38 * vFocus;
        }
        if (uPass > 2.5) {
          float r = length(gl_PointCoord - vec2(.5));
          alpha = (1.0 - smoothstep(.3, .5, r)) * .9 * vFocus;
        }
        if (uPass > 3.5) {
          color = mix(ice, vec3(.957, .561, .141), .24);
          alpha *= 1.25;
        }
        gl_FragColor = vec4(color, alpha);
      }
    `;

    function shader(type, source) {
      const result = gl.createShader(type);
      resources.push(['deleteShader', result]);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Wave shader could not compile');
      return result;
    }

    try {
      const vertex = shader(gl.VERTEX_SHADER, vertexSource);
      const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
      const program = gl.createProgram();
      resources.push(['deleteProgram', program]);
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Wave program could not link');
      gl.useProgram(program);

      const columns = 256;
      const rows = 124;
      const lines = [];
      const dots = [];
      const terrain = [];
      function point(target, x, z) { target.push(x, z, x, z, 0); }
      for (let row = 0; row < rows; row += 1) {
        // More depth samples near the camera preserve the fine foreground strands.
        const z = Math.pow(row / (rows - 1), 1.3) * 56;
        for (let column = 0; column < columns; column += 1) {
          const x = -48 + column * 96 / (columns - 1);
          if (column % 2 === row % 2) point(dots, x, z);
          if (column < columns - 1) {
            point(lines, x, z);
            point(lines, x + 96 / (columns - 1), z);
            if (row < rows - 1) {
              const nextZ = Math.pow((row + 1) / (rows - 1), 1.3) * 56;
              const nextX = x + 96 / (columns - 1);
              point(terrain, x, z); point(terrain, nextX, z); point(terrain, x, nextZ);
              point(terrain, nextX, z); point(terrain, nextX, nextZ); point(terrain, x, nextZ);
            }
          }
        }
      }
      const anchors = [[-18, 13], [-12, 8], [-6, 15], [0, 9], [7, 16], [13, 8], [19, 14]];
      const connections = [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [4, 5], [4, 6], [5, 6]];
      const edges = [];
      const nodes = [];
      const signals = [];
      anchors.forEach(([x, z]) => point(nodes, x, z));
      connections.forEach(([from, to], index) => {
        const ends = [...anchors[from], ...anchors[to]];
        edges.push(...ends, 0, ...ends, 1);
        signals.push(...ends, index / connections.length);
      });

      function batch(values, mode, pass) {
        const source = gl.createBuffer();
        resources.push(['deleteBuffer', source]);
        gl.bindBuffer(gl.ARRAY_BUFFER, source);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(values), gl.STATIC_DRAW);
        return { source, mode, pass, count: values.length / 5 };
      }
      const batches = [batch(terrain, gl.TRIANGLES, -1), batch(lines, gl.LINES, 0), batch(dots, gl.POINTS, 1), batch(edges, gl.LINES, 2), batch(nodes, gl.POINTS, 3), batch(signals, gl.POINTS, 4)];
      const position = gl.getAttribLocation(program, 'aPosition');
      const along = gl.getAttribLocation(program, 'aAlong');
      const uniforms = Object.fromEntries(['uTime', 'uAspect', 'uPixelRatio', 'uPass'].map(name => [name, gl.getUniformLocation(program, name)]));
      gl.enableVertexAttribArray(position);
      gl.enableVertexAttribArray(along);
      gl.enable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      let lost = false;
      let disposed = false;
      let width = 1;
      let height = 1;
      let pixelRatio = 1;
      let currentTime = 0;
      function draw(seconds) {
        if (lost || disposed) return;
        currentTime = seconds;
        gl.depthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform1f(uniforms.uTime, seconds % 48);
        gl.uniform1f(uniforms.uAspect, width / height);
        gl.uniform1f(uniforms.uPixelRatio, pixelRatio);
        for (const { source, mode, pass, count } of batches) {
          gl.depthMask(pass < 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, source);
          gl.vertexAttribPointer(position, 4, gl.FLOAT, false, 20, 0);
          gl.vertexAttribPointer(along, 1, gl.FLOAT, false, 20, 16);
          gl.uniform1f(uniforms.uPass, pass);
          gl.drawArrays(mode, 0, count);
        }
      }
      function resize() {
        const bounds = stage.getBoundingClientRect();
        width = Math.max(1, bounds.width);
        height = Math.max(1, bounds.height);
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5, 2560 / width);
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        gl.viewport(0, 0, canvas.width, canvas.height);
        draw(currentTime);
      }
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
      function onContextLost(event) {
        event.preventDefault();
        lost = true;
        stage.dataset.renderer = 'poster';
      }
      function onContextRestored() { initializeRenderer(); }
      canvas.addEventListener('webglcontextlost', onContextLost);
      canvas.addEventListener('webglcontextrestored', onContextRestored);
      resize();
      stage.dataset.renderer = 'webgl';
      return {
        draw,
        dispose() {
          disposed = true;
          resizeObserver.disconnect();
          canvas.removeEventListener('webglcontextlost', onContextLost);
          canvas.removeEventListener('webglcontextrestored', onContextRestored);
          releaseResources();
        }
      };
    } catch (error) { releaseResources(); throw error; }
  }

  // A single clock owns the field and the identity choreography. Pause, visibility
  // and reduced motion therefore freeze the complete composition at the same frame.
  let identityMotion = window.createScreensaverIdentityMotion?.(stage) || null;
  let programme = window.createScreensaverProgramme?.(stage) || null;
  let programmeTimer = 0;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let pageActive = true;

  // Align status changes with the wall clock, independent of animation playback.
  function scheduleProgrammeClock() {
    clearTimeout(programmeTimer);
    programmeTimer = 0;
    if (document.hidden || !pageActive) return;
    programme?.refreshClock();
    programmeTimer = setTimeout(scheduleProgrammeClock, 60000 - Date.now() % 60000 + 20);
  }

  function drawComposition() {
    renderer?.draw(elapsed);
    identityMotion?.seek(elapsed);
  }
  function stopMotion() { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  function tick(now) {
    frame = 0;
    if (paused || document.hidden || !pageActive) { previous = 0; return; }
    if (!previous || now - previous >= 32) {
      elapsed = (elapsed + (previous ? Math.min((now - previous) / 1000, .1) : 0)) % 48;
      previous = now;
      drawComposition();
    }
    frame = requestAnimationFrame(tick);
  }
  function startMotion() {
    if (!frame && !paused && !document.hidden && pageActive) frame = requestAnimationFrame(tick);
  }
  function initializeRenderer() {
    renderer?.dispose();
    renderer = null;
    try { renderer = createWaveField(); }
    catch { stage.dataset.renderer = 'poster'; }
    if (!renderer) stage.dataset.renderer = 'poster';
    pauseButton.hidden = !renderer && !identityMotion;
    drawComposition();
  }

  pauseButton.addEventListener('click', () => { paused = !paused; syncPause(); });
  fullscreenButton.addEventListener('click', toggleFullscreen);
  controls.addEventListener('focusin', showControls);
  controls.addEventListener('focusout', showControls);
  controls.addEventListener('pointerenter', () => { controlsHovered = true; showControls(); });
  controls.addEventListener('pointerleave', () => { controlsHovered = false; showControls(); });
  document.addEventListener('pointermove', showControls, { passive: true });
  document.addEventListener('pointerdown', () => { keyboardMode = false; showControls(); }, { passive: true });
  document.addEventListener('keydown', event => {
    keyboardMode = true;
    showControls();
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || /^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.code === 'Space' && (renderer || identityMotion)) { event.preventDefault(); paused = !paused; syncPause(); }
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    fullscreenButton.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
    fullscreenButton.title = active ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (F)';
    fullscreenButton.querySelector('[data-fullscreen-label]').textContent = active ? 'Exit fullscreen' : 'Fullscreen';
    fullscreenButton.setAttribute('aria-pressed', String(active));
    if (active) keepAwake();
    else if (wakeLock) wakeLock.release().catch(() => {});
    showControls();
  });
  document.addEventListener('visibilitychange', () => { scheduleProgrammeClock(); if (document.hidden) stopMotion(); else { startMotion(); keepAwake(); } });
  reducedMotion.addEventListener('change', event => { paused = event.matches; if (paused) { elapsed = 0; drawComposition(); } syncPause(); });
  window.addEventListener('pagehide', () => { pageActive = false; stopMotion(); clearTimeout(programmeTimer); programme?.dispose(); programme = null; renderer?.dispose(); renderer = null; identityMotion?.dispose(); identityMotion = null; if (wakeLock) wakeLock.release().catch(() => {}); });
  window.addEventListener('pageshow', event => { if (event.persisted) { pageActive = true; programme = window.createScreensaverProgramme?.(stage) || null; scheduleProgrammeClock(); identityMotion = window.createScreensaverIdentityMotion?.(stage) || null; initializeRenderer(); syncPause(); showControls(); } });

  controls.hidden = false;
  scheduleProgrammeClock();
  initializeRenderer();
  syncPause();
  root.dataset.controls = 'hidden';
})();
