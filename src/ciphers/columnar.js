(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function columnOrder(key) {
    const chars = Array.from(String(key).toLowerCase()).filter((ch) => /[a-z0-9]/.test(ch));
    if (chars.length < 2) throw new Error("The key must have at least 2 letters or digits.");
    return chars
      .map((ch, index) => ({ ch, index }))
      .sort((a, b) => (a.ch < b.ch ? -1 : a.ch > b.ch ? 1 : a.index - b.index))
      .map((entry) => entry.index);
  }

  function encode(text, key) {
    const order = columnOrder(key);
    const chars = Array.from(String(text));
    return order.map((col) => chars.filter((_, i) => i % order.length === col).join("")).join("");
  }

  function decode(text, key) {
    const order = columnOrder(key);
    const n = order.length;
    const chars = Array.from(String(text));
    const rows = Math.ceil(chars.length / n);
    const fullColumns = chars.length % n || n;
    const columns = new Array(n);
    let position = 0;
    for (const col of order) {
      const length = col < fullColumns ? rows : rows - 1;
      columns[col] = chars.slice(position, position + length);
      position += length;
    }
    let output = "";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < n; c++) if (r < columns[c].length) output += columns[c][r];
    }
    return output;
  }

  Ciphers.columnar = { decode, encode };
})();
