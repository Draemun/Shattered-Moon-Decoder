const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const BROWSER_ONLY = ["nav.js", "menu.js", "search-ui.js", "cipher-page.js", "verify.js", "router.js"];

const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
for (const src of scripts) {
  if (!BROWSER_ONLY.includes(path.basename(src))) require(path.join(root, src));
}

module.exports = {
  Ciphers: globalThis.Ciphers,
  Answers: globalThis.Answers,
  Catalog: globalThis.Catalog,
  Search: globalThis.Search,
  English: globalThis.English,
  scripts,
  BROWSER_ONLY,
};
