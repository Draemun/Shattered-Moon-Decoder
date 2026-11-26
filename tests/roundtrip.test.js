const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const samples = ["Shattered Moon", "Hello, World!", "abc xyz 123"];

test("Caesar: decode(encode(x)) === x", () => {
  for (const text of samples) assert.equal(Ciphers.caesar.decode(Ciphers.caesar.encode(text, 21), 21), text);
});

test("Vigenère: decode(encode(x)) === x", () => {
  for (const text of samples) assert.equal(Ciphers.vigenere.decode(Ciphers.vigenere.encode(text, "moon"), "moon"), text);
});

test("Brainfuck: decode(encode(x)) === x", () => {
  for (const text of samples) assert.equal(Ciphers.brainfuck.decode(Ciphers.brainfuck.encode(text)), text);
});

test("Binary: decode(encode(x)) === x", () => {
  for (const text of samples) assert.equal(Ciphers.binary.decode(Ciphers.binary.encode(text)), text);
});

test("Morse: decode(encode(x)) === x in uppercase", () => {
  for (const text of samples) assert.equal(Ciphers.morse.decode(Ciphers.morse.encode(text)), text.toUpperCase());
});

test("Base64: decode(encode(x)) === x", () => {
  for (const text of samples) assert.equal(Ciphers.base64.decode(Ciphers.base64.encode(text)), text);
});

test("Caesar encode gives the Shattered Moon example", () => {
  assert.equal(Ciphers.caesar.encode("Shattered Moon", 21), "Ncvoozmzy Hjji");
});

test("Morse encode rejects characters with no Morse code", () => {
  assert.throws(() => Ciphers.morse.encode("hi#"), /no Morse code/);
});
