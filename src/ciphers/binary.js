(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(input) {
    const cleaned = String(input).trim();
    if (cleaned === "") return "";
    if (/[^01\s]/.test(cleaned)) throw new Error("Binary can only contain 0, 1 and spaces.");

    let groups = cleaned.split(/\s+/);
    if (groups.length === 1 && groups[0].length > 8) {
      if (groups[0].length % 8 !== 0) {
        throw new Error("Binary without spaces must be a multiple of 8 bits long.");
      }
      groups = groups[0].match(/.{8}/g);
    }

    const bytes = groups.map((group) => {
      if (group.length > 8) throw new Error(`"${group}" is longer than 8 bits.`);
      return parseInt(group, 2);
    });
    return new TextDecoder().decode(Uint8Array.from(bytes));
  }

  function encode(text) {
    return Array.from(new TextEncoder().encode(text), (byte) => byte.toString(2).padStart(8, "0")).join(" ");
  }

  Ciphers.binary = { decode, encode };
})();
