(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const KEYLESS = [
    "base64", "base32", "base58", "base85", "hex", "binary", "decimal", "octal", "url",
    "morse", "nato", "a1z26", "tapcode", "polybius", "bacon", "t9", "braille",
    "atbash", "rot47", "reverse",
  ];

  function nameOf(id) {
    const entry = globalThis.Catalog && globalThis.Catalog.cipher(id);
    return entry ? entry.name : id;
  }

  function candidates(text) {
    const results = [];
    const add = (method, label, run) => {
      try {
        const output = run();
        if (typeof output === "string" && output.trim() !== "" && output !== text) {
          results.push({ method, label, text: output });
        }
      } catch {
        return;
      }
    };

    for (const id of KEYLESS) add(id, nameOf(id), () => Ciphers[id].decode(text));

    if (/^[\s+\-<>[\].,]+$/.test(text) && text.includes(".")) {
      add("brainfuck", nameOf("brainfuck"), () => Ciphers.brainfuck.run(text, "", { maxSteps: 200000 }));
    }

    for (const { shift, text: output } of Ciphers.caesar.bruteforce(text)) {
      add("caesar", `${nameOf("caesar")} (shift ${shift})`, () => output);
    }

    for (const { a, b, text: output } of Ciphers.affine.bruteforce(text)) {
      if (a !== 1) add("affine", `${nameOf("affine")} (a = ${a}, b = ${b})`, () => output);
    }

    for (const { rails, text: output } of Ciphers.railfence.bruteforce(text)) {
      add("railfence", `${nameOf("railfence")} (${rails} rails)`, () => output);
    }

    return results;
  }

  function detect(text, options = {}) {
    const input = String(text);
    if (input.trim() === "") return [];
    const isKnown = options.isKnown || (() => false);
    const limit = options.limit || 10;
    const seen = new Set();

    return candidates(input)
      .map((candidate) => ({
        ...candidate,
        known: Boolean(isKnown(candidate.text)),
        score: globalThis.English.score(candidate.text),
      }))
      .sort((a, b) => Number(b.known) - Number(a.known) || b.score - a.score)
      .filter((candidate) => {
        const key = candidate.text.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  }

  function decode(text) {
    const best = detect(text, { limit: 1 })[0];
    return best ? best.text : "";
  }

  Ciphers.magic = { decode, detect, candidates };
})();
