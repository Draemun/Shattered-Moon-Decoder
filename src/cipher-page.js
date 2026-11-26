(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const form = document.getElementById("cipher-form");
  const title = document.getElementById("cipher-title");
  const optionsBox = document.getElementById("cipher-options");
  const textField = document.getElementById("cipher-text-field");
  const textInput = document.getElementById("cipher-text");
  const textLabel = document.getElementById("cipher-text-label");
  const submitButton = document.getElementById("cipher-submit");
  const result = document.getElementById("cipher-result");
  const output = document.getElementById("cipher-output");
  const kicker = document.getElementById("cipher-kicker");
  const optionsSection = document.getElementById("cipher-options-section");
  const optionsLabel = document.getElementById("cipher-options-label");
  const chartSection = document.getElementById("cipher-chart-section");
  const chart = document.getElementById("cipher-chart");
  const back = document.getElementById("cipher-back");

  const integer = (id, label) => ({ id, label, type: "integer" });
  const text = (id, label, extra = {}) => ({ id, label, type: "text", ...extra });
  const choice = (id, label, choices) => ({ id, label, type: "choice", choices });
  const whenKnown = (option) => ({ ...option, when: { mode: "specific" } });
  const howToDecode = choice("mode", "How do you want to decode it?", [
    ["bruteforce", "Bruteforce (try every option)"],
    ["specific", "I know the key"],
  ]);

  const list = (rows, extra = {}) => ({ list: rows, ...extra });

  const methods = {
    magic: {
      decode: {
        run: (t) => ({ magic: Ciphers.magic.detect(t, { isKnown: Answers.find }) }),
      },
    },

    caesar: {
      decode: {
        options: [howToDecode, whenKnown(integer("shift", "Decoding shift"))],
        run: (t, v) =>
          v.mode === "bruteforce"
            ? list(Ciphers.caesar.bruteforce(t).map((r) => ({ label: `Shift ${r.shift}`, text: r.text })), { best: true })
            : Ciphers.caesar.decode(t, v.shift),
      },
      encode: { options: [integer("shift", "Encoding shift")], run: (t, v) => Ciphers.caesar.encode(t, v.shift) },
    },
    rot47: {
      decode: { run: (t) => Ciphers.rot47.decode(t) },
      encode: { run: (t) => Ciphers.rot47.encode(t) },
    },
    atbash: {
      decode: { run: (t) => Ciphers.atbash.decode(t) },
      encode: { run: (t) => Ciphers.atbash.encode(t) },
    },
    affine: {
      decode: {
        options: [howToDecode, whenKnown(integer("a", "Multiplier (a)")), whenKnown(integer("b", "Offset (b)"))],
        run: (t, v) =>
          v.mode === "bruteforce"
            ? list(Ciphers.affine.bruteforce(t).map((r) => ({ label: `a = ${r.a}, b = ${r.b}`, text: r.text })), { rank: true, limit: 20 })
            : Ciphers.affine.decode(t, v.a, v.b),
      },
      encode: {
        options: [integer("a", "Multiplier (a)"), integer("b", "Offset (b)")],
        run: (t, v) => Ciphers.affine.encode(t, v.a, v.b),
      },
    },
    keyboard: {
      decode: {
        options: [choice("direction", "Which way was it shifted?", [["right", "One key to the right"], ["left", "One key to the left"]])],
        run: (t, v) => Ciphers.keyboard.decode(t, v.direction),
      },
      encode: {
        options: [choice("direction", "Which way should it shift?", [["right", "One key to the right"], ["left", "One key to the left"]])],
        run: (t, v) => Ciphers.keyboard.encode(t, v.direction),
      },
    },

    vigenere: {
      decode: { options: [text("key", "Key")], run: (t, v) => Ciphers.vigenere.decode(t, v.key) },
      encode: { options: [text("key", "Key")], run: (t, v) => Ciphers.vigenere.encode(t, v.key) },
    },
    autokey: {
      decode: { options: [text("key", "Key")], run: (t, v) => Ciphers.autokey.decode(t, v.key) },
      encode: { options: [text("key", "Key")], run: (t, v) => Ciphers.autokey.encode(t, v.key) },
    },
    beaufort: {
      decode: { options: [text("key", "Key")], run: (t, v) => Ciphers.beaufort.decode(t, v.key) },
      encode: { options: [text("key", "Key")], run: (t, v) => Ciphers.beaufort.encode(t, v.key) },
    },
    dateshift: {
      decode: {
        options: [text("date", "Date (each digit is one shift)")],
        run: (t, v) => Ciphers.dateshift.decode(t, v.date),
      },
      encode: {
        options: [text("date", "Date (each digit is one shift)")],
        run: (t, v) => Ciphers.dateshift.encode(t, v.date),
      },
    },
    playfair: {
      decode: {
        options: [text("key", "Key", { optional: true })],
        run: (t, v) => Ciphers.playfair.decode(t, v.key),
      },
      encode: { options: [text("key", "Key", { optional: true })], run: (t, v) => Ciphers.playfair.encode(t, v.key) },
    },

    reverse: {
      decode: {
        options: [choice("mode", "What should be reversed?", [["text", "The whole text"], ["words", "Each word"], ["order", "The word order"]])],
        run: (t, v) => Ciphers.reverse.decode(t, v.mode),
      },
      encode: {
        options: [choice("mode", "What should be reversed?", [["text", "The whole text"], ["words", "Each word"], ["order", "The word order"]])],
        run: (t, v) => Ciphers.reverse.encode(t, v.mode),
      },
    },
    railfence: {
      decode: {
        options: [howToDecode, whenKnown(integer("rails", "Number of rails"))],
        run: (t, v) =>
          v.mode === "bruteforce"
            ? list(Ciphers.railfence.bruteforce(t).map((r) => ({ label: `${r.rails} rails`, text: r.text })), { best: true })
            : Ciphers.railfence.decode(t, v.rails),
      },
      encode: { options: [integer("rails", "Number of rails")], run: (t, v) => Ciphers.railfence.encode(t, v.rails) },
    },
    columnar: {
      decode: { options: [text("key", "Key")], run: (t, v) => Ciphers.columnar.decode(t, v.key) },
      encode: { options: [text("key", "Key")], run: (t, v) => Ciphers.columnar.encode(t, v.key) },
    },

    binary: { decode: { label: "Binary", run: (t) => Ciphers.binary.decode(t) }, encode: { run: (t) => Ciphers.binary.encode(t) } },
    hex: { decode: { label: "Hex", run: (t) => Ciphers.hex.decode(t) }, encode: { run: (t) => Ciphers.hex.encode(t) } },
    decimal: { decode: { label: "Decimal numbers", run: (t) => Ciphers.decimal.decode(t) }, encode: { run: (t) => Ciphers.decimal.encode(t) } },
    octal: { decode: { label: "Octal numbers", run: (t) => Ciphers.octal.decode(t) }, encode: { run: (t) => Ciphers.octal.encode(t) } },
    base32: { decode: { label: "Base32", run: (t) => Ciphers.base32.decode(t) }, encode: { run: (t) => Ciphers.base32.encode(t) } },
    base58: { decode: { label: "Base58", run: (t) => Ciphers.base58.decode(t) }, encode: { run: (t) => Ciphers.base58.encode(t) } },
    base64: { decode: { label: "Base64", run: (t) => Ciphers.base64.decode(t) }, encode: { run: (t) => Ciphers.base64.encode(t) } },
    base85: { decode: { label: "Base85", run: (t) => Ciphers.base85.decode(t) }, encode: { run: (t) => Ciphers.base85.encode(t) } },
    url: { decode: { label: "URL-encoded text", run: (t) => Ciphers.url.decode(t) }, encode: { run: (t) => Ciphers.url.encode(t) } },

    morse: { decode: { label: "Morse code", run: (t) => Ciphers.morse.decode(t) }, encode: { run: (t) => Ciphers.morse.encode(t) } },
    nato: { decode: { label: "NATO words", run: (t) => Ciphers.nato.decode(t) }, encode: { run: (t) => Ciphers.nato.encode(t) } },
    a1z26: { decode: { label: "Numbers", run: (t) => Ciphers.a1z26.decode(t) }, encode: { run: (t) => Ciphers.a1z26.encode(t) } },
    tapcode: {
      decode: { label: 'Tap code ("23 15" or ".. ...")', run: (t) => Ciphers.tapcode.decode(t) },
      encode: {
        options: [choice("format", "Output format", [["numbers", "Numbers (23 15)"], ["dots", "Taps (.. ...)"]])],
        run: (t, v) => Ciphers.tapcode.encode(t, v.format),
      },
    },
    polybius: {
      decode: { label: "Coordinates", options: [text("key", "Key", { optional: true })], run: (t, v) => Ciphers.polybius.decode(t, v.key) },
      encode: { options: [text("key", "Key", { optional: true })], run: (t, v) => Ciphers.polybius.encode(t, v.key) },
    },
    bacon: {
      decode: {
        options: [
          choice("source", "Where is the message?", [["ab", "A and B letters"], ["case", "Hidden in letter case (lower = A, upper = B)"]]),
          choice("variant", "Alphabet", [["26", "26 letters"], ["24", "24 letters (I=J, U=V)"]]),
        ],
        run: (t, v) => Ciphers.bacon.decode(t, v.variant, v.source),
      },
      encode: {
        options: [choice("variant", "Alphabet", [["26", "26 letters"], ["24", "24 letters (I=J, U=V)"]])],
        run: (t, v) => Ciphers.bacon.encode(t, v.variant),
      },
    },
    t9: {
      decode: { label: 'Key presses ("44 444" = HI, 0 = space)', run: (t) => Ciphers.t9.decode(t) },
      encode: { run: (t) => Ciphers.t9.encode(t) },
    },
    braille: { decode: { label: "Braille", run: (t) => Ciphers.braille.decode(t) }, encode: { run: (t) => Ciphers.braille.encode(t) } },
    brainfuck: {
      decode: {
        label: "Brainfuck program",
        options: [text("input", "Program input", { optional: true })],
        run: (t, v) => Ciphers.brainfuck.run(t, v.input),
      },
      encode: { run: (t) => Ciphers.brainfuck.encode(t) },
    },

    pigpen: {
      decode: { picker: "pigpen" },
      encode: { run: (t) => ({ glyphs: Ciphers.pigpen.encode(t), kind: "pigpen" }) },
    },
    unown: {
      decode: { picker: "unown" },
      encode: {
        run: (t) => ({ glyphs: Ciphers.unown.encode(t), kind: "unown" }),
      },
    },
  };

  let current = null;
  let pickerText = "";

  function clearResult() {
    result.replaceChildren();
    result.className = "result";
    output.hidden = true;
  }

  function showResult(content, kind = "") {
    result.replaceChildren(content);
    result.className = kind ? "result " + kind : "result";
    output.hidden = false;
  }

  function showText(message, kind) {
    showResult(message, kind);
  }

  function showList(output) {
    let rows = output.list.map((row) => ({ ...row, score: English.score(row.text), known: Boolean(Answers.find(row.text)) }));
    if (rows.length === 0) {
      showText("Nothing readable came out. Try a specific cipher instead.", "warning");
      return;
    }
    if (output.rank) rows.sort((a, b) => Number(b.known) - Number(a.known) || b.score - a.score);
    if (output.limit) rows = rows.slice(0, output.limit);

    let top = -1;
    if (output.rank) top = 0;
    else if (output.best) {
      const known = rows.findIndex((row) => row.known);
      top = known !== -1 ? known : rows.reduce((best, row, i) => (row.score > rows[best].score ? i : best), 0);
    }
    showResult(resultRows(rows, top));
  }

  function resultRows(rows, top) {
    const listEl = document.createElement("ul");
    listEl.className = "bruteforce";
    rows.forEach((row, index) => {
      const item = document.createElement("li");
      if (index === top) item.classList.add("top");
      const label = document.createElement(row.href ? "a" : "span");
      label.className = "bruteforce-label";
      label.textContent = row.label;
      if (row.href) label.href = row.href;
      const value = document.createElement("span");
      value.className = "bruteforce-text";
      value.textContent = row.text;
      item.append(label, value);
      if (row.known) {
        const mark = document.createElement("span");
        mark.className = "known-mark";
        mark.textContent = "✓";
        mark.title = "Matches a known answer";
        mark.setAttribute("aria-label", "Matches a known answer");
        item.append(mark);
      }
      listEl.append(item);
    });
    return listEl;
  }

  function glyphSvg(glyph, size = 40) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("class", "glyph");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", glyph.letter);
    glyph.lines.forEach(([x1, y1, x2, y2]) => {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      svg.append(line);
    });
    if (glyph.dot) {
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", glyph.dot[0]);
      dot.setAttribute("cy", glyph.dot[1]);
      dot.setAttribute("r", "1.8");
      svg.append(dot);
    }
    return svg;
  }

  function symbol(letter, kind, size) {
    if (kind === "pigpen") return glyphSvg(Ciphers.pigpen.glyph(letter), size);
    const el = document.createElement("span");
    el.className = "unown-glyph";
    el.style.fontSize = `${size}px`;
    el.textContent = letter;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", letter);
    return el;
  }

  function showGlyphs(glyphs, kind) {
    const row = document.createElement("div");
    row.className = "glyph-row";
    glyphs.forEach((glyph) => {
      if (!glyph.plain) row.append(symbol(glyph.letter, kind, 40));
      else if (/\s/.test(glyph.letter)) row.append(Object.assign(document.createElement("span"), { className: "glyph-gap" }));
      else row.append(Object.assign(document.createElement("span"), { className: "glyph-plain", textContent: glyph.letter }));
    });
    showResult(row);
  }

  function showMagic(candidates) {
    if (candidates.length === 0) {
      showText("Nothing readable found. Try picking a cipher yourself.", "warning");
      return;
    }
    const rows = candidates.map((candidate) => ({
      label: candidate.label,
      href: `#decode/${candidate.method}`,
      text: candidate.text,
      known: candidate.known,
    }));
    showResult(resultRows(rows, 0));
  }

  function renderChart(kind) {
    chart.replaceChildren();
    chartSection.hidden = !kind;
    chartSection.open = false;
    if (!kind) return;
    for (const letter of Ciphers[kind].LETTERS) {
      const cell = document.createElement("div");
      cell.className = "glyph-chart-cell";
      cell.append(symbol(letter, kind, 30), Object.assign(document.createElement("span"), { textContent: letter }));
      chart.append(cell);
    }
  }

  function renderPickerOutput() {
    if (pickerText === "") showText("Click symbols to start.", "");
    else showText(pickerText, "success");
  }

  function renderPicker(kind) {
    const keyboard = document.createElement("div");
    keyboard.className = `glyph-keyboard ${kind}-keyboard`;
    for (const letter of Ciphers[kind].LETTERS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "glyph-key";
      button.setAttribute("aria-label", `Symbol for ${letter}`);
      button.append(symbol(letter, kind, 32), Object.assign(document.createElement("span"), { className: "glyph-key-letter", textContent: letter }));
      button.addEventListener("click", () => {
        pickerText += letter;
        renderPickerOutput();
      });
      keyboard.append(button);
    }
    const controls = document.createElement("div");
    controls.className = "glyph-controls";
    [
      ["Space", () => (pickerText += " ")],
      ["Backspace", () => (pickerText = pickerText.slice(0, -1))],
      ["Clear", () => (pickerText = "")],
    ].forEach(([label, action]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        action();
        renderPickerOutput();
      });
      controls.append(button);
    });
    optionsBox.append(keyboard, controls);
    pickerText = "";
    renderPickerOutput();
  }

  function renderOptions(config) {
    optionsBox.replaceChildren();
    for (const option of config.options || []) {
      const wrapper = document.createElement("div");
      wrapper.className = "option";
      wrapper.dataset.option = option.id;

      if (option.type === "choice") {
        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = option.label;
        fieldset.append(legend);
        option.choices.forEach(([value, label], index) => {
          const labelEl = document.createElement("label");
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = `option-${option.id}`;
          radio.value = value;
          radio.checked = index === 0;
          radio.addEventListener("change", () => {
            updateVisibility();
            clearResult();
          });
          labelEl.append(radio, " " + label);
          fieldset.append(labelEl);
        });
        wrapper.append(fieldset);
      } else {
        const label = document.createElement("label");
        label.htmlFor = `option-${option.id}`;
        label.textContent = option.optional ? `${option.label} (optional)` : option.label;
        const input = document.createElement("input");
        input.id = `option-${option.id}`;
        input.type = "text";
        input.autocomplete = "off";
        input.spellcheck = false;
        wrapper.append(label, input);
      }
      optionsBox.append(wrapper);
    }
    if (config.picker) renderPicker(config.picker);
    updateVisibility();
  }

  function values() {
    const collected = {};
    for (const option of current.config.options || []) {
      if (option.type === "choice") {
        const checked = optionsBox.querySelector(`input[name="option-${option.id}"]:checked`);
        collected[option.id] = checked ? checked.value : undefined;
      } else {
        collected[option.id] = optionsBox.querySelector(`#option-${option.id}`).value;
      }
    }
    return collected;
  }

  function updateVisibility() {
    const currentValues = values();
    for (const option of current.config.options || []) {
      const wrapper = optionsBox.querySelector(`[data-option="${option.id}"]`);
      const visible = !option.when || Object.entries(option.when).every(([key, value]) => currentValues[key] === value);
      wrapper.hidden = !visible;
      const input = wrapper.querySelector('input[type="text"]');
      if (input) input.required = visible && !option.optional;
    }
  }

  function open(mode, method) {
    const entry = Catalog.cipher(method);
    const config = methods[method] && methods[method][mode];
    if (!entry || !config || !entry.modes.includes(mode)) return false;
    current = { mode, method, config };

    const verb = mode === "decode" ? "Decode" : "Encode";
    const category = Nav.categoryName(entry);
    title.textContent = entry.name;
    kicker.textContent = category === entry.name ? verb : `${verb} · ${category}`;
    textLabel.textContent = config.label || (mode === "decode" ? "Encoded text" : "Text");
    submitButton.textContent = verb;

    const usesPicker = Boolean(config.picker);
    textField.hidden = usesPicker;
    textInput.required = !usesPicker;
    submitButton.hidden = usesPicker;
    optionsSection.hidden = !usesPicker && (config.options || []).length === 0;
    optionsLabel.textContent = usesPicker ? "Symbols" : "Options";
    renderChart(entry.category === "symbols" && mode === "encode" ? method : null);
    back.href = `#${mode}`;
    back.textContent = `‹ Back to ${verb}`;

    clearResult();
    renderOptions(config);
    return true;
  }


  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!current || !current.config.run) return;
    try {
      const output = current.config.run(textInput.value, values());
      if (output && output.list) showList(output);
      else if (output && output.glyphs) showGlyphs(output.glyphs, output.kind);
      else if (output && output.magic) showMagic(output.magic);
      else if (output === "") showText("The result is empty.", "warning");
      else showText(output, "success");
    } catch (error) {
      showText(error.message, "warning");
    }
  });

  globalThis.CipherPage = { open, methods };
})();
