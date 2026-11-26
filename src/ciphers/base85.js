(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function pushGroup(output, digits, count) {
    let value = 0;
    for (const digit of digits) value = value * 85 + digit;
    if (value > 0xffffffff) throw new Error("That isn't valid Base85.");
    const bytes = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
    output.push(...bytes.slice(0, count));
  }

  function decode(input) {
    let cleaned = String(input).replace(/\s+/g, "");
    if (cleaned.startsWith("<~")) cleaned = cleaned.slice(2);
    if (cleaned.endsWith("~>")) cleaned = cleaned.slice(0, -2);
    if (cleaned === "") return "";
    if (/[^!-uz]/.test(cleaned)) throw new Error("That isn't valid Base85.");

    const output = [];
    let group = [];
    for (const ch of cleaned) {
      if (ch === "z") {
        if (group.length > 0) throw new Error('"z" can only appear between groups of 5.');
        output.push(0, 0, 0, 0);
        continue;
      }
      group.push(ch.charCodeAt(0) - 33);
      if (group.length === 5) {
        pushGroup(output, group, 4);
        group = [];
      }
    }
    if (group.length === 1) throw new Error("That isn't valid Base85 (wrong length).");
    if (group.length > 0) {
      const missing = 5 - group.length;
      pushGroup(output, [...group, ...new Array(missing).fill(84)], 4 - missing);
    }
    return Ciphers.alphabet.bytesToText(output);
  }

  function encode(text) {
    const bytes = Ciphers.alphabet.textToBytes(text);
    let output = "";
    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = Array.from(bytes.slice(i, i + 4));
      const missing = 4 - chunk.length;
      const full = [...chunk, ...new Array(missing).fill(0)];
      let value = full[0] * 16777216 + full[1] * 65536 + full[2] * 256 + full[3];
      if (value === 0 && missing === 0) {
        output += "z";
        continue;
      }
      const chars = [];
      for (let j = 0; j < 5; j++) {
        chars.unshift(String.fromCharCode(33 + (value % 85)));
        value = Math.floor(value / 85);
      }
      output += chars.join("").slice(0, 5 - missing);
    }
    return output;
  }

  Ciphers.base85 = { decode, encode };
})();
