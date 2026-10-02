#!/usr/bin/env node
/* Regression harness for scripts/check-site-data.js.
 *
 * Each case mutates a COPY of curriculum.js, runs the real checker against that
 * copy via --curriculum, and asserts the checker rejects it. A case that the
 * checker does NOT catch is a hole in the authoring safety net, so this prints
 * the diff-relevant exit code for every case and fails loudly at the end.
 *
 *   node temp/pab-checker-regress.js
 */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CHECKER = path.join(ROOT, "scripts", "check-site-data.js");
const REAL_CURR = path.join(ROOT, "docs", "assets", "curriculum.js");
const REAL_ANS = path.join(ROOT, "docs", "assets", "answers.js");

const src = fs.readFileSync(REAL_CURR, "utf8");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pab-regress-"));

function run(curriculumText, answersText) {
  const c = path.join(tmp, "curriculum.js");
  const a = path.join(tmp, "answers.js");
  fs.writeFileSync(c, curriculumText, "utf8");
  fs.writeFileSync(a, answersText, "utf8");
  let code = 0, out = "";
  try {
    out = execFileSync(process.execPath, [CHECKER, "--curriculum", c, "--answers", a], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (e) {
    code = e.status === undefined ? 99 : e.status;
    out = (e.stdout || "") + (e.stderr || "");
  }
  const first = (out.match(/^\s*x (.+)$/m) || [])[1] || "";
  return { code, first: first.trim() };
}

/* Every case must (a) actually change the source, and (b) be rejected. */
const CASES = [
  ["block type renderer cannot draw", s => s.replace("{ t: 'h', x: 'Object, record, field' }", "{ t: 'h2', x: 'Object, record, field' }")],
  ["quiz answer index out of range", s => s.replace("          a: 1,\n          why: 'It is new DATA", "          a: 99,\n          why: 'It is new DATA")],
  ["duplicate exercise id", s => s.replace("id: '1.2',", "id: '1.1',")],
  ["table row cell-count mismatch", s => s.replace("['Tab', 'The UI doorway to an object. A tab is NOT a data container.', 'the Accounts tab'],", "['Tab', 'The UI doorway to an object.',],")],
  ["ex missing verify", s => s.replace(/verify: 'A = page layout[\s\S]*?computing a value\)\.'/, "verify: ''")],
  ["proj missing success", s => s.replace(/success: 'You have a one-page plan[\s\S]*?Phases 2-17\.'/, "success: ''")],
  ["ex missing obj", s => s.replace("obj: 'Ground the object/record/field vocabulary in a live UI before building anything.'", "obj: ''")],
  ["list with non-array items", s => s.replace("{ t: 'list', items: [", "{ t: 'list', items: 'oops', junk: [")],
  ["code block missing lang", s => s.replace("            lang: 'xml',", "            missingLang: 'xml',")],
  ["selfcheck missing answer", s => s.replace(/a: 'Neither\. It is a custom FIELD[\s\S]*?already has one\.[\s\S]*?custom field vs custom object\) is a common exam trap\.'/, "a: ''")],
  ["module n out of sequence", s => s.replace("    n: 1,\n    title: 'Salesforce Fundamentals'", "    n: 4,\n    title: 'Salesforce Fundamentals'")],
  ["unknown exam domain", s => s.replace("exam: 'fund',", "exam: 'nope',")],
  ["colour not hex", s => s.replace("color: '#0EA5E9',", "color: 'skyblue',")],
  ["empty objectives", s => s.replace(/objectives: \[[\s\S]*?\],\n    lessons:/, "objectives: [],\n    lessons:")],
  ["missing renderer-contract 'art'", s => s.replace(/\n    art: \[\],/, "")],
  ["'art' not an array", s => s.replace("art: [],", "art: 'none',")],
  ["multi-select with a single index", s => s.replace("          a: [0, 1],", "          a: [0],")],
  ["orphan answer in answers.js", (_c, a) => [null, a.replace("'1.1': `", "'9.9': `")]],
  ["missing why explanation", s => s.replace(/why: 'A tab is the UI doorway[\s\S]*?under an object\)\.'/, "why: ''")],
];

let holes = 0, noops = 0;
for (const [name, mutate] of CASES) {
  const next = mutate(src, fs.readFileSync(REAL_ANS, "utf8"));
  const curText = Array.isArray(next) ? next[0] : next;
  const ansText = Array.isArray(next) ? next[1] : fs.readFileSync(REAL_ANS, "utf8");
  if (curText === null) {
    /* orphan-answer case mutates answers.js only */
    const r = run(src, ansText);
    report(name, r, src !== ansText || true);
    continue;
  }
  if (curText === src) { noops++; console.log(`  NO-OP  ${name}  <-- mutation did not match the source`); continue; }
  report(name, run(curText, ansText), true);
}
function report(name, r, changed) {
  const caught = r.code === 1 && r.first;
  if (!caught) holes++;
  const verdict = caught ? "caught " : "HOLE   ";
  console.log(`  ${verdict} ${name.padEnd(34)} exit=${r.code}  ${r.first.slice(0, 96)}`);
}

console.log(`\ncontrol: unmodified curriculum must PASS`);
const ctrl = run(src, fs.readFileSync(REAL_ANS, "utf8"));
console.log(`  exit=${ctrl.code} ${ctrl.code === 0 ? "OK" : "UNEXPECTED FAILURE: " + ctrl.first}`);

console.log(`\n${CASES.length} mutation cases, ${holes} hole(s), ${noops} no-op mutation(s)`);
if (ctrl.code !== 0 || holes || noops) process.exit(1);
console.log("checker regression suite: all green");