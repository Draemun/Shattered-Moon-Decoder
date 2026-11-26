(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  function decode(input) {
    let cleaned = String(input).replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
    if (cleaned === "") return "";
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) throw new Error("That isn't valid Base64.");

    cleaned = cleaned.replace(/=+$/, "");
    if (cleaned.length % 4 === 1) throw new Error("That isn't valid Base64 (wrong length).");
    cleaned += "=".repeat((4 - (cleaned.length % 4)) % 4);

    const binary = atob(cleaned);
    return new TextDecoder().decode(Uint8Array.from(binary, (ch) => ch.charCodeAt(0)));
  }

  function encode(text) {
    let binary = "";
    new TextEncoder().encode(text).forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  Ciphers.base64 = { decode, encode };
})();
