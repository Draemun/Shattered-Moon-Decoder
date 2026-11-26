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
      const target = sidebar.querySelector(".nav-link.active") || sidebar.querySelector(".nav-link");
      if (target) target.focus();
    }
  }

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  backdrop.addEventListener("click", () => setOpen(false));
  sidebar.addEventListener("click", (event) => {
    if (event.target.closest(".nav-link")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  globalThis.Menu = { open: () => setOpen(true), close: () => setOpen(false) };
})();
