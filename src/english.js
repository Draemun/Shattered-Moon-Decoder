(function () {
  const FREQUENCIES = [
    8.2, 1.5, 2.8, 4.3, 12.7, 2.2, 2.0, 6.1, 7.0, 0.15, 0.77, 4.0, 2.4,
    6.7, 7.5, 1.9, 0.095, 6.0, 6.3, 9.1, 2.8, 0.98, 2.4, 0.15, 2.0, 0.074,
  ];

  const COMMON_WORDS = new Set(
    (
      "the be to of and a in that have i it for not on with he as you do at this but his by from they we " +
      "say her she or an will my one all would there their what so up out if about who get which go me when " +
      "make can like time no just him know take people into year your good some could them see other than " +
      "then now look only come its over think also back after use two how our work first well way even new " +
      "want because any these give day most us is are was were has had been hello world moon secret message " +
      "code meet here where find key night dark light shattered star stars sky"
    ).split(" ")
  );

  function score(text) {
    const chars = Array.from(String(text));
    if (chars.length === 0) return -Infinity;

    let printable = 0;
    let letters = 0;
    const counts = new Array(26).fill(0);
    for (const ch of chars) {
      const code = ch.charCodeAt(0);
      if ((ch.length === 1 && code >= 32 && code < 127) || ch === "\n") printable++;
      const lower = ch.toLowerCase();
      if (lower.length === 1 && lower >= "a" && lower <= "z") {
        letters++;
        counts[lower.charCodeAt(0) - 97]++;
      }
    }

    let chi = 0;
    if (letters > 0) {
      for (let i = 0; i < 26; i++) {
        const expected = (FREQUENCIES[i] / 100) * letters;
        chi += (counts[i] - expected) ** 2 / expected;
      }
    }
    const chiPerLetter = letters > 0 ? Math.min(chi / letters, 10) : 10;

    const tokens = String(text).toLowerCase().match(/[a-z']+/g) || [];
    const hits = tokens.filter((token) => COMMON_WORDS.has(token)).length;
    const wordRatio = tokens.length > 0 ? hits / tokens.length : 0;

    const spaces = chars.filter((ch) => ch === " ").length;
    const spaceRatio = spaces / chars.length;
    const spaceBonus = spaceRatio > 0.08 && spaceRatio < 0.3 ? 0.5 : 0;

    return (
      3 * (printable / chars.length) +
      2 * (letters / chars.length) +
      6 * wordRatio +
      spaceBonus -
      0.6 * chiPerLetter
    );
  }

  globalThis.English = { score };
})();
