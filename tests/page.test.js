const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Ciphers } = require("./load");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const cipherPage = fs.readFileSync(path.join(root, "src", "cipher-page.js"), "utf8");

const CIPHERS = ["caesar", "vigenere", "brainfuck", "binary", "morse", "base64"];

function sidebarRoutes() {
  const sidebar = html.match(/<aside id="sidebar"[\s\S]*?<\/aside>/)[0];
  return [...sidebar.matchAll(/data-page="([^"]+)"/g)].map((m) => m[1]);
}

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

test("the sidebar has a decode and an encode section for every cipher", () => {
  const routes = sidebarRoutes();
  assert.deepEqual(routes, [
    "home",
    "verify",
    ...CIPHERS.map((c) => `decode/${c}`),
    ...CIPHERS.map((c) => `encode/${c}`),
  ]);
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

test("every linked page exists", () => {
  for (const route of new Set([...html.matchAll(/data-page="([^"]+)"/g)].map((m) => m[1]))) {
    const target = route.includes("/") ? "cipher" : route;
    assert.ok(html.includes(`id="page-${target}"`), `page for ${route} is missing`);
  }
});

test("every field the cipher page uses exists in index.html", () => {
  const fields = new Set([...cipherPage.matchAll(/fields: \[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((f) => f[1])));
  for (const field of fields) {
    assert.ok(html.includes(`data-field="${field}"`), `data-field="${field}" is missing`);
  }
  for (const id of [...cipherPage.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1])) {
    assert.ok(html.includes(`id="${id}"`), `#${id} is missing`);
  }
});

test("every element verify.js uses exists in index.html", () => {
  const verify = fs.readFileSync(path.join(root, "src", "verify.js"), "utf8");
  for (const id of [...verify.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1])) {
    assert.ok(html.includes(`id="${id}"`), `#${id} is missing`);
  }
});

test("a successful verification opens a dialog with a copy button and channel instructions", () => {
  const dialog = html.match(/<dialog id="verify-dialog"[\s\S]*?<\/dialog>/);
  assert.ok(dialog, "verify dialog is missing");
  assert.match(dialog[0], /id="verify-copy"/);
  assert.match(dialog[0], /id="verify-dialog-value"[^>]*readonly/);
  assert.match(dialog[0], /verification channel/);
});

test("shifts are typed as numbers, not picked with a number spinner", () => {
  assert.doesNotMatch(html, /type="number"/);
  for (const id of ["verify-shift", "cipher-shift"]) {
    assert.match(html, new RegExp(`id="${id}" type="text" inputmode="numeric"`));
  }
});

test("the burger button controls the sidebar", () => {
  assert.match(html, /id="menu-toggle"[^>]*aria-controls="sidebar"/);
  assert.match(html, /<aside id="sidebar"/);
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
