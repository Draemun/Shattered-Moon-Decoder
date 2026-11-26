(function () {
  const form = document.getElementById("verify-form");
  const textInput = document.getElementById("verify-text");
  const shiftInput = document.getElementById("verify-shift");
  const result = document.getElementById("verify-result");

  function show(message, kind) {
    result.textContent = message;
    result.className = "result " + kind;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = textInput.value;
    const shift = shiftInput.value.trim();

    if (!text.trim()) {
      show("Please enter some text to verify.", "warning");
      return;
    }
    if (shift === "" || !Number.isInteger(Number(shift))) {
      show("The shift must be a whole number.", "warning");
      return;
    }

    const decoded = Cipher.decode(text, shift);
    const target = Cipher.normalize(decoded);
    const match = KnownAnswers.find((answer) => Cipher.normalize(answer) === target);

    if (match) {
      show(`Match! "${text.trim()}" with shift ${shift} decodes to "${match}".`, "success");
    } else {
      show(`Warning: no match. "${text.trim()}" with shift ${shift} decodes to "${decoded.trim()}", which isn't a known answer.`, "warning");
    }
  });
})();
