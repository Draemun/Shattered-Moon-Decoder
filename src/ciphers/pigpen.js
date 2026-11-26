(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOW = 4;
  const HIGH = 20;
  const MID = 12;

  const X_SHAPES = [
    { lines: [[LOW, LOW, MID, HIGH], [MID, HIGH, HIGH, LOW]], dot: [MID, LOW + 5] },
    { lines: [[LOW, LOW, HIGH, MID], [HIGH, MID, LOW, HIGH]], dot: [LOW + 5, MID] },
    { lines: [[HIGH, LOW, LOW, MID], [LOW, MID, HIGH, HIGH]], dot: [HIGH - 5, MID] },
    { lines: [[LOW, HIGH, MID, LOW], [MID, LOW, HIGH, HIGH]], dot: [MID, HIGH - 5] },
  ];

  function glyph(letter) {
    const upper = String(letter).toUpperCase();
    const index = LETTERS.indexOf(upper);
    if (upper.length !== 1 || index === -1) return null;

    if (index < 18) {
      const cell = index % 9;
      const row = Math.floor(cell / 3);
      const col = cell % 3;
      const lines = [];
      if (row > 0) lines.push([LOW, LOW, HIGH, LOW]);
      if (row < 2) lines.push([LOW, HIGH, HIGH, HIGH]);
      if (col > 0) lines.push([LOW, LOW, LOW, HIGH]);
      if (col < 2) lines.push([HIGH, LOW, HIGH, HIGH]);
      return { letter: upper, lines, dot: index >= 9 ? [MID, MID] : null };
    }

    const shape = X_SHAPES[(index - 18) % 4];
    return { letter: upper, lines: shape.lines, dot: index >= 22 ? shape.dot : null };
  }

  function encode(text) {
    return Array.from(String(text), (ch) => glyph(ch) || { letter: ch, lines: [], dot: null, plain: true });
  }

  function decode(glyphs) {
    if (typeof glyphs === "string") return glyphs.toUpperCase();
    return glyphs.map((g) => g.letter).join("");
  }

  Ciphers.pigpen = { decode, encode, glyph, LETTERS };
})();
