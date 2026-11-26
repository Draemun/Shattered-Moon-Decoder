const test = require("node:test");
const assert = require("node:assert/strict");
const { Ciphers } = require("./load");

const { brainfuck } = Ciphers;

const HELLO_WORLD =
  "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";

test("runs Hello World", () => {
  assert.equal(brainfuck.run(HELLO_WORLD), "Hello World!\n");
});

test("ignores characters that aren't commands", () => {
  const commented = HELLO_WORLD.split("").join(" x ");
  assert.equal(brainfuck.run(commented), "Hello World!\n");
});

test("reads from input", () => {
  assert.equal(brainfuck.run(",.,.,.", "abc"), "abc");
});

test("reads 0 once input runs out", () => {
  assert.equal(brainfuck.run(",[.,]", "hi"), "hi");
});

test("cells wrap around between 0 and 255", () => {
  assert.equal(brainfuck.run("-" + "-".repeat(190) + "."), "A");
});

test("empty program gives empty output", () => {
  assert.equal(brainfuck.run(""), "");
});

test("rejects unmatched brackets", () => {
  assert.throws(() => brainfuck.run("[+"), /without a matching "\]"/);
  assert.throws(() => brainfuck.run("+]"), /without a matching "\["/);
});

test("stops infinite loops", () => {
  assert.throws(() => brainfuck.run("+[]", "", { maxSteps: 1000 }), /ran too long/);
});

test("rejects moving before the start of the tape", () => {
  assert.throws(() => brainfuck.run("<"), /before the start/);
});

test("encodes text into a program that prints it", () => {
  for (const text of ["Shattered Moon", "Hello World!\n", "a", "~ !", "zA", "Vigenère ☾"]) {
    assert.equal(brainfuck.run(brainfuck.encode(text)), text);
  }
});

test("encoded programs only contain Brainfuck commands", () => {
  assert.match(brainfuck.encode("Shattered Moon"), /^[+\-<>[\].]+$/);
});

test("encoding empty text gives an empty program", () => {
  assert.equal(brainfuck.encode(""), "");
});

test("encoding every byte value round-trips", () => {
  const text = String.fromCharCode(...Array.from({ length: 128 }, (_, i) => i));
  assert.equal(brainfuck.run(brainfuck.encode(text)), text);
});
