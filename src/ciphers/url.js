(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(input) {
    try {
      return decodeURIComponent(String(input).replace(/\+/g, " "));
    } catch {
      throw new Error("That isn't valid URL encoding.");
    }
  }

  function encode(text) {
    return encodeURIComponent(String(text));
  }

  Ciphers.url = { decode, encode };
})();
