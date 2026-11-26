(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const CELLS = Array.from("ABCDEFGHIJLMNOPQRSTUVWXYZ");

  function pairsFromDots(word) {
    if (/[^.\s]/.test(word)) throw new Error("Tap code with dots can only contain dots and spaces.");
    const counts = word.trim().split(/\s+/).map((group) => group.length);
    if (counts.some((n) => n > 5)) throw new Error("Each group of taps must be 1 to 5 dots.");
    if (counts.length % 2 !== 0) throw new Error("Tap code needs pairs of tap groups (row and column).");
    const pairs = [];
    for (let i = 0; i < counts.length; i += 2) pairs.push([counts[i], counts[i + 1]]);
    return pairs;
  }

  function decode(input) {
    return Ciphers.polybius
      .splitWords(input)
      .map((word) => {
        const pairs = word.includes(".") ? pairsFromDots(word) : Ciphers.polybius.digitPairs(word, "Tap code");
        return pairs.map(([row, col]) => CELLS[(row - 1) * 5 + (col - 1)]).join("");
      })
      .join(" ");
  }

  function encode(text, format = "numbers") {
    if (format !== "numbers" && format !== "dots") throw new Error('The format must be "numbers" or "dots".');
    return String(text)
      .toUpperCase()
      .replace(/K/g, "C")
      .split(/\s+/)
      .map((word) =>
        Array.from(word)
          .filter((ch) => CELLS.includes(ch))
          .map((ch) => {
            const index = CELLS.indexOf(ch);
            const row = Math.floor(index / 5) + 1;
            const col = (index % 5) + 1;
            return format === "dots" ? `${".".repeat(row)} ${".".repeat(col)}` : `${row}${col}`;
          })
          .join(format === "dots" ? "   " : " ")
      )
      .filter(Boolean)
      .join(" / ");
  }

  Ciphers.tapcode = { decode, encode };
})();
