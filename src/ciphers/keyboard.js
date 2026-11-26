(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const ROWS = [
    "`1234567890-=",
    "qwertyuiop[]\\",
    "asdfghjkl;'",
    "zxcvbnm,./",
    "~!@#$%^&*()_+",
    "QWERTYUIOP{}|",
    'ASDFGHJKL:"',
    "ZXCVBNM<>?",
  ];

  function step(direction) {
    if (direction === undefined || direction === "right") return 1;
    if (direction === "left") return -1;
    throw new Error('The direction must be "left" or "right".');
  }

  function shift(text, offset) {
    return Array.from(String(text), (ch) => {
      for (const row of ROWS) {
        const index = row.indexOf(ch);
        if (index !== -1) return row[Ciphers.alphabet.mod(index + offset, row.length)];
      }
      return ch;
    }).join("");
  }

  function encode(text, direction) {
    return shift(text, step(direction));
  }

  function decode(text, direction) {
    return shift(text, -step(direction));
  }

  Ciphers.keyboard = { decode, encode };
})();
