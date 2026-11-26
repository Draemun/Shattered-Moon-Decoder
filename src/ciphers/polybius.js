(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const ALPHABET = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

  function square(key = "") {
    const keyLetters = String(key).toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
    return [...new Set(keyLetters + ALPHABET)];
  }

  function splitWords(input) {
    return String(input)
      .trim()
      .split(/\s*\/\s*/)
      .filter((word) => word.trim() !== "");
  }

  function digitPairs(word, name) {
    if (/[^1-5\s,\-]/.test(word)) throw new Error(`${name} can only contain the digits 1-5 and separators.`);
    const digits = word.replace(/[^1-5]/g, "");
    if (digits.length % 2 !== 0) throw new Error(`${name} needs pairs of digits (row and column).`);
    return (digits.match(/../g) || []).map((pair) => [Number(pair[0]), Number(pair[1])]);
  }

  function decode(input, key = "") {
    const cells = square(key);
    return splitWords(input)
      .map((word) => digitPairs(word, "Polybius").map(([row, col]) => cells[(row - 1) * 5 + (col - 1)]).join(""))
      .join(" ");
  }

  function encode(text, key = "") {
    const cells = square(key);
    return String(text)
      .toUpperCase()
      .replace(/J/g, "I")
      .split(/\s+/)
      .map((word) =>
        Array.from(word)
          .filter((ch) => cells.includes(ch))
          .map((ch) => {
            const index = cells.indexOf(ch);
            return `${Math.floor(index / 5) + 1}${(index % 5) + 1}`;
          })
          .join(" ")
      )
      .filter(Boolean)
      .join(" / ");
  }

  Ciphers.polybius = { decode, encode, square, splitWords, digitPairs };
})();
