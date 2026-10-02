# Where I stopped — handoff

**Project:** `C:\Users\addou\OneDrive\Bureau\Salesforce Abdo Academy\Salesforce App builder\Salesforce App Builder Roadmap`
**Last validated state:** 14 of 17 phases complete, all checks green.
**Started:** Phase 15 — Packaging & Metadata Deployment. No files written for it yet.

Local only. No org, no deployment, no push. Do not run `sf project deploy start`.

---

## Validate before you touch anything

Run these first. If they pass, the tree is in the state described below.

```powershell
node --check docs\assets\curriculum.js
node --check docs\assets\answers.js
node temp\pab-backticks.js
node scripts\check-site-data.js
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\sync-guides.ps1 -Check
node temp\pab-smoke.js
node temp\pab-checker-regress.js
```

Expected output:

```
0 line(s) with an unescaped backtick that is not a delimiter
14 module(s) declared
42 exercise id(s), 42 answer(s)
OK: curriculum.js and answers.js are internally consistent.
OK: all 14 guides are in sync.
45/45 checks passed, 0 script error(s)
19 mutation cases, 0 hole(s), 0 no-op mutation(s)
checker regression suite: all green
```

There is **no `npm run verify`** that does all of this. `node_modules` is absent, `package-lock.json` is
missing, and `temp/pab-smoke.js` needs a jsdom that is not declared locally. Use the commands above.

---

## What is done

Phases 1–14 each have a curriculum module, three exercises with answers, and a canonical guide.

| # | Module id | Title | Exam |
|---|---|---|---|
| 01 | `fundamentals` | Fundamentals & Navigation | fund |
| 02 | `security` | Security, Profiles & Sharing | fund |
| 03 | `reporting` | Reports, Dashboards & Mobile | data |
| 04 | `objects` | Objects & Fields | data |
| 05 | `relationships` | Relationships & Integrity | data |
| 06 | `formulas` | Formula Fields | data |
| 07 | `rollups` | Roll-Up Summaries & Validation | data |
| 08 | `recordtypes` | Record Types & Business Processes | logic |
| 09 | `flows` | Flow Automation | logic |
| 10 | `approvals` | Approval Processes | logic |
| 11 | `workflow` | Workflow Rules, Assignment & Auto-Response | logic |
| 12 | `appbuilder` | Lightning App Builder | ui |
| 13 | `dynamicforms` | Dynamic Forms & Lightning Pages | ui |
| 14 | `console` | Lightning Console & Experience Sites | ui |

- **fund** 23% complete · **data** 22% complete · **logic** 28% complete · **ui** 17% complete ·
  **deploy** 0% — phases 15 and 16 are the whole deploy domain (10%).
- Quiz: 6 questions per module, 84 total. Every module has exactly 3 exercises, all answered.
- Guides are synced: canonical in `developer Platform App Builder Roadmap\`, mirrored to `docs\guide\`.
  Any new guide must be written **canonical first**, then `sync-guides.ps1` run without `-Check`.

### Site features already built
Markdown rendering with highlighting, multi-select grading, exercise ratings, saved progress, search,
scorecards, domain routes, weighted timed mock exam, partial-bank disclosure.

---

## Remaining work, in order

### 1. Phase 15 — Packaging & Metadata Deployment (`deploy`)
**Status: not started.** This is the next task.

Needs: curriculum module with 3 lessons, 6 quiz questions, exercises `15.1`–`15.3`, a canonical guide
named `15-Packaging-Metadata-Deployment.md`, and answers `15.1`–`15.3` in `docs/assets/answers.js`.

Content to cover: metadata types, package types (managed 2GP, unlocked, org package), `package.xml`
manifest structure, decomposed vs non-decomposed metadata, source format conversion, `sf project deploy`
vs `sfdx force:source:deploy`, destructive changes, and what actually breaks on deploy.

### 2. Phase 16 — Change Sets & Environment Strategy (`deploy`)
**Status: not started.** Change sets (outbound/inbound/copied), sandbox types and refresh strategy,
deployment pipeline, deployment windows, validation and rollback.

### 3. Phase 17 — Capstone Lead-to-Cash (`logic`)
**Status: not started.** Must tie Phases 1–16 into one scenario.

### 4. Formula corrections in Phases 04 and 06 — outstanding
These contain **known factual errors** that have not been fixed:

- Phase 04 claims bare arithmetic formulas cannot save. They can:
  `IF(Quantity__c > 0, Unit_Price__c * Quantity__c, 0)`.
- Phase 04 and Phase 06 both claim Currency fields cannot be referenced in formulas. They can. The real
  constraint is formula **return type**: a formula returning Currency cannot be referenced by a formula
  returning Number.
- `&&` appears in formula examples. Formula uses `AND()`, not `&&`.
- Some examples mix Number and Text returns in one formula, which is invalid.
- Phase 07 uses `Amount__c`; the standard Opportunity field is `Amount`.
- Phase 07 uses `ISPICKVAL()` on checkbox, currency and date fields, where it does not apply —
  checkboxes use `ISCHECKED()`, and blank tests use `ISBLANK()`.

### 5. Technical accuracy audit of Phases 07–14
Newer modules were authored quickly and have not had a Salesforce-facts review. Things flagged but
unverified:

- Phase 07 claims a roll-up can reach an Account through a Contract, which needs a **master-detail**
  relationship, not a lookup.
- Phase 09 states Flow Fault only works in before-save flows. Check the current behaviour before
  asserting it absolutely.
- Phase 12 says the Page Layout Editor is Classic-only. It is used in Lightning too.
- Phase 12 states a Flow component always replaces the form view. That depends on the flow's
  **behaviour mode** (auto-launch, lightbox, modal, screen flow).
- Phase 13 dynamic form rules on current user and on permissions: verify both are supported.

### 6. `force-app/main/default` metadata — 0 objects built
`node scripts/validate-metadata.js` currently reports 32 directories and **0 objects**. The target is
roughly 8 custom objects, 10 flows, permission sets, apps, layouts, Lightning pages, record types,
reports, dashboards, sharing, validation rules, formula fields, roll-ups, and Apex tests. Declarative
first; Apex only where justified.

### 7. Housekeeping
- `README.md` is still the stock file.
- `package-lock.json` absent, but `.github/workflows/pages.yml` runs `npm ci`, which needs a lockfile.
- `manifest/` needs a type audit.
- `validate:backticks` exists but `npm run verify` does not call it.
- `EXAM.alignedRelease` in `docs/assets/app.js` still carries the stale Spring '24 warning.
- Final GitHub repo slug unknown; temp value is `AbdoAddouli/Salesforce-App-Builder-Roadmap`.
- Git root is `C:/Users/addou`, **not** this project. `git status` here reports the whole home directory.

---

## Block contract

A module is this shape. Copy it exactly:

```js
{
  id: 'console',                  // unique, lowercase, no spaces
  n: 14,                          // must equal its 1-based position in the array
  title: 'Lightning Console & Experience Sites',
  icon: '🗂️',
  color: '#0EA5E9',               // must be hex, not a colour name
  tagline: 'one line, shown on the home card',
  exam: 'ui',                     // one of fund | data | logic | ui | deploy
  guide: '14-Lightning-Console-Experience-Sites.md',   // must exist in the canonical folder
  objectives: [ '...' ],          // non-empty array
  art: [],                        // MUST be present and an array, even if empty
  lessons: [ { title, mins, blocks: [ ... ] } ],
  quiz: { questions: [ { q, opts, a, why } ] }
}
```

Allowed `t` values only: `p`, `h`, `list`, `num`, `table`, `code`, `callout`, `selfcheck`, `ex`, `proj`.

- `a` on a quiz question is a **zero-based index**, or an array of indexes for multi-select.
- `callout` needs `kind` of `tip` or `warn`.
- `code` needs `lang`.
- `ex` needs `id`, `title`, `obj`, `stars`, `steps`, `verify`.
- `proj` needs `id`, `title`, `obj`, `stars`, `reqs`, `success`.
- Every `ex`/`proj` id needs a matching key in `answers.js` or the reveal button is hidden.

---

## Pitfalls that have already cost time

**1. Apostrophes break `curriculum.js`.** It is one giant array of single-quoted strings. A prose
apostrophe inside one is a syntax error. This happened twice in Phase 13. Either escape it (`\'`) or
avoid contractions. To find them:

```powershell
node "C:\Users\addou\AppData\Local\Temp\opencode\pab-oddquote.js" "docs\assets\curriculum.js" 2995 3400
```

**2. Backticks break `answers.js`.** Every answer body is a template literal, so any backtick inside
must be escaped as `` \` ``. Run `node temp\pab-backticks.js` after every edit to that file — it reports
0 when clean. This also happened in Phase 14 with a My Domain URL.

**3. Closing form of the last answer.** The final entry must be a bare backtick then `};`:

```
...last line of prose
`
};
```

not `` `; ``. A wrong close produces a file that parses but exports garbage.

**4. Syntax validity is not schema validity.** In Phase 14 I added a non-existent `n` property to
`selfcheck` blocks. `node --check` passed and `check-site-data.js` passed. It was dead data that would
have shipped. The mutation suite is the only thing that catches contract breaks.

**5. An `oldString` that spans the end of file often will not match.** Anchor edits on a short unique
line instead of trying to match the tail.

**6. PowerShell is 5.1.** No `&&`. Use `cmd1; if ($?) { cmd2 }`.

**7. `rg` is not installed.** Use `grep`/`glob` tools or `Select-String`.

---

## Useful file paths

| Path | What it is |
|---|---|
| `docs/assets/curriculum.js` | All 14 modules. The big file you will edit most |
| `docs/assets/answers.js` | 42 answers. Template literals, see pitfall 2 |
| `docs/assets/app.js` | Renderer, mock exam, progress, routes. Holds `EXAM` domains |
| `docs/assets/style.css` | Styling and mock-exam states |
| `docs/index.html` | GitHub Pages shell |
| `developer Platform App Builder Roadmap\` | Canonical guides. Write here first |
| `docs/guide\` | Generated mirror. Never edit by hand |
| `scripts/check-site-data.js` | Curriculum/answers/blocks/exercises/guides validator |
| `scripts/sync-guides.ps1` | `-Check` verifies, no flag copies |
| `scripts/validate-metadata.js` | Offline manifest and `force-app` validator |
| `temp/pab-smoke.js` | 45-check browser render suite |
| `temp/pab-checker-regress.js` | Validator mutation suite, 19 cases |
| `temp/pab-backticks.js` | Reports unescaped backticks in `answers.js` |
| `temp/pab-fix-backticks.js` | Safely escapes them |
| `temp/pab-quote-scan.js` | Quote and backtick diagnostics |
| `force-app/main/default/` | Metadata destination. Empty so far |
| `manifest/` | Package manifests, needs a type audit |

---

## Scenario to keep consistent

**Brightline Equipment**, a B2B industrial-equipment reseller. Leads, Accounts, Contacts, Opportunities,
Products, price books, quotes, approvals, Contracts, Assets, Cases. Use these field names when phases
need to reference each other:

`Quote_Request__c`, `Quote_Line__c`, `Discount_Request__c`, `Product__c`, `Asset__c`, and Opportunity
fields `Discount_Percent__c`, `Authority_Notes__c`, `Next_Step__c`, `Next_Step_Date__c`,
`Credit_Terms__c`, `Cost_Margin__c`, `Margin_Percent__c`.

Permission sets already referenced across phases: `Brightline_Sales_User`, `Brightline_Finance_User`,
`Brightline_Service_User`.

Apps already referenced: **Brightline Sales**, **Brightline Finance**, **Brightline Service**.

---

## How to add a phase, condensed

1. Append the module object to `docs/assets/curriculum.js` before the closing `];`.
2. `node --check docs\assets\curriculum.js` — fix apostrophes until clean.
3. `node scripts\check-site-data.js` — will report the missing guide file. That is expected.
4. Write the canonical guide in `developer Platform App Builder Roadmap\`.
5. Add the answers to `docs/assets/answers.js`, escaping every backtick.
6. `node --check docs\assets\answers.js`, then `node temp\pab-backticks.js`.
7. `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\sync-guides.ps1`
8. `node scripts\check-site-data.js`, `sync-guides.ps1 -Check`, smoke, checker regression.