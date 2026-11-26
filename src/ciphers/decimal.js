(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(input) {
    const cleaned = String(input).trim();
    if (cleaned === "") return "";
    if (/[^0-9\s,;]/.test(cleaned)) throw new Error("Decimal can only contain numbers separated by spaces or commas.");
    const bytes = cleaned.split(/[\s,;]+/).map((token) => {
      const value = Number(token);
      if (value > 255) throw new Error(`"${token}" is bigger than 255.`);
      return value;
    });
    return Ciphers.alphabet.bytesToText(bytes);
  }

  function encode(text) {
    return Array.from(Ciphers.alphabet.textToBytes(text)).join(" ");
  }

  Ciphers.decimal = { decode, encode };
})();
