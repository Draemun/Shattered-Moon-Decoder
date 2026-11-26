(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(input) {
    const cleaned = String(input).replace(/0o/gi, " ").trim();
    if (cleaned === "") return "";
    if (/[^0-7\s,;]/.test(cleaned)) throw new Error("Octal can only contain the digits 0-7 and separators.");
    const bytes = cleaned.split(/[\s,;]+/).map((token) => {
      const value = parseInt(token, 8);
      if (value > 255) throw new Error(`"${token}" is bigger than 377 (255).`);
      return value;
    });
    return Ciphers.alphabet.bytesToText(bytes);
  }

  function encode(text) {
    return Array.from(Ciphers.alphabet.textToBytes(text), (byte) => byte.toString(8).padStart(3, "0")).join(" ");
  }

  Ciphers.octal = { decode, encode };
})();
