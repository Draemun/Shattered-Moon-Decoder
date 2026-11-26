(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  function decode(input) {
    const cleaned = String(input).replace(/\s+/g, "");
    if (cleaned === "") return "";
    let value = 0n;
    for (const ch of cleaned) {
      const index = ALPHABET.indexOf(ch);
      if (index === -1) throw new Error(`"${ch}" isn't a Base58 character.`);
      value = value * 58n + BigInt(index);
    }
    const bytes = [];
    while (value > 0n) {
      bytes.unshift(Number(value % 256n));
      value /= 256n;
    }
    const zeros = cleaned.match(/^1*/)[0].length;
    return Ciphers.alphabet.bytesToText([...new Array(zeros).fill(0), ...bytes]);
  }

  function encode(text) {
    const bytes = Ciphers.alphabet.textToBytes(text);
    let zeros = 0;
    while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
    let value = 0n;
    for (const byte of bytes) value = value * 256n + BigInt(byte);
    let output = "";
    while (value > 0n) {
      output = ALPHABET[Number(value % 58n)] + output;
      value /= 58n;
    }
    return "1".repeat(zeros) + output;
  }

  Ciphers.base58 = { decode, encode };
})();
