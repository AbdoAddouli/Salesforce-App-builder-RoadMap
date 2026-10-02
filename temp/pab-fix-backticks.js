/* Escape unescaped backticks inside EXERCISE_ANSWERS template-literal bodies.
 *
 * The answers are Markdown in JS template literals, so every inline-code
 * backtick must be \`-escaped or the file will not parse. This fixes them in
 * place, leaving real delimiters and the file header comment alone.
 *
 * Usage: node temp/pab-fix-backticks.js docs/assets/answers.js
 */
const fs = require("fs");

const p = process.argv[2] || "docs/assets/answers.js";
const src = fs.readFileSync(p, "utf8");
const eol = src.includes("\r\n") ? "\r\n" : "\n";
const lines = src.split(/\r?\n/);

const isDelim = (s) => {
  const t = s.trim();
  if (t === "`,;" || t === "`," || t === "`;" || t === "`" || t === "`)") return true;
  if (/^'[\d.]+':\s*`$/.test(t)) return true;
  if (/^\/\*[^*]*\*\/$/.test(t)) return true;
  return false;
};

/* Everything before the first answer key is header + the object opening, where
 * bare backticks are legal JS comments. Only rewrite from the first key on. */
let start = lines.findIndex((l) => /^\s*'[\d.]+':/.test(l));
if (start === -1) {
  console.log("no answer keys found; nothing to do");
  process.exit(0);
}

let fixedLines = 0;
let fixedTicks = 0;
for (let i = start; i < lines.length; i++) {
  const line = lines[i];
  if (isDelim(line)) continue;
  if (!line.includes("`")) continue;
  let out = "";
  let changed = false;
  for (let c = 0; c < line.length; c++) {
    if (line[c] === "`" && (c === 0 || line[c - 1] !== "\\")) {
      out += "\\`";
      changed = true;
      fixedTicks++;
    } else {
      out += line[c];
    }
  }
  if (changed) {
    lines[i] = out;
    fixedLines++;
  }
}

fs.writeFileSync(p, lines.join(eol), "utf8");
console.log(`escaped ${fixedTicks} backtick(s) across ${fixedLines} line(s) from line ${start + 1}`);