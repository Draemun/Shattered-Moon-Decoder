(function () {
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll(".nav-link");

  function showPage(name) {
    pages.forEach((page) => {
      page.hidden = page.id !== "page-" + name;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.page === name);
    });
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.page));
  });

  const start = location.hash.slice(1);
  showPage(document.getElementById("page-" + start) ? start : "home");
})();
