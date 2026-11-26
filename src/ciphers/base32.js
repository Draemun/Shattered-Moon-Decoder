(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  function decode(input) {
    const cleaned = String(input).replace(/\s+/g, "").toUpperCase().replace(/=+$/, "");
    if (cleaned === "") return "";
    if (/[^A-Z2-7]/.test(cleaned)) throw new Error("That isn't valid Base32.");
    if ([1, 3, 6].includes(cleaned.length % 8)) throw new Error("That isn't valid Base32 (wrong length).");

    const bytes = [];
    let value = 0;
    let bits = 0;
    for (const ch of cleaned) {
      value = (value << 5) | ALPHABET.indexOf(ch);
      bits += 5;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((value >>> bits) & 255);
        value &= (1 << bits) - 1;
      }
    }
    return Ciphers.alphabet.bytesToText(bytes);
  }

  function encode(text) {
    let output = "";
    let value = 0;
    let bits = 0;
    for (const byte of Ciphers.alphabet.textToBytes(text)) {
      value = (value << 8) | byte;
      bits += 8;
      while (bits >= 5) {
        bits -= 5;
        output += ALPHABET[(value >>> bits) & 31];
      }
      value &= (1 << bits) - 1;
    }
    if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
    return output + "=".repeat((8 - (output.length % 8)) % 8);
  }

  Ciphers.base32 = { decode, encode };
})();
