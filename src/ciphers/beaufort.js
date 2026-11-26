(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(text, key) {
    const shifts = Ciphers.alphabet.keyShifts(key);
    let index = 0;
    return Ciphers.alphabet.mapLetters(text, (x) => shifts[index++ % shifts.length] - x);
  }

  Ciphers.beaufort = { decode, encode: decode };
})();
