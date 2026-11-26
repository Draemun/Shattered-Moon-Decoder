const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { Catalog, Search } = require("./load");

const index = Search.buildIndex(Catalog.pages);
const routes = (query) => Search.search(index, query).map((entry) => entry.route);

test("searching a cipher shows its decoder and encoder", () => {
  assert.deepEqual(routes("vigenere"), ["decode/vigenere", "encode/vigenere"]);
  assert.deepEqual(routes("morse"), ["decode/morse", "encode/morse"]);
  assert.deepEqual(routes("base64"), ["decode/base64", "encode/base64"]);
});

test("accents are optional", () => {
  assert.deepEqual(routes("Vigenère"), ["decode/vigenere", "encode/vigenere"]);
  assert.deepEqual(routes("vigenere"), routes("vigenère"));
});

test("search is case-insensitive", () => {
  assert.deepEqual(routes("VIGENERE"), ["decode/vigenere", "encode/vigenere"]);
  assert.deepEqual(routes("BrainFuck"), ["decode/brainfuck", "encode/brainfuck"]);
});

test("common misspellings still find the cipher", () => {
  assert.deepEqual(routes("vinegere"), ["decode/vigenere", "encode/vigenere"]);
  assert.deepEqual(routes("vigenre"), ["decode/vigenere", "encode/vigenere"]);
  assert.deepEqual(routes("ceasar"), ["decode/caesar", "encode/caesar"]);
  assert.deepEqual(routes("brianfuck"), ["decode/brainfuck", "encode/brainfuck"]);
  assert.deepEqual(routes("mosre"), ["decode/morse", "encode/morse"]);
});

test("partial words match while typing", () => {
  assert.deepEqual(routes("vig"), ["decode/vigenere", "encode/vigenere"]);
  assert.deepEqual(routes("brain"), ["decode/brainfuck", "encode/brainfuck"]);
});

test("adding decode or encode narrows the results", () => {
  assert.deepEqual(routes("vigenere decode"), ["decode/vigenere"]);
  assert.deepEqual(routes("encode vinegere"), ["encode/vigenere"]);
  assert.deepEqual(routes("caesar decoder"), ["decode/caesar"]);
});

test("searching decode or encode lists every one of them", () => {
  const ids = (mode) => Catalog.ciphers.filter((c) => c.modes.includes(mode)).map((c) => c.id);
  assert.deepEqual(routes("decode"), ["decode", ...ids("decode").map((id) => `decode/${id}`)]);
  assert.deepEqual(routes("encoder"), ["encode", ...ids("encode").map((id) => `encode/${id}`)]);
});

test("new ciphers can be found, with or without typos", () => {
  assert.deepEqual(routes("atbash"), ["decode/atbash", "encode/atbash"]);
  assert.deepEqual(routes("playfiar"), ["decode/playfair", "encode/playfair"]);
  assert.deepEqual(routes("date shift"), ["decode/dateshift", "encode/dateshift"]);
  assert.deepEqual(routes("pigpen"), ["decode/pigpen", "encode/pigpen"]);
  assert.deepEqual(routes("magic"), ["decode/magic"]);
  assert.deepEqual(routes("unown"), ["decode/unown", "encode/unown"]);
  assert.deepEqual(routes("pokemon"), ["decode/unown", "encode/unown"]);
});

test("decoder searches don't drift into encoders through typo matching", () => {
  assert.ok(routes("decoder").every((route) => route.startsWith("decode")));
  assert.ok(routes("encode").every((route) => route.startsWith("encode")));
});

test("keywords find ciphers", () => {
  assert.deepEqual(routes("shift"), [
    "decode/caesar", "decode/keyboard", "decode/dateshift",
    "encode/caesar", "encode/keyboard", "encode/dateshift",
  ]);
  assert.deepEqual(routes("zigzag"), ["decode/railfence", "encode/railfence"]);
  assert.deepEqual(routes("auto detect"), ["decode/magic"]);
  assert.deepEqual(routes("b64"), ["decode/base64", "encode/base64"]);
});

test("Server Verification can be found", () => {
  assert.equal(routes("verification")[0], "verify");
  assert.equal(routes("server")[0], "verify");
});

test("empty or unknown searches return nothing", () => {
  assert.deepEqual(routes(""), []);
  assert.deepEqual(routes("   "), []);
  assert.deepEqual(routes("zzzzqq"), []);
});

test("distance counts edits, including swapped letters", () => {
  assert.equal(Search.distance("vigenere", "vigenere"), 0);
  assert.equal(Search.distance("vinegere", "vigenere"), 2);
  assert.equal(Search.distance("ceasar", "caesar"), 1);
  assert.equal(Search.distance("", "abc"), 3);
});

test("normalize strips accents and lowercases", () => {
  assert.equal(Search.normalize("Vigenère"), "vigenere");
});

test("every catalog route opens a real page", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  for (const page of Catalog.pages) {
    const target = page.route.includes("/") ? "cipher" : page.route;
    assert.ok(html.includes(`id="page-${target}"`), `${page.route} has no page`);
    if (page.route.includes("/")) {
      const [mode, id] = page.route.split("/");
      assert.ok(Catalog.menu(mode).top.concat(...Catalog.menu(mode).groups.map((g) => g.ciphers)).some((c) => c.id === id), `${page.route} is not in the menu`);
    } else {
      assert.ok(html.includes(`href="#${page.route}"`), `${page.route} is not in the menu`);
    }
  }
});

test("the search box is in the page", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  for (const id of ["search", "search-toggle", "search-box", "search-input", "search-results"]) {
    assert.ok(html.includes(`id="${id}"`), `#${id} is missing`);
  }
});
