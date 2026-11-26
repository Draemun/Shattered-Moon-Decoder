(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(text, shift) {
    const n = Ciphers.alphabet.toInteger(shift, "The shift");
    return Ciphers.alphabet.mapLetters(text, (x) => x - n);
  }

  function encode(text, shift) {
    return decode(text, -Ciphers.alphabet.toInteger(shift, "The shift"));
  }

  function bruteforce(text) {
    const results = [];
    for (let shift = 1; shift < 26; shift++) {
      results.push({ shift, text: decode(text, shift) });
    }
    return results;
  }

  Ciphers.caesar = { decode, encode, bruteforce };
})();
