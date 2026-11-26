(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function letterBase(ch) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return 65;
    if (code >= 97 && code <= 122) return 97;
    return null;
  }

  function shiftLetter(ch, shift) {
    const base = letterBase(ch);
    if (base === null) return ch;
    const offset = (((ch.charCodeAt(0) - base + shift) % 26) + 26) % 26;
    return String.fromCharCode(base + offset);
  }

  Ciphers.alphabet = { letterBase, shiftLetter };
})();
