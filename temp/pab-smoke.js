#!/usr/bin/env node
/* Phase 01 smoke test: drives the REAL site in jsdom and asserts the pages the
 * learner actually visits render, and that nothing throws.
 *
 * This catches the class of bug static checks cannot: a template literal that
 * references an undefined helper, a hash route that renders the wrong view, a
 * quiz that cannot be graded, a mock exam that crashes on finish.
 *
 *   node temp/pab-smoke.js
 */
"use strict";
const fs = require("fs");
const path = require("path");
const JSDOM_DIR =
  process.env.JSDOM_DIR ||
  path.join("C:", "Users", "addou", "AppData", "Local", "Temp", "opencode", "jsdom-test", "node_modules", "jsdom");
const { JSDOM, VirtualConsole } = require(path.resolve(JSDOM_DIR));

const ROOT = path.resolve(__dirname, "..");
const A = path.join(ROOT, "docs", "assets");

const errors = [];
const checks0 = [];
/* Surface anything the page logs or throws. Without this, jsdom swallows
 * exceptions raised inside click handlers and the suite reports green pages
 * that are actually broken. */
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push("uncaught: " + ((e.stack || e.message) + "").split("\n").slice(0, 3).join(" | ")));
vc.on("error", (...a) => errors.push("console.error: " + a.map(String).join(" ")));

const html = fs.readFileSync(path.join(ROOT, "docs", "index.html"), "utf8");
const dom = new JSDOM(html, {
  runScripts: "outside-only",
  url: "https://example.test/",
  pretendToBeVisual: true,
  virtualConsole: vc
});
const w = dom.window;

/* jsdom implements neither of these; app.js legitimately calls both. Stub them so
 * a "not implemented" message is not mistaken for a real app defect. */
w.scrollTo = () => {};
w.confetti = w.confetti || (() => {});

/* app.js reads localStorage for progress. jsdom has it, but make failures loud
 * rather than silent, since a throwing storage shim would look like a data bug. */
try {
  w.localStorage.getItem("pab-academy-v1");
} catch (e) {
  errors.push("localStorage unusable: " + e.message);
}

/* Boot the app the way index.html does: curriculum.js, then answers.js, then
 * app.js, sharing ONE scope so the top-level `const ACADEMY` from curriculum.js
 * is visible to app.js. Neither w.eval() per file (separate scopes) nor
 * separate <script> elements work under jsdom, because app.js's `const`
 * declarations are lexical to the script that parsed them - a separate call
 * cannot see them. Concatenating into a single function body reproduces the
 * browser's shared-top-level-const behaviour faithfully.
 *
 * NOTE: top-level `const` is still NOT visible as a property of `window`, so
 * these bindings must be reached through w.eval() inside the same context,
 * never as w.MODULES.
 */
/* The three files are concatenated so their top-level `const` bindings share ONE
 * scope, the way they do in the browser where all three are separate <script>
 * elements at global scope. That is why the probe has to be APPENDED to the same
 * concatenated body rather than run afterwards: these bindings are lexical to
 * that function and are invisible to any later w.eval() call.
 *
 * The probe runs at the END, so MODULES is fully initialised by then. */
let booted = false;
try {
  const files = ["curriculum.js", "answers.js", "app.js"];
  const src =
    files.map((f) => fs.readFileSync(path.join(A, f), "utf8")).join("\n;\n") +
    "\n;globalThis.__pabProbe = { modules: MODULES.length," +
    " ids: MODULES.map((m) => m.id), n: MODULES.map((m) => m.n), " +
    " quizzes: MODULES.map((m) => (m.quiz && m.quiz.questions ? m.quiz.questions.length : 0)), " +
    " exIds: MODULES.map((m) => m.exerciseIds), " +
    " quiz: MODULES[0].quiz.questions.length, ex: MODULES[0].exerciseIds.length };";
  new w.Function(src)();
  booted = true;
} catch (e) {
  errors.push("app boot threw: " + e.message + "\n" + e.stack);
}
const probe = booted ? w.__pabProbe : null;
if (probe) checks0.push(probe.modules, probe.quiz, probe.ex, probe.ids, probe.n, probe.quizzes, probe.exIds);
else errors.push("boot probe produced no result");



const checks = [];
const ok = (name, cond, detail) => checks.push({ name, pass: !!cond, detail: detail || "" });

/* The roadmap grows a module at a time, so assert invariants rather than a frozen
 * module count: sequential numbering, unique ids, every phase a full quiz and
 * every phase carrying at least one exercise. */
const ids = checks0[3] || [];
const nums = checks0[4] || [];
const quizzes = checks0[5] || [];
const exIds = checks0[6] || [];
ok("app booted with curriculum loaded", checks0[0] === ids.length, "modules=" + checks0[0]);
ok("phase numbering is sequential from 1", nums.every((v, i) => v === i + 1), "n=" + nums.join(","));
ok("module ids are unique", new Set(ids).size === ids.length, ids.join(","));
ok("every phase has at least 6 quiz questions", quizzes.every((q) => q >= 6), "quiz=" + quizzes.join(","));
ok("every phase has at least one exercise", exIds.every((e) => e.length > 0), "ex=" + exIds.map((e) => e.length).join(","));
ok("phase 01 quiz has 6 questions", checks0[1] === 6, "quiz=" + checks0[1]);
ok("phase 01 exercise ids derived", checks0[2] === 3, "ex=" + checks0[2]);

/* The app's router is a module-scope `route` variable, not a global function,
 * so drive it exactly the way a real user does: set location.hash and fire the
 * hashchange event the app listens for. Guessing an internal function name
 * would test nothing. */
function route(hash) {
  try {
    w.location.hash = hash;
    w.dispatchEvent(new w.Event("hashchange"));
  } catch (e) {
    errors.push(`route ${hash} threw: ${e.message}`);
  }
  return w.document.querySelector("#view") || w.document.body;
}

/* ---- home / dashboard ---- */
let v = route("#/");
ok("home renders", /Platform App Builder/i.test(v.textContent), v.textContent.slice(0, 60).replace(/\s+/g, " "));
ok("phase 01 listed", /Salesforce Fundamentals/.test(v.textContent));
ok("home hero present", !!v.querySelector(".home-hero"));
ok("home shows a phase card linking to phase 01",
   !!v.querySelector('a[href="#/phase/fundamentals"]') || !!v.querySelector('a[href="#/module/fundamentals"]'));

/* ---- module / lessons ---- */
v = route("#/phase/fundamentals");
ok("module page renders", /Salesforce Fundamentals/.test(v.textContent));
ok("module shows the exam section it serves", /Exam section/i.test(v.textContent));
ok("module objectives listed", !!v.querySelector(".ph-obj"));
ok("module links to the full guide", !!v.querySelector('a[href="#/guide/fundamentals"]'));
ok("module lists lesson rows", v.querySelectorAll(".lessons a, .lesson-row").length >= 4,
   String(v.querySelectorAll(".lessons a, .lesson-row").length));

for (let i = 0; i < 4; i++) {
  v = route(`#/lesson/fundamentals/${i}`);
  const h = v.querySelector("h1");
  ok(`lesson ${i} renders h1`, !!h && h.textContent.trim().length > 0, h ? h.textContent : "(no h1)");
  ok(`lesson ${i} has blocks`, v.querySelectorAll(".blocks > *").length > 0,
     String(v.querySelectorAll(".blocks > *").length));
  ok(`lesson ${i} no raw markdown leakage`, !/\{\{ t:|\}\s*$/.test(v.innerHTML));
}

/* exercise cards + rating + answer reveal */
v = route("#/lesson/fundamentals/2");
ok("exercise card rendered", v.querySelectorAll(".ex-card").length > 0,
   String(v.querySelectorAll(".ex-card").length));
ok("exercise has data-ex-id", !!v.querySelector(".ex-card[data-ex-id]"));
ok("rating buttons present", v.querySelectorAll(".rate-btn").length > 0);
ok("answer reveal present", !!v.querySelector("details.ex-answer"));

/* ---- quiz: pick the right option, expect grading ---- */
v = route("#/quiz/fundamentals");
ok("quiz renders", v.querySelectorAll(".q-item").length > 0, String(v.querySelectorAll(".q-item").length));
const q1 = v.querySelector(".q-item");
ok("quiz item has options", q1 && q1.querySelectorAll(".q-opt").length >= 2,
   q1 ? String(q1.querySelectorAll(".q-opt").length) : "no .q-item; view=" + v.innerHTML.slice(0, 160));
ok("quiz has submit/save button", !!v.querySelector("#saveScore"));

/* ---- mock exam: full run including finish ---- */
v = route("#/mock");
ok("mock intro renders", /mock exam/i.test(v.textContent));
const goBtn = v.querySelector("#mockGo");
ok("mock start button exists", !!goBtn);
if (goBtn) {
  goBtn.click();
  const bar = w.document.querySelector("#mockTimer");
  ok("mock run screen renders", !!bar, bar ? bar.textContent : "(no timer)");
  const qc = w.document.querySelector(".mock-qcard");
  ok("mock question card renders", !!qc);
  if (qc) {
    ok("mock shows a question count", /Q \d+ of \d+/.test(w.document.body.textContent));
    const opt = w.document.querySelector(".mock-qcard .q-opt");
    if (opt) {
      opt.click();
      ok("mock accepts an answer", w.document.querySelectorAll(".mock-dot.answered").length > 0);
    }
    const next = w.document.querySelector("#mockNext");
    if (next) {
      next.click();
      ok("mock advances", !!w.document.querySelector(".mock-qcard"));
      // finish the whole paper to exercise mockFinish(), which used to throw
      for (let g = 0; g < 200; g++) {
        const n = w.document.querySelector("#mockNext");
        if (!n) break;
        n.click();
      }
      ok("mock result screen renders", /result|score|Passed|Failed/i.test(w.document.body.textContent),
         w.document.body.textContent.slice(0, 80).replace(/\s+/g, " "));
    }
  }
}

/* ---- scorecard / domain pages ---- */
v = route("#/scorecard");
ok("scorecard renders", v.textContent.length > 0);
v = route("#/domain/fund");
ok("domain page renders", /Fundamentals/i.test(v.textContent));

/* ---- search returns a real match and not every exercise ---- */
route("#/");
const sb = w.document.querySelector("#searchRes");
const input = w.document.querySelector("#globalQ");
if (input) {
  input.value = "record type";
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
  const hits = sb ? sb.querySelectorAll("a, .sr").length : 0;
  ok("search finds matches for 'record type'", hits > 0, String(hits));
  input.value = "zzzznotpresentzzzz";
  input.dispatchEvent(new w.Event("input", { bubbles: true }));
  const missText = sb ? sb.textContent : "";
  ok("search returns nothing for a nonsense query", !/1\.1|1\.2|1\.3/.test(missText),
     missText.slice(0, 80).replace(/\s+/g, " "));
}

/* ---------------------------------------------------------------- report */
const failed = checks.filter((c) => !c.pass);
for (const c of checks) console.log(`  ${c.pass ? "ok  " : "FAIL"}  ${c.name}${c.detail ? "  [" + c.detail + "]" : ""}`);
if (errors.length) {
  console.log("\nscript errors:");
  [...new Set(errors)].slice(0, 12).forEach((e) => console.log("  ! " + e));
}
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed, ${new Set(errors).size} script error(s)`);
process.exit(failed.length || errors.length ? 1 : 0);