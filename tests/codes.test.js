const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { nato, a1z26, tapcode, polybius, bacon, t9, braille, pigpen } = Ciphers;

test("NATO alphabet decodes words and accepts variant spellings", () => {
  assert.equal(nato.decode("Sierra Hotel Alfa / Mike Oscar Oscar November"), "SHA MOON");
  assert.equal(nato.decode("alpha juliet whisky x-ray xray niner"), "AJWXX9");
});

test("NATO alphabet encodes letters and digits", () => {
  assert.equal(nato.encode("Hi 2"), "Hotel India / Two");
  assert.throws(() => nato.encode("hi!"), /no NATO alphabet word/);
  assert.throws(() => nato.decode("Sierra Banana"), /isn't a NATO/);
});

test("A1Z26 decodes dashed words and spaced letters", () => {
  assert.equal(a1z26.decode("8-5-12-12-15 23-15-18-12-4"), "HELLO WORLD");
  assert.equal(a1z26.decode("8 9"), "HI");
  assert.equal(a1z26.decode("8 9 / 13 15"), "HI MO");
  assert.equal(a1z26.encode("Hello World"), "8-5-12-12-15 23-15-18-12-4");
});

test("A1Z26 rejects numbers outside 1-26", () => {
  assert.throws(() => a1z26.decode("27"), /1-26/);
  assert.throws(() => a1z26.decode("0"), /1-26/);
  assert.throws(() => a1z26.decode("a"), /only contain numbers/);
});

test("Tap code decodes numbers and dots", () => {
  assert.equal(tapcode.decode("52 11 44 15 42"), "WATER");
  assert.equal(tapcode.decode(".... .... . ....."), "TE");
  assert.equal(tapcode.encode("water"), "52 11 44 15 42");
  assert.equal(tapcode.encode("hi", "dots"), ".. ...   .. ....");
});

test("Tap code merges K into C", () => {
  assert.equal(tapcode.decode(tapcode.encode("kick")), "CICC");
});

test("Tap code rejects bad groups", () => {
  assert.throws(() => tapcode.decode("2"), /pairs/);
  assert.throws(() => tapcode.decode("...... ."), /1 to 5 dots/);
});

test("Polybius square encodes and decodes with optional key", () => {
  assert.equal(polybius.encode("hi"), "23 24");
  assert.equal(polybius.decode("23 24 / 32 34 34 33"), "HI MOON");
  assert.equal(polybius.decode(polybius.encode("Shattered Moon", "secret"), "secret"), "SHATTERED MOON");
  assert.throws(() => polybius.decode("67"), /digits 1-5/);
});

test("Bacon encodes with 26- and 24-letter alphabets", () => {
  assert.equal(bacon.encode("HELLO"), "AABBB AABAA ABABB ABABB ABBBA");
  assert.equal(bacon.encode("HELLO", "24"), "AABBB AABAA ABABA ABABA ABBAB");
  assert.equal(bacon.decode("AABBB AABAA ABABB ABABB ABBBA"), "HELLO");
  assert.equal(bacon.decode("00111 00100", "26"), "HE");
});

test("Bacon reads messages hidden in letter case", () => {
  const carrier = "thiS IS A test";
  assert.equal(bacon.decode(carrier, "26", "case"), "DY");
});

test("Bacon rejects incomplete groups", () => {
  assert.throws(() => bacon.decode("AAB"), /groups of 5/);
  assert.throws(() => bacon.decode("AACAB"), /only contain A and B/);
});

test("T9 multi-tap decodes key presses", () => {
  assert.equal(t9.decode("44 444 0 7777"), "HI S");
  assert.equal(t9.decode("6 666 666 66"), "MOON");
  assert.equal(t9.encode("moon"), "6 666 666 66");
  assert.throws(() => t9.decode("43"), /repeat one key/);
  assert.throws(() => t9.encode("#"), /phone keypad/);
});

test("Braille encodes letters, capitals, numbers and punctuation", () => {
  assert.equal(braille.encode("Hi 2026!"), "⠠⠓⠊⠀⠼⠃⠚⠃⠋⠖");
  assert.equal(braille.decode("⠠⠓⠊⠀⠼⠃⠚⠃⠋⠖"), "Hi 2026!");
});

test("Braille uses a letter sign after numbers", () => {
  assert.equal(braille.decode(braille.encode("2a")), "2a");
});

test("Braille rejects unknown symbols", () => {
  assert.throws(() => braille.decode("⣿"), /Unknown Braille/);
  assert.throws(() => braille.encode("#"), /no Braille symbol/);
});

test("Unown covers A-Z plus ! and ?", () => {
  assert.equal(Ciphers.unown.LETTERS, "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?");
  assert.ok(Ciphers.unown.isUnown("q"));
  assert.ok(Ciphers.unown.isUnown("?"));
  assert.ok(!Ciphers.unown.isUnown("1"));
});

test("Unown encodes letters and keeps everything else as plain text", () => {
  const glyphs = Ciphers.unown.encode("Hi, Moon!");
  assert.deepEqual(glyphs.filter((g) => !g.plain).map((g) => g.letter).join(""), "HIMOON!");
  assert.deepEqual(glyphs.filter((g) => g.plain).map((g) => g.letter), [",", " "]);
  assert.equal(Ciphers.unown.decode(glyphs), "HI, MOON!");
});

test("Pigpen has a distinct symbol for every letter", () => {
  const shapes = new Set(pigpen.LETTERS.split("").map((l) => JSON.stringify(pigpen.glyph(l))));
  assert.equal(shapes.size, 26);
  assert.equal(pigpen.glyph("e").lines.length, 4);
  assert.equal(pigpen.glyph("A").dot, null);
  assert.ok(pigpen.glyph("J").dot);
});

test("Pigpen round-trips and keeps other characters as plain text", () => {
  const glyphs = pigpen.encode("Moon 1");
  assert.equal(glyphs.length, 6);
  assert.ok(glyphs[4].plain && glyphs[5].plain);
  assert.equal(pigpen.decode(glyphs), "MOON 1");
});
