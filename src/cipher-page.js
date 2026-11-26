(function () {
  const form = document.getElementById("cipher-form");
  const title = document.getElementById("cipher-title");
  const textInput = document.getElementById("cipher-text");
  const textLabel = document.getElementById("cipher-text-label");
  const shiftInput = document.getElementById("cipher-shift");
  const shiftLabel = document.getElementById("cipher-shift-label");
  const keyInput = document.getElementById("cipher-key");
  const programInput = document.getElementById("cipher-program-input");
  const submitButton = document.getElementById("cipher-submit");
  const result = document.getElementById("cipher-result");

  function caesarMode() {
    return form.querySelector('input[name="caesar-mode"]:checked').value;
  }

  function requireShift() {
    const shift = shiftInput.value.trim();
    if (shift === "") throw new Error("Enter a shift.");
    return shift;
  }

  const methods = {
    caesar: {
      name: "Caesar",
      decode: {
        label: "Encoded text",
        fields: ["caesar-mode", "shift"],
        run: (text) =>
          caesarMode() === "bruteforce"
            ? { list: Ciphers.caesar.bruteforce(text) }
            : Ciphers.caesar.decode(text, requireShift()),
      },
      encode: {
        label: "Text",
        fields: ["shift"],
        run: (text) => Ciphers.caesar.encode(text, requireShift()),
      },
    },
    vigenere: {
      name: "Vigenère",
      decode: { label: "Encoded text", fields: ["key"], run: (text) => Ciphers.vigenere.decode(text, keyInput.value) },
      encode: { label: "Text", fields: ["key"], run: (text) => Ciphers.vigenere.encode(text, keyInput.value) },
    },
    brainfuck: {
      name: "Brainfuck",
      decode: {
        label: "Brainfuck program",
        fields: ["program-input"],
        run: (text) => Ciphers.brainfuck.run(text, programInput.value),
      },
      encode: { label: "Text", fields: [], run: (text) => Ciphers.brainfuck.encode(text) },
    },
    binary: {
      name: "Binary",
      decode: { label: "Binary", fields: [], run: (text) => Ciphers.binary.decode(text) },
      encode: { label: "Text", fields: [], run: (text) => Ciphers.binary.encode(text) },
    },
    morse: {
      name: "Morse",
      decode: { label: "Morse code", fields: [], run: (text) => Ciphers.morse.decode(text) },
      encode: { label: "Text", fields: [], run: (text) => Ciphers.morse.encode(text) },
    },
    base64: {
      name: "Base64",
      decode: { label: "Base64", fields: [], run: (text) => Ciphers.base64.decode(text) },
      encode: { label: "Text", fields: [], run: (text) => Ciphers.base64.encode(text) },
    },
  };

  let current = null;

  function clearResult() {
    result.replaceChildren();
    result.className = "result";
  }

  function showText(message, kind) {
    result.replaceChildren();
    result.textContent = message;
    result.className = "result " + kind;
  }

  function showBruteforce(rows) {
    const list = document.createElement("ul");
    list.className = "bruteforce";
    rows.forEach(({ shift, text }) => {
      const item = document.createElement("li");
      item.textContent = `Shift ${shift}: ${text}`;
      if (Answers.find(text)) {
        item.classList.add("match");
        item.textContent += "  ✓ known answer";
      }
      list.append(item);
    });
    result.replaceChildren(list);
    result.className = "result";
  }

  function updateFields() {
    if (!current) return;
    const fields = current.config.fields;
    form.querySelectorAll("[data-field]").forEach((el) => {
      let visible = fields.includes(el.dataset.field);
      if (el.dataset.field === "shift" && fields.includes("caesar-mode")) {
        visible = caesarMode() === "specific";
      }
      el.hidden = !visible;
    });
    shiftInput.required = !shiftInput.closest("[data-field]").hidden;
    keyInput.required = fields.includes("key");
  }

  function open(mode, method) {
    const entry = methods[method];
    if (!entry || !entry[mode]) return false;
    current = { mode, method, config: entry[mode] };

    const verb = mode === "decode" ? "Decode" : "Encode";
    title.textContent = `${verb}: ${entry.name}`;
    textLabel.textContent = current.config.label;
    shiftLabel.textContent = mode === "decode" ? "Decoding shift" : "Encoding shift";
    submitButton.textContent = verb;

    updateFields();
    clearResult();
    return true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!current) return;
    try {
      const output = current.config.run(textInput.value);
      if (output && output.list) showBruteforce(output.list);
      else if (output === "") showText("The result is empty.", "warning");
      else showText(output, "success");
    } catch (error) {
      showText(error.message, "warning");
    }
  });

  form.querySelectorAll('input[name="caesar-mode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      updateFields();
      clearResult();
    });
  });

  globalThis.CipherPage = { open, methods };
})();
