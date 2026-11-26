(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(input) {
    const cleaned = String(input)
      .replace(/0x|\\x|%/gi, " ")
      .replace(/[\s,:;-]+/g, " ")
      .trim();
    if (cleaned === "") return "";
    if (/[^0-9a-f ]/i.test(cleaned)) throw new Error("Hex can only contain 0-9, A-F and separators.");

    const groups = cleaned.split(" ");
    let pairs;
    if (groups.length > 1 && groups.every((group) => group.length <= 2)) {
      pairs = groups;
    } else {
      const joined = groups.join("");
      if (joined.length % 2 !== 0) throw new Error("Hex needs an even number of digits.");
      pairs = joined.match(/../g);
    }
    return Ciphers.alphabet.bytesToText(pairs.map((pair) => parseInt(pair, 16)));
  }

  function encode(text) {
    return Array.from(Ciphers.alphabet.textToBytes(text), (byte) => byte.toString(16).padStart(2, "0")).join(" ");
  }

  Ciphers.hex = { decode, encode };
})();
