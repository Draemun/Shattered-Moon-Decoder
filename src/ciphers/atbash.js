(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(text) {
    return Ciphers.alphabet.mapLetters(text, (x) => 25 - x);
  }

  Ciphers.atbash = { decode, encode: decode };
})();
