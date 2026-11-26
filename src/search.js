(function () {
  function normalize(text) {
    return String(text)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  function words(text) {
    return normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
  }

  function distance(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const d = Array.from({ length: rows }, (_, i) => [i, ...new Array(cols - 1).fill(0)]);
    for (let j = 0; j < cols; j++) d[0][j] = j;
    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }

  function allowedTypos(token) {
    if (token.length >= 7) return 2;
    if (token.length >= 4) return 1;
    return 0;
  }

  function tokenScore(token, terms) {
    let best = Infinity;
    for (const term of terms) {
      if (term === token) return 0;
      if (term.startsWith(token)) best = Math.min(best, 0.5);
      const typos = allowedTypos(token);
      if (typos > 0) {
        const d = Math.min(distance(token, term), distance(token, term.slice(0, token.length)) + 0.5);
        if (d <= typos) best = Math.min(best, d);
      }
    }
    return best;
  }

  function buildIndex(pages) {
    return pages.map((page, order) => ({
      ...page,
      order,
      terms: [...new Set([...words(page.title), ...(page.keywords || []).flatMap(words)])],
    }));
  }

  function search(index, query) {
    const tokens = words(query);
    if (tokens.length === 0) return [];
    const results = [];
    for (const entry of index) {
      let score = 0;
      for (const token of tokens) {
        const s = tokenScore(token, entry.terms);
        if (s === Infinity) {
          score = Infinity;
          break;
        }
        score += s;
      }
      if (score !== Infinity) results.push({ entry, score });
    }
    const hasExact = results.some(({ score }) => score < 1);
    return results
      .filter(({ score }) => !hasExact || score < 1)
      .sort((a, b) => a.score - b.score || a.entry.order - b.entry.order)
      .map(({ entry }) => entry);
  }

  globalThis.Search = { normalize, words, distance, buildIndex, search };
})();
