(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?";

  function isUnown(ch) {
    return ch.length === 1 && LETTERS.includes(ch.toUpperCase());
  }

  function encode(text) {
    return Array.from(String(text), (ch) =>
      isUnown(ch) ? { letter: ch.toUpperCase() } : { letter: ch, plain: true }
    );
  }

  function decode(glyphs) {
    if (typeof glyphs === "string") return glyphs.toUpperCase();
    return glyphs.map((g) => g.letter).join("");
  }

  Ciphers.unown = { decode, encode, isUnown, LETTERS };
})();
