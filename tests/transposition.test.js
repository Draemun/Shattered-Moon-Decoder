const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { reverse, railfence, columnar } = Ciphers;

test("Reverse flips the whole text", () => {
  assert.equal(reverse.decode("nooM derettahS"), "Shattered Moon");
});

test("Reverse can flip each word or the word order", () => {
  assert.equal(reverse.decode("derettahS nooM", "words"), "Shattered Moon");
  assert.equal(reverse.decode("Moon Shattered", "order"), "Shattered Moon");
});

test("Reverse keeps emoji and accents intact", () => {
  assert.equal(reverse.decode("è☾"), "☾è");
});

test("Rail fence matches the classic 3-rail example", () => {
  assert.equal(railfence.encode("WEAREDISCOVEREDRUNATONCE", 3), "WECRUOERDSOEERNTNEAIVDAC");
  assert.equal(railfence.decode("WECRUOERDSOEERNTNEAIVDAC", 3), "WEAREDISCOVEREDRUNATONCE");
});

test("Rail fence round-trips for many rail counts", () => {
  const text = "Meet me under the shattered moon!";
  for (let rails = 2; rails <= 12; rails++) {
    assert.equal(railfence.decode(railfence.encode(text, rails), rails), text);
  }
});

test("Rail fence needs at least 2 rails", () => {
  assert.throws(() => railfence.encode("abc", 1), /at least 2 rails/);
  assert.throws(() => railfence.encode("abc", "x"), /whole number/);
});

test("Rail fence bruteforce finds the right rail count", () => {
  const results = railfence.bruteforce("WECRUOERDSOEERNTNEAIVDAC");
  assert.ok(results.some((r) => r.rails === 3 && r.text === "WEAREDISCOVEREDRUNATONCE"));
});

test("Columnar transposition matches the ZEBRAS example", () => {
  assert.equal(columnar.encode("WEAREDISCOVEREDFLEEATONCE", "ZEBRAS"), "EVLNACDTESEAROFODEECWIREE");
  assert.equal(columnar.decode("EVLNACDTESEAROFODEECWIREE", "ZEBRAS"), "WEAREDISCOVEREDFLEEATONCE");
});

test("Columnar transposition round-trips with spaces and repeated key letters", () => {
  const text = "Meet me under the shattered moon!";
  for (const key of ["moon", "shattered", "ab", "zebras"]) {
    assert.equal(columnar.decode(columnar.encode(text, key), key), text);
  }
});

test("Columnar transposition needs a key of at least 2 characters", () => {
  assert.throws(() => columnar.encode("abc", "a"), /at least 2/);
});
