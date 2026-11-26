(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(text, key) {
    return Ciphers.alphabet.polyShift(text, Ciphers.alphabet.keyShifts(key), -1);
  }

  function encode(text, key) {
    return Ciphers.alphabet.polyShift(text, Ciphers.alphabet.keyShifts(key), 1);
  }

  Ciphers.vigenere = { decode, encode };
})();
