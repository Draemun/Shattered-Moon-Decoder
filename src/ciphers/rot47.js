(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(text) {
    return Array.from(String(text), (ch) => {
      const code = ch.charCodeAt(0);
      if (ch.length !== 1 || code < 33 || code > 126) return ch;
      return String.fromCharCode(33 + ((code - 33 + 47) % 94));
    }).join("");
  }

  Ciphers.rot47 = { decode, encode: decode };
})();
