const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { caesar } = Ciphers;

test("decodes the Shattered Moon example with shift 21", () => {
  assert.equal(caesar.decode("Ncvoozmzy Hjji", 21), "Shattered Moon");
});

test("accepts the shift as a string", () => {
  assert.equal(caesar.decode("Ncvoozmzy Hjji", "21"), "Shattered Moon");
});

test("keeps case, spaces, digits and punctuation", () => {
  assert.equal(caesar.decode("Khoor, Zruog! 123", 3), "Hello, World! 123");
});

test("wraps around the alphabet", () => {
  assert.equal(caesar.decode("abc", 3), "xyz");
  assert.equal(caesar.decode("XYZ", -3), "ABC");
});

test("handles shifts larger than 26 and negative shifts", () => {
  assert.equal(caesar.decode("Khoor", 29), "Hello");
  assert.equal(caesar.decode("Khoor", -23), "Hello");
});

test("shift 0 leaves text unchanged", () => {
  assert.equal(caesar.decode("Hello", 0), "Hello");
});

test("encode and decode are inverses", () => {
  for (let shift = -30; shift <= 30; shift++) {
    assert.equal(caesar.decode(caesar.encode("The Quick Brown Fox", shift), shift), "The Quick Brown Fox");
  }
});

test("rejects shifts that aren't whole numbers", () => {
  assert.throws(() => caesar.decode("abc", 2.5), /whole number/);
  assert.throws(() => caesar.decode("abc", "abc"), /whole number/);
  assert.throws(() => caesar.decode("abc", ""), /whole number/);
});

test("bruteforce returns all 25 shifts", () => {
  const results = caesar.bruteforce("Ncvoozmzy Hjji");
  assert.equal(results.length, 25);
  assert.deepEqual(results.map((r) => r.shift), Array.from({ length: 25 }, (_, i) => i + 1));
  assert.deepEqual(results.find((r) => r.shift === 21), { shift: 21, text: "Shattered Moon" });
});
