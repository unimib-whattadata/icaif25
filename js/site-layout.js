(() => {
  "use strict";

  const body = document.body;
  const page = body.dataset.page || "";
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  const slugify = (value) =>
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const uniqueId = (base) => {
    let candidate = base || "section";
    let suffix = 2;
    while (document.getElementById(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  };

  const sectionHeadings = () => {
    const main = document.querySelector("main");
    if (!main || page === "index") return [];

    const headings = Array.from(main.querySelectorAll("h2")).filter(
      (heading) => !heading.closest(".card, .alert"),
    );

    if (page === "workshop" || page === "competitions") {
      headings.push(
        ...main.querySelectorAll(
          "article.card.scroll-mt-24 > .card-body > h3.card-title",
        ),
      );
    }

    return [...new Set(headings)];
  };

  const buildPageIndex = () => {
    const header = document.querySelector("main > #page-header");
    const title = header?.querySelector("h1");
    const headings = sectionHeadings();
    if (!header || !title || headings.length < 3) return;

    headings.forEach((heading) => {
      if (!heading.id) heading.id = uniqueId(slugify(heading.textContent));
      heading.classList.add("scroll-mt-36");
    });

    const links = headings.map((heading) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      link.dataset.sectionLink = heading.id;
      item.append(link);
      return item;
    });

    const wrapper = document.createElement("div");
    wrapper.className = "page-index";

    const inner = document.createElement("div");
    inner.className = "page-index-inner";

    const mobile = document.createElement("details");
    mobile.className = "dropdown dropdown-bottom page-index-mobile";
    const summary = document.createElement("summary");
    summary.className = "btn min-h-11 w-full justify-between";
    summary.textContent = title.textContent.trim();
    const mobileList = document.createElement("ul");
    mobileList.className =
      "menu menu-sm dropdown-content z-40 mt-2 max-h-[min(70vh,30rem)] w-full overflow-y-auto rounded-box bg-base-100 p-2 shadow-sm";
    links.forEach((item) => mobileList.append(item.cloneNode(true)));
    mobile.append(summary, mobileList);

    const desktop = document.createElement("nav");
    desktop.className = "page-index-desktop";
    desktop.setAttribute("aria-label", title.textContent.trim());
    const desktopList = document.createElement("ul");
    desktopList.className =
      "menu menu-horizontal menu-xs flex-nowrap gap-1 whitespace-nowrap";
    links.forEach((item) => desktopList.append(item));
    desktop.append(desktopList);

    inner.append(mobile, desktop);
    wrapper.append(inner);
    header.after(wrapper);

    wrapper.addEventListener("click", (event) => {
      if (event.target.closest("a")) mobile.open = false;
    });

    const observed = headings.map((heading) => heading);
    const setActive = (id) => {
      wrapper.querySelectorAll("[data-section-link]").forEach((link) => {
        link.classList.toggle("menu-active", link.dataset.sectionLink === id);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-144px 0px -68% 0px", threshold: [0, 1] },
    );
    observed.forEach((heading) => observer.observe(heading));
    setActive(headings[0].id);
  };

  const buildFooterDisclosure = () => {
    const footerGrid = document.querySelector("footer .footer");
    if (!footerGrid) return;

    footerGrid.querySelectorAll(":scope > nav").forEach((navigation) => {
      const title = navigation.querySelector(":scope > .footer-title");
      if (!title) return;

      const details = document.createElement("details");
      details.className = "footer-disclosure";
      const summary = document.createElement("summary");
      summary.className = "footer-title";
      summary.textContent = title.textContent.trim();
      const content = document.createElement("nav");
      content.className = "footer-disclosure-content";
      const label = navigation.getAttribute("aria-label");
      if (label) content.setAttribute("aria-label", label);

      Array.from(navigation.children).forEach((child) => {
        if (child !== title) content.append(child);
      });
      details.append(summary, content);
      navigation.replaceWith(details);

      if (!mobileQuery.matches) details.open = true;
    });

    mobileQuery.addEventListener("change", (event) => {
      if (!event.matches) {
        footerGrid
          .querySelectorAll(".footer-disclosure")
          .forEach((details) => (details.open = true));
      }
    });
  };

  const addDisclosure = (container, anchor, detailsContent) => {
    if (!container || !anchor || !detailsContent) return;
    const id = uniqueId(`${slugify(anchor.textContent)}-details`);
    detailsContent.id = id;
    detailsContent.classList.add("responsive-details");

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "btn btn-ghost btn-sm responsive-details-toggle md:hidden";
    button.setAttribute("aria-controls", id);
    button.setAttribute("aria-expanded", String(!mobileQuery.matches));
    button.setAttribute("aria-label", anchor.textContent.trim());
    const icon = document.createElement("span");
    icon.className = "responsive-details-icon";
    icon.setAttribute("aria-hidden", "true");
    button.append(icon);
    anchor.after(button);

    const setExpanded = (expanded) => {
      container.classList.toggle("is-collapsed", !expanded);
      button.setAttribute("aria-expanded", String(expanded));
    };
    setExpanded(!mobileQuery.matches);

    button.addEventListener("click", () => {
      setExpanded(button.getAttribute("aria-expanded") !== "true");
    });
    mobileQuery.addEventListener("change", (event) => setExpanded(!event.matches));
  };

  const enhanceProgrammeCards = () => {
    if (page !== "workshop" && page !== "competitions") return;
    document
      .querySelectorAll("main article.card.scroll-mt-24")
      .forEach((article) => {
        const body = article.querySelector(":scope > .card-body");
        const title = body?.querySelector(":scope > h3.card-title");
        if (!body || !title) return;

        article.classList.add("program-card");
        const details = document.createElement("div");
        Array.from(body.children)
          .slice(Array.from(body.children).indexOf(title) + 1)
          .forEach((child) => details.append(child));
        body.append(details);
        addDisclosure(article, title, details);
      });
  };

  const enhanceSponsorTiers = () => {
    if (page !== "become-a-sponsor") return;
    document
      .querySelectorAll("main .card.flex.flex-col.bg-base-100.p-8")
      .forEach((card) => {
        const content = card.querySelector(":scope > .flex-grow");
        const title = content?.querySelector(":scope > h3");
        const list = content?.querySelector(":scope > ul");
        if (!content || !title || !list) return;
        const details = document.createElement("div");
        list.before(details);
        details.append(list);
        card.classList.add("sponsor-tier-card");
        addDisclosure(card, title, details);
      });
  };

  const enhanceTables = () => {
    document.querySelectorAll("main table").forEach((table) => {
      if (table.tHead?.rows[0]?.cells.length === 2) {
        table.classList.add("table-mobile-rows");
      }
    });

    if (page !== "registration") return;
    const table = Array.from(document.querySelectorAll("main table")).find(
      (candidate) => candidate.classList.contains("min-w-[920px]"),
    );
    if (!table?.tHead || !table.tBodies[0]) return;

    table.classList.add("table-pin-rows", "table-pin-cols");
    const tableCard = table.closest(".card");
    tableCard?.classList.add("registration-table-card");

    const headers = Array.from(table.tHead.rows[0].cells).map((cell) =>
      cell.textContent.trim(),
    );
    const cards = document.createElement("div");
    cards.className = "registration-fee-cards";
    let period = "";

    Array.from(table.tBodies[0].rows).forEach((row) => {
      const cells = Array.from(row.cells);
      if (cells[0]?.getAttribute("scope") === "rowgroup") {
        period = cells.shift().textContent.trim();
      }
      const type = cells.shift()?.textContent.trim();
      if (!type) return;

      const card = document.createElement("article");
      card.className = "card card-border bg-base-100";
      const cardBody = document.createElement("div");
      cardBody.className = "card-body gap-4 p-4";
      const periodLabel = document.createElement("p");
      periodLabel.className = "text-xs font-bold uppercase tracking-wider text-primary";
      periodLabel.textContent = period;
      const title = document.createElement("h3");
      title.className = "card-title text-base";
      title.textContent = type;
      const list = document.createElement("dl");
      list.className = "grid gap-2";

      cells.forEach((cell, index) => {
        const row = document.createElement("div");
        row.className = "grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-base-300 pt-2";
        const term = document.createElement("dt");
        term.className = "text-xs text-base-content/70";
        term.textContent = headers[index + 2];
        const value = document.createElement("dd");
        value.className = "text-right text-sm font-semibold tabular-nums";
        value.textContent = cell.textContent.trim();
        row.append(term, value);
        list.append(row);
      });

      cardBody.append(periodLabel, title, list);
      card.append(cardBody);
      cards.append(card);
    });

    tableCard?.after(cards);
  };

  buildPageIndex();
  buildFooterDisclosure();
  enhanceProgrammeCards();
  enhanceSponsorTiers();
  enhanceTables();
})();
