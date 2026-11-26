(function () {
  const known = [
    "Shattered Moon",
  ];

  function normalize(text) {
    return String(text).trim().replace(/\s+/g, " ").toLowerCase();
  }

  function find(text) {
    const target = normalize(text);
    return known.find((answer) => normalize(answer) === target) || null;
  }

  globalThis.Answers = { known, normalize, find };
})();
