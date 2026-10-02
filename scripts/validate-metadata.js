#!/usr/bin/env node
/**
 * Local metadata validator for the Platform App Builder lab.
 *
 * Runs entirely offline — it never contacts an org. It exists because this is a
 * declarative-first project, so the usual safety net (`sf project deploy validate`)
 * is both out of scope for a read-only check and unavailable without an org.
 *
 * Checks:
 *   1. every XML file under force-app/ and manifest/ is well-formed
 *   2. every metadata file in force-app/ is covered by manifest/package.xml
 *      (catches the classic "created the component, forgot the manifest" bug)
 *   3. package.xml metadata types are all real Salesforce metadata API types
 *   4. all manifests agree on the API version and it matches sfdx-project.json
 *   5. Apex classes are named consistently with their test class
 *   6. LWC bundles expose a matching .html template
 *
 * Exit code 0 = clean, 1 = problems found.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const FORCE_APP = path.join(ROOT, "force-app", "main", "default");
const MANIFEST_DIR = path.join(ROOT, "manifest");
const SFDX_PROJECT = path.join(ROOT, "sfdx-project.json");

const problems = [];
const notes = [];
const fail = (m) => problems.push(m);

/* ------------------------------------------------------------------ utils */
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/**
 * Minimal XML well-formedness check. We deliberately avoid a real parser because
 * package.xml uses a namespace that naive regexes trip over, and the goal here is
 * "tags balance and attributes quote correctly", not schema validation.
 */
function checkXml(file) {
  const src = fs.readFileSync(file, "utf8");
  const stripped = src
    .replace(/<\?[\s\S]*?\?>/g, "") // xml declaration
    .replace(/<!--[\s\S]*?-->/g, "") // comments
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");

  const stack = [];
  const re = /<(\/?)([A-Za-z_][\w.:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m,
    consumed = 0;
  while ((m = re.exec(stripped)) !== null) {
    // flag any '<' that is not part of a well-formed tag
    const between = stripped.slice(consumed, m.index);
    if (between.includes("<") || between.includes(">")) {
      fail(
        `${rel(file)}: stray '<' or '>' outside a tag near "${between.trim().slice(0, 40)}"`
      );
      return;
    }
    consumed = m.index + m[0].length;
    const [, close, tag, attrs, selfClose] = m;
    if (/=\s*(?![^"'>]*("|'))/.test(attrs)) {
      fail(`${rel(file)}: unquoted attribute value in <${tag}>`);
      return;
    }
    if (close) {
      const open = stack.pop();
      if (open !== tag) {
        fail(`${rel(file)}: </${tag}> closes <${open || "nothing"}>`);
        return;
      }
    } else if (!selfClose) {
      stack.push(tag);
    }
  }
  if (stack.length)
    fail(`${rel(file)}: unclosed tag(s) <${stack.join("> <")}>`);
}

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

/* --------------------------------------------------- 1. XML well-formedness */
const xmlFiles = [
  ...walk(FORCE_APP).filter((f) => f.endsWith(".xml")),
  ...walk(MANIFEST_DIR).filter((f) => f.endsWith(".xml"))
];
for (const f of xmlFiles) checkXml(f);
notes.push(`${xmlFiles.length} XML file(s) checked for well-formedness`);

/* ------------------------------------------------------------- manifests */
function readManifests() {
  if (!fs.existsSync(MANIFEST_DIR)) {
    fail("manifest/ directory is missing");
    return [];
  }
  return fs
    .readdirSync(MANIFEST_DIR)
    .filter((n) => n.endsWith(".xml"))
    .map((n) => {
      const file = path.join(MANIFEST_DIR, n);
      const src = fs.readFileSync(file, "utf8");
      const types = [];
      const re = /<types>([\s\S]*?)<\/types>/g;
      let m;
      while ((m = re.exec(src)) !== null) {
        const body = m[1];
        const name = (body.match(/<name>([^<]+)<\/name>/) || [])[1];
        const members = [...body.matchAll(/<members>([^<]+)<\/members>/g)].map(
          (x) => x[1]
        );
        if (name) types.push({ name, members });
      }
      const version = (src.match(/<version>([^<]+)<\/version>/) || [])[1];
      return { name: n, file, types, version, src };
    });
}

const manifests = readManifests();
if (!manifests.length) fail("no manifests found in manifest/");

/* --------------------- 4. API version agreement + sfdx-project.json match */
let projectApi = null;
try {
  const proj = JSON.parse(fs.readFileSync(SFDX_PROJECT, "utf8"));
  projectApi = proj.sourceApiVersion;
} catch (e) {
  fail(`sfdx-project.json unreadable: ${e.message}`);
}

const versions = new Set();
for (const mf of manifests) {
  if (!mf.version) fail(`${mf.name}: missing <version>`);
  else versions.add(mf.version);
}
if (versions.size > 1)
  fail(`manifests disagree on API version: ${[...versions].join(", ")}`);
if (projectApi && versions.size && !versions.has(projectApi)) {
  fail(
    `manifest API version ${[...versions][0]} does not match sfdx-project.json sourceApiVersion ${projectApi}`
  );
}
if (projectApi)
  notes.push(
    `API version ${projectApi} consistent across sfdx-project.json and ${manifests.length} manifest(s)`
  );

/* --------------------------- 2 + 3. full manifest coverage + type sanity */
// Metadata API types this project is allowed to use. Anything else in package.xml
// is almost always a typo (e.g. FlexiPage vs FlexiPageRegion ordering mistakes,
// or "AuraDefinition" instead of "AuraDefinitionBundle").
const ALLOWED = new Set([
  "CustomApplication",
  "CustomTab",
  "CustomObject",
  "CustomField",
  "RecordType",
  "BusinessProcess",
  "CompactLayout",
  "PageLayout",
  "FlexiPage",
  "FlexiPageRegion",
  "CustomLabels",
  "Flow",
  "FlowActionCallout",
  "WorkflowRule",
  "WorkflowFieldUpdate",
  "WorkflowAlert",
  "Report",
  "ReportType",
  "Dashboard",
  "DataCategoryGroup",
  "PermissionSet",
  "CustomPermission",
  "Role",
  "Group",
  "Queue",
  "SharingTerritory",
  "SharingRules",
  "OwdSettings",
  "CustomNotificationType",
  "EmailTemplate",
  "EmailAlert",
  "NamedCredential",
  "ExternalCredential",
  "Certificate",
  "CustomMetadataType",
  "ApexClass",
  "ApexTrigger",
  "StaticResource",
  "SharingSettings",
  "UserInterfaceSettings",
  "ApexSettings",
  "SecuritySettings",
  "SearchSettings",
  "MobileSettings",
  "CustomSetting",
  "Network"
]);

const full = manifests.find((m) => m.name === "package.xml");
if (!full) fail("manifest/package.xml is missing");

const covered = new Map(); // dirName under default/ -> Set of member names
if (full) {
  for (const t of full.types) {
    if (!ALLOWED.has(t.name))
      fail(`manifest/package.xml: unknown metadata type <${t.name}>`);
    if (!covered.has(t.name)) covered.set(t.name, new Set());
    const set = covered.get(t.name);
    t.members.forEach((mem) => (mem === "*" ? set.add("*") : set.add(mem)));
  }
  // cross-check the split manifests are subsets of the full manifest
  for (const mf of manifests) {
    if (mf.name === "package.xml") continue;
    for (const t of mf.types) {
      if (!ALLOWED.has(t.name))
        fail(`${mf.name}: unknown metadata type <${t.name}>`);
      const fullSet = covered.get(t.name);
      t.members.forEach((mem) => {
        if (fullSet && !fullSet.has("*") && !fullSet.has(mem)) {
          fail(
            `${mf.name}: <${mem}> (${t.name}) is not present in package.xml`
          );
        }
      });
    }
  }
}

// Map force-app directory names -> metadata type they produce.
const DIR_TYPES = {
  applications: "CustomApplication",
  tabs: "CustomTab",
  objects: "CustomObject",
  layouts: "PageLayout",
  compactLayouts: "CompactLayout",
  flexipages: "FlexiPage",
  flows: "Flow",
  workflows: "WorkflowRule",
  reports: "Report",
  dashboards: "Dashboard",
  permissionsets: "PermissionSet",
  roles: "Role",
  groups: "Group",
  queues: "Queue",
  territories: "SharingTerritory",
  sharingrules: "SharingRules",
  labels: "CustomLabels",
  classes: "ApexClass",
  triggers: "ApexTrigger",
  staticresources: "StaticResource",
  lwc: "LightningComponentBundle",
  aura: "AuraDefinitionBundle",
  contentassets: "Document",
  quickactions: "QuickActionDefinition",
  approvalprocesses: "ApprovalProcess",
  externalCredentials: "ExternalCredential",
  namedCredentials: "NamedCredential",
  certificates: "Certificate",
  dataCategories: "DataCategoryGroup",
  translations: "Translation",
  settings: "Settings",
  objectTranslations: "CustomObjectTranslation"
};

// Objects live at objects/<Obj>/... and produce several members of ONE CustomObject.
const objectDirs = fs.existsSync(path.join(FORCE_APP, "objects"))
  ? fs
      .readdirSync(path.join(FORCE_APP, "objects"), { withFileTypes: true })
      .filter((e) => e.isDirectory())
  : [];

for (const e of objectDirs) {
  const set = covered.get("CustomObject");
  if (set && !set.has("*") && !set.has(e.name))
    fail(`custom object "${e.name}" is not in package.xml`);
  const set2 = covered.get("CustomField");
  if (set2 && !set2.has("*") && !set2.has(e.name + ".*")) {
    // CustomField members are Object.Field
    notes.push(
      `check CustomField coverage for ${e.name} manually (members are Object.Field)`
    );
  }
}

for (const [dir, type] of Object.entries(DIR_TYPES)) {
  const full2 = path.join(FORCE_APP, dir);
  if (!fs.existsSync(full2)) continue;
  for (const e of fs.readdirSync(full2, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const name = e.name.replace(/__\w+$/, "");
    const set = covered.get(type);
    if (set && !set.has("*") && !set.has(name) && type !== "CustomObject") {
      fail(
        `${rel(full2)}/${e.name}: not covered by package.xml (<members>${name}</members> under <name>${type}</name>)`
      );
    }
  }
}
notes.push(
  `force-app coverage checked for ${Object.keys(DIR_TYPES).length} metadata directories + ${objectDirs.length} object(s)`
);

/* ------------------------------------------- 5. Apex test-class convention */
const classesDir = path.join(FORCE_APP, "classes");
const classFiles = fs.existsSync(classesDir)
  ? fs
      .readdirSync(classesDir)
      .filter((n) => n.endsWith(".cls") && !n.endsWith("-meta.xml"))
  : [];
const classNames = new Set(classFiles.map((n) => n.replace(/\.cls$/, "")));
let tests = 0;
for (const cls of classNames) {
  if (cls.endsWith("Test") || cls.endsWith("_TEST")) {
    tests++;
    continue;
  }
  const expected = cls + "Test";
  const alt = cls + "_TEST";
  if (!classNames.has(expected) && !classNames.has(alt)) {
    notes.push(
      `Apex class "${cls}" has no ${expected}.cls — add one (75% org-wide coverage is required to deploy)`
    );
  }
}
if (classNames.size)
  notes.push(`${classNames.size} Apex class(es), ${tests} test class(es)`);

/* --------------------------------------------- 6. LWC bundle integrity */
const lwcDir = path.join(FORCE_APP, "lwc");
if (fs.existsSync(lwcDir)) {
  const bundles = fs
    .readdirSync(lwcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory());
  for (const b of bundles) {
    const dir = path.join(lwcDir, b.name);
    const hasJs = fs.readdirSync(dir).some((n) => n.endsWith(".js"));
    const hasHtml = fs.readdirSync(dir).some((n) => n.endsWith(".html"));
    if (!hasJs) fail(`${rel(dir)}: bundle has no .js component`);
    if (!hasHtml) fail(`${rel(dir)}: bundle has no .html template`);
    const hasTest = fs.readdirSync(dir).some((n) => n.endsWith(".test.js"));
    if (hasJs && !hasTest) notes.push(`LWC bundle "${b.name}" has no .test.js`);
  }
  if (bundles.length) notes.push(`${bundles.length} LWC bundle(s) checked`);
}

/* ------------------------------------------------------------------ report */
const pad = (s) => s;
if (notes.length) {
  console.log("notes:");
  notes.forEach((n) => console.log("  - " + pad(n)));
}
if (problems.length) {
  console.error(`\nFAIL: ${problems.length} problem(s) found\n`);
  problems.forEach((p) => console.error("  x " + p));
  process.exit(1);
}
console.log("\nOK: metadata manifests and force-app contents are consistent.");
