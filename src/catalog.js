(function () {
  const categories = [
    { id: "substitution", name: "Shift & substitution" },
    { id: "keyed", name: "Keyed ciphers" },
    { id: "transposition", name: "Transposition" },
    { id: "encodings", name: "Numbers & encodings" },
    { id: "codes", name: "Codes & alphabets" },
    { id: "symbols", name: "Symbols" },
  ];

  const ciphers = [
    { id: "magic", name: "Auto-detect", category: null, modes: ["decode"], keywords: ["magic", "auto", "detect", "guess", "unknown", "identify"] },

    { id: "caesar", name: "Caesar", category: "substitution", keywords: ["cesar", "shift", "rot", "rot13", "bruteforce"] },
    { id: "rot47", name: "ROT47", category: "substitution", keywords: ["rot", "symbols"] },
    { id: "atbash", name: "Atbash", category: "substitution", keywords: ["mirror", "backwards alphabet"] },
    { id: "affine", name: "Affine", category: "substitution", keywords: ["multiply", "math"] },
    { id: "keyboard", name: "Keyboard shift", category: "substitution", keywords: ["qwerty", "keys"] },

    { id: "vigenere", name: "Vigenère", category: "keyed", keywords: ["keyword"] },
    { id: "autokey", name: "Autokey", category: "keyed", keywords: ["running key"] },
    { id: "beaufort", name: "Beaufort", category: "keyed", keywords: ["reciprocal"] },
    { id: "dateshift", name: "Date shift", category: "keyed", keywords: ["date", "digits", "calendar"] },
    { id: "playfair", name: "Playfair", category: "keyed", keywords: ["digraph", "grid"] },

    { id: "reverse", name: "Reverse", category: "transposition", keywords: ["backwards", "mirror"] },
    { id: "railfence", name: "Rail fence", category: "transposition", keywords: ["zigzag", "rails"] },
    { id: "columnar", name: "Columnar transposition", category: "transposition", keywords: ["columns"] },

    { id: "binary", name: "Binary", category: "encodings", keywords: ["bits", "bytes", "01"] },
    { id: "hex", name: "Hex", category: "encodings", keywords: ["hexadecimal", "base16"] },
    { id: "decimal", name: "Decimal", category: "encodings", keywords: ["ascii", "numbers", "char codes"] },
    { id: "octal", name: "Octal", category: "encodings", keywords: ["base8"] },
    { id: "base32", name: "Base32", category: "encodings", keywords: ["b32"] },
    { id: "base58", name: "Base58", category: "encodings", keywords: ["b58", "bitcoin"] },
    { id: "base64", name: "Base64", category: "encodings", keywords: ["b64"] },
    { id: "base85", name: "Base85", category: "encodings", keywords: ["b85", "ascii85"] },
    { id: "url", name: "URL encoding", category: "encodings", keywords: ["percent", "uri", "link"] },

    { id: "morse", name: "Morse", category: "codes", keywords: ["dots", "dashes", "telegraph"] },
    { id: "nato", name: "NATO alphabet", category: "codes", keywords: ["phonetic", "alfa", "bravo", "military"] },
    { id: "a1z26", name: "A1Z26", category: "codes", keywords: ["letter numbers", "alphabet position"] },
    { id: "tapcode", name: "Tap code", category: "codes", keywords: ["knock", "prison", "taps"] },
    { id: "polybius", name: "Polybius square", category: "codes", keywords: ["grid", "coordinates"] },
    { id: "bacon", name: "Bacon", category: "codes", keywords: ["baconian", "steganography"] },
    { id: "t9", name: "T9 / Multi-tap", category: "codes", keywords: ["phone", "keypad", "multitap", "sms"] },
    { id: "braille", name: "Braille", category: "codes", keywords: ["dots", "blind"] },
    { id: "brainfuck", name: "Brainfuck", category: "codes", keywords: ["bf", "esoteric", "program"] },

    { id: "pigpen", name: "Pigpen", category: "symbols", keywords: ["masonic", "freemason", "symbols"] },
    { id: "unown", name: "Unown", category: "symbols", keywords: ["pokemon", "pokémon", "glyphs", "symbols"] },
  ].map((cipher) => ({ modes: ["decode", "encode"], ...cipher }));

  const popular = ["magic", "caesar", "vigenere", "base64", "morse", "binary", "atbash", "unown"];

  const modes = [
    { id: "decode", name: "Decode", keywords: ["decoder", "decrypt", "decipher", "solve"] },
    { id: "encode", name: "Encode", keywords: ["encoder", "encrypt", "encipher"] },
  ];

  const pages = [
    { route: "home", title: "Home", keywords: ["start", "main"] },
    { route: "verify", title: "Server Verification", keywords: ["verify", "verification", "server", "check"] },
    ...modes.map((mode) => ({
      route: mode.id,
      title: mode.name,
      subtitle: `All ${mode.name.toLowerCase()}rs`,
      keywords: mode.keywords,
    })),
    ...modes.flatMap((mode) =>
      ciphers
        .filter((cipher) => cipher.modes.includes(mode.id))
        .map((cipher) => ({
          route: `${mode.id}/${cipher.id}`,
          title: `${mode.name}: ${cipher.name}`,
          subtitle: `${cipher.name} ${mode.name.toLowerCase()}r`,
          keywords: [...cipher.keywords, ...mode.keywords],
        }))
    ),
  ];

  function cipher(id) {
    return ciphers.find((c) => c.id === id) || null;
  }

  function menu(mode) {
    const available = ciphers.filter((c) => c.modes.includes(mode));
    return {
      top: available.filter((c) => c.category === null),
      popular: popular.map(cipher).filter((c) => c && c.modes.includes(mode)),
      groups: categories
        .map((category) => ({ ...category, ciphers: available.filter((c) => c.category === category.id) }))
        .filter((group) => group.ciphers.length > 0),
    };
  }

  globalThis.Catalog = { categories, ciphers, modes, pages, cipher, menu };
})();
