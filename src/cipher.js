window.Cipher = (function () {
  function shiftChar(ch, shift) {
    const code = ch.charCodeAt(0);
    let base;
    if (code >= 65 && code <= 90) base = 65;
    else if (code >= 97 && code <= 122) base = 97;
    else return ch;
    const offset = ((code - base - shift) % 26 + 26) % 26;
    return String.fromCharCode(base + offset);
  }

  function decode(text, shift) {
    const n = Number(shift);
    return Array.from(text, (ch) => shiftChar(ch, n)).join("");
  }

  function encode(text, shift) {
    return decode(text, -Number(shift));
  }

  function normalize(text) {
    return text.trim().replace(/\s+/g, " ").toLowerCase();
  }

  return { decode, encode, normalize };
})();
