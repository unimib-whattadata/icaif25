(() => {
  "use strict";
  const picture = document.getElementById("venue-map-picture");
  const canvas = document.getElementById("venue-map-canvas");
  const controls = document.querySelector(".venue-map-switch");
  const zoomControls = document.querySelector(".venue-map-tools");
  const status = document.getElementById("map-status");
  if (!canvas || !picture || !controls || !zoomControls || typeof d3 === "undefined" || typeof renderVenueMap !== "function") return;

  const compact = window.matchMedia("(max-width: 639px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionToggle = document.getElementById("map-motion-toggle");
  const routePicker = document.getElementById("venue-route-picker");
  const routeSelect = document.getElementById("venue-route-origin");
  const routeDetails = document.getElementById("venue-route-details");
  const routeHint = document.getElementById("venue-route-hint");
  const replay = document.getElementById("venue-route-replay");
  const hotelKey = document.getElementById("venue-hotel-key");
  const hotelPopup = document.createElement("div");
  hotelPopup.id = "venue-hotel-tooltip";
  hotelPopup.className = "card card-sm venue-hotel-popover";
  hotelPopup.setAttribute("role", "group");
  hotelPopup.setAttribute("aria-labelledby", "venue-hotel-name");
  hotelPopup.hidden = true;
  const hotelBody = document.createElement("div");
  hotelBody.className = "card-body";
  const hotelClose = document.createElement("button");
  hotelClose.type = "button";
  hotelClose.className = "btn btn-ghost btn-sm btn-square venue-hotel-close";
  hotelClose.setAttribute("aria-label", "Close hotel details");
  hotelClose.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>';
  const hotelName = document.createElement("h3");
  hotelName.id = "venue-hotel-name";
  hotelName.className = "card-title";
  const hotelMeta = document.createElement("p");
  hotelMeta.className = "venue-hotel-meta";
  const hotelActions = document.createElement("div");
  hotelActions.className = "card-actions";
  const hotelLink = document.createElement("a");
  hotelLink.className = "btn btn-sm";
  hotelLink.target = "_blank";
  hotelLink.rel = "noopener noreferrer";
  hotelLink.textContent = "Visit hotel website";
  hotelActions.append(hotelLink);
  hotelBody.append(hotelClose, hotelName, hotelMeta, hotelActions);
  hotelPopup.append(hotelBody);
  let view = "city", zoom = 1, frame = 0;
  let mapData, drawnGeometry;
  let routes = [], route = null;
  let mapVisible = false, motionPaused = false, journeyRunning = false;
  let activeHotelMarker = null;
  const easeOut = t => 1-Math.pow(1-t,3);
  const canMove = () => !reducedMotion.matches && !motionPaused && !document.hidden && mapVisible;
  const geometry = () => venueMapGeometry(d3,view,compact.matches,route);

  function updateButtons() {
    zoomControls.querySelector('[data-map-zoom="in"]').disabled = zoom >= 2;
    zoomControls.querySelector('[data-map-zoom="out"]').disabled = zoom <= 1;
    zoomControls.querySelector('[data-map-zoom="reset"]').disabled = zoom === 1;
    controls.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed",String(button.dataset.mapView===view)));
    motionToggle.hidden = reducedMotion.matches;
    replay.disabled = !route || reducedMotion.matches || motionPaused;
    replay.title = motionPaused ? "Resume animation to replay the route" : reducedMotion.matches ? "Your device prefers reduced motion" : "Trace this route again";
  }

  function stopMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    journeyRunning = false;
    canvas.dataset.motion = "idle";
    canvas.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    routeDetails.getAnimations({subtree:true}).forEach(animation => animation.cancel());
    const mask = canvas.querySelector(".map-route-reveal");
    if (mask) { mask.style.strokeDasharray = "none"; mask.style.strokeDashoffset = "0"; }
    canvas.querySelector(".map-route-traveller")?.setAttribute("visibility","hidden");
  }

  function idlePin() {
    if (!canMove() || journeyRunning) return;
    const pin = canvas.querySelector(".map-pin-icon");
    const halo = canvas.querySelector(".map-pulse");
    [pin,halo].forEach(element => element?.getAnimations().forEach(animation => animation.cancel()));
    pin?.animate([
      {transform:"translateY(0)"}, {transform:"translateY(-4px)"}, {transform:"translateY(0)"}
    ],{duration:4200,iterations:Infinity,easing:"ease-in-out"});
    halo?.animate([
      {transform:"scale(.8)",opacity:.7},
      {transform:"scale(1.65)",opacity:0,offset:.7},
      {transform:"scale(1.65)",opacity:0}
    ],{duration:4200,iterations:Infinity,easing:"cubic-bezier(.16,1,.3,1)"});
  }

  function arrive() {
    canvas.dataset.motion = "idle";
    journeyRunning = false;
    if (!canMove()) return;
    const pin = canvas.querySelector(".map-pin-icon");
    const animation = pin?.animate([
      {transform:"translateY(-9px) scale(.94)"},
      {transform:"translateY(0) scale(1)"}
    ],{duration:320,easing:"cubic-bezier(.16,1,.3,1)"});
    if (animation) animation.onfinish = idlePin;
    else idlePin();
  }

  function zoomBox() {
    const {width,height,projection} = drawnGeometry;
    const [x,y] = projection([9.18782,45.45068]);
    const w = width/zoom, h = height/zoom;
    return [Math.max(0,Math.min(width-w,x-w/2)),Math.max(0,Math.min(height-h,y-h/2)),w,h];
  }

  // Preserve the geographic centre and scale, including an interrupted zoom.
  function captureCamera() {
    const svg = canvas.querySelector("svg");
    if (!svg || !drawnGeometry) return null;
    const [x,y,w,h] = svg.getAttribute("viewBox").split(/\s+/).map(Number);
    return {center:drawnGeometry.projection.invert([x+w/2,y+h/2]),scale:drawnGeometry.scale*drawnGeometry.width/w};
  }

  function animateBox(target, duration, done) {
    const svg = canvas.querySelector("svg");
    if (!canMove()) { svg.setAttribute("viewBox",target.join(" ")); done?.(); return; }
    const initial = svg.getAttribute("viewBox").split(/\s+/).map(Number);
    const start = performance.now();
    canvas.dataset.motion = "camera";
    function step(now) {
      const progress = Math.min(1,(now-start)/duration);
      svg.setAttribute("viewBox",initial.map((value,i) => value+(target[i]-value)*easeOut(progress)).join(" "));
      if (progress < 1) frame = requestAnimationFrame(step);
      else { frame = 0; canvas.dataset.motion = "idle"; done?.(); }
    }
    frame = requestAnimationFrame(step);
  }

  function traceRoute() {
    if (!route || !canMove()) { arrive(); return; }
    const mask = canvas.querySelector(".map-route-reveal");
    const traveller = canvas.querySelector(".map-route-traveller");
    const segments = [...canvas.querySelectorAll(".map-route-segment")];
    const lengths = segments.map(path => path.getTotalLength());
    const total = lengths.reduce((sum,length) => sum+length,0);
    if (!mask || !traveller || !total) { arrive(); return; }
    journeyRunning = true;
    canvas.dataset.motion = "route";
    mask.style.strokeDasharray = "1";
    mask.style.strokeDashoffset = "1";
    const duration = Math.min(1100,650+total*.45);
    const start = performance.now();
    // Cache geometry once; each frame moves only the mask and a single SVG dot.
    function step(now) {
      const progress = Math.min(1,(now-start)/duration);
      const travelled = total*progress;
      let offset = travelled, index = 0;
      while (index < lengths.length-1 && offset > lengths[index]) offset -= lengths[index++];
      const point = segments[index].getPointAtLength(Math.min(offset,lengths[index]));
      mask.style.strokeDashoffset = String(1-progress);
      traveller.setAttribute("cx",point.x);
      traveller.setAttribute("cy",point.y);
      traveller.setAttribute("fill",venueRouteStyle(route.segments[index]).color);
      traveller.setAttribute("stroke",route.segments[index].line === "M3" ? "#806600" : "#fff");
      traveller.setAttribute("visibility","visible");
      if (progress < 1) frame = requestAnimationFrame(step);
      else {
        frame = 0;
        mask.style.strokeDasharray = "none";
        traveller.setAttribute("visibility","hidden");
        arrive();
      }
    }
    frame = requestAnimationFrame(step);
  }

  function closeHotel(restoreFocus = false) {
    if (activeHotelMarker) {
      activeHotelMarker.classList.remove("is-active");
      activeHotelMarker.setAttribute("aria-expanded", "false");
      if (restoreFocus && activeHotelMarker.isConnected) activeHotelMarker.focus();
    }
    activeHotelMarker = null;
    hotelPopup.hidden = true;
  }

  function placeHotelPopup(marker) {
    const mapRect = canvas.getBoundingClientRect();
    const markerRect = marker.querySelector(".map-hotel-disc").getBoundingClientRect();
    const x = markerRect.left + markerRect.width / 2 - mapRect.left;
    const y = markerRect.top + markerRect.height / 2 - mapRect.top;
    const left = Math.max(8, Math.min(mapRect.width - hotelPopup.offsetWidth - 8, x - hotelPopup.offsetWidth / 2));
    const above = y - hotelPopup.offsetHeight - 23;
    const top = above >= 8 ? above : Math.min(mapRect.height - hotelPopup.offsetHeight - 8, y + 23);
    hotelPopup.style.left = `${left}px`;
    hotelPopup.style.top = `${Math.max(8, top)}px`;
  }

  function openHotel(marker, fromKeyboard = false) {
    const hotel = VENUE_HOTELS.find(item => item.id === marker.dataset.hotelId);
    if (!hotel) return;
    if (marker === activeHotelMarker) { closeHotel(fromKeyboard); return; }
    closeHotel();
    activeHotelMarker = marker;
    marker.classList.add("is-active");
    marker.setAttribute("aria-expanded", "true");
    hotelName.textContent = hotel.name;
    hotelMeta.textContent = `${hotel.address} · about ${hotel.walk} min walk to the venue`;
    hotelLink.href = hotel.url;
    hotelLink.setAttribute("aria-label", `Visit ${hotel.name} website (new tab)`);
    hotelPopup.hidden = false;
    placeHotelPopup(marker);
    if (fromKeyboard) hotelLink.focus({preventScroll:true});
    status.textContent = `${hotel.name}. ${hotel.address}. About ${hotel.walk} minutes on foot to the venue. Visit hotel website link available.`;
  }

  function draw(previousCamera, trace = false) {
    closeHotel();
    stopMotion();
    drawnGeometry = geometry();
    canvas.innerHTML = renderVenueMap(d3,mapData,view,compact.matches,route,true);
    canvas.append(hotelPopup);
    const svg = canvas.querySelector("svg");
    svg.setAttribute("role", "group");
    hotelKey.hidden = !!route;
    const target = zoomBox();
    updateButtons();
    const move = canMove();
    if (trace && move) {
      const mask = canvas.querySelector(".map-route-reveal");
      if (mask) { mask.style.strokeDasharray = "1"; mask.style.strokeDashoffset = "1"; }
    }
    if (previousCamera && move) {
      const {width,height,projection,scale} = drawnGeometry;
      const [x,y] = projection(previousCamera.center);
      const ratio = scale/previousCamera.scale;
      svg.setAttribute("viewBox",[x-width*ratio/2,y-height*ratio/2,width*ratio,height*ratio].join(" "));
      animateBox(target,420,trace ? traceRoute : idlePin);
    } else {
      svg.setAttribute("viewBox",target.join(" "));
      if (trace) traceRoute(); else idlePin();
    }
  }

  function renderDetails() {
    routeDetails.hidden = !route;
    routeHint.hidden = !!route;
    if (!route) { status.textContent = "City map displayed. Choose a starting point to see your route."; return; }
    document.getElementById("venue-route-title").textContent = `${route.label} to Bocconi`;
    document.getElementById("venue-route-mode").textContent = route.travelmode === "walking" ? "Walking route · about 1.7 km" : "Public transport + a short walk";
    const link = document.getElementById("venue-route-link");
    const url = new URL("https://www.google.com/maps/dir/");
    url.search = new URLSearchParams({api:"1",origin:route.origin,destination:"Via Guglielmo Röntgen 1, Milano, Italy",travelmode:route.travelmode});
    link.href = url.href;
    link.setAttribute("aria-label",`Open route from ${route.label} to Bocconi in Google Maps (new tab)`);
    document.getElementById("venue-route-steps").replaceChildren(...route.steps.map((step,index) => {
      const item = document.createElement("li");
      const segment = route.segments[Math.min(index,route.segments.length-1)];
      item.dataset.line = segment.line || segment.mode;
      const body = document.createElement("div");
      const title = document.createElement("strong");
      const detail = document.createElement("span");
      title.textContent = step.title;
      detail.textContent = step.detail;
      body.append(title,detail);
      item.append(body);
      return item;
    }));
    const seen = new Set();
    document.querySelector(".venue-route-legend").replaceChildren(...route.segments.flatMap(segment => {
      const style = venueRouteStyle(segment);
      if (seen.has(style.label)) return [];
      seen.add(style.label);
      const item = document.createElement("span"), key = document.createElement("span");
      key.className = "route-line-key";
      key.dataset.line = segment.line || segment.mode;
      key.setAttribute("aria-hidden","true");
      if (segment.mode === "walk") key.innerHTML = `<svg viewBox="-10 -11 20 25" width="20" height="25"><path d="${VENUE_FOOTPRINT}" transform="translate(-4 -1) scale(.75)" fill="currentColor"/><path d="${VENUE_FOOTPRINT}" transform="translate(4 6) scale(-.75 .75)" fill="currentColor"/></svg>`;
      item.append(key,document.createTextNode(style.label));
      return [item];
    }));
    status.textContent = `Route from ${route.label} to Bocconi displayed. ${route.steps.map(step => step.title).join(". ")}.`;
    if (!document.hidden && !motionPaused) routeDetails.animate([{opacity:.65},{opacity:1}],{duration:reducedMotion.matches?120:220,easing:"ease-out"});
  }

  function selectRoute() {
    const previousCamera = captureCamera();
    route = routes.find(item => item.id === routeSelect.value) || null;
    view = "city";
    zoom = 1;
    draw(previousCamera,!!route);
    renderDetails();
  }

  fetch("assets/venue/milan.geojson?v=2026092404")
    .then(response => { if (!response.ok) throw new Error("Map data unavailable"); return response.json(); })
    .then(data => {
      mapData = data;
      draw();
      canvas.hidden = false;
      picture.hidden = true;
      controls.hidden = false;
      zoomControls.hidden = false;
      fetch("assets/venue/routes.json?v=2026092406")
        .then(response => { if (!response.ok) throw new Error("Routes unavailable"); return response.json(); })
        .then(data => {
          routes = data.routes;
          routePicker.hidden = false;
          routeHint.hidden = false;
          routeSelect.value = "";
      routeSelect.addEventListener("change",selectRoute);
        })
        .catch(() => {
          routeHint.textContent = "Route previews are unavailable. Use Get directions to plan your journey in Google Maps.";
          routeHint.hidden = false;
        });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(entries => {
          mapVisible = entries[0].isIntersecting;
          if (mapVisible) idlePin();
          else { stopMotion(); canvas.querySelector("svg").setAttribute("viewBox",zoomBox().join(" ")); }
        },{threshold:.15}).observe(canvas);
      } else { mapVisible = true; idlePin(); }
      compact.addEventListener("change",() => draw());
      window.addEventListener("resize",() => {
        if (activeHotelMarker) placeHotelPopup(activeHotelMarker);
      });
      canvas.addEventListener("click",event => {
        const marker = event.target.closest?.(".map-hotel-marker");
        if (marker) openHotel(marker);
        else if (!hotelPopup.contains(event.target)) closeHotel();
      });
      canvas.addEventListener("keydown",event => {
        const marker = event.target.closest?.(".map-hotel-marker");
        if (marker && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          openHotel(marker,true);
        } else if (event.key === "Escape" && activeHotelMarker) {
          event.preventDefault();
          closeHotel(true);
        }
      });
      hotelClose.addEventListener("click",() => closeHotel(true));
      document.addEventListener("pointerdown",event => {
        if (activeHotelMarker && !canvas.contains(event.target)) closeHotel();
      });
      reducedMotion.addEventListener("change",() => draw());
      document.addEventListener("visibilitychange",() => { if (document.hidden) draw(); else idlePin(); });
      motionToggle.addEventListener("click",() => {
        motionPaused = !motionPaused;
        motionToggle.textContent = motionPaused ? "Play animation" : "Pause animation";
        motionToggle.setAttribute("aria-pressed",String(motionPaused));
        stopMotion();
        canvas.querySelector("svg").setAttribute("viewBox",zoomBox().join(" "));
        updateButtons();
        idlePin();
        status.textContent = motionPaused ? "Map animation paused." : "Map animation playing.";
      });
      replay.addEventListener("click",() => {
        if (!route || replay.disabled) return;
        canvas.scrollIntoView({block:"center",behavior:"smooth"});
        const previousCamera = captureCamera();
        view = "city"; zoom = 1;
        draw(previousCamera,true);
        status.textContent = `Replaying the illustrated route from ${route.label}.`;
      });
      controls.addEventListener("click",event => {
        const button = event.target.closest("button[data-map-view]");
        if (!button || button.dataset.mapView === view) return;
        if (!["city","campus"].includes(button.dataset.mapView)) return;
        const previousCamera = captureCamera();
        view = button.dataset.mapView;
        zoom = 1;
        draw(previousCamera);
        status.textContent = `${view === "campus" ? "Campus" : "City"} map displayed.`;
      });
      zoomControls.addEventListener("click",event => {
        const button = event.target.closest("button[data-map-zoom]");
        if (!button) return;
        closeHotel();
        stopMotion();
        const action = button.dataset.mapZoom;
        zoom = action === "reset" ? 1 : Math.max(1,Math.min(2,zoom+(action === "in" ? .25 : -.25)));
        animateBox(zoomBox(),280,idlePin);
        updateButtons();
        status.textContent = `Map zoom: ${Math.round(zoom*100)}%.`;
      });
    })
    .catch(() => {
      canvas.hidden = true;
      picture.hidden = false;
      controls.hidden = true;
      zoomControls.hidden = true;
    });
})();
