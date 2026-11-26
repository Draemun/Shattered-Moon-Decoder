(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const KEYS = { 2: "ABC", 3: "DEF", 4: "GHI", 5: "JKL", 6: "MNO", 7: "PQRS", 8: "TUV", 9: "WXYZ" };

  function decode(input) {
    const cleaned = String(input).trim();
    if (cleaned === "") return "";
    return cleaned
      .split(/[\s,]+/)
      .map((token) => {
        if (token === "/" || /^0+$/.test(token)) return " ".repeat(token === "/" ? 1 : token.length);
        if (!/^(\d)\1*$/.test(token)) {
          throw new Error(`"${token}" should repeat one key, like 44 for H.`);
        }
        const letters = KEYS[token[0]];
        if (!letters) throw new Error(`Key ${token[0]} has no letters.`);
        return letters[(token.length - 1) % letters.length];
      })
      .join("");
  }

  function encode(text) {
    return Array.from(String(text).toUpperCase().trim())
      .map((ch) => {
        if (/\s/.test(ch)) return "0";
        for (const [key, letters] of Object.entries(KEYS)) {
          const index = letters.indexOf(ch);
          if (index !== -1) return key.repeat(index + 1);
        }
        throw new Error(`"${ch}" isn't on a phone keypad.`);
      })
      .join(" ");
  }

  Ciphers.t9 = { decode, encode };
})();
