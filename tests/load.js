const path = require("node:path");

const files = [
  "ciphers/alphabet.js",
  "ciphers/caesar.js",
  "ciphers/vigenere.js",
  "ciphers/brainfuck.js",
  "ciphers/binary.js",
  "ciphers/morse.js",
  "ciphers/base64.js",
  "answers.js",
];

for (const file of files) require(path.join(__dirname, "..", "src", file));

module.exports = { Ciphers: globalThis.Ciphers, Answers: globalThis.Answers };
