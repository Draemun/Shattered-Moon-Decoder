const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { base64 } = Ciphers;

test("decodes standard Base64", () => {
  assert.equal(base64.decode("U2hhdHRlcmVkIE1vb24="), "Shattered Moon");
});

test("decodes without padding", () => {
  assert.equal(base64.decode("U2hhdHRlcmVkIE1vb24"), "Shattered Moon");
});

test("ignores whitespace and line breaks", () => {
  assert.equal(base64.decode("U2hhdHRl\ncmVkIE1v b24="), "Shattered Moon");
});

test("decodes URL-safe Base64", () => {
  assert.equal(base64.decode("Pz8_"), "???");
  assert.equal(base64.decode("Pj4-"), ">>>");
});

test("decodes UTF-8 characters", () => {
  assert.equal(base64.decode(base64.encode("Vigenère ☾")), "Vigenère ☾");
});

test("encodes text", () => {
  assert.equal(base64.encode("Shattered Moon"), "U2hhdHRlcmVkIE1vb24=");
});

test("empty input gives empty output", () => {
  assert.equal(base64.decode(""), "");
});

test("rejects invalid characters", () => {
  assert.throws(() => base64.decode("abc$"), /isn't valid Base64/);
});

test("rejects impossible lengths", () => {
  assert.throws(() => base64.decode("abcde"), /wrong length/);
});
