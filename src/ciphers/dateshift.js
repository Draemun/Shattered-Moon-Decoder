(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function dateShifts(date) {
    const digits = String(date).replace(/\D/g, "");
    if (digits === "") throw new Error("The date must contain at least one digit.");
    return Array.from(digits, Number);
  }

  function encode(text, date) {
    return Ciphers.alphabet.polyShift(text, dateShifts(date), 1);
  }

  function decode(text, date) {
    return Ciphers.alphabet.polyShift(text, dateShifts(date), -1);
  }

  Ciphers.dateshift = { decode, encode };
})();
