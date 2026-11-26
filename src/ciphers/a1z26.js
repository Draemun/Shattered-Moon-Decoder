(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(input) {
    const cleaned = String(input).trim();
    if (cleaned === "") return "";
    if (/[^0-9\s,.\-\/]/.test(cleaned)) {
      throw new Error('A1Z26 can only contain numbers separated by spaces, dashes, commas or "/".');
    }
    const words = cleaned.includes("-") ? cleaned.split(/\s*\/\s*|\s+/) : cleaned.split(/\s*\/\s*|\s{2,}/);
    return words
      .filter((word) => word !== "")
      .map((word) =>
        word
          .split(/[\s,.\-]+/)
          .filter(Boolean)
          .map((token) => {
            const value = Number(token);
            if (!Number.isInteger(value) || value < 1 || value > 26) {
              throw new Error(`"${token}" isn't a letter number (1-26).`);
            }
            return String.fromCharCode(64 + value);
          })
          .join("")
      )
      .join(" ");
  }

  function encode(text) {
    return String(text)
      .toUpperCase()
      .split(/\s+/)
      .map((word) =>
        Array.from(word)
          .filter((ch) => ch >= "A" && ch <= "Z")
          .map((ch) => ch.charCodeAt(0) - 64)
          .join("-")
      )
      .filter(Boolean)
      .join(" ");
  }

  Ciphers.a1z26 = { decode, encode };
})();
