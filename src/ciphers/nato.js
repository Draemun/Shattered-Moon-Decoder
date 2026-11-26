(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const LETTERS = [
    "Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India",
    "Juliett", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa", "Quebec", "Romeo",
    "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "X-ray", "Yankee", "Zulu",
  ];
  const DIGITS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

  const WORDS = {};
  LETTERS.forEach((word, i) => {
    WORDS[word.toLowerCase().replace(/[^a-z]/g, "")] = String.fromCharCode(65 + i);
  });
  DIGITS.forEach((word, i) => {
    WORDS[word.toLowerCase()] = String(i);
  });
  Object.assign(WORDS, { alpha: "A", juliet: "J", whisky: "W", fower: "4", fife: "5", niner: "9" });

  function decode(input) {
    const cleaned = String(input).trim();
    if (cleaned === "") return "";
    return cleaned
      .split(/\s*\/\s*|\s*\(space\)\s*/i)
      .filter((word) => word.trim() !== "")
      .map((word) =>
        word
          .trim()
          .split(/[\s,]+/)
          .map((token) => {
            const key = token.toLowerCase().replace(/[^a-z]/g, "");
            if (!(key in WORDS)) throw new Error(`"${token}" isn't a NATO alphabet word.`);
            return WORDS[key];
          })
          .join("")
      )
      .join(" ");
  }

  function encode(text) {
    return String(text)
      .toUpperCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        Array.from(word)
          .map((ch) => {
            if (ch >= "A" && ch <= "Z") return LETTERS[ch.charCodeAt(0) - 65];
            if (ch >= "0" && ch <= "9") return DIGITS[Number(ch)];
            throw new Error(`"${ch}" has no NATO alphabet word.`);
          })
          .join(" ")
      )
      .join(" / ");
  }

  Ciphers.nato = { decode, encode };
})();
