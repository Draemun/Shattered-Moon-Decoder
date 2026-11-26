(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function toRails(rails) {
    const n = Ciphers.alphabet.toInteger(rails, "The number of rails");
    if (n < 2) throw new Error("There must be at least 2 rails.");
    return n;
  }

  function pattern(length, rails) {
    const result = [];
    let rail = 0;
    let direction = 1;
    for (let i = 0; i < length; i++) {
      result.push(rail);
      if (rail === 0) direction = 1;
      else if (rail === rails - 1) direction = -1;
      rail += direction;
    }
    return result;
  }

  function order(length, rails) {
    const rows = pattern(length, rails);
    const indices = [];
    for (let r = 0; r < rails; r++) {
      rows.forEach((row, i) => {
        if (row === r) indices.push(i);
      });
    }
    return indices;
  }

  function encode(text, rails) {
    const chars = Array.from(String(text));
    return order(chars.length, toRails(rails)).map((i) => chars[i]).join("");
  }

  function decode(text, rails) {
    const chars = Array.from(String(text));
    const output = new Array(chars.length);
    order(chars.length, toRails(rails)).forEach((index, k) => {
      output[index] = chars[k];
    });
    return output.join("");
  }

  function bruteforce(text) {
    const length = Array.from(String(text)).length;
    const max = Math.max(2, Math.min(10, length - 1));
    const results = [];
    for (let rails = 2; rails <= max; rails++) results.push({ rails, text: decode(text, rails) });
    return results;
  }

  Ciphers.railfence = { decode, encode, bruteforce };
})();
