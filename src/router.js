(function () {
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll(".nav-link");

  function resolve(route) {
    if (route !== "cipher" && document.getElementById("page-" + route)) return route;
    const match = route.match(/^(decode|encode)\/(\w+)$/);
    if (match && CipherPage.open(match[1], match[2])) return "cipher";
    return null;
  }

  function go(route) {
    let page = resolve(route);
    if (!page) {
      route = "home";
      page = "home";
    }
    pages.forEach((section) => {
      section.hidden = section.id !== "page-" + page;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.page === route);
    });
    if (location.hash !== "#" + route) history.replaceState(null, "", "#" + route);
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => go(button.dataset.page));
  });

  go(location.hash.slice(1));
})();
