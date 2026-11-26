const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { atbash, rot47, affine, keyboard } = Ciphers;

test("Atbash mirrors the alphabet and keeps case", () => {
  assert.equal(atbash.decode("Svool, Dliow!"), "Hello, World!");
  assert.equal(atbash.encode("abcxyz"), "zyxcba");
});

test("Atbash is its own inverse", () => {
  assert.equal(atbash.decode(atbash.encode("Shattered Moon")), "Shattered Moon");
});

test("ROT47 rotates printable characters", () => {
  assert.equal(rot47.encode("Hello, World!"), "w6==@[ (@C=5P");
  assert.equal(rot47.decode("w6==@[ (@C=5P"), "Hello, World!");
});

test("ROT47 leaves spaces and non-ASCII alone", () => {
  assert.equal(rot47.encode(" è "), " è ");
});

test("Affine matches the classic example", () => {
  assert.equal(affine.encode("AFFINECIPHER", 5, 8), "IHHWVCSWFRCP");
  assert.equal(affine.decode("IHHWVCSWFRCP", 5, 8), "AFFINECIPHER");
});

test("Affine keeps case and punctuation", () => {
  assert.equal(affine.decode(affine.encode("Shattered Moon!", 7, 3), 7, 3), "Shattered Moon!");
});

test("Affine rejects multipliers that share a factor with 26", () => {
  assert.throws(() => affine.encode("abc", 2, 1), /must be one of/);
  assert.throws(() => affine.encode("abc", 13, 1), /must be one of/);
  assert.throws(() => affine.encode("abc", "x", 1), /whole number/);
});

test("Affine bruteforce tries all 312 keys and finds the right one", () => {
  const results = affine.bruteforce("IHHWVCSWFRCP");
  assert.equal(results.length, 12 * 26);
  assert.ok(results.some((r) => r.a === 5 && r.b === 8 && r.text === "AFFINECIPHER"));
});

test("Keyboard shift moves one key to the right or left", () => {
  assert.equal(keyboard.encode("hello", "right"), "jr;;p");
  assert.equal(keyboard.decode("jr;;p", "right"), "hello");
  assert.equal(keyboard.encode("hello", "left"), "gwkki");
  assert.equal(keyboard.decode("gwkki", "left"), "hello");
});

test("Keyboard shift handles capitals and wraps at the row edges", () => {
  assert.equal(keyboard.decode(keyboard.encode("Shattered Moon", "right"), "right"), "Shattered Moon");
  assert.equal(keyboard.encode("p", "right"), "[");
  assert.equal(keyboard.encode("\\", "right"), "q");
});

test("Keyboard shift rejects unknown directions", () => {
  assert.throws(() => keyboard.encode("a", "up"), /left" or "right/);
});
