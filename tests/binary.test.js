const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { binary } = Ciphers;

test("decodes space-separated bytes", () => {
  assert.equal(binary.decode("01001000 01101001"), "Hi");
});

test("decodes a continuous bit string", () => {
  assert.equal(binary.decode("0100100001101001"), "Hi");
});

test("accepts groups shorter than 8 bits and extra whitespace", () => {
  assert.equal(binary.decode("  1001000\n1101001  "), "Hi");
});

test("decodes a single byte without spaces", () => {
  assert.equal(binary.decode("1000001"), "A");
});

test("decodes UTF-8 characters", () => {
  assert.equal(binary.decode(binary.encode("Vigenère ☾")), "Vigenère ☾");
});

test("encodes to space-separated 8-bit groups", () => {
  assert.equal(binary.encode("Hi"), "01001000 01101001");
});

test("empty input gives empty output", () => {
  assert.equal(binary.decode("   "), "");
});

test("rejects characters other than 0, 1 and spaces", () => {
  assert.throws(() => binary.decode("0102"), /only contain 0, 1/);
});

test("rejects a continuous string that isn't a multiple of 8", () => {
  assert.throws(() => binary.decode("010010000"), /multiple of 8/);
});

test("rejects a group longer than 8 bits", () => {
  assert.throws(() => binary.decode("01001000 010010000"), /longer than 8 bits/);
});
