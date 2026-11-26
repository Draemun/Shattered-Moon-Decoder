(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(text, mode = "text") {
    const value = String(text);
    if (mode === "text") return Array.from(value).reverse().join("");
    if (mode === "words") {
      return value
        .split(/(\s+)/)
        .map((part) => (/^\s+$/.test(part) ? part : Array.from(part).reverse().join("")))
        .join("");
    }
    if (mode === "order") return value.split(/(\s+)/).reverse().join("");
    throw new Error('The mode must be "text", "words" or "order".');
  }

  Ciphers.reverse = { decode, encode: decode };
})();
