(function () {
  const form = document.getElementById("verify-form");
  const textInput = document.getElementById("verify-text");
  const shiftInput = document.getElementById("verify-shift");
  const result = document.getElementById("verify-result");
  const dialog = document.getElementById("verify-dialog");
  const dialogValue = document.getElementById("verify-dialog-value");
  const copyButton = document.getElementById("verify-copy");
  const copyStatus = document.getElementById("verify-copy-status");

  function show(message, kind) {
    result.textContent = message;
    result.className = "result " + kind;
  }

  function openDialog(value) {
    dialogValue.value = value;
    copyStatus.textContent = "";
    dialog.showModal();
    dialogValue.select();
  }

  async function copy() {
    const value = dialogValue.value;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      dialogValue.select();
      if (!document.execCommand("copy")) {
        copyStatus.textContent = "Couldn't copy automatically. Select the text and copy it manually.";
        return;
      }
    }
    copyStatus.textContent = "Copied! Now paste it in the verification channel.";
  }

  copyButton.addEventListener("click", copy);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = textInput.value.trim();
    const shift = shiftInput.value.trim();

    if (!text) {
      show("Please enter some text to verify.", "warning");
      return;
    }

    let decoded;
    try {
      decoded = Ciphers.caesar.decode(text, shift);
    } catch (error) {
      show(error.message, "warning");
      return;
    }

    const match = Answers.find(decoded);
    if (match) {
      show("", "");
      openDialog(match);
    } else {
      show("Warning: no match. Check the text and the shift and try again.", "warning");
    }
  });
})();
