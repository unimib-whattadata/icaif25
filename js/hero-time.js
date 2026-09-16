(() => {
  "use strict";

  const TIME_ZONE = "Europe/Rome";
  const REFRESH_MS = 60 * 1000;
  const variants = Object.freeze({
    dawn: { file: "alba", label: "Dawn", scene: "at dawn" },
    day: { file: "giorno", label: "Daytime", scene: "in daylight" },
    sunset: { file: "tramonto", label: "Sunset", scene: "at sunset" },
    night: { file: "notte", label: "Night", scene: "at night" },
  });

  // Fixed editorial time bands, not a live view or an astronomical forecast.
  // Explicit Milan time also handles daylight-saving changes for overseas visitors.
  const getPeriod = (date = new Date()) => {
    try {
      const hour = Number(new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        hourCycle: "h23",
      }).format(date));
      if (hour >= 6 && hour < 9) return "dawn";
      if (hour >= 9 && hour < 17) return "day";
      if (hour >= 17 && hour < 20) return "sunset";
      if (Number.isFinite(hour)) return "night";
    } catch {
      // Preserve the approved sunset when Intl or a valid date is unavailable.
    }
    return "sunset";
  };

  window.ICAIFHeroTime = Object.freeze({ getPeriod, timeZone: TIME_ZONE });

  const container = document.querySelector("[data-time-hero]");
  if (!container) return;
  const label = document.querySelector("[data-hero-time-label]");
  let displayedPeriod = null;
  let requestedPeriod = null;
  let requestId = 0;

  const render = async (period) => {
    const id = ++requestId;
    requestedPeriod = period;
    if (period === displayedPeriod) return;

    const variant = variants[period];
    const base = `img/piazza-duomo-${variant.file}`;
    const picture = document.createElement("picture");
    picture.className = "absolute inset-0 size-full";
    const source = document.createElement("source");
    source.type = "image/webp";
    source.srcset = `${base}.webp`;
    const image = document.createElement("img");
    image.className = "size-full object-cover";
    image.alt = `AI-edited view of an empty Piazza del Duomo ${variant.scene}`;
    image.width = 1536;
    image.height = 1024;
    image.decoding = "async";
    image.fetchPriority = "high";
    picture.append(source, image);
    image.src = `${base}.jpg`;

    try {
      try {
        await image.decode();
      } catch {
        // A failed WebP request must not discard the JPG fallback.
        source.remove();
        image.src = `${base}.jpg`;
        await image.decode();
      }
      if (id !== requestId) return;
      // Swap only after decoding; keep the previous photograph during loading.
      const previous = container.querySelector("picture");
      if (previous) previous.replaceWith(picture);
      else container.append(picture);
      displayedPeriod = period;
      container.dataset.heroPeriod = period;
      if (label) label.textContent = `${variant.label} · Milan time`;
    } catch {
      if (id === requestId) {
        requestedPeriod = null;
        if (!displayedPeriod && period !== "sunset") await render("sunset");
      }
    }
  };

  const refresh = () => {
    if (document.hidden) return;
    const period = getPeriod();
    if (period !== requestedPeriod) void render(period);
  };

  refresh();
  window.setInterval(refresh, REFRESH_MS);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("pageshow", refresh);
})();
