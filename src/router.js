(function () {
  const pages = document.querySelectorAll(".page");

  function resolve(route) {
    if (route !== "cipher" && document.getElementById("page-" + route)) return route;
    const match = route.match(/^(decode|encode)\/(\w+)$/);
    if (match && CipherPage.open(match[1], match[2])) return "cipher";
    return null;
  }

  function render() {
    let route = decodeURIComponent(location.hash.slice(1)) || "home";
    let page = resolve(route);
    if (!page) {
      route = "home";
      page = "home";
      history.replaceState(null, "", "#home");
    }
    pages.forEach((section) => {
      section.hidden = section.id !== "page-" + page;
    });
    Menu.setActive(route);
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", render);
  render();
})();
