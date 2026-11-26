const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { autokey, beaufort, dateshift, playfair } = Ciphers;

test("Autokey matches the classic QUEENLY example", () => {
  assert.equal(autokey.encode("ATTACKATDAWN", "QUEENLY"), "QNXEPVYTWTWP");
  assert.equal(autokey.decode("QNXEPVYTWTWP", "QUEENLY"), "ATTACKATDAWN");
});

test("Autokey keeps case and skips non-letters", () => {
  const text = "Meet me at the Shattered Moon!";
  assert.equal(autokey.decode(autokey.encode(text, "moon"), "moon"), text);
});

test("Autokey needs a key with letters", () => {
  assert.throws(() => autokey.decode("abc", "123"), /at least one letter/);
});

test("Beaufort matches the FORTIFICATION example", () => {
  const cipher = "CKMPVCPVWPIWUJOGIUAPVWRIWUUK";
  assert.equal(beaufort.encode("DEFENDTHEEASTWALLOFTHECASTLE", "FORTIFICATION"), cipher);
  assert.equal(beaufort.decode(cipher, "FORTIFICATION"), "DEFENDTHEEASTWALLOFTHECASTLE");
});

test("Beaufort is its own inverse", () => {
  assert.equal(beaufort.decode(beaufort.encode("Shattered Moon", "key"), "key"), "Shattered Moon");
});

test("Date shift uses each digit of the date as a shift", () => {
  assert.equal(dateshift.encode("abc", "123"), "bdf");
  assert.equal(dateshift.encode("abc", "1/2/3"), "bdf");
  assert.equal(dateshift.decode("bdf", "1-2-3"), "abc");
});

test("Date shift repeats the date and keeps punctuation", () => {
  const text = "The moon shatters at midnight!";
  assert.equal(dateshift.decode(dateshift.encode(text, "11/26/2026"), "11/26/2026"), text);
});

test("Date shift needs at least one digit", () => {
  assert.throws(() => dateshift.encode("abc", "november"), /at least one digit/);
});

test("Playfair matches the classic example", () => {
  const key = "playfair example";
  assert.equal(playfair.encode("Hide the gold in the tree stump", key), "BMODZBXDNABEKUDMUIXMMOUVIF");
  assert.equal(playfair.decode("BMODZBXDNABEKUDMUIXMMOUVIF", key), "HIDETHEGOLDINTHETREXESTUMP");
});

test("Playfair builds the key square with I and J merged", () => {
  assert.equal(playfair.grid("playfair example").cells.join(""), "PLAYFIREXMBCDGHKNOQSTUVWZ");
  assert.equal(playfair.grid("").cells.length, 25);
});

test("Playfair pads odd lengths and splits double letters", () => {
  const decoded = playfair.decode(playfair.encode("balloon", "moon"), "moon");
  assert.equal(decoded, "BALXLOON");
  assert.equal(playfair.decode(playfair.encode("abc", "key"), "key"), "ABCX");
});

test("Playfair rejects an odd number of letters when decoding", () => {
  assert.throws(() => playfair.decode("ABC", "key"), /even number/);
});
