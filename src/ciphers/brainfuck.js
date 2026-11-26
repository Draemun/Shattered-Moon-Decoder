(function () {
  const Ciphers = (globalThis.Ciphers = globalThis.Ciphers || {});

  const TAPE_SIZE = 30000;
  const DEFAULT_MAX_STEPS = 10000000;

  function matchBrackets(code) {
    const jumps = new Array(code.length);
    const stack = [];
    for (let i = 0; i < code.length; i++) {
      if (code[i] === "[") stack.push(i);
      else if (code[i] === "]") {
        if (stack.length === 0) throw new Error('The program has a "]" without a matching "[".');
        const open = stack.pop();
        jumps[open] = i;
        jumps[i] = open;
      }
    }
    if (stack.length > 0) throw new Error('The program has a "[" without a matching "]".');
    return jumps;
  }

  function run(program, input = "", options = {}) {
    const maxSteps = options.maxSteps ?? DEFAULT_MAX_STEPS;
    const code = Array.from(program).filter((ch) => "+-<>[].,".includes(ch));
    const jumps = matchBrackets(code);
    const tape = new Uint8Array(TAPE_SIZE);
    const inputBytes = new TextEncoder().encode(input);
    const output = [];
    let pointer = 0;
    let inputPos = 0;
    let steps = 0;

    for (let ip = 0; ip < code.length; ip++) {
      if (++steps > maxSteps) {
        throw new Error("The program ran too long and was stopped (possible infinite loop).");
      }
      switch (code[ip]) {
        case "+": tape[pointer]++; break;
        case "-": tape[pointer]--; break;
        case ">":
          if (++pointer >= TAPE_SIZE) throw new Error("The program moved past the end of the tape.");
          break;
        case "<":
          if (--pointer < 0) throw new Error("The program moved before the start of the tape.");
          break;
        case ".": output.push(tape[pointer]); break;
        case ",": tape[pointer] = inputPos < inputBytes.length ? inputBytes[inputPos++] : 0; break;
        case "[": if (tape[pointer] === 0) ip = jumps[ip]; break;
        case "]": if (tape[pointer] !== 0) ip = jumps[ip]; break;
      }
    }

    return new TextDecoder().decode(Uint8Array.from(output));
  }

  function change(diff) {
    const amount = Math.abs(diff);
    const sign = diff > 0 ? "+" : "-";
    if (amount <= 15) return sign.repeat(amount);
    const outer = Math.floor(Math.sqrt(amount));
    const inner = Math.floor(amount / outer);
    const rest = amount - outer * inner;
    return ">" + "+".repeat(outer) + "[<" + sign.repeat(inner) + ">-]<" + sign.repeat(rest);
  }

  function encode(text) {
    let current = 0;
    let program = "";
    for (const byte of new TextEncoder().encode(text)) {
      let diff = byte - current;
      if (diff > 128) diff -= 256;
      if (diff < -128) diff += 256;
      program += change(diff) + ".";
      current = byte;
    }
    return program;
  }

  Ciphers.brainfuck = { run, decode: run, encode };
})();
