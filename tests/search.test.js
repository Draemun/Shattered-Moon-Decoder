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
  const ids = Catalog.ciphers.map((c) => c.id);
  assert.deepEqual(routes("decode"), ["decode", ...ids.map((id) => `decode/${id}`)]);
  assert.deepEqual(routes("encoder"), ["encode", ...ids.map((id) => `encode/${id}`)]);
});

test("decoder searches don't drift into encoders through typo matching", () => {
  assert.ok(routes("decoder").every((route) => route.startsWith("decode")));
  assert.ok(routes("encode").every((route) => route.startsWith("encode")));
});

test("keywords find ciphers", () => {
  assert.deepEqual(routes("shift"), ["decode/caesar", "encode/caesar"]);
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
    assert.ok(html.includes(`href="#${page.route}"`), `${page.route} is not in the menu`);
  }
});

test("the search box is in the page", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  for (const id of ["search", "search-toggle", "search-box", "search-input", "search-results"]) {
    assert.ok(html.includes(`id="${id}"`), `#${id} is missing`);
  }
});
