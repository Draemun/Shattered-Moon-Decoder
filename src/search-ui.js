(function () {
  const container = document.getElementById("search");
  const toggle = document.getElementById("search-toggle");
  const box = document.getElementById("search-box");
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  const index = Search.buildIndex(Catalog.pages);

  function setOpen(open) {
    if (open && globalThis.Menu) Menu.close();
    box.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      input.focus();
      render();
    } else {
      results.hidden = true;
    }
  }

  globalThis.SearchUI = { close: () => setOpen(false) };

  function close() {
    input.value = "";
    setOpen(false);
  }

  function render() {
    const query = input.value.trim();
    results.replaceChildren();
    if (!query) {
      results.hidden = true;
      return;
    }

    const matches = Search.search(index, query);
    if (matches.length === 0) {
      const empty = document.createElement("li");
      empty.className = "search-empty";
      empty.textContent = "No decoder or encoder found.";
      results.append(empty);
    }

    matches.forEach((entry) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#" + entry.route;
      const title = document.createElement("span");
      title.className = "search-title";
      title.textContent = entry.title;
      link.append(title);
      if (entry.subtitle) {
        const subtitle = document.createElement("span");
        subtitle.className = "search-subtitle";
        subtitle.textContent = entry.subtitle;
        link.append(subtitle);
      }
      item.append(link);
      results.append(item);
    });

    results.hidden = false;
  }

  function resultLinks() {
    return [...results.querySelectorAll("a")];
  }

  toggle.addEventListener("click", () => setOpen(box.hidden));
  input.addEventListener("input", render);

  input.addEventListener("keydown", (event) => {
    const links = resultLinks();
    if (event.key === "Enter" && links.length > 0) {
      event.preventDefault();
      links[0].click();
    } else if (event.key === "ArrowDown" && links.length > 0) {
      event.preventDefault();
      links[0].focus();
    }
  });

  results.addEventListener("keydown", (event) => {
    const links = resultLinks();
    const position = links.indexOf(document.activeElement);
    if (event.key === "ArrowDown" && position < links.length - 1) {
      event.preventDefault();
      links[position + 1].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (position > 0) links[position - 1].focus();
      else input.focus();
    }
  });

  results.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });

  container.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !box.hidden) {
      event.stopPropagation();
      close();
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#search")) setOpen(false);
  });
})();
