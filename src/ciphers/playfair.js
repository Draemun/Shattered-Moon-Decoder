(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

  function letters(text) {
    return String(text).toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
  }

  function grid(key) {
    const cells = [...new Set(letters(key) + ALPHABET)];
    const position = {};
    cells.forEach((ch, i) => {
      position[ch] = [Math.floor(i / 5), i % 5];
    });
    return { cells, position };
  }

  function filler(ch) {
    return ch === "X" ? "Q" : "X";
  }

  function encodePairs(text) {
    const pairs = [];
    let i = 0;
    while (i < text.length) {
      const a = text[i];
      const b = text[i + 1];
      if (b === undefined || a === b) {
        pairs.push([a, filler(a)]);
        i += 1;
      } else {
        pairs.push([a, b]);
        i += 2;
      }
    }
    return pairs;
  }

  function transform(pairs, square, direction) {
    const { mod } = Ciphers.alphabet;
    const at = (row, col) => square.cells[mod(row, 5) * 5 + mod(col, 5)];
    return pairs
      .map(([a, b]) => {
        const [ra, ca] = square.position[a];
        const [rb, cb] = square.position[b];
        if (ra === rb) return at(ra, ca + direction) + at(rb, cb + direction);
        if (ca === cb) return at(ra + direction, ca) + at(rb + direction, cb);
        return at(ra, cb) + at(rb, ca);
      })
      .join("");
  }

  function encode(text, key = "") {
    return transform(encodePairs(letters(text)), grid(key), 1);
  }

  function decode(text, key = "") {
    const clean = letters(text);
    if (clean.length % 2 !== 0) throw new Error("Playfair text must have an even number of letters.");
    const pairs = clean.match(/../g) || [];
    return transform(pairs, grid(key), -1);
  }

  Ciphers.playfair = { decode, encode, grid };
})();
