(function () {
  const ciphers = [
    { id: "caesar", name: "Caesar", keywords: ["cesar", "shift", "rot", "rot13", "bruteforce"] },
    { id: "vigenere", name: "Vigenère", keywords: ["vigenere", "key", "keyword"] },
    { id: "brainfuck", name: "Brainfuck", keywords: ["bf", "esoteric", "program"] },
    { id: "binary", name: "Binary", keywords: ["bits", "bytes", "01"] },
    { id: "morse", name: "Morse", keywords: ["dots", "dashes", "telegraph"] },
    { id: "base64", name: "Base64", keywords: ["b64", "base"] },
  ];

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
      ciphers.map((cipher) => ({
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

  globalThis.Catalog = { ciphers, modes, pages, cipher };
})();
