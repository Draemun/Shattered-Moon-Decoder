const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Ciphers, Catalog, scripts, BROWSER_ONLY } = require("./load");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const cipherPage = fs.readFileSync(path.join(root, "src", "cipher-page.js"), "utf8");

function section(pattern) {
  const match = html.match(pattern);
  assert.ok(match, `${pattern} not found`);
  return match[0];
}

function hashLinks(markup) {
  return [...markup.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
}

const sidebar = section(/<nav class="sidebar" id="sidebar"[\s\S]*?<\/nav>/);

test("every local script and stylesheet in index.html exists", () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]).filter((ref) => !/^https?:/.test(ref));
  assert.ok(refs.length > 0);
  for (const ref of refs) {
    assert.ok(fs.existsSync(path.join(root, ref)), `${ref} is missing`);
  }
});

test("every file in src is loaded by index.html", () => {
  const files = [
    ...fs.readdirSync(path.join(root, "src")).filter((f) => f.endsWith(".js")).map((f) => `src/${f}`),
    ...fs.readdirSync(path.join(root, "src", "ciphers")).map((f) => `src/ciphers/${f}`),
  ];
  for (const file of files) assert.ok(scripts.includes(file), `${file} is not loaded`);
});

test("browser-only scripts load after the code they use", () => {
  const firstBrowserOnly = scripts.findIndex((src) => BROWSER_ONLY.includes(path.basename(src)));
  for (const src of scripts.slice(firstBrowserOnly)) {
    assert.ok(BROWSER_ONLY.includes(path.basename(src)), `${src} should load before the page scripts`);
  }
  assert.ok(scripts.indexOf("src/nav.js") < scripts.indexOf("src/menu.js"), "nav.js must build the menu before menu.js wires it");
  assert.equal(scripts.at(-1), "src/router.js");
});

test("the burger button sits in the burger menu and controls the sidebar", () => {
  assert.match(html, /<div class="burger-menu"[^>]*>\s*<button class="burger-icon" id="menu-toggle"/);
  assert.match(html, /id="menu-toggle"[^>]*aria-controls="sidebar"/);
});

test("the sidebar has Home, Server Verification, Decode and Encode", () => {
  assert.deepEqual(hashLinks(sidebar), ["home", "verify", "decode", "encode"]);
  for (const mode of ["decode", "encode"]) {
    assert.match(sidebar, new RegExp(`aria-controls="submenu-${mode}"`));
    assert.match(sidebar, new RegExp(`id="submenu-${mode}" data-menu="${mode}" hidden`));
  }
});

test("the Decode and Encode pages have a cipher overview", () => {
  for (const mode of ["decode", "encode"]) {
    assert.match(section(new RegExp(`<section id="page-${mode}"[\\s\\S]*?<\\/section>`)), new RegExp(`data-overview="${mode}"`));
  }
});

test("the home page only offers Server Verification and Decode", () => {
  assert.deepEqual(hashLinks(section(/<section id="page-home"[\s\S]*?<section id="page-verify"/)), ["verify", "decode"]);
});

test("every catalog cipher has a category, a page config and working functions", () => {
  const categoryIds = Catalog.categories.map((c) => c.id);
  for (const cipher of Catalog.ciphers) {
    assert.ok(cipher.category === null || categoryIds.includes(cipher.category), `${cipher.id} has an unknown category`);
    assert.match(cipherPage, new RegExp(`\\n    ${cipher.id}: \\{`), `${cipher.id} is missing from cipher-page.js`);
    for (const mode of cipher.modes) {
      assert.equal(typeof Ciphers[cipher.id][mode], "function", `${cipher.id} has no ${mode}()`);
    }
  }
});

test("catalog ids are unique", () => {
  const ids = Catalog.ciphers.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("the menu groups every cipher exactly once per mode", () => {
  for (const mode of ["decode", "encode"]) {
    const { top, groups } = Catalog.menu(mode);
    const listed = [...top, ...groups.flatMap((g) => g.ciphers)].map((c) => c.id);
    const expected = Catalog.ciphers.filter((c) => c.modes.includes(mode)).map((c) => c.id);
    assert.deepEqual([...listed].sort(), [...expected].sort());
  }
  assert.deepEqual(Catalog.menu("decode").top.map((c) => c.id), ["magic"]);
  assert.deepEqual(Catalog.menu("encode").top, []);
});

test("every linked page exists", () => {
  for (const route of new Set([...hashLinks(html), ...Catalog.pages.map((p) => p.route)])) {
    const target = route.includes("/") ? "cipher" : route;
    assert.ok(html.includes(`id="page-${target}"`), `page for ${route} is missing`);
  }
});

test("every element the page scripts use exists in index.html", () => {
  for (const file of BROWSER_ONLY) {
    const code = fs.readFileSync(path.join(root, "src", file), "utf8");
    for (const id of [...code.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1])) {
      assert.ok(html.includes(`id="${id}"`), `#${id} used by ${file} is missing`);
    }
  }
});

test("a successful verification opens a dialog with a copy button and channel instructions", () => {
  const dialog = section(/<dialog id="verify-dialog"[\s\S]*?<\/dialog>/);
  assert.match(dialog, /id="verify-copy"/);
  assert.match(dialog, /id="verify-dialog-value"[^>]*readonly/);
  assert.match(dialog, /verification channel/);
});

test("shift inputs are typed, not spinners, and suggest nothing", () => {
  assert.doesNotMatch(html, /type="number"/);
  const input = section(/<input id="verify-shift"[^>]*>/);
  assert.match(input, /type="text"/);
  assert.doesNotMatch(input, /inputmode/, "a numeric keypad would hide the minus key");
  assert.doesNotMatch(cipherPage, /inputMode/, "a numeric keypad would hide the minus key");
  assert.match(input, /autocomplete="off"/);
  assert.doesNotMatch(input, /placeholder|value=|list=/);
  assert.match(cipherPage, /input\.autocomplete = "off"/);
  assert.doesNotMatch(cipherPage, /placeholder/);
});

test("the background has the main site's stars and moon", () => {
  assert.match(html, /class="stars"/);
  assert.match(html, /class="moon-crack"/);
  const css = fs.readFileSync(path.join(root, "style", "style.css"), "utf8");
  for (const name of ["stars-drift", "stars-blink", "moon-curve", "moon-color", "glitch-skew", "warning-pulse"]) {
    assert.match(css, new RegExp(`@keyframes ${name} `), `missing @keyframes ${name}`);
  }
  assert.match(css, /prefers-reduced-motion/);
});

test("pages use the main site's home, lore and archive styles", () => {
  const home = section(/<section id="page-home"[\s\S]*?<section id="page-verify"/);
  assert.match(home, /class="glitch"[\s\S]*class="warning-section"/);
  for (const page of ["verify", "cipher"]) {
    assert.match(section(new RegExp(`<section id="page-${page}"[\\s\\S]*?<\\/section>`)), /class="lore-content-section/);
  }
  for (const mode of ["decode", "encode"]) {
    assert.match(section(new RegExp(`<section id="page-${mode}"[\\s\\S]*?<\\/section>`)), /class="page-title"/);
  }
  assert.match(fs.readFileSync(path.join(root, "src", "nav.js"), "utf8"), /faction-row/);
});

test("the Entity Log look and Chroniclers text are gone", () => {
  const files = ["index.html", "style/style.css", "src/nav.js", "src/cipher-page.js"];
  for (const file of files) {
    const content = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(content, /chronicler/i, `${file} still mentions Chroniclers`);
    assert.doesNotMatch(content, /terminal-|entity-filter|filter-btn/, `${file} still uses the Entity Log style`);
  }
});

test("the cipher page no longer shows a Needs line", () => {
  assert.doesNotMatch(html, /cipher-needs/);
  assert.doesNotMatch(cipherPage, /Needs:/);
});

test("the Popular list only holds real ciphers, with Magic first when decoding", () => {
  for (const mode of ["decode", "encode"]) {
    const { popular } = Catalog.menu(mode);
    assert.ok(popular.length >= 5);
    for (const cipher of popular) assert.ok(cipher.modes.includes(mode));
  }
  assert.equal(Catalog.menu("decode").popular[0].id, "magic");
  assert.ok(!Catalog.menu("encode").popular.some((c) => c.id === "magic"));
});

test("the Unown font is bundled, credited and loaded by the stylesheet", () => {
  const css = fs.readFileSync(path.join(root, "style", "style.css"), "utf8");
  const font = css.match(/url\("\.\.\/(fonts\/[^"]+)"\)/);
  assert.ok(font, "no @font-face url found");
  assert.ok(fs.existsSync(path.join(root, font[1])), `${font[1]} is missing`);
  const credits = fs.readFileSync(path.join(root, "fonts", "CREDITS.txt"), "utf8");
  assert.match(credits, /free for all uses/);
});

test("the home page has no quote, just two plain buttons", () => {
  const home = section(/<section id="page-home"[\s\S]*?<section id="page-verify"/);
  assert.doesNotMatch(home, /main-quote|broken moon/);
  const buttons = [...home.matchAll(/<a class="btn-primary btn-big" href="#([^"]+)">([^<]+)<\/a>/g)];
  assert.deepEqual(buttons.map((m) => [m[1], m[2]]), [["verify", "Server Verification"], ["decode", "Decode"]]);
  const panel = home.match(/<section class="warning-section">[\s\S]*?<\/section>/)[0];
  assert.doesNotMatch(panel, /faction-row-tag|warning-intro|<p |<span/, "the buttons should have no subtext");
});

test("nothing says what a cipher needs any more", () => {
  for (const file of ["index.html", "src/nav.js", "src/cipher-page.js", "src/catalog.js"]) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), /needs|Needs a key|No key|Can bruteforce/i, `${file} still mentions needs`);
  }
});

test("symbol decoders label their keys and encoders keep the alphabet folded away", () => {
  assert.match(html, /<details id="cipher-chart-section"[^>]*hidden>/);
  assert.match(cipherPage, /renderChart\(entry\.category === "symbols" && mode === "encode"/);
  assert.match(cipherPage, /chartSection\.open = false/);
  assert.match(cipherPage, /glyph-key-letter/);
});

test("cipher pages link back to their Decode or Encode list", () => {
  const cipher = section(/<section id="page-cipher"[\s\S]*?<\/section>/);
  assert.match(cipher, /<a id="cipher-back" class="back-link" href="#decode">/);
  assert.match(cipherPage, /back\.href = `#\$\{mode\}`/);
  assert.match(cipherPage, /Back to \$\{verb\}/);
});

test("the project code has no comments", () => {
  const files = [
    "index.html",
    "style/style.css",
    ...fs.readdirSync(path.join(root, "src")).filter((f) => f.endsWith(".js")).map((f) => `src/${f}`),
    ...fs.readdirSync(path.join(root, "src", "ciphers")).map((f) => `src/ciphers/${f}`),
  ];
  const patterns = {
    ".html": /<!--/,
    ".css": /\/\*/,
    ".js": /\/\*|^\s*\/\/|[;{}),]\s*\/\/(?!\S*["'`])/m,
  };
  for (const file of files) {
    const content = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(content, patterns[path.extname(file)], `${file} contains a comment`);
  }
});

test("red text is easy to read on the dark background", () => {
  const css = fs.readFileSync(path.join(root, "style", "style.css"), "utf8");
  const variable = (name) => css.match(new RegExp(`--${name}: (#[0-9a-f]{6});`, "i"))[1];
  const luminance = (hex) => {
    const [r, g, b] = hex.slice(1).match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  for (const text of ["text-red", "text-red-soft"]) {
    for (const bg of ["bg-dark", "bg-secondary", "bg-tertiary"]) {
      assert.ok(contrast(variable(text), variable(bg)) >= 7, `--${text} on --${bg} is too low contrast`);
    }
  }
  const textRules = [...css.matchAll(/([^{}]+)\{[^}]*?\n  color: var\(--accent-(primary|red)\);/g)].map((m) => m[1].trim());
  assert.deepEqual(textRules, [], `these rules still use dark red for text: ${textRules.join(", ")}`);
});

test("results are a plain list: no banner, no pill badges", () => {
  const css = fs.readFileSync(path.join(root, "style", "style.css"), "utf8");
  for (const [name, content] of [["cipher-page.js", cipherPage], ["style.css", css]]) {
    assert.doesNotMatch(content, /magic-best|magic-cipher|\.badge|"badge|Best guess|Most likely|Known answer found/, `${name} still has the banner or badges`);
  }
  assert.match(cipherPage, /item\.classList\.add\("top"\)/);
  assert.match(cipherPage, /known-mark/);
});

test("only the main buttons and the home panel glow", () => {
  const css = fs.readFileSync(path.join(root, "style", "style.css"), "utf8");
  const allowed = [".moon-crack", "@keyframes moon-color", ".search-results", "@keyframes glitch-skew", ".warning-section", ".warning-title", ".btn-primary", ".btn-primary:focus-visible"];
  let selector = "";
  for (const line of css.split("\n")) {
    if (/^\S.*\{$/.test(line)) selector = line.replace(/\s*\{$/, "").trim();
    if (/(box-shadow|text-shadow|drop-shadow)/.test(line)) {
      assert.ok(allowed.includes(selector), `${selector} still glows`);
    }
  }
});

test("spaced-out uppercase labels are only used on the Decode/Encode lists", () => {
  assert.doesNotMatch(html, /class="faction-group-label"/);
  assert.doesNotMatch(cipherPage, /faction-group-label/);
  assert.match(fs.readFileSync(path.join(root, "src", "nav.js"), "utf8"), /faction-group-label/);
  for (const label of ["Input", "Options", "Output", "Alphabet"]) {
    assert.match(html, new RegExp(`class="section-label"[^>]*>(<label[^>]*>)?${label}<`), `${label} should be a plain label`);
  }
});

test("no helper sentences under titles", () => {
  for (const page of ["verify", "decode", "encode", "cipher"]) {
    const markup = section(new RegExp(`<section id="page-${page}"[\\s\\S]*?<\\/section>`)).replace(/<dialog[\s\S]*<\/dialog>/, "");
    assert.doesNotMatch(markup, /section-intro|<blockquote/, `${page} still has a helper sentence`);
  }
  assert.doesNotMatch(cipherPage, /\babout:/);
});

test("Magic is called Auto-detect but can still be searched as magic", () => {
  assert.equal(Catalog.cipher("magic").name, "Auto-detect");
  assert.ok(Catalog.cipher("magic").keywords.includes("magic"));
  assert.doesNotMatch(html + cipherPage, /Magic \(auto-detect\)|Try Magic/);
});

test("on phones the buttons sit on a solid top bar and menu and search never overlap", () => {
  const css = fs.readFileSync(path.join(root, "style", "style.css"), "utf8");
  const mobile = css.slice(css.indexOf("@media (max-width: 768px)"));
  assert.match(html, /<div class="mobile-bar" aria-hidden="true"><\/div>/);
  assert.match(mobile, /\.mobile-bar \{\s*display: block;\s*position: fixed;/);
  assert.match(mobile, /\.container \{\s*padding: 108px/);
  assert.match(css, /\.burger-icon\[aria-expanded="true"\] span:nth-child\(1\)/);
  assert.match(fs.readFileSync(path.join(root, "src", "menu.js"), "utf8"), /SearchUI\.close\(\)/);
  assert.match(fs.readFileSync(path.join(root, "src", "search-ui.js"), "utf8"), /Menu\.close\(\)/);
});
