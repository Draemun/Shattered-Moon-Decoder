(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function toShift(shift) {
    const n = typeof shift === "string" && shift.trim() === "" ? NaN : Number(shift);
    if (!Number.isInteger(n)) throw new Error("The shift must be a whole number.");
    return n;
  }

  function decode(text, shift) {
    const n = toShift(shift);
    return Array.from(text, (ch) => Ciphers.alphabet.shiftLetter(ch, -n)).join("");
  }

  function encode(text, shift) {
    return decode(text, -toShift(shift));
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
