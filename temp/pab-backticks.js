/* Find unescaped backticks in a JS file that should have been escaped
 * (i.e. inside a template literal body, not a delimiter).
 * Usage: node temp/pab-backticks.js docs/assets/answers.js
 */
const fs = require("fs");
const p = process.argv[2] || "docs/assets/answers.js";
const src = fs.readFileSync(p, "utf8");
const lines = src.split(/\r?\n/);

const isDelim = (s) => {
  const t = s.trim();
  if (t === "`,;") return true;
  if (t === "`," || t === "`;" || t === "`" || t === "`)") return true;
  if (/^'[\d.]+':\s*`$/.test(t)) return true;
  return false;
};

/* Before the first answer key the file is a JS comment block, where bare
 * backticks are legal. Only the answer bodies are template literals. */
let start = lines.findIndex((l) => /^\s*'[\d.]+':/.test(l));
if (start === -1) start = 0;

let bad = 0;
lines.forEach((line, i) => {
  if (i < start) return;
  let idx = line.indexOf("`");
  while (idx !== -1) {
    const precededByBackslash = idx > 0 && line[idx - 1] === "\\";
    if (!precededByBackslash) {
      if (!isDelim(line)) {
        bad++;
        const snippet = line.trim().slice(0, 90);
        console.log(`L${i + 1}: ${snippet}`);
      }
      break;
    }
    const next = line.indexOf("`", idx + 1);
    if (next === -1) break;
    idx = next;
  }
});
console.log(`\n${bad} line(s) with an unescaped backtick that is not a delimiter`);