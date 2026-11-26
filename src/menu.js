(function () {
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");

  function isOpen() {
    return sidebar.classList.contains("open");
  }

  function setOpen(open) {
    sidebar.classList.toggle("open", open);
    sidebar.inert = !open;
    backdrop.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      const target = sidebar.querySelector("a.active") || sidebar.querySelector("a");
      if (target) target.focus();
    }
  }

  function setSubmenuOpen(submenu, open) {
    const button = submenu.querySelector(".submenu-toggle");
    const items = submenu.querySelector(".submenu-items");
    submenu.classList.toggle("open", open);
    items.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
  }

  function setActive(route) {
    sidebar.querySelectorAll("a").forEach((link) => {
      const active = link.dataset.page === route;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const activeLink = sidebar.querySelector("a.active");
    let submenu = activeLink && activeLink.closest(".submenu");
    while (submenu) {
      setSubmenuOpen(submenu, true);
      submenu = submenu.parentElement.closest(".submenu");
    }
  }

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  backdrop.addEventListener("click", () => setOpen(false));

  sidebar.querySelectorAll(".submenu-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const submenu = button.closest(".submenu");
      setSubmenuOpen(submenu, !submenu.classList.contains("open"));
    });
  });

  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  globalThis.Menu = { open: () => setOpen(true), close: () => setOpen(false), setActive };
})();
