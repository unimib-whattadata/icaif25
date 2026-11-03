/* Paginate a print-only copy: the visitor's filters, disclosures and agenda stay intact. */
(() => {
  "use strict";
  if (typeof document === "undefined") return;

  const EDITION = "programme-print-edition";
  const publicOrigin = "https://icaif2026.org";
  let screenPosition;
  const visible = (root, selector) => [...root.querySelectorAll(selector)]
    .filter((element) => !element.closest("[hidden]"));
  const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : noun.endsWith("match") ? "es" : "s"}`;
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    node.className = className;
    if (content) node.textContent = content;
    return node;
  };

  function copy(source) {
    const clone = source.cloneNode(true);
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clone.querySelectorAll("[hidden], .programme-session-actions, .programme-paper-search-tools, .timeline-middle, hr")
      .forEach((node) => node.remove());
    clone.querySelectorAll("[aria-labelledby], [aria-describedby], [aria-current]").forEach((node) => {
      node.removeAttribute("aria-labelledby");
      node.removeAttribute("aria-describedby");
      node.removeAttribute("aria-current");
    });
    clone.querySelectorAll("a[href]").forEach((link) => {
      const url = new URL(link.getAttribute("href"), location.href);
      if (url.origin === location.origin) link.href = publicOrigin + url.pathname + url.search + url.hash;
    });
    return clone;
  }

  function paperCaption(source, open) {
    const total = source.querySelectorAll("[data-programme-paper]").length;
    const shown = visible(source, "[data-programme-paper]").length;
    const matches = visible(source, '[data-programme-paper][data-search-match="true"]').length;
    if (!open) return `${plural(total, "paper")} · details online`;
    if (matches && matches === shown && shown < total) return `${plural(shown, "matching paper")} · authors below`;
    if (matches && matches < shown) return `${plural(shown, "paper")} in matching session · full paper list (${plural(matches, "search match")})`;
    return `${plural(shown, "paper")} in this session · authors below`;
  }

  function sessionCopy(source) {
    const clone = copy(source);
    const sourceDetails = source.querySelector(".programme-papers");
    const details = clone.querySelector(".programme-papers");
    if (sourceDetails && details) {
      const open = sourceDetails.open;
      const block = element("div", "programme-print-paper-details");
      const caption = element("p", "programme-print-paper-caption", paperCaption(sourceDetails, open));
      if (!open) {
        const link = element("a", "link", caption.textContent);
        link.href = `${publicOrigin}/programme/?day=${source.closest("[data-programme-day]").dataset.programmeDay}#${source.id}`;
        caption.replaceChildren(link);
      }
      block.append(caption);
      if (open) {
        block.append(details.querySelector(".programme-paper-list"));
        clone.classList.add("programme-print-expanded");
      }
      details.replaceWith(block);
    }
    return clone;
  }

  function slotCopy(source, sessions) {
    const clone = copy(source);
    clone.dataset.programmePrintColumns = String(Math.min(sessions.length, 4));
    clone.querySelector(".programme-sessions").replaceChildren(...sessions);
    return clone;
  }

  function cleanUp(restore = true) {
    document.getElementById(EDITION)?.remove();
    document.getElementById(`${EDITION}-styles`)?.remove();
    delete document.body.dataset.programmePrintReady;
    if (restore && screenPosition) {
      const position = screenPosition;
      screenPosition = null;
      requestAnimationFrame(() => {
        if (position.focus?.isConnected) position.focus.focus({ preventScroll: true });
        window.scrollTo({ left: position.x, top: position.y, behavior: "instant" });
      });
    }
  }

  function prepare() {
    if (document.body.dataset.page !== "programme") return;
    if (document.getElementById(EDITION)) return;
    screenPosition ||= { x: window.scrollX, y: window.scrollY, focus: document.activeElement };
    cleanUp(false);
    const days = visible(document, "main [data-programme-day]");
    const template = document.querySelector("main .programme-print-day-header");
    if (!template) return;
    const compact = document.body.dataset.programmePrintCompact === "true";
    const hasOpenPapers = days.some((day) => visible(day, ".programme-papers[open]").length);
    const scope = hasOpenPapers
      ? "Paper details are included for opened sessions; other sessions link to details online."
      : "Schedule overview · Paper titles and authors: icaif2026.org/programme/";
    const root = element("div", EDITION);
    root.id = EDITION;
    // beforeprint can fire before the print media query changes (Chromium).
    // Measure with the same print rules, then remove this temporary sheet.
    const printSheet = [...document.styleSheets].find((sheet) => sheet.href?.includes("programme-print.css"));
    if (!printSheet) return;
    const styles = document.createElement("style");
    styles.id = `${EDITION}-styles`;
    styles.textContent = [...printSheet.cssRules]
      .filter((rule) => rule.media?.mediaText === "print")
      .flatMap((rule) => [...rule.cssRules].map((child) => child.cssText)).join("\n");
    document.head.append(styles);
    document.body.append(root);
    document.body.dataset.programmePrintReady = "true";
    const ruler = element("div", "programme-print-ruler");
    root.append(ruler);
    const maxHeight = ruler.getBoundingClientRect().height;
    ruler.remove();
    let sheet, body, sheetDay, dayTransition, sheetUnits = 0;

    function dayHeading(day, continued) {
      const heading = copy(day.querySelector(".programme-day-heading"));
      if (continued) heading.querySelector("p").textContent = "Continued · All times CET (UTC+1)";
      return heading;
    }

    function newSheet(day, continued = false) {
      dayTransition?.remove();
      dayTransition = null;
      sheet = element("section", "programme-print-sheet");
      sheet.dataset.printDate = day?.dataset.programmeDay || "";
      sheetDay = day;
      sheetUnits = 0;
      if (!continued) {
        const header = copy(template);
        const title = header.querySelector("[data-programme-print-title]");
        const h1 = element("h1", "", title.textContent);
        title.replaceWith(h1);
        header.append(element("p", "programme-print-scope", scope));
        sheet.append(header);
      } else {
        sheet.append(element("p", "programme-print-running-brand", "ICAIF ’26 · Conference programme · 14–17 November 2026"));
      }
      if (day) sheet.append(dayHeading(day, continued));
      body = element("ol", "timeline timeline-vertical programme-timeline programme-print-sheet-body");
      sheet.append(body);
      root.append(sheet);
    }

    const overflows = () => sheet.getBoundingClientRect().height > maxHeight + 0.5;
    function appendUnit(unit, day) {
      body.append(unit);
      if (overflows() && sheetUnits) {
        unit.remove();
        newSheet(day, true);
        body.append(unit);
      }
      sheetUnits++;
      dayTransition = null;
    }

    // A long opened session is split only between papers. Each fragment repeats
    // its complete session header as well as the day heading on the new sheet.
    function appendSession(sourceSlot, sourceSession, day) {
      const original = sessionCopy(sourceSession);
      const list = original.querySelector(".programme-paper-list");
      if (!list) {
        appendUnit(slotCopy(sourceSlot, [original]), day);
        return;
      }
      const papers = [...list.children];
      list.replaceChildren();
      let fragment;
      function addFragment() {
        const article = original.cloneNode(true);
        fragment = slotCopy(sourceSlot, [article]);
        body.append(fragment);
        return article.querySelector(".programme-paper-list");
      }
      let target = addFragment();
      for (const paper of papers) {
        target.append(paper);
        if (!overflows()) {
          dayTransition = null;
          continue;
        }
        const hasPrevious = target.children.length > 1;
        if (hasPrevious || sheetUnits) {
          paper.remove();
          if (!target.children.length) fragment.remove();
          newSheet(day, true);
          target = addFragment();
          target.append(paper);
        }
        // An exceptionally long single contribution may flow naturally rather
        // than being clipped; ordinary papers remain indivisible.
        if (overflows()) fragment.classList.add("programme-print-oversize");
      }
      sheetUnits++;
    }

    days.forEach((day) => {
      if (!sheet || !compact) newSheet(day);
      else if (sheetDay !== day) {
        const heading = element("li", "programme-print-day-transition");
        heading.append(dayHeading(day, false));
        body.append(heading);
        dayTransition = heading;
        if (overflows()) {
          heading.remove();
          newSheet(day, true);
        }
        sheetDay = day;
      }
      visible(day, "[data-programme-announcements]").forEach((group) => {
        const item = element("li", "programme-print-announcements");
        item.append(copy(group));
        appendUnit(item, day);
      });
      const slots = visible(day, "[data-programme-slot]");
      const expanded = slots.some((slot) => visible(slot, ".programme-papers[open]").length);
      const splitAt = { "2026-11-16": "14:15", "2026-11-17": "14:00" }[day.dataset.programmeDay];
      slots.forEach((slot) => {
        if (!compact && !expanded && splitAt === slot.dataset.timelineTime && sheetUnits) newSheet(day, true);
        const sessions = visible(slot, "[data-programme-session]");
        if (sessions.some((session) => session.querySelector(".programme-papers[open]"))) {
          sessions.forEach((session) => appendSession(slot, session, day));
        } else appendUnit(slotCopy(slot, sessions.map(sessionCopy)), day);
      });
    });
    if (!days.length) {
      newSheet(null);
      const empty = document.querySelector("[data-programme-empty]");
      if (empty) {
        const item = element("li", "programme-print-empty");
        item.append(copy(empty));
        body.append(item);
      }
    }
  }

  window.addEventListener("beforeprint", prepare);
  window.addEventListener("afterprint", cleanUp);
  window.matchMedia("print").addEventListener("change", (event) => {
    if (event.matches) prepare();
    else cleanUp();
  });
})();
