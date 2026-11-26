(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

  function inverse(a) {
    for (let x = 1; x < 26; x++) if ((a * x) % 26 === 1) return x;
    return null;
  }

  function keys(a, b) {
    const { toInteger, mod } = Ciphers.alphabet;
    const multiplier = mod(toInteger(a, "The multiplier (a)"), 26);
    const offset = mod(toInteger(b, "The offset (b)"), 26);
    if (inverse(multiplier) === null) {
      throw new Error("The multiplier (a) must be one of 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23 or 25.");
    }
    return { a: multiplier, b: offset };
  }

  function encode(text, a, b) {
    const k = keys(a, b);
    return Ciphers.alphabet.mapLetters(text, (x) => k.a * x + k.b);
  }

  function decode(text, a, b) {
    const k = keys(a, b);
    const inv = inverse(k.a);
    return Ciphers.alphabet.mapLetters(text, (y) => inv * (y - k.b));
  }

  function bruteforce(text) {
    const results = [];
    for (const a of VALID_A) {
      for (let b = 0; b < 26; b++) results.push({ a, b, text: decode(text, a, b) });
    }
    return results;
  }

  Ciphers.affine = { decode, encode, bruteforce, VALID_A };
})();
