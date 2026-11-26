(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const TO_MORSE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..",
    0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
    5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
    ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
    '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
  };

  const FROM_MORSE = Object.fromEntries(Object.entries(TO_MORSE).map(([ch, code]) => [code, ch]));

  function decode(input) {
    const cleaned = String(input)
      .replace(/[·•]/g, ".")
      .replace(/[_−–—]/g, "-")
      .trim();
    if (cleaned === "") return "";
    if (/[^.\-\/\s]/.test(cleaned)) {
      throw new Error('Morse code can only contain dots, dashes, spaces and "/" between words.');
    }

    return cleaned
      .split(/\s*\/\s*|\s{3,}/)
      .filter((word) => word !== "")
      .map((word) =>
        word.split(/\s+/).map((code) => {
          if (!(code in FROM_MORSE)) throw new Error(`Unknown Morse code: "${code}".`);
          return FROM_MORSE[code];
        }).join("")
      )
      .join(" ");
  }

  function encode(text) {
    return String(text)
      .toUpperCase()
      .trim()
      .split(/\s+/)
      .map((word) =>
        Array.from(word).map((ch) => {
          if (!(ch in TO_MORSE)) throw new Error(`"${ch}" has no Morse code.`);
          return TO_MORSE[ch];
        }).join(" ")
      )
      .join(" / ");
  }

  Ciphers.morse = { decode, encode };
})();
