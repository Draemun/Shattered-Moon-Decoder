(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const ALPHABETS = {
    26: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    24: "ABCDEFGHIKLMNOPQRSTUWXYZ",
  };

  function alphabet(variant = "26") {
    const letters = ALPHABETS[variant];
    if (!letters) throw new Error('The variant must be "26" or "24".');
    return letters;
  }

  function normalizeLetter(ch, variant) {
    if (String(variant) === "24") {
      if (ch === "J") return "I";
      if (ch === "V") return "U";
    }
    return ch;
  }

  function codeFor(index) {
    return index.toString(2).padStart(5, "0").replace(/0/g, "A").replace(/1/g, "B");
  }

  function lettersFrom(symbols, letters) {
    let output = "";
    for (let i = 0; i + 5 <= symbols.length; i += 5) {
      const group = symbols.slice(i, i + 5);
      const index = parseInt(group.replace(/A/g, "0").replace(/B/g, "1"), 2);
      if (index >= letters.length) throw new Error(`"${group}" isn't a Bacon letter.`);
      output += letters[index];
    }
    return output;
  }

  function decode(input, variant = "26", source = "ab") {
    const letters = alphabet(variant);
    const text = String(input);

    if (source === "case") {
      const symbols = Array.from(text)
        .filter((ch) => Ciphers.alphabet.letterBase(ch) !== null)
        .map((ch) => (ch === ch.toLowerCase() ? "A" : "B"))
        .join("");
      return lettersFrom(symbols, letters);
    }
    if (source !== "ab") throw new Error('The source must be "ab" or "case".');

    return text
      .trim()
      .split(/\s*\/\s*/)
      .filter((word) => word.trim() !== "")
      .map((word) => {
        if (/[^ab01\s]/i.test(word)) throw new Error("Bacon can only contain A and B (or 0 and 1).");
        const symbols = word.toUpperCase().replace(/0/g, "A").replace(/1/g, "B").replace(/[^AB]/g, "");
        if (symbols.length % 5 !== 0) throw new Error("Bacon needs groups of 5 A/B letters.");
        return lettersFrom(symbols, letters);
      })
      .join(" ");
  }

  function encode(text, variant = "26") {
    const letters = alphabet(variant);
    return String(text)
      .toUpperCase()
      .split(/\s+/)
      .map((word) =>
        Array.from(word)
          .map((ch) => normalizeLetter(ch, variant))
          .filter((ch) => letters.includes(ch))
          .map((ch) => codeFor(letters.indexOf(ch)))
          .join(" ")
      )
      .filter(Boolean)
      .join(" / ");
  }

  Ciphers.bacon = { decode, encode };
})();
