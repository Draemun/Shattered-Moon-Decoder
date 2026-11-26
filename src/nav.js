(function () {
  function element(tag, attributes = {}, text) {
    const el = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) el.setAttribute(name, value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function cipherLink(mode, cipher) {
    const route = `${mode}/${cipher.id}`;
    return element("a", { href: `#${route}`, "data-page": route }, cipher.name);
  }

  function categoryName(cipher) {
    const category = Catalog.categories.find((c) => c.id === cipher.category);
    return category ? category.name : "Auto-detect";
  }

  function buildSidebar(mode) {
    const container = document.querySelector(`[data-menu="${mode}"]`);
    if (!container) return;
    const { top, groups } = Catalog.menu(mode);

    top.forEach((cipher) => container.append(cipherLink(mode, cipher)));

    groups.forEach((group) => {
      const id = `submenu-${mode}-${group.id}`;
      const submenu = element("div", { class: "submenu" });
      const toggle = element("button", {
        class: "submenu-toggle submenu-heading",
        type: "button",
        "aria-expanded": "false",
        "aria-controls": id,
      });
      toggle.append(
        element("span", { class: "submenu-label" }, group.name),
        element("span", { class: "submenu-arrow", "aria-hidden": "true" }, ">")
      );
      const header = element("div", { class: "submenu-header" });
      header.append(toggle);
      const items = element("div", { class: "submenu-items", id });
      items.hidden = true;
      group.ciphers.forEach((cipher) => items.append(cipherLink(mode, cipher)));
      submenu.append(header, items);
      container.append(submenu);
    });
  }

  function row(mode, cipher) {
    const link = element("a", { class: "faction-row", href: `#${mode}/${cipher.id}` });
    link.append(
      element("span", { class: "faction-row-name" }, cipher.name),
      element("span", { class: "faction-row-arrow", "aria-hidden": "true" }, "›")
    );
    return link;
  }

  function rowGrid(mode, ciphers) {
    const grid = element("div", { class: "row-grid" });
    ciphers.forEach((cipher) => {
      const link = row(mode, cipher);
      link.dataset.cipher = cipher.id;
      grid.append(link);
    });
    return grid;
  }

  function buildOverview(mode) {
    const container = document.querySelector(`[data-overview="${mode}"]`);
    if (!container) return;
    const { popular, groups } = Catalog.menu(mode);
    const index = Search.buildIndex(
      Catalog.ciphers
        .filter((c) => c.modes.includes(mode))
        .map((c) => ({ route: c.id, title: c.name, keywords: [...c.keywords, categoryName(c)] }))
    );

    const filter = element("input", {
      class: "overview-filter",
      type: "search",
      placeholder: `Filter ${Catalog.ciphers.filter((c) => c.modes.includes(mode)).length} ciphers...`,
      autocomplete: "off",
      "aria-label": "Filter ciphers",
    });

    const popularSection = element("div", { class: "faction-group" });
    popularSection.append(element("div", { class: "faction-group-label" }, "Popular"), rowGrid(mode, popular));

    const groupEls = groups.map((g) => {
      const details = element("details", { class: "cipher-group" });
      const summary = element("summary", { class: "faction-group-label" });
      summary.append(
        element("span", { class: "group-name" }, g.name),
        element("span", { class: "group-count" }, String(g.ciphers.length))
      );
      details.append(summary, rowGrid(mode, g.ciphers));
      return details;
    });

    const empty = element("p", { class: "section-intro overview-empty" }, "No cipher matches that.");
    empty.hidden = true;

    const applyFilter = () => {
      const query = filter.value.trim();
      const filtering = query !== "";
      const matches = new Set(filtering ? Search.search(index, query).map((e) => e.route) : []);
      let popularVisible = 0;
      popularSection.querySelectorAll(".faction-row").forEach((link) => {
        const ungrouped = Catalog.cipher(link.dataset.cipher).category === null;
        const show = !filtering || (ungrouped && matches.has(link.dataset.cipher));
        link.hidden = !show;
        if (show) popularVisible++;
      });
      popularSection.hidden = popularVisible === 0;
      groupEls.forEach((details) => {
        if (filtering && details.dataset.wasOpen === undefined) details.dataset.wasOpen = String(details.open);
        if (!filtering && details.dataset.wasOpen !== undefined) {
          details.open = details.dataset.wasOpen === "true";
          delete details.dataset.wasOpen;
        }
        let visible = 0;
        details.querySelectorAll(".faction-row").forEach((link) => {
          const show = !filtering || matches.has(link.dataset.cipher);
          link.hidden = !show;
          if (show) visible++;
        });
        details.hidden = filtering && visible === 0;
        if (filtering) details.open = visible > 0;
      });
      empty.hidden = !filtering || matches.size > 0;
    };

    filter.addEventListener("input", applyFilter);
    container.append(filter, popularSection, ...groupEls, empty);
  }

  Catalog.modes.forEach((mode) => {
    buildSidebar(mode.id);
    buildOverview(mode.id);
  });

  globalThis.Nav = { categoryName };
})();
