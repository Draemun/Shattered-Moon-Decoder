(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function keyShifts(key) {
    const shifts = Array.from(String(key).toLowerCase())
      .filter((ch) => ch >= "a" && ch <= "z")
      .map((ch) => ch.charCodeAt(0) - 97);
    if (shifts.length === 0) throw new Error("The key must contain at least one letter.");
    return shifts;
  }

  function transform(text, key, direction) {
    const shifts = keyShifts(key);
    let index = 0;
    return Array.from(text, (ch) => {
      if (Ciphers.alphabet.letterBase(ch) === null) return ch;
      const shift = shifts[index++ % shifts.length] * direction;
      return Ciphers.alphabet.shiftLetter(ch, shift);
    }).join("");
  }

  function decode(text, key) {
    return transform(text, key, -1);
  }

  function encode(text, key) {
    return transform(text, key, 1);
  }

  Ciphers.vigenere = { decode, encode };
})();
