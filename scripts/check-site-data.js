#!/usr/bin/env node
/**
 * Validates the interactive site's data files.
 *
 * curriculum.js and answers.js are ~100KB hand-authored JavaScript data
 * literals. Nothing about that shape is type-checked at runtime, so a typo in a
 * quiz answer index would ship silently: the question would mark every answer
 * wrong and nobody would notice until a learner complained.
 *
 * This script loads both files in a Node VM sandbox (they are pure data, no DOM)
 * and asserts the invariants the renderer relies on. It is the authoring safety
 * net for phases 1-N content, and it runs in CI via `npm run verify`.
 *
 * Checks:
 *   ACADEMY    - required fields, unique ids, sequential numbering,
 *                guide file exists, every module maps to a real exam domain
 *   lessons    - known block types, code blocks declare a language, quiz
 *                questions have in-range answers, no duplicate options,
 *                multiple-select answers are well-formed
 *   answers    - every answer key maps to a real exercise id (no orphans)
 *
 * Exit 0 = clean, 1 = problems. Missing files are an error, not a skip, so an
 * empty curriculum cannot pass.
 *
 * Usage:
 *   node scripts/check-site-data.js [--curriculum <file>] [--answers <file>]
 *                                   [--app <file>] [--guide-dir <dir>]
 * Overrides exist so a broken COPY of the data can be checked in isolation
 * (regression-testing the checker itself) without touching the real files.
 * Any unrecognised argument is a hard error, so a mistyped flag can never
 * silently validate the wrong file.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(ROOT, "docs", "assets");
const GUIDE_DIR = path.join(ROOT, "developer Platform App Builder Roadmap");

/* ------------------------------------------------------------ CLI overrides */
const FLAGS = {
  "--curriculum": "curriculum",
  "--answers": "answers",
  "--app": "app",
  "--guide-dir": "guideDir"
};
const OPT = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = FLAGS[process.argv[i]];
  if (!key) {
    console.error(
      `unknown argument "${process.argv[i]}"\n` +
        `usage: node scripts/check-site-data.js [--curriculum <file>] [--answers <file>] ` +
        `[--app <file>] [--guide-dir <dir>]`
    );
    process.exit(2);
  }
  const val = process.argv[i + 1];
  if (val === undefined || val.startsWith("--")) {
    console.error(`${process.argv[i]} needs a value`);
    process.exit(2);
  }
  OPT[key] = path.resolve(val);
  i++;
}
const CUR_FILE = OPT.curriculum || path.join(ASSETS, "curriculum.js");
const ANS_FILE = OPT.answers || path.join(ASSETS, "answers.js");
const APP_FILE = OPT.app || path.join(ASSETS, "app.js");
const GUIDE_CHECK_DIR = OPT.guideDir || GUIDE_DIR;

const problems = [];
const notes = [];
const fail = (m) => problems.push(m);

/* --------------------------------------------------- load the data files
 * `optKey` is the CLI flag key (OPT) and `file` the display filename. They are
 * passed separately on purpose: keying the lookup off the filename silently
 * ignores an override (OPT["curriculum.js"] is undefined when the flag stores
 * OPT.curriculum), which makes a corrupt test file look clean.
 * These files declare their data with top-level `const` (ACADEMY,
 * EXERCISE_ANSWERS). A top-level `const` creates a LEXICAL binding in the
 * context's global scope - it does not become a property of the sandbox object,
 * so reading sandbox.ACADEMY afterwards returns undefined. Re-running a second
 * script in the same context can still see the binding, which is how the
 * exports below are pulled out. */
function load(optKey, file, globals) {
  const p = OPT[optKey] || path.join(ASSETS, file);
  if (!fs.existsSync(p)) {
    fail(
      `docs/assets/${file} is missing - the site cannot render without it (${p})`
    );
    return null;
  }
  const src = fs.readFileSync(p, "utf8");
  const exports = {};
  const sandbox = { exports };
  try {
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: file, timeout: 10000 });
    // Same context, so the file's top-level `const` bindings are still visible.
    for (const g of globals) {
      vm.runInContext(
        `exports.${g} = typeof ${g} !== 'undefined' ? ${g} : undefined;`,
        sandbox,
        { timeout: 5000 }
      );
    }
  } catch (e) {
    fail(`docs/assets/${file} threw while loading: ${e.message}`);
    return null;
  }
  return exports;
}

const curriculum = load("curriculum", "curriculum.js", ["ACADEMY", "GUIDE"]);
const answersSrc = load("answers", "answers.js", ["EXERCISE_ANSWERS"]);

/* ---- pull EXAM / DOMAINS out of app.js without executing the whole app ----
 * app.js touches document/localStorage at module scope, so it cannot be run in
 * Node. Only the two literal declarations are needed, and they are flat data,
 * so a narrow slice-and-eval is both safe and sufficient. If app.js is ever
 * restructured, this fails loudly rather than quietly skipping domain checks. */
let DOMAINS = [];
try {
  const appSrc = fs.readFileSync(APP_FILE, "utf8");
  const start = appSrc.indexOf("const DOMAINS = [");
  if (start < 0)
    throw new Error('could not find "const DOMAINS = [" in app.js');
  const end = appSrc.indexOf("\n];", start);
  if (end < 0)
    throw new Error('could not find the closing "];" of DOMAINS in app.js');
  // Assign to the outer DOMAINS - a `const DOMAINS` here would shadow it and
  // leave domainIds empty, which silently disables every domain check.
  DOMAINS = vm.runInNewContext(
    "[" + appSrc.slice(appSrc.indexOf("[", start) + 1, end) + "]"
  );
  if (!Array.isArray(DOMAINS) || !DOMAINS.length)
    throw new Error("DOMAINS did not evaluate to a non-empty array");
  notes.push(`${DOMAINS.length} exam domains read from app.js`);
} catch (e) {
  fail(`cannot read DOMAINS from app.js: ${e.message}`);
}

const domainIds = new Set(DOMAINS.map((d) => d.id));

const EXERCISE_ANSWERS = (answersSrc && answersSrc.EXERCISE_ANSWERS) || {};
const referencedExercises = new Set();

/* Block types the lesson renderer knows how to draw (see renderBlock in
 * docs/assets/app.js). Anything else renders as NOTHING AT ALL, so an unknown
 * type is always a content bug, never a feature.
 *
 * This list must stay in lockstep with renderBlock(). It was previously drifted
 * (the validator advertised h2/h3/ul/ol/kv/steps, which the renderer cannot
 * draw, and omitted ex/proj, which it can), so validate the two together. */
const BLOCK_TYPES = new Set([
  "p",
  "h",
  "list",
  "num",
  "table",
  "code",
  "callout",
  "selfcheck",
  "case",
  "ex",
  "proj"
]);

/* Blocks whose whole payload is a single string in `x`. */
const TEXT_BLOCKS = new Set(["p", "h", "callout"]);

function checkAcademy(modules) {
  notes.push(`${modules.length} module(s) declared`);

  const seenIds = new Map();
  const guideFiles = fs.existsSync(GUIDE_CHECK_DIR)
    ? new Set(fs.readdirSync(GUIDE_CHECK_DIR).filter((n) => n.endsWith(".md")))
    : new Set();
  // Guide files are authored in a later wave than the curriculum, so an empty
  // guide directory is an expected intermediate state. Say so ONCE and skip the
  // existence checks, rather than repeating the note per module.
  const guidesAvailable = guideFiles.size > 0;
  if (!guidesAvailable) {
    notes.push(
      "guide directory is empty - guide existence checks skipped (author guides later)"
    );
  }

  modules.forEach((m, i) => {
    const at = `module #${i + 1}${m && m.id ? ` (${m.id})` : ""}`;

    if (!m || typeof m !== "object") {
      fail(`${at}: not an object`);
      return;
    }

    for (const key of [
      "id",
      "n",
      "title",
      "icon",
      "color",
      "tagline",
      "guide",
      "exam"
    ]) {
      if (m[key] === undefined || m[key] === null || m[key] === "") {
        fail(`${at}: missing required field "${key}"`);
      }
    }
    if (typeof m.id === "string") {
      if (seenIds.has(m.id))
        fail(
          `${at}: duplicate module id "${m.id}" (also module #${seenIds.get(m.id) + 1})`
        );
      else seenIds.set(m.id, i);
    }
    if (m.n !== i + 1)
      fail(`${at}: n should be ${i + 1} to match its position, found ${m.n}`);

    if (!/^#[0-9A-Fa-f]{6}$/.test(m.color || ""))
      fail(
        `${at}: color must be a hex value like "#4F46E5", found "${m.color}"`
      );

    if (!Array.isArray(m.objectives) || m.objectives.length === 0) {
      fail(`${at}: objectives must be a non-empty array`);
    }

    if (m.exam && !domainIds.has(m.exam)) {
      fail(
        `${at}: exam domain "${m.exam}" is not one of [${[...domainIds].join(", ")}] - the scorecard cannot group this phase`
      );
    }

    // renderer-contract fields: read unguarded by app.js
    for (const key of MODULE_REQUIRED) {
      const want = MODULE_OPTIONAL_SHAPES[key];
      if (m[key] === undefined) {
        fail(
          `${at}: missing "${key}" - the phase page renders it directly and will throw without it`
        );
      } else if (want === Array && !Array.isArray(m[key])) {
        fail(`${at}: "${key}" must be an array`);
      }
    }

    if (m.guide && guidesAvailable && !guideFiles.has(m.guide)) {
      fail(
        `${at}: guide file "${m.guide}" not found in "developer Platform App Builder Roadmap/"`
      );
    }

    if (!Array.isArray(m.lessons) || m.lessons.length === 0) {
      fail(`${at}: lessons must be a non-empty array`);
      return;
    }
    m.lessons.forEach((l, li) => {
      const lat = `${at} lesson ${li + 1}${l && l.title ? ` ("${l.title}")` : ""}`;
      if (!l || typeof l !== "object") {
        fail(`${lat}: not an object`);
        return;
      }
      if (!l.title) fail(`${lat}: missing title`);
      if (!Array.isArray(l.blocks) || l.blocks.length === 0) {
        fail(`${lat}: blocks must be a non-empty array`);
        return;
      }
      l.blocks.forEach((b, bi) => {
        const bat = `${lat} block ${bi + 1}`;
        if (!b || typeof b !== "object") {
          fail(`${bat}: not an object`);
          return;
        }
        if (!BLOCK_TYPES.has(b.t))
          fail(
            `${bat}: unknown block type "${b.t}" (renderer supports ${[...BLOCK_TYPES].join(", ")})`
          );

        // p / h / callout all render esc(b.x) directly, so x must be a
        // non-empty string. Note the .trim(): typeof "" === "string", so a bare
        // type check would happily accept an empty block that renders as nothing.
        if (TEXT_BLOCKS.has(b.t) && (typeof b.x !== "string" || !b.x.trim()))
          fail(`${bat}: type "${b.t}" needs non-empty string text in x`);

        if (b.t === "code" && !b.lang)
          fail(
            `${bat}: code block has no lang, so the syntax highlighter cannot choose rules`
          );

        if ((b.t === "list" || b.t === "num") && !Array.isArray(b.items))
          fail(`${bat}: type "${b.t}" needs an items array`);

        if (
          b.t === "table" &&
          (!Array.isArray(b.head) ||
            !Array.isArray(b.rows) ||
            (b.rows.length &&
              b.rows.some(
                (r) => !Array.isArray(r) || r.length !== b.head.length
              )))
        )
          fail(
            `${bat}: table needs head[] and rows[] where every row has head.length cells`
          );

        if (
          b.t === "selfcheck" &&
          (typeof b.q !== "string" ||
            !b.q.trim() ||
            typeof b.a !== "string" ||
            !b.a.trim())
        )
          fail(
            `${bat}: selfcheck needs non-empty q (question) and a (answer) - the reveal is always visible`
          );

        // exercises are rendered inline as ex/proj; they are the one block that
        // carries an id the rest of the app keys off, so validate their shape too
        if (b.t === "ex" || b.t === "proj") checkExercise(b, bat, m);

        // case = a real-world use case study: problem -> solution -> build steps
        // -> gotcha. It is the one block whose whole point is that the prose is
        // specific, so empty strings are a content bug, not a style choice.
        if (b.t === "case") {
          for (const k of ["title", "problem", "solution", "gotcha"])
            if (typeof b[k] !== "string" || !b[k].trim())
              fail(
                `${bat}: case study needs non-empty string "${k}" - an empty section renders as a blank heading`
              );
          if (!Array.isArray(b.steps) || b.steps.length === 0)
            fail(
              `${bat}: case study needs a non-empty steps array ("How it was built")`
            );
          else if (b.steps.some((s) => typeof s !== "string" || !s.trim()))
            fail(`${bat}: every case steps entry must be a non-empty string`);
          // org (which company) and exam (how it maps to CRT-403) are optional,
          // but if present they must not be empty - a blank pill looks broken.
          for (const k of ["org", "exam"])
            if (k in b && (typeof b[k] !== "string" || !b[k].trim()))
              fail(
                `${bat}: case study "${k}" is present but empty - omit the key instead`
              );
        }
      });
    });

    checkQuiz(m, at);
  });
}

function checkQuiz(m, at) {
  if (!m.quiz) {
    fail(
      `${at}: missing quiz - every phase needs one, the mock exam samples from them`
    );
    return;
  }
  const qs = m.quiz.questions;
  if (!Array.isArray(qs) || qs.length === 0) {
    fail(`${at}.quiz: questions must be a non-empty array`);
    return;
  }

  qs.forEach((q, qi) => {
    const qat = `${at}.quiz Q${qi + 1}`;
    if (typeof q.q !== "string" || !q.q.trim())
      fail(`${qat}: missing question text`);
    if (typeof q.why !== "string" || !q.why.trim())
      fail(
        `${qat}: missing "why" explanation - instant feedback is the whole point`
      );
    if (!Array.isArray(q.opts) || q.opts.length < 2) {
      fail(`${qat}: needs at least 2 options`);
      return;
    }

    // duplicate distractors make a question unanswerable by elimination alone
    const norm = q.opts.map((o) => String(o).trim().toLowerCase());
    if (new Set(norm).size !== norm.length)
      fail(`${qat}: duplicate options ${JSON.stringify(q.opts)}`);

    if (Array.isArray(q.a)) {
      if (q.a.length < 2)
        fail(
          `${qat}: multiple-select answer lists only ${q.a.length} option - use a plain index instead`
        );
      for (const i of q.a) {
        if (!Number.isInteger(i))
          fail(
            `${qat}: multiple-select answers must be option indices, found ${JSON.stringify(i)}`
          );
        else if (i < 0 || i >= q.opts.length)
          fail(
            `${qat}: answer index ${i} out of range (${q.opts.length} options)`
          );
      }
      if (new Set(q.a).size !== q.a.length)
        fail(`${qat}: multiple-select answer repeats an index`);
    } else {
      if (!Number.isInteger(q.a))
        fail(
          `${qat}: answer must be an option index, found ${JSON.stringify(q.a)}`
        );
      else if (q.a < 0 || q.a >= q.opts.length)
        fail(
          `${qat}: answer index ${q.a} out of range (${q.opts.length} options)`
        );
    }
  });
}

/* Exercises are rendered inline in the lesson as ex / proj blocks (the renderer
 * draws them from lesson.blocks, NOT from m.exercises), so they are collected
 * here straight from the block tree. That keeps a single source of truth: the
 * validator can never pass on a module whose exercises live in an array the
 * page never renders. The id doubles as the EXERCISE_ANSWERS key and as the
 * self-rating key in localStorage, so uniqueness is enforced globally. */
/* Fields a RENDERER reads off a module with no guard. If curriculum.js omits one,
 * app.js throws mid-render and the learner gets a half-drawn page - so require
 * them here rather than relying on a default in app.js. Keep this list in sync
 * with the `mod.*` accesses in docs/assets/app.js. */
const MODULE_REQUIRED = ["art"];
const MODULE_OPTIONAL_SHAPES = { art: Array };

function checkExercise(b, at, m) {
  if (!b.id) {
    fail(
      `${at}: missing id - EXERCISE_ANSWERS and saved star ratings are keyed by it`
    );
    return;
  }
  if (referencedExercises.has(b.id))
    fail(`${at}: duplicate exercise id "${b.id}"`);
  referencedExercises.add(b.id);

  for (const k of ["title", "obj"]) {
    if (typeof b[k] !== "string" || !b[k].trim())
      fail(
        `${at}: missing "${k}" - the card renders it as a heading / intro line`
      );
  }
  // renderer: b.steps for ex, b.reqs for proj, then `b.steps || b.reqs`
  const items = b.t === "proj" ? b.reqs : b.steps;
  if (!Array.isArray(items) || !items.length)
    fail(
      `${at}: needs a non-empty ${b.t === "proj" ? "reqs" : "steps"} array (${b.t === "proj" ? "Requirements" : "Instructions"})`
    );
  // renderer: ex shows b.verify, proj shows b.success
  const done = b.t === "proj" ? b.success : b.verify;
  if (typeof done !== "string" || !done.trim())
    fail(
      `${at}: missing "${b.t === "proj" ? "success" : "verify"}" - the success/verify footer needs it`
    );
}

/* ------------------------------------------------------------------ run
 * All dispatch happens here, after every `const` above is initialised.
 * Calling checkAcademy() earlier is a temporal-dead-zone crash (it reads
 * BLOCK_TYPES / domainIds), and computing the answer cross-reference earlier
 * is a logic bug: referencedExercises is only populated by checkAcademy. */
const ACADEMY = curriculum && curriculum.ACADEMY;
if (!ACADEMY) {
  fail("curriculum.js does not export a top-level `const ACADEMY = [...]`");
} else if (!Array.isArray(ACADEMY) || ACADEMY.length === 0) {
  fail("ACADEMY must be a non-empty array of modules");
} else {
  checkAcademy(ACADEMY);
}

/* --------------------------------------------------------- answers vs ids */
const orphanAnswers = Object.keys(EXERCISE_ANSWERS).filter(
  (id) => !referencedExercises.has(id)
);
orphanAnswers.forEach((id) =>
  fail(
    `answers.js has an answer for "${id}" but no exercise with that id exists in curriculum.js`
  )
);

const missing = [...referencedExercises].filter(
  (id) => !Object.prototype.hasOwnProperty.call(EXERCISE_ANSWERS, id)
);
if (missing.length) {
  notes.push(
    `${missing.length} exercise(s) have no answer yet (reveal button will be hidden): ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? ", ..." : ""}`
  );
}
notes.push(
  `${referencedExercises.size} exercise id(s), ${Object.keys(EXERCISE_ANSWERS).length} answer(s)`
);

/* ------------------------------------------------------------------ report */
if (notes.length) {
  console.log("notes:");
  notes.forEach((n) => console.log("  - " + n));
}
if (problems.length) {
  console.error(`\nFAIL: ${problems.length} problem(s) found\n`);
  problems.forEach((p) => console.error("  x " + p));
  process.exit(1);
}
console.log("\nOK: curriculum.js and answers.js are internally consistent.");
