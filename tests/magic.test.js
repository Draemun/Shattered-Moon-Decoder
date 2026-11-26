const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers, Answers, English } = require("./load");

const best = (text) => Ciphers.magic.detect(text, { isKnown: Answers.find })[0];

test("Magic finds the Shattered Moon example", () => {
  const top = best("Ncvoozmzy Hjji");
  assert.equal(top.text, "Shattered Moon");
  assert.equal(top.known, true);
});

test("Magic recognises common encodings", () => {
  const message = "meet me at the old tower at night";
  for (const id of ["base64", "base32", "hex", "binary", "morse", "atbash", "rot47", "reverse", "url", "decimal"]) {
    const encoded = Ciphers[id].encode(message);
    assert.equal(best(encoded).text.toLowerCase(), message, `${id} was not detected`);
  }
});

test("Magic finds Caesar shifts", () => {
  const top = best(Ciphers.caesar.encode("the secret is under the shattered moon", 7));
  assert.equal(top.text, "the secret is under the shattered moon");
  assert.equal(top.method, "caesar");
});

test("Magic runs Brainfuck programs", () => {
  const top = best(Ciphers.brainfuck.encode("hello world"));
  assert.equal(top.text, "hello world");
});

test("Magic returns nothing for empty input and doesn't repeat results", () => {
  assert.deepEqual(Ciphers.magic.detect("   "), []);
  const results = Ciphers.magic.detect("Uryyb jbeyq");
  const texts = results.map((r) => r.text.toLowerCase());
  assert.equal(new Set(texts).size, texts.length);
  assert.ok(results.length <= 10);
});

test("English scoring prefers real sentences over gibberish", () => {
  assert.ok(English.score("meet me at the old tower") > English.score("zqxv jkqw pxxz"));
  assert.ok(English.score("the moon") > English.score("\u0001\u0002\u0003"));
  assert.equal(English.score(""), -Infinity);
});
