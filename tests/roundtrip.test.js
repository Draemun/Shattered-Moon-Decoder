const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers, Catalog } = require("./load");

const ARGS = {
  caesar: [21],
  affine: [5, 8],
  keyboard: ["right"],
  vigenere: ["moon"],
  autokey: ["moon"],
  beaufort: ["moon"],
  dateshift: ["11/26/2026"],
  reverse: ["text"],
  railfence: [3],
  columnar: ["moon"],
  polybius: ["moon"],
  bacon: ["26"],
};

const EXPECTED = {
  morse: (t) => t.toUpperCase(),
  nato: (t) => t.toUpperCase(),
  a1z26: (t) => t.toUpperCase(),
  tapcode: (t) => t.toUpperCase().replace(/K/g, "C"),
  polybius: (t) => t.toUpperCase().replace(/J/g, "I"),
  bacon: (t) => t.toUpperCase(),
  t9: (t) => t.toUpperCase(),
  pigpen: (t) => t.toUpperCase(),
  unown: (t) => t.toUpperCase(),
};

const samples = ["Shattered Moon", "meet me at the old tower", "Hello World"];

const SKIP = ["playfair"];

for (const cipher of Catalog.ciphers.filter((c) => c.modes.includes("encode") && !SKIP.includes(c.id))) {
  test(`${cipher.name}: decode(encode(x)) gives x back`, () => {
    const args = ARGS[cipher.id] || [];
    const expected = EXPECTED[cipher.id] || ((t) => t);
    for (const text of samples) {
      const encoded = Ciphers[cipher.id].encode(text, ...args);
      assert.equal(Ciphers[cipher.id].decode(encoded, ...args), expected(text), `failed for "${text}"`);
    }
  });
}

test("Caesar encode gives the Shattered Moon example", () => {
  assert.equal(Ciphers.caesar.encode("Shattered Moon", 21), "Ncvoozmzy Hjji");
});

test("Morse encode rejects characters with no Morse code", () => {
  assert.throws(() => Ciphers.morse.encode("hi#"), /no Morse code/);
});
