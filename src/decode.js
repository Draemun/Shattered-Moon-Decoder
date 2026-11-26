(function () {
  const form = document.getElementById("decode-form");
  const textInput = document.getElementById("decode-text");
  const shiftInput = document.getElementById("decode-shift");
  const result = document.getElementById("decode-result");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const shift = shiftInput.value.trim();
    if (shift === "" || !Number.isInteger(Number(shift))) {
      result.textContent = "The shift must be a whole number.";
      result.className = "result warning";
      return;
    }

    result.textContent = Cipher.decode(textInput.value, shift);
    result.className = "result success";
  });
})();
