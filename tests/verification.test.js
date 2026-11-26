const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers, Answers } = require("./load");

function verify(text, shift) {
  return Answers.find(Ciphers.caesar.decode(text, shift));
}

test("verifies the example input", () => {
  assert.equal(verify("Ncvoozmzy Hjji", 21), "Shattered Moon");
});

test("verification is case-insensitive", () => {
  assert.equal(verify("nCVOOZMZY hjji", 21), "Shattered Moon");
  assert.equal(verify("NCVOOZMZY HJJI", "21"), "Shattered Moon");
});

test("verification ignores extra spaces", () => {
  assert.equal(verify("  Ncvoozmzy    Hjji ", 21), "Shattered Moon");
});

test("no match with the wrong shift", () => {
  assert.equal(verify("Ncvoozmzy Hjji", 5), null);
});

test("no match for unknown text", () => {
  assert.equal(verify("Hello World", 0), null);
});

test("every known answer can be found again after encoding", () => {
  for (const answer of Answers.known) {
    assert.equal(verify(Ciphers.caesar.encode(answer, 13), 13), answer);
  }
});
