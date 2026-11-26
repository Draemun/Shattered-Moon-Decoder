const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { morse } = Ciphers;

test("decodes SOS", () => {
  assert.equal(morse.decode("... --- ..."), "SOS");
});

test("decodes words separated by a slash", () => {
  assert.equal(morse.decode("... .... .- - - . .-. . -.. / -- --- --- -."), "SHATTERED MOON");
});

test("decodes words separated by three spaces", () => {
  assert.equal(morse.decode(".... ..   -- ---"), "HI MO");
});

test("decodes numbers and punctuation", () => {
  assert.equal(morse.decode("..--- ----- ..--- -.... -.-.--"), "2026!");
});

test("accepts alternative dot and dash characters", () => {
  assert.equal(morse.decode("··· ——— ···"), "SOS");
  assert.equal(morse.decode("... ___ ..."), "SOS");
});

test("ignores extra whitespace and leading or trailing slashes", () => {
  assert.equal(morse.decode("  / ... --- ... /  "), "SOS");
});

test("encode and decode are inverses", () => {
  assert.equal(morse.decode(morse.encode("Shattered Moon")), "SHATTERED MOON");
});

test("empty input gives empty output", () => {
  assert.equal(morse.decode(""), "");
});

test("rejects unknown codes", () => {
  assert.throws(() => morse.decode("........"), /Unknown Morse code/);
});

test("rejects characters that aren't Morse", () => {
  assert.throws(() => morse.decode("... abc"), /can only contain/);
});
