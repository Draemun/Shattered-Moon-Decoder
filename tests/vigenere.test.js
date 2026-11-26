const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { vigenere } = Ciphers;

test("decodes the classic LEMON example", () => {
  assert.equal(vigenere.decode("LXFOPVEFRNHR", "LEMON"), "ATTACKATDAWN");
});

test("encodes the classic LEMON example", () => {
  assert.equal(vigenere.encode("ATTACKATDAWN", "LEMON"), "LXFOPVEFRNHR");
});

test("key is case-insensitive and ignores non-letters", () => {
  assert.equal(vigenere.decode("LXFOPVEFRNHR", "le mon!"), "ATTACKATDAWN");
});

test("keeps case and skips non-letters without using up the key", () => {
  assert.equal(vigenere.decode("Lxfopv ef rnhr!", "lemon"), "Attack at dawn!");
});

test("encode and decode are inverses", () => {
  const text = "Shattered Moon, 2026!";
  assert.equal(vigenere.decode(vigenere.encode(text, "moon"), "moon"), text);
});

test("rejects a key with no letters", () => {
  assert.throws(() => vigenere.decode("abc", ""), /at least one letter/);
  assert.throws(() => vigenere.decode("abc", "123"), /at least one letter/);
});
