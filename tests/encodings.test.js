const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { hex, decimal, octal, base32, base58, base85, url } = Ciphers;

test("Hex decodes spaced, joined and prefixed forms", () => {
  assert.equal(hex.decode("48 65 6c 6c 6f"), "Hello");
  assert.equal(hex.decode("48656C6C6F"), "Hello");
  assert.equal(hex.decode("0x48 0x69"), "Hi");
  assert.equal(hex.decode("\\x48\\x69"), "Hi");
  assert.equal(hex.encode("Hi"), "48 69");
});

test("Hex rejects bad input", () => {
  assert.throws(() => hex.decode("4G"), /0-9, A-F/);
  assert.throws(() => hex.decode("486"), /even number/);
});

test("Decimal decodes byte values", () => {
  assert.equal(decimal.decode("72 105"), "Hi");
  assert.equal(decimal.decode("72,105"), "Hi");
  assert.equal(decimal.encode("Hi"), "72 105");
  assert.throws(() => decimal.decode("300"), /bigger than 255/);
  assert.throws(() => decimal.decode("72 a"), /only contain numbers/);
});

test("Octal decodes byte values", () => {
  assert.equal(octal.decode("110 151"), "Hi");
  assert.equal(octal.encode("Hi"), "110 151");
  assert.throws(() => octal.decode("8"), /0-7/);
  assert.throws(() => octal.decode("777"), /bigger than/);
});

test("Base32 matches RFC 4648 examples", () => {
  const vectors = { "": "", f: "MY======", fo: "MZXQ====", foo: "MZXW6===", foob: "MZXW6YQ=", fooba: "MZXW6YTB", foobar: "MZXW6YTBOI======" };
  for (const [plain, encoded] of Object.entries(vectors)) {
    assert.equal(base32.encode(plain), encoded);
    assert.equal(base32.decode(encoded), plain);
  }
});

test("Base32 is case-insensitive and padding is optional", () => {
  assert.equal(base32.decode("mzxw6ytboi"), "foobar");
  assert.throws(() => base32.decode("MZ1"), /valid Base32/);
});

test("Base58 matches the Bitcoin alphabet", () => {
  assert.equal(base58.encode("Hello World!"), "2NEpo7TZRRrLZSi2U");
  assert.equal(base58.decode("2NEpo7TZRRrLZSi2U"), "Hello World!");
  assert.throws(() => base58.decode("0OIl"), /isn't a Base58 character/);
});

test("Base58 keeps leading zero bytes", () => {
  assert.equal(base58.decode(base58.encode("\0\0hi")), "\0\0hi");
});

test("Base85 matches the Ascii85 example", () => {
  assert.equal(base85.encode("Man "), "9jqo^");
  assert.equal(base85.decode("<~9jqo^BlbD-BleB1DJ+*+F(f,q~>"), "Man is distinguished");
});

test("Base85 handles partial groups and z for zeros", () => {
  for (const text of ["M", "Ma", "Man", "Shattered Moon", "\0\0\0\0x"]) {
    assert.equal(base85.decode(base85.encode(text)), text);
  }
  assert.equal(base85.encode("\0\0\0\0"), "z");
  assert.throws(() => base85.decode("9jqo^B"), /wrong length/);
});

test("URL encoding handles %XX and plus signs", () => {
  assert.equal(url.decode("Shattered%20Moon%21"), "Shattered Moon!");
  assert.equal(url.decode("a+b"), "a b");
  assert.equal(url.encode("Moon & Stars"), "Moon%20%26%20Stars");
  assert.throws(() => url.decode("%E0%A4%A"), /valid URL/);
});

test("all encodings round-trip UTF-8 text", () => {
  for (const codec of [hex, decimal, octal, base32, base58, base85, url]) {
    assert.equal(codec.decode(codec.encode("Vigenère ☾ moon")), "Vigenère ☾ moon");
  }
});
