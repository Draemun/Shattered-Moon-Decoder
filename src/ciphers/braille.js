(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const LETTERS = {
    a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑", f: "⠋", g: "⠛", h: "⠓", i: "⠊", j: "⠚",
    k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕", p: "⠏", q: "⠟", r: "⠗", s: "⠎", t: "⠞",
    u: "⠥", v: "⠧", w: "⠺", x: "⠭", y: "⠽", z: "⠵",
  };
  const PUNCTUATION = { ",": "⠂", ";": "⠆", ":": "⠒", ".": "⠲", "!": "⠖", "?": "⠦", "'": "⠄", "-": "⠤" };
  const CAPITAL = "⠠";
  const NUMBER = "⠼";
  const LETTER_SIGN = "⠰";
  const BLANK = "⠀";
  const DIGIT_LETTERS = "jabcdefghi";

  const LETTER_OF = Object.fromEntries(Object.entries(LETTERS).map(([k, v]) => [v, k]));
  const PUNCTUATION_OF = Object.fromEntries(Object.entries(PUNCTUATION).map(([k, v]) => [v, k]));

  function encode(text) {
    let output = "";
    let inNumber = false;
    for (const ch of String(text)) {
      if (ch >= "0" && ch <= "9") {
        if (!inNumber) output += NUMBER;
        inNumber = true;
        output += LETTERS[DIGIT_LETTERS[Number(ch)]];
        continue;
      }
      if (/\s/.test(ch)) {
        inNumber = false;
        output += ch === "\n" ? "\n" : BLANK;
        continue;
      }
      const lower = ch.toLowerCase();
      if (LETTERS[lower]) {
        if (inNumber && DIGIT_LETTERS.includes(lower)) output += LETTER_SIGN;
        inNumber = false;
        if (ch !== lower) output += CAPITAL;
        output += LETTERS[lower];
        continue;
      }
      if (PUNCTUATION[ch]) {
        inNumber = false;
        output += PUNCTUATION[ch];
        continue;
      }
      throw new Error(`"${ch}" has no Braille symbol here.`);
    }
    return output;
  }

  function decode(input) {
    let output = "";
    let capital = false;
    let inNumber = false;
    for (const ch of String(input)) {
      if (ch === BLANK || /\s/.test(ch)) {
        output += ch === BLANK ? " " : ch;
        inNumber = false;
        continue;
      }
      if (ch === CAPITAL) {
        capital = true;
        continue;
      }
      if (ch === NUMBER) {
        inNumber = true;
        continue;
      }
      if (ch === LETTER_SIGN) {
        inNumber = false;
        continue;
      }
      const letter = LETTER_OF[ch];
      if (letter && inNumber && DIGIT_LETTERS.includes(letter)) {
        output += String(DIGIT_LETTERS.indexOf(letter));
        continue;
      }
      if (letter) {
        inNumber = false;
        output += capital ? letter.toUpperCase() : letter;
        capital = false;
        continue;
      }
      if (PUNCTUATION_OF[ch]) {
        inNumber = false;
        output += PUNCTUATION_OF[ch];
        continue;
      }
      throw new Error(`Unknown Braille symbol "${ch}".`);
    }
    return output;
  }

  Ciphers.braille = { decode, encode };
})();
