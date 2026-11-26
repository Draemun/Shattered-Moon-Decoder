(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function letterBase(ch) {
    const code = ch.charCodeAt(0);
    if (ch.length !== 1) return null;
    if (code >= 65 && code <= 90) return 65;
    if (code >= 97 && code <= 122) return 97;
    return null;
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function shiftLetter(ch, shift) {
    const base = letterBase(ch);
    if (base === null) return ch;
    return String.fromCharCode(base + mod(ch.charCodeAt(0) - base + shift, 26));
  }

  function mapLetters(text, fn) {
    return Array.from(String(text), (ch) => {
      const base = letterBase(ch);
      if (base === null) return ch;
      return String.fromCharCode(base + mod(fn(ch.charCodeAt(0) - base), 26));
    }).join("");
  }

  function polyShift(text, shifts, direction) {
    let index = 0;
    return mapLetters(text, (x) => x + shifts[index++ % shifts.length] * direction);
  }

  function keyShifts(key) {
    const shifts = Array.from(String(key).toLowerCase())
      .filter((ch) => ch >= "a" && ch <= "z")
      .map((ch) => ch.charCodeAt(0) - 97);
    if (shifts.length === 0) throw new Error("The key must contain at least one letter.");
    return shifts;
  }

  function toInteger(value, name) {
    const text = typeof value === "string" ? value.trim().replace(/^[−–—]/, "-").replace(/^([+-])\s+/, "$1") : value;
    const n = typeof text === "string" && text === "" ? NaN : Number(text);
    if (!Number.isInteger(n)) throw new Error(`${name} must be a whole number.`);
    return n;
  }

  function textToBytes(text) {
    return new TextEncoder().encode(String(text));
  }

  function bytesToText(bytes) {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  }

  Ciphers.alphabet = {
    letterBase,
    mod,
    shiftLetter,
    mapLetters,
    polyShift,
    keyShifts,
    toInteger,
    textToBytes,
    bytesToText,
  };
})();
