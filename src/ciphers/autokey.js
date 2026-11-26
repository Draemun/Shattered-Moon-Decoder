(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function encode(text, key) {
    const stream = Ciphers.alphabet.keyShifts(key);
    let index = 0;
    return Ciphers.alphabet.mapLetters(text, (x) => {
      const shift = stream[index++];
      stream.push(x);
      return x + shift;
    });
  }

  function decode(text, key) {
    const stream = Ciphers.alphabet.keyShifts(key);
    let index = 0;
    return Ciphers.alphabet.mapLetters(text, (y) => {
      const plain = Ciphers.alphabet.mod(y - stream[index++], 26);
      stream.push(plain);
      return plain;
    });
  }

  Ciphers.autokey = { decode, encode };
})();
