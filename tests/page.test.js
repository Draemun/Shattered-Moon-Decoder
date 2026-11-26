const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Ciphers } = require("./load");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const cipherPage = fs.readFileSync(path.join(root, "src", "cipher-page.js"), "utf8");

const CIPHERS = ["caesar", "vigenere", "brainfuck", "binary", "morse", "base64"];

function section(pattern) {
  const match = html.match(pattern);
  assert.ok(match, `${pattern} not found`);
  return match[0];
}

function hashLinks(markup) {
  return [...markup.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
}

const sidebar = section(/<nav class="sidebar" id="sidebar"[\s\S]*?<\/nav>/);

test("every script and stylesheet in index.html exists", () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 0);
  for (const ref of refs) {
    assert.ok(fs.existsSync(path.join(root, ref)), `${ref} is missing`);
  }
});

test("every cipher file in src/ciphers is loaded by index.html", () => {
  for (const file of fs.readdirSync(path.join(root, "src", "ciphers"))) {
    assert.ok(html.includes(`src/ciphers/${file}`), `${file} is not loaded`);
  }
});

test("the burger button sits in the burger menu and controls the sidebar", () => {
  assert.match(html, /<div class="burger-menu"[^>]*>\s*<button class="burger-icon" id="menu-toggle"/);
  assert.match(html, /id="menu-toggle"[^>]*aria-controls="sidebar"/);
});

test("the sidebar has Home, Server Verification and Decode/Encode submenus with every cipher", () => {
  assert.deepEqual(hashLinks(sidebar), [
    "home",
    "verify",
    "decode",
    ...CIPHERS.map((c) => `decode/${c}`),
    "encode",
    ...CIPHERS.map((c) => `encode/${c}`),
  ]);
});

test("sidebar links carry a matching data-page", () => {
  const pairs = [...sidebar.matchAll(/href="#([^"]+)" data-page="([^"]+)"/g)];
  assert.equal(pairs.length, hashLinks(sidebar).length);
  for (const [, href, page] of pairs) assert.equal(page, href);
});

test("every submenu toggle controls an existing, initially collapsed list", () => {
  const toggles = [...sidebar.matchAll(/class="submenu-toggle"[^>]*aria-controls="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(toggles, ["submenu-decode", "submenu-encode"]);
  for (const id of toggles) {
    assert.match(sidebar, new RegExp(`class="submenu-items" id="${id}" hidden`));
  }
});

test("the home page only offers Server Verification and Decode", () => {
  assert.deepEqual(hashLinks(section(/<section id="page-home"[\s\S]*?<\/section>/)), ["verify", "decode"]);
});

test("the Decode and Encode pages list every cipher", () => {
  for (const mode of ["decode", "encode"]) {
    const page = section(new RegExp(`<section id="page-${mode}"[\\s\\S]*?<\\/section>`));
    assert.deepEqual(hashLinks(page), CIPHERS.map((c) => `${mode}/${c}`));
  }
});

test("every linked page exists", () => {
  for (const route of new Set(hashLinks(html))) {
    const target = route.includes("/") ? "cipher" : route;
    assert.ok(html.includes(`id="page-${target}"`), `page for ${route} is missing`);
  }
});

test("every cipher has decode and encode functions", () => {
  for (const cipher of CIPHERS) {
    assert.equal(typeof Ciphers[cipher].decode, "function", `${cipher} has no decode()`);
    assert.equal(typeof Ciphers[cipher].encode, "function", `${cipher} has no encode()`);
  }
});

test("the cipher page is configured for every cipher", () => {
  for (const cipher of CIPHERS) {
    assert.match(cipherPage, new RegExp(`\\b${cipher}: \\{`), `${cipher} is missing from cipher-page.js`);
  }
});

test("every field the cipher page uses exists in index.html", () => {
  const fields = new Set(
    [...cipherPage.matchAll(/fields: \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((f) => f[1]))
  );
  for (const field of fields) {
    assert.ok(html.includes(`data-field="${field}"`), `data-field="${field}" is missing`);
  }
});

test("every element the page scripts use exists in index.html", () => {
  for (const file of ["verify.js", "menu.js", "cipher-page.js"]) {
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

test("shifts are typed as numbers, not picked with a number spinner", () => {
  assert.doesNotMatch(html, /type="number"/);
  for (const id of ["verify-shift", "cipher-shift"]) {
    assert.match(html, new RegExp(`id="${id}" type="text" inputmode="numeric"`));
  }
});

test("shift inputs don't suggest a value", () => {
  for (const id of ["verify-shift", "cipher-shift"]) {
    const input = section(new RegExp(`<input id="${id}"[^>]*>`));
    assert.doesNotMatch(input, /placeholder|value=|list=/);
    assert.match(input, /autocomplete="off"/);
  }
});

test("the project code has no comments", () => {
  const files = [
    "index.html",
    "style/style.css",
    ...fs.readdirSync(path.join(root, "src")).filter((f) => f.endsWith(".js")).map((f) => `src/${f}`),
    ...fs.readdirSync(path.join(root, "src", "ciphers")).map((f) => `src/ciphers/${f}`),
  ];
  for (const file of files) {
    const content = fs.readFileSync(path.join(root, file), "utf8");
    assert.doesNotMatch(content, /<!--|\/\*|^\s*\/\/|\s\/\/\s/m, `${file} contains a comment`);
  }
});
