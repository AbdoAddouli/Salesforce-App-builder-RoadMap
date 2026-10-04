/* =============================================================================
 * Platform App Builder Academy — app
 * Client-side learning app: hash routing, lesson renderer, quiz engine
 * (multiple-choice AND multiple-select), timed 60-question mock exam,
 * per-exam-domain scorecard, progress persistence (localStorage), search.
 *
 * Derived from the Developer I & II Academy engine. Sections marked
 * "PAB ADDITION" are new in this project; everything else is unchanged.
 * ============================================================================= */

/* ------------------------- repo links -------------------------
 * Single source of truth. Swap REPO_SLUG when the GitHub repo is
 * created; every artifact/guide/footer link is derived from it.      */
const REPO_SLUG = 'AbdoAddouli/Salesforce-App-Builder-Roadmap';
const REPO_BLOB = 'https://github.com/' + REPO_SLUG + '/blob/main/';
const repoHref = p => REPO_BLOB + String(p).replace(/^\//, '');

/* Base for the published guide mirror (docs/guide), used for every "open the raw
 * guide" link. Derived from the same slug so there is one place to update.
 * (GUIDE_DIR below is the relative path the page FETCHES from; this is the
 * absolute URL a browser navigates to.)
 *
 * Named GUIDE_PAGES, not GUIDE: curriculum.js declares `GUIDE` (the GitHub blob
 * base) because the Abdo's Salesforce Academy hub reads it from there to build
 * its "view source" links, and both files are concatenated into one scope by
 * temp/pab-smoke.js. Two different URLs, so two different names. */
const GUIDE_PAGES = 'https://' + REPO_SLUG.split('/')[1].toLowerCase() +
  '.github.io/' + REPO_SLUG.split('/')[1] + '/guide/';

/* ------------------------- verified exam spine -------------------------
 * Salesforce Certified Platform App Builder (CRT-403).
 *
 * Every value below is quoted from an official Salesforce source listed in
 * EXAM_SOURCES. Kept in sync with
 * force-app/main/default/customMetadata/Certification_Setting__mdt.
 *
 * NOTE ON THE TWO CONTESTED FIELDS (alignedRelease, maintenance):
 * Salesforce's own pages disagree with each other, so both readings are kept
 * rather than picking one and hiding the other. The guides explain the
 * conflict; that is itself an exam-relevant lesson.
 *
 *   - EXAM_SOURCES.examGuideHelp  says "Version: Exam questions align to the
 *     Spring '24 release". That page is visibly stale (it still advertises
 *     Spring '24), so treat it as a floor, not a ceiling.
 *   - EXAM_SOURCES.examGuideTrailhead says maintenance is required "three
 *     times a year"; EXAM_SOURCES.maintenanceHelp says "one maintenance badge
 *     per year" and schedules Platform App Builder on the Winter cycle only.
 *     Current behaviour follows the Help article.
 */
const EXAM = {
  code: 'CRT-403',
  name: 'Salesforce Certified Platform App Builder',
  questions: 60,
  unscored: 5,
  minutes: 105,
  passPct: 63,
  feeUsd: 200,
  retakeUsd: 100,
  prerequisites: 'None',
  // "Exam questions align to the Spring '24 release" per the official Help exam
  // guide. Re-check before booking: Salesforce rolls this forward each cycle
  // without archiving the old page.
  alignedRelease: "Spring '24",
  // Two official statements disagree. maintenancePerYear is the CURRENT
  // requirement (one Winter-cycle badge); maintenancePerYearExamGuide is what
  // the exam guide still says (three times a year).
  maintenancePerYear: 1,
  maintenancePerYearExamGuide: 3,
  maintenanceCycle: 'Winter',
  // CRT-403 is an Associate credential: no prerequisites, and an Associate
  // credential never expires as long as maintenance is completed on time.
  credentialType: 'Associate'
};

const EXAM_SOURCES = {
  examGuideHelp:
    'https://help.salesforce.com/s/articleView?id=005298964&language=en_US&type=1',
  examGuideTrailhead:
    'https://trailhead.salesforce.com/en/help?article=Salesforce-Certified-Platform-App-Builder-Exam-Guide',
  examOutlinePdf:
    'https://developer.salesforce.com/resources2/certification-site/files/SGCertifiedPlatformAppBuilder.pdf',
  maintenanceSchedule:
    'https://help.salesforce.com/s/articleView?id=005298922&language=en_US&type=1',
  maintenanceOverview:
    'https://help.salesforce.com/s/articleView?id=005298841&language=en_US&type=1'
};

/* The five official exam sections and their published weightings (total 100%). */
const DOMAINS = [
  { id: 'fund',  name: 'Salesforce Fundamentals',        pct: 23, color: '#4F46E5' },
  { id: 'data',  name: 'Data Modeling & Management',     pct: 22, color: '#0EA5E9' },
  { id: 'logic', name: 'Business Logic & Process Automation', pct: 28, color: '#7C3AED' },
  { id: 'ui',    name: 'User Interface',                 pct: 17, color: '#10B981' },
  { id: 'deploy',name: 'App Deployment',                 pct: 10, color: '#F59E0B' }
];
const domainById = id => DOMAINS.find(d => d.id === id);


/* ------------------------- theme -------------------------
 * Key is namespaced to THIS academy. GitHub Pages serves every site on the
 * same *.github.io origin, so the Developer I & II academy and this one share
 * localStorage. An un-namespaced key would silently overwrite the other
 * site's progress and theme.
 */
const THEME_KEY = 'pab-academy-theme';

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(THEME_KEY, t);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = t === 'dark' ? '🌙' : '☀️';
}

/* ------------------------- small helpers ------------------------- */

const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

const esc = (s = '') => s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const cyrb53 = s => { let h = 9; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761); return (h ^ h >>> 9) >>> 0; };

/* Optional per-module fields, defaulted here so a phase only has to declare what
 * is specific to it.
 *
 * `art` matters most: renderModule() renders an "artifacts in this repo" grid by
 * calling mod.art.map(...). With no default, omitting `art` from a module threw a
 * TypeError inside the hashchange handler, which aborted render() midway and left
 * a half-rendered phase page - a content omission that looked like a rendering
 * bug. Defaulting optional display fields here keeps that failure mode closed. */
const MODULE_DEFAULTS = { art: [] };
const MODULES = ACADEMY.map(m => Object.assign({}, MODULE_DEFAULTS, m));

/* Exercise id -> { mod, li, block }, built in the walk below and used by search
 * to link straight to the lesson that contains the exercise. */
const EX_INDEX = {};

/* Exercise ids are DERIVED, never authored by hand.
 * Exercises are rendered inline as ex / proj blocks inside a lesson, so a
 * hand-maintained `exerciseIds` array is a second source of truth that can
 * silently drift from what the page actually draws (the scorecard would then
 * count an exercise that is not there, and search would index one that never
 * renders). Walking the block tree once here keeps the progress bars, the
 * self-rating lookup and the search index in lockstep with the lessons. */
MODULES.forEach(m => {
  const ids = [];
  (m.lessons || []).forEach((l, li) => (l.blocks || []).forEach(b => {
    if ((b.t === 'ex' || b.t === 'proj') && b.id && ids.indexOf(b.id) === -1) {
      ids.push(b.id);
      EX_INDEX[b.id] = { mod: m, li, block: b };
    }
  }));
  m.exerciseIds = ids;
});

/* ------------------------- progress store -------------------------
 * Namespaced per academy for the same origin reason as THEME_KEY.
 * Bump the version suffix only for a breaking shape change; the store merges
 * defaults, so adding a new key (e.g. "mock") needs no bump at all.       */
const KEY = 'pab-academy-v1';
let store = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || defaultStore(); }
  catch (e) { return defaultStore(); }
}
function defaultStore() {
  return { done: {}, quiz: {}, best: {}, stars: {}, guide: {}, lastOpen: null, mock: [] };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
}
function lessonDone(mid, li)  { return !!store.done[mid + ':' + li]; }
function markDone(mid, li, v) { store.done[mid + ':' + li] = v; save(); }
function guideRead(mid)       { return !!(store.guide && store.guide[mid]); }
function markGuideRead(mid, v) { if (!store.guide) store.guide = {}; store.guide[mid] = v; save(); }

/* PAB ADDITION — exercise self-rating (1-4 stars) feeds `store.stars`,
   which the engine rendered but never wrote. */
function exStars(id)        { return (store.stars && store.stars[id]) || 0; }
function setExStars(id, n)  { if (!store.stars) store.stars = {}; store.stars[id] = n; save(); }

/* PAB ADDITION — best mock-exam result, 0..1 (null until first attempt). */
function mockBest() { return (store.mock && store.mock.length) ? Math.max.apply(null, store.mock) : null; }
function recordMock(pct) {
  if (!Array.isArray(store.mock)) store.mock = [];
  store.mock.push(pct); save();
}

function moduleProgress(mid) {
  const m = byId(mid);
  if (!m) return { done: 0, total: 0, pct: 0, quizPct: 0, complete: 0, totalUnits: 0 };
  const lessons = m.lessons.length;
  let done = 0;
  if (guideRead(mid)) {
    done = lessons;                       // reading the full guide = all lessons
  } else {
    m.lessons.forEach((_, i) => { if (lessonDone(mid, i)) done++; });
  }
  // lessons are worth 2 units, quiz worth 1
  const units = lessons * 2 + 1;
  const earned = done * 2 + (store.quiz[mid] ? 1 : 0);
  const pct = Math.round((earned / units) * 100);
  const complete = earned >= units;
  return { done, total: lessons, pct, quizPct: quizPctOf(mid), complete, earned, units };
}
function quizPctOf(mid) {
  const m = byId(mid);
  if (!m || !store.best[mid]) return 0;
  return Math.round((store.best[mid] / m.quiz.questions.length) * 100);
}
function overallPct() {
  const rows = MODULES.map(m => {
    const p = moduleProgress(m.id);
    return p.units ? p.earned / p.units * 100 : 0;
  });
  return Math.round(rows.reduce((a, b) => a + b, 0) / rows.length);
}

function byId(id) { return MODULES.find(m => m.id === id); }

/* ------------------------- PAB: exam-domain scorecard -------------------------
 * Each module declares `exam` — the official section it maps to. A domain's
 * mastery blends three signals:
 *   lessons read (60%) + phase quiz score (25%) + exercises self-rated (15%)
 * `weighted` is the published exam weighting, so the headline number is
 * "how ready am I, weighted the way the real exam is weighted".            */
function domainScore(id) {
  const mods = MODULES.filter(m => m.exam === id);
  if (!mods.length) return { pct: 0, mods: 0, weighted: 0, lessonsDone: 0, lessonsTotal: 0, quizBest: 0, quizTotal: 0 };
  const d = domainById(id);
  let lessonsDone = 0, lessonsTotal = 0, quizBest = 0, quizTotal = 0, exRated = 0, exTotal = 0, exPts = 0;

  mods.forEach(m => {
    const p = moduleProgress(m.id);
    lessonsDone += p.done; lessonsTotal += p.total;
    if (store.best[m.id] != null) { quizBest += store.best[m.id]; quizTotal += m.quiz.questions.length; }
    // exercise ids are declared per module in curriculum.js
    (m.exerciseIds || []).forEach(id2 => {
      exTotal++;
      const s = exStars(id2);
      if (s) { exRated++; exPts += s / 4; }
    });
  });

  const lessonPct = lessonsTotal ? lessonsDone / lessonsTotal : 0;
  const quizPct  = quizTotal   ? quizBest / quizTotal : 0;
  const exPct    = exTotal     ? exPts / exTotal : 0;
  // before you have attempted quizzes, fall back to lesson progress alone
  const score = quizTotal ? (0.60 * lessonPct + 0.25 * quizPct + 0.15 * exPct) : lessonPct;

  return {
    pct: Math.round(score * 100),
    raw: score,
    mods: mods.length,
    weighted: d ? d.pct : 0,
    lessonsDone, lessonsTotal,
    quizBest, quizTotal,
    exRated, exTotal
  };
}

/* Headline readiness = sum(weighting% x mastery) — i.e. the score you would be
 * expected to hit if every section were sampled at its published rate. */
function examReadiness() {
  const total = DOMAINS.reduce((acc, d) => acc + (d.pct / 100) * domainScore(d.id).raw, 0);
  return Math.round(total * 100);
}


/* ------------------------- routing ------------------------- */

let route = { view: 'home', mid: null, li: null };

function navigate(view, mid, li) {
  route = { view, mid, li: li != null ? li : null };
  history.replaceState(null, '', '#' + hashFor());
  render();
}
function hashFor() {
  if (route.view === 'phase')  return '/phase/' + route.mid;
  if (route.view === 'domain') return '/domain/' + route.mid;
  if (route.view === 'lesson') return '/lesson/' + route.mid + '/' + route.li;
  if (route.view === 'quiz')  return '/quiz/' + route.mid;
  if (route.view === 'guide') return '/guide/' + route.mid + (route.anchor ? '/' + route.anchor : '');
  if (route.view === 'mock') return '/mock';
  return '/';
}
function parseHash() {
  const h = decodeURIComponent((location.hash || '#/').replace(/^#/, ''));
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'phase')  return { view: 'phase', mid: parts[1] };
  if (parts[0] === 'domain') return { view: 'domain', mid: parts[1] };
  if (parts[0] === 'lesson') return { view: 'lesson', mid: parts[1], li: Number(parts[2]) };
  if (parts[0] === 'quiz')   return { view: 'quiz', mid: parts[1] };
  if (parts[0] === 'guide')  return { view: 'guide', mid: parts[1], anchor: parts[2] || null };
  if (parts[0] === 'mock')   return { view: 'mock' };
  return { view: 'home' };
}

/* ------------------------- renderer ------------------------- */

const view = $('#view');

function render() {
  const mod = route.mid ? byId(route.mid) : null;
  const r = parseHash(); // keep in sync with friendly URLs
  document.title = 'Platform App Builder Academy' + (mod ? ' · ' + mod.title : '');

  // sidebar
  renderSidebar();

  // topbar progress
  const tp = $('#topPct');
  if (tp) tp.textContent = overallPct() + '%';
  const tbar = $('#topBar');
  if (tbar) tbar.style.width = overallPct() + '%';
  bindTopSearch();

  if (r.view === 'phase')  return renderModule(mod);
  if (r.view === 'domain') return renderDomain(route.mid);
  if (r.view === 'lesson') return renderLesson(mod, Math.min(Number(r.li) || 0, mod.lessons.length - 1));
  if (r.view === 'quiz')   return renderQuiz(mod);
  if (r.view === 'guide')  return renderGuide(mod);
  if (r.view === 'mock')   return renderMock();
  renderHome();
}

/* ------------------------- sidebar ------------------------- */

function renderSidebar() {
  const aside = $('aside.sidebar');
  aside.innerHTML = `
    <div class="side-brand">
      <div class="logo">☁️</div>
      <div><b>Platform App Builder Academy</b><span>17-phase roadmap</span></div>
    </div>`;

  const nav = document.createElement('nav');
  nav.className = 'side-nav';

  const home = document.createElement('a');
  home.href = '#/';
  home.className = 'side-link' + (route.view === 'home' ? ' active' : '');
  home.innerHTML = `<span class="sli">🏠</span> Dashboard`;
  nav.appendChild(home);

  /* PAB ADDITION — timed mock exam sits at the top of the sidebar. */
  const mock = document.createElement('a');
  mock.href = '#/mock';
  mock.className = 'side-link' + (route.view === 'mock' ? ' active' : '');
  const mb = mockBest();
  mock.innerHTML = `<span class="sli">🎯</span> Mock Exam` + (mb != null ? `<span class="sp-pct">${Math.round(mb * 100)}%</span>` : '');
  nav.appendChild(mock);

  /* PAB ADDITION — a section per official exam section, so the sidebar doubles
     as the blueprint tracker. */
  const bg = document.createElement('div');
  bg.className = 'side-group';
  bg.textContent = 'Exam sections';
  nav.appendChild(bg);

  DOMAINS.forEach(d => {
    const s = domainScore(d.id);
    const a = document.createElement('a');
    a.href = '#/domain/' + d.id;
    a.className = 'side-phase side-domain' + (route.view === 'domain' && route.mid === d.id ? ' active' : '');
    a.innerHTML = `
      <span class="sp-n" style="border-color:${d.color}">${d.pct}</span>
      <span class="sp-body">
        <span class="sp-title">${d.name}</span>
        <span class="sp-bar"><i style="width:${s.pct}%;background:${d.color}"></i></span>
      </span>
      <span class="sp-pct">${s.pct}%</span>`;
    nav.appendChild(a);
  });

  const bg2 = document.createElement('div');
  bg2.className = 'side-group';
  bg2.textContent = 'Phases';
  nav.appendChild(bg2);

  MODULES.forEach(m => {
    const p = moduleProgress(m.id);
    const a = document.createElement('a');
    a.href = '#/phase/' + m.id;
    a.className = 'side-phase' + (route.mid === m.id && route.view !== 'domain' ? ' active' : '');
    a.innerHTML = `
      <span class="sp-n" style="border-color:${m.color}">${String(m.n).padStart(2, '0')}</span>
      <span class="sp-body">
        <span class="sp-title">${m.title}</span>
        <span class="sp-bar"><i style="width:${p.pct}%;background:${m.color}"></i></span>
      </span>
      <span class="sp-pct">${p.pct}%</span>
      ${p.complete ? '<span class="sp-ok">✓</span>' : ''}`;
    nav.appendChild(a);
  });

  aside.appendChild(nav);

  const progWrap = document.createElement('div');
  progWrap.className = 'side-progress';
  const op = overallPct();
  const er = examReadiness();
  progWrap.innerHTML = `<div class="sp-bar big"><i style="width:${op}%"></i></div>
    <div class="side-prog-label"><b>${op}%</b> of roadmap complete</div>
    <div class="sp-bar big" style="margin-top:8px"><i style="width:${er}%;background:linear-gradient(90deg,var(--warn),var(--ok))"></i></div>
    <div class="side-prog-label"><b>${er}%</b> weighted exam readiness${er >= EXAM.passPct ? ' · 🎯 at pass line' : ''}</div>`;
  aside.appendChild(progWrap);
}

/* ------------------------- home ------------------------- */

function renderHome() {
  const op = overallPct();
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const totalDone = MODULES.reduce((a, m) => a + moduleProgress(m.id).earned, 0);
  const totalUnits = MODULES.reduce((a, m) => a + moduleProgress(m.id).units, 0);

  // continue card
  let next = null;
  for (const m of MODULES) {
    for (let i = 0; i < m.lessons.length; i++) {
      if (!lessonDone(m.id, i)) { next = { m, i }; break; }
    }
    if (next) break;
  }
  if (!next) next = { m: MODULES[0], i: 0 };
  let resume = null;
  if (store.lastOpen && byId(store.lastOpen.mid)) {
    const lm = byId(store.lastOpen.mid);
    resume = { m: lm, li: Math.max(0, Math.min(store.lastOpen.li, lm.lessons.length - 1)) };
  }
  if (!resume) resume = { m: next.m, li: next.i };
  const rm = resume.m;

  view.innerHTML = `
    <div class="home-hero reveal">
      <div>
        <div class="hero-kicker">${EXAM.code} · Salesforce Platform App Builder</div>
        <h1 class="hero-title">Become <span class="grad">app builder certified</span>, phase by phase.</h1>
        <p class="hero-sub">${MODULES.length} guided modules, ${totalLessons} lessons, ${MODULES.length} quizzes and a ${EXAM.questions}-question timed mock exam — mirroring the real ${EXAM.questions} questions / ${EXAM.minutes} minutes / ${EXAM.passPct}% pass mark, with real declarative metadata in the repo to deploy and click through.</p>
        <div class="hero-actions">
          <button class="btn primary" id="startBtn">${next ? '▶ Continue learning' : '🎉 Restart'}</button>
          <a class="btn ghost" href="#/mock">🎯 Take the mock exam</a>
          <button class="btn ghost" id="phasesBtn">Browse all phases</button>
          <span class="hero-meta">📅 17 phases · self-paced</span>
        </div>
      </div>
      <div class="ring-wrap">
        <div class="ring" style="--p:${op}"><span>${op}<small>%</small></span></div>
        <div class="ring-caption">roadmap progress</div>
      </div>
    </div>

    <div class="stats reveal">
      <div class="stat"><div class="st-n">${totalDone}<small>/${totalUnits}</small></div><div class="st-l">units completed</div></div>
      <div class="stat"><div class="st-n">${MODULES.filter(m => moduleProgress(m.id).complete).length}<small>/</small></div><div class="st-l">phases mastered</div></div>
      <div class="stat"><div class="st-n">${MODULES.filter(m => store.best[m.id] >= m.quiz.questions.length).length}<small>/</small></div><div class="st-l">quizzes passed</div></div>
      <div class="stat"><div class="st-n">${examReadiness()}<small>%</small></div><div class="st-l">weighted exam readiness</div></div>
    </div>

    ${domainScorecardHTML()}

    <div class="home-cards">
      <div class="card continue-card" style="--c:${rm.color}">
        <div class="cc-top"><span class="cc-label">Continue where you left off</span><span class="pill">Phase ${rm.n}</span></div>
        <h3>${resume.li != null && resume.li < rm.lessons.length ? rm.lessons[resume.li].title : rm.lessons[0].title}</h3>
        <div class="cc-sub">${rm.title}</div>
        <div class="sp-bar"><i style="width:${moduleProgress(rm.id).pct}%;background:${rm.color}"></i></div>
        <button class="btn primary sm" id="resumeBtn">Resume →</button>
      </div>
      <div class="card next-card" style="--c:${next.m.color}">
        <div class="cc-top"><span class="cc-label">Next up</span><span class="pill">Phase ${next.m.n}</span></div>
        <h3>${next.i != null && next.i < next.m.lessons.length ? next.m.lessons[next.i].title : next.m.lessons[0].title}</h3>
        <div class="cc-sub">${next.m.lessons[next.i].mins} min · ${next.m.lessons.length} lessons · ${next.m.quiz.questions.length}-question quiz</div>
        <button class="btn sm" id="nextBtn">Open →</button>
      </div>
      <div class="card streak-card" style="--c:#e8b93d">
        <div class="cc-top"><span class="cc-label">Learning tips</span></div>
        <h3>3 wins today</h3>
        <ul class="tips">
          <li>Build the <b>same object twice</b> — once by click, once with Schema Builder.</li>
          <li>After a phase, sit the <a href="#/mock">🎯 timed mock exam</a>.</li>
          <li>Use <kbd>/</kbd> to search anything.</li>
        </ul>
      </div>
    </div>

    <div class="grid-head reveal"><h2>Your roadmap</h2><span>${MODULES.length} phases · study in order or jump anywhere</span></div>
    <div class="module-grid reveal" id="modGrid"></div>`;

  $('#startBtn').addEventListener('click', () => navigate('lesson', resume.m.id, resume.li != null && resume.li < rm.lessons.length ? resume.li : 0));
  $('#resumeBtn').addEventListener('click', () => navigate('lesson', resume.m.id, resume.li != null && resume.li < rm.lessons.length ? resume.li : 0));
  $('#nextBtn').addEventListener('click', () => navigate('lesson', next.m.id, next.i));
  $('#phasesBtn').addEventListener('click', () => navigate('phase', MODULES[0].id));

  const grid = $('#modGrid');
  MODULES.forEach(m => {
    const p = moduleProgress(m.id);
    const d = domainById(m.exam);
    const card = document.createElement('a');
    card.href = '#/phase/' + m.id;
    card.className = 'mod-card';
    card.style.setProperty('--c', m.color);
    card.innerHTML = `
      <div class="mc-top">
        <span class="mc-num">${String(m.n).padStart(2, '0')}</span>
        <span class="mc-ico">${m.icon}</span>
        ${p.complete ? '<span class="mc-done">✓ completed</span>' : ''}
      </div>
      <h3>${esc(m.title)}</h3>
      <div class="mc-tag">${esc(m.tagline)}</div>
      ${d ? `<div class="mc-exam" title="Maps to the ${esc(d.name)} exam section (${d.pct}% of the exam)"><i style="background:${d.color}"></i>${esc(d.name)} · ${d.pct}%</div>` : ''}
      <div class="mc-prog">
        <div class="sp-bar"><i style="width:${p.pct}%;background:${m.color}"></i></div>
        <div class="mc-sub">${p.done}/${p.total} lessons · ${p.quizPct}% quiz</div>
      </div>
      <div class="mc-foot">
        <span>${m.lessons.length} lessons · ${m.quiz.questions.length} quiz</span>
        <span class="mc-arrow">→</span>
      </div>`;
    grid.appendChild(card);
  });
}

/* ------------------------- PAB: domain scorecard HTML ------------------------- */
function domainScorecardHTML() {
  const er = examReadiness();
  const rows = DOMAINS.map(d => {
    const s = domainScore(d.id);
    return `
      <a class="dc-row" href="#/domain/${d.id}">
        <span class="dc-name"><i class="dc-dot" style="background:${d.color}"></i><span>${esc(d.name)}</span><span class="dc-w">${d.pct}% of exam</span></span>
        <span class="dc-track"><i style="width:${s.pct}%;background:${d.color}"></i></span>
        <span class="dc-pct">${s.pct}%</span>
      </a>`;
  }).join('');

  return `
    <div class="domain-card reveal">
      <div class="dc-head">
        <h3>📊 ${EXAM.code} readiness by exam section</h3>
        <span class="dc-note">${esc(EXAM.name)}</span>
      </div>
      <p class="dc-sub">
        Your five bars are the five official exam sections. <b>Readiness</b> blends lessons read (60%), phase-quiz
        score (25%) and how you self-rate the hands-on exercises (15%). The headline figure weights each section by its
        published exam weighting, so it estimates the score you would get if the real exam sampled every section at its
        official rate.
      </p>
      <div class="dc-rows">${rows}</div>
      <div class="dc-foot">
        <span>Weighted readiness <b>${er}%</b></span>
        <span>·</span>
        <span>Pass mark <b>${EXAM.passPct}%</b></span>
        <span>·</span>
        <span>${er >= EXAM.passPct ? '<span class="mock-pass-mark">at/above the pass line</span>' : `needs <b>+${EXAM.passPct - er}</b> points to reach it`}</span>
        <span style="margin-left:auto"></span>
        <a class="btn ghost sm" href="#/mock">🎯 Sit the mock exam</a>
      </div>
    </div>`;
}

/* ------------------------- PAB: single exam-section page ------------------------- */
function renderDomain(id) {
  const d = domainById(id);
  if (!d) return renderHome();
  const s = domainScore(id);
  const mods = MODULES.filter(m => m.exam === id);
  const quizTotal = mods.reduce((a, m) => a + m.quiz.questions.length, 0);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <b>${esc(d.name)}</b></div>

    <div class="phase-hero reveal" style="--c:${d.color}">
      <div class="ph-ico">📊</div>
      <div class="ph-body">
        <div class="ph-kicker">Official exam section · ${d.pct}% of the ${EXAM.code}</div>
        <h1>${esc(d.name)}</h1>
        <div class="ph-obj"><span>This section is covered by ${mods.length} phase${mods.length === 1 ? '' : 's'}:</span>
          <ul>${mods.map(m => `<li>${esc(m.title)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="ph-side">
        <div class="ring sm" style="--p:${s.pct};--c:${d.color}"><span>${s.pct}<small>%</small></span></div>
        <div class="ph-stats"><span>${s.lessonsDone}/${s.lessonsTotal} lessons</span><span>${s.quizBest}/${s.quizTotal} quiz points</span></div>
        <a class="btn primary sm" href="#/mock">🎯 Test this on the mock exam</a>
      </div>
    </div>

    <div class="domain-card reveal">
      <div class="dc-head"><h3>How your ${s.pct}% is calculated</h3></div>
      <div class="dc-rows">
        <div class="dc-row"><span class="dc-name"><span>Lessons &amp; guides read</span></span>
          <span class="dc-track"><i style="width:${s.lessonsTotal ? Math.round(s.lessonsDone / s.lessonsTotal * 100) : 0}%;background:${d.color}"></i></span>
          <span class="dc-pct">${s.lessonsDone}/${s.lessonsTotal}</span></div>
        <div class="dc-row"><span class="dc-name"><span>Phase quiz points earned</span></span>
          <span class="dc-track"><i style="width:${s.quizTotal ? Math.round(s.quizBest / s.quizTotal * 100) : 0}%;background:${d.color}"></i></span>
          <span class="dc-pct">${s.quizBest}/${s.quizTotal}</span></div>
        <div class="dc-row"><span class="dc-name"><span>Exercises you self-rated</span></span>
          <span class="dc-track"><i style="width:${s.exTotal ? Math.round(s.exRated / s.exTotal * 100) : 0}%;background:${d.color}"></i></span>
          <span class="dc-pct">${s.exRated}/${s.exTotal}</span></div>
      </div>
    </div>

    <div class="grid-head reveal"><h2>Phases in this section</h2><span>${mods.length} phase${mods.length === 1 ? '' : 's'}</span></div>
    <div class="module-grid reveal" id="domGrid"></div>`;

  const grid = $('#domGrid');
  mods.forEach(m => {
    const p = moduleProgress(m.id);
    const card = document.createElement('a');
    card.href = '#/phase/' + m.id;
    card.className = 'mod-card';
    card.style.setProperty('--c', m.color);
    card.innerHTML = `
      <div class="mc-top"><span class="mc-num">${String(m.n).padStart(2, '0')}</span><span class="mc-ico">${m.icon}</span>
      ${p.complete ? '<span class="mc-done">✓ completed</span>' : ''}</div>
      <h3>${esc(m.title)}</h3>
      <div class="mc-tag">${esc(m.tagline)}</div>
      <div class="mc-prog"><div class="sp-bar"><i style="width:${p.pct}%;background:${m.color}"></i></div>
        <div class="mc-sub">${p.done}/${p.total} lessons · ${p.quizPct}% quiz</div></div>
      <div class="mc-foot"><span>${m.lessons.length} lessons · ${m.quiz.questions.length} quiz</span><span class="mc-arrow">→</span></div>`;
    grid.appendChild(card);
  });
}

/* ------------------------- module/phase page ------------------------- */

function renderModule(mod) {
  const p = moduleProgress(mod.id);
  const quizScore = store.best[mod.id];
  const d = domainById(mod.exam);
  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> ${d ? `<a href="#/domain/${d.id}">${esc(d.name)}</a> <span>›</span> ` : ''} <b>${mod.title}</b></div>

    <div class="phase-hero reveal" style="--c:${mod.color}">
      <div class="ph-ico">${mod.icon}</div>
      <div class="ph-body">
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · ${mod.tagline}</div>
        <h1>${mod.title}</h1>
        ${d ? `<div class="mc-exam" style="margin:6px 0 10px"><i style="background:${d.color}"></i>Exam section: <b style="color:var(--text)">${esc(d.name)}</b> · ${d.pct}% of ${EXAM.code}</div>` : ''}
        <div class="ph-obj"><span>By the end you can:</span>
          <ul>${mod.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="ph-side">
        <div class="ring sm" style="--p:${p.pct};--c:${mod.color}"><span>${p.pct}<small>%</small></span></div>
        <div class="ph-stats">
          <span>${p.done}/${p.total} lessons</span>
          <span>${store.quiz[mod.id] ? '✓ quiz taken' : 'quiz pending'}</span>
        </div>
        <a class="btn primary sm" href="#/guide/${mod.id}">📖 Read the full guide</a>
        <a class="btn ghost sm" target="_blank" rel="noopener"
           href="${GUIDE_PAGES}${mod.guide}">📄 raw</a>
      </div>
    </div>

    <div class="lessons reveal">
      <a class="lesson-row guide-row" href="#/guide/${mod.id}" style="--c:${mod.color}">
        <span class="lr-state guide">📖</span>
        <span class="lr-info">
          <b>Full module guide</b>
          <span class="lr-meta">complete walkthrough · sections, tables, code & checklists${guideRead(mod.id) ? ' · read ✓' : ''}</span>
        </span>
        <span class="lr-arrow">→</span>
      </a>
      ${mod.lessons.map((l, i) => `
        <a class="lesson-row" href="#/lesson/${mod.id}/${i}" style="--c:${mod.color}">
          <span class="lr-state">${lessonDone(mod.id, i) ? '<span class="lr-done">✓</span>' : String(i + 1).padStart(2, '0')}</span>
          <span class="lr-info">
            <b>${l.title}</b>
            <span class="lr-meta">${l.mins} min</span>
          </span>
          <span class="lr-arrow">→</span>
        </a>`).join('')}
    </div>

    <div class="quiz-card reveal" style="--c:${mod.color}">
      <div class="qc-left">
        <div class="qc-ico">🧠</div>
        <div>
          <h3>Module quiz · check your understanding</h3>
          <p>${mod.quiz.questions.length} questions · ${mod.quiz.mins} min.
             ${quizScore != null ? `Your best: <b>${quizScore}/${mod.quiz.questions.length}</b> (${Math.round(quizScore / mod.quiz.questions.length * 100)}%).` : 'Not attempted yet.'}
          </p>
        </div>
      </div>
      <div class="qc-right">
        ${quizScore != null && quizScore === mod.quiz.questions.length ? '<span class="qc-perfect">★ perfect</span>' : ''}
        <a class="btn primary" href="#/quiz/${mod.id}">${quizScore != null ? 'Retake quiz' : 'Take quiz →'}</a>
      </div>
    </div>

    <div class="artifacts reveal">
      <h3>📦 Real artifacts in this repo</h3>
      <div class="artifacts-grid">
        ${mod.art.map(a => `
          <a class="artifact" target="_blank" rel="noopener"
             href="${repoHref(a.href)}" style="--c:${mod.color}">
            <span class="a-ico">🗂️</span> <span>${esc(a.label)}</span>
          </a>`).join('')}
      </div>
    </div>

    <div class="phase-nav reveal">
      ${mod.n > 1 ? `<a class="btn ghost" href="#/phase/${MODULES[mod.n - 2].id}">← ${MODULES[mod.n - 2].title}</a>` : '<span></span>'}
      ${mod.n < MODULES.length
        ? `<a class="btn primary" href="#/phase/${MODULES[mod.n].id}">${MODULES[mod.n].title} →</a>`
        : `<a class="btn primary" href="#/quiz/${mod.id}">🎯 Take the final quiz</a>`}
    </div>`;
}

/* ------------------------- lesson page ------------------------- */

function renderLesson(mod, li) {
  const lesson = mod.lessons[li];
  const prevI = li > 0 ? li - 1 : null;
  const nextI = li < mod.lessons.length - 1 ? li + 1 : null;
  const done = lessonDone(mod.id, li);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>›</span> <b>${lesson.title}</b></div>

    <div class="lesson-wrap reveal">
      <aside class="lesson-toc">
        <div class="toc-title">${mod.title}</div>
        ${mod.lessons.map((l, i) => `
          <a href="#/lesson/${mod.id}/${i}" class="toc-item ${i === li ? 'active' : ''}">
            <span class="toc-state">${lessonDone(mod.id, i) ? '✓' : i + 1}</span>
            <span>${l.title}<span class="toc-min">${l.mins}′</span></span>
          </a>`).join('')}
        <a href="#/guide/${mod.id}" class="toc-item toc-guide" style="--c:${mod.color}">
          <span class="toc-state">📖</span><span>Full module guide</span>
        </a>
        <a href="#/quiz/${mod.id}" class="toc-item toc-quiz" style="--c:${mod.color}">
          <span class="toc-state">🧠</span><span>Module quiz</span>
        </a>
      </aside>

      <article class="lesson article" style="--c:${mod.color}">
        <div class="lesson-head" style="--c:${mod.color}">
          <div class="lh-meta">Phase ${String(mod.n).padStart(2, '0')} · Lesson ${li + 1} of ${mod.lessons.length} · ${lesson.mins} min</div>
          <h1>${lesson.title}</h1>
        </div>
        <div class="chips">
          ${mod.objectives.map((o, i) => `<span class="chip-o">${o}</span>`).join('')}
        </div>

        <div class="blocks">${lesson.blocks.map(renderBlock).join('')}</div>

        <div class="lesson-foot">
          <div class="lf-left">
            ${done
              ? '<button class="btn ghost sm" id="unbtn">↩ Mark as unlearned</button>'
              : `<button class="btn primary" id="doneBtn">✓ Mark lesson complete</button>`}
          </div>
          <div class="lf-right">
            ${prevI != null ? `<a class="btn ghost sm" href="#/lesson/${mod.id}/${prevI}">← Prev</a>` : ''}
            ${nextI != null
              ? `<a class="btn primary sm" href="#/lesson/${mod.id}/${nextI}">Next →</a>`
              : `<a class="btn primary sm" href="#/quiz/${mod.id}">Take the quiz →</a>`}
          </div>
        </div>
      </article>
    </div>`;

  const b = $('#doneBtn'); const u = $('#unbtn');
  if (b) b.addEventListener('click', () => { markDone(mod.id, li, true); store.lastOpen = { mid: mod.id, li }; save(); toast('Lesson complete! 🎉'); render(); });
  if (u) u.addEventListener('click', () => { markDone(mod.id, li, false); render(); });
  store.lastOpen = { mid: mod.id, li }; save();
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

/* Minimal markdown renderer for the exercise answer blocks + full guides */
let mdToc = [];            // filled on every md() call: { lvl, slug, label }

function slugify(txt) {
  return String(txt || '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'section';
}

function mdInline(t) {
  return String(t)
    .replace(/`([^`]+)`/g, (m, c) => '\u0001' + c + '\u0002')       // protect inline code
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*\u0001\u0002])\*([^*\n\u0001\u0002]+?)\*(?!\*)/g, '$1<i>$2</i>')
    .replace(/\u0001([^\u0002]*)\u0002/g, '<code class="inline">$1</code>');
}

function md(src, opts) {
  opts = opts || {};
  const lines = String(src || '').split(/\r?\n/);
  const html = [];
  const seen = new Set();
  mdToc = [];
  let i = 0, inFence = false, fenceBuf = [], fenceLang = '';

  while (i < lines.length) {
    const line = lines[i];

    if (!inFence && /^```/.test(line)) {
      inFence = true; fenceLang = (line.match(/^```(\w*)/) || [])[1] || 'text'; fenceBuf = []; i++; continue;
    }
    if (inFence) {
      if (/^```/.test(line)) {
        html.push(renderCode(fenceLang, fenceBuf));
        inFence = false; fenceBuf = []; fenceLang = ''; i++; continue;
      }
      fenceBuf.push(line); i++; continue;
    }
    if (/^\s*---\s*$/.test(line)) { i++; continue; }

    const head = line.match(/^(#{1,4})\s+(.*)/);
    if (head) {
      const hl = head[1].length;
      if (opts.skipH1 && hl === 1 && !seen.has('h1')) { seen.add('h1'); i++; continue; }
      const lvl = hl + (opts.shift || 0);
      const txt = esc(head[2]);
      const label = mdInline(txt).replace(/<[^>]+>/g, '');
      let slug = slugify(label), base = slug, n = 2;
      while (seen.has(slug)) { slug = base + '-' + n; n++; }
      seen.add(slug);
      if (lvl <= 4) mdToc.push({ lvl, slug, label });
      html.push(`<h${lvl} id="${slug}">${mdInline(txt)}</h${lvl}>`);
      i++; continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      html.push(mdTable(rows));
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      const isTask = /^\s*[-*]\s+\[[ xX]\]/.test(line);
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i]); i++; }
      if (isTask) {
        html.push('<ul class="task-list">' + items.map(x => {
          const m = x.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)/);
          if (!m) return `<li>${mdInline(esc(x.replace(/^\s*[-*]\s+/, '')))}</li>`;
          const done = m[1] === 'x' || m[1] === 'X';
          return `<li class="task ${done ? 'done' : ''}"><span class="t-box">${done ? '✓' : ''}</span><span class="t-text">${mdInline(esc(m[2]))}</span></li>`;
        }).join('') + '</ul>');
      } else {
        html.push(`<ul class="tick-list">${items.map(x => `<li>${mdInline(esc(x.replace(/^\s*[-*]\s+/, '')))}</li>`).join('')}</ul>`);
      }
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      html.push(`<ol>${items.map(x => `<li>${mdInline(esc(x))}</li>`).join('')}</ol>`);
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }

    const para = [];
    while (i < lines.length) {
      const l = lines[i];
      if (/^\s*$/.test(l) || /^```/.test(l) || /^\|/.test(l) || /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l) || /^(#{1,4})\s+/.test(l) || /^\s*---\s*$/.test(l)) break;
      para.push(l); i++;
    }
    if (para.length) html.push(`<p>${mdInline(esc(para.join(' ')))}</p>`);
  }

  if (inFence && fenceBuf.length) html.push(renderCode(fenceLang, fenceBuf));
  return html.join('');
}

/* ------------------------- PAB: code syntax highlighting -------------------------
 * The base engine emitted `class="lang-<x>"` but shipped no token rules, so
 * every fence rendered flat. These patterns split RAW source into named token
 * groups, then each piece is escaped — so nothing can inject markup.
 * Flow Builder metadata is XML, so `flow` reuses the XML rules.               */
const HL_APEX = /(?<com>\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(?<str>"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(?<lit>@[A-Za-z_]\w*|Test\.\w+|System\.\w+|Database\.\w+|Schema\.\w+)|(?<key>\b(?:abstract|trigger|global|public|private|protected|static|final|class|interface|enum|extends|implements|override|virtual|with|without|inherited|sharing|new|return|void|super|this|null|true|false|try|catch|finally|throw|switch|case|default|if|else|for|while|do|break|continue|insert|update|upsert|delete|undelete|integer|string|boolean|decimal|double|long|id|sObject|list|set|map|date|dateTime|transaction|test)\b)|(?<num>\b\d+(?:\.\d+)?\b)|(?<cstm>\b[A-Za-z_]\w*__[a-z]\w*\b)/gi;

const HL_SOQL = /(?<com>--[^\n]*|\/\/[^\n]*)|(?<str>'(?:[^']|'')*')|(?<key>\b(?:SELECT|FROM|WHERE|ORDER|GROUP|LIMIT|OFFSET|WITH|FOR|AND|OR|NOT|LIKE|IN|INCLUDES|EXCLUDES|BETWEEN|ASC|DESC|USING|SCOPE|REFERENCE|FIELDS|ALL|ROWS|COUNT|TYPEOF|END|SECURITY_INCLUDED|SECURITY_NOT_INCLUDED|UserRecordAccess|DataCategory|NetworkId)\b)|(?<cstm>\b[A-Za-z_]\w*__c\b)|(?<num>\b\d+(?:\.\d+)?\b)/gi;

const HL_JSON = /(?<key>"(?:[^"\\]|\\.)*")(?=\s*:)|(?<str>"(?:[^"\\]|\\.)*")|(?<num>-?\b\d+(?:\.\d+)?\b)|(?<lit>\b(?:true|false|null)\b)/gi;

const HL_XML = /(?<com><!--[\s\S]*?-->)|(?<tag><\/?[A-Za-z_][\w:.-]*)|(?<att>\b[A-Za-z_][\w:.-]*)(?=\s*=)|(?<str>"[^"]*"|'[^']*')/g;

const HL_SHELL = /(?<com>#[^\n]*)|(?<str>"[^"]*"|'[^']*')/g;

const HL_RULES = {
  apex: HL_APEX, trigger: HL_APEX, cls: HL_APEX,
  soql: HL_SOQL, query: HL_SOQL,
  json: HL_JSON, jsonl: HL_JSON,
  xml: HL_XML, html: HL_XML, 'package-xml': HL_XML, flow: HL_XML, metadata: HL_XML,
  shell: HL_SHELL, bash: HL_SHELL, powershell: HL_SHELL, ps1: HL_SHELL
};

const TK_ORDER = ['com', 'str', 'lit', 'num', 'tag', 'att', 'key', 'cstm'];

function highlight(lang, src) {
  const re = HL_RULES[String(lang || 'text').toLowerCase()];
  if (!re) return esc(src);
  re.lastIndex = 0;
  let out = '', last = 0, m;
  while ((m = re.exec(src)) !== null) {
    if (m[0] === '') { re.lastIndex++; continue; }
    if (m.index > last) out += esc(src.slice(last, m.index));
    const g = m.groups || {};
    let cls = 'tk-key';
    for (const k of TK_ORDER) { if (g[k] !== undefined) { cls = 'tk-' + k; break; } }
    out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

function renderCode(lang, buf) {
  const L = esc(lang || 'text');
  const src = buf.join('\n');
  const withCopy = buf.length ? `<button class="cb-copy" data-copy-text="${esc(src)}" title="Copy">⧉ Copy</button>` : '';
  return `<div class="codeblock"><div class="cb-head"><span class="cb-lang">${L}</span>${withCopy}</div><pre><code>${highlight(lang, src)}</code></pre></div>`;
}

function mdTable(rows) {
  const parseRow = r => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  let head = [], body = [], sep = false;
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    if (idx === 1 && /^[\s|:-]+$/.test(r.replace(/^\|/, '').replace(/\|$/, ''))) { sep = true; head = parseRow(rows[0]); continue; }
    if (sep) body.push(parseRow(r)); else head = parseRow(r);
  }
  if (!sep) { body = rows.map(parseRow); head = []; }
  const thead = head.length ? `<thead><tr>${head.map(h => `<th>${mdInline(esc(h))}</th>`).join('')}</tr></thead>` : '';
  const tbody = `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${mdInline(esc(c))}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="tbl"><table>${thead}${tbody}</table></div>`;
}

/* Block renderer for the curriculum blocks */
function renderBlock(b) {
  switch (b.t) {
    case 'p': return `<p>${esc(b.x)}</p>`;
    case 'h': return `<h2>${esc(b.x)}</h2>`;
    case 'list': return `<ul class="tick-list">${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'num': return `<ol>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'table': return `
      <div class="tbl"><table>
        <thead><tr>${b.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    case 'code': {
      const cid = 'c' + cyrb53(b.x);
      const bT = b.lang || 'text';
      return `<div class="codeblock">
        <div class="cb-head"><span class="cb-lang">${esc(bT)}</span><button class="cb-copy" data-copy="${cid}" title="Copy">⧉ Copy</button></div>
        <pre id="${cid}" class="lang-${esc(bT)}"><code>${highlight(bT, b.x)}</code></pre>
      </div>`;
    }
    case 'callout': {
      const icons = { tip: '💡', warn: '⚠️' };
      return `<div class="callout ${esc(b.kind)}"><div class="co-ico">${icons[b.kind] || '💡'}</div><div>${esc(b.x)}</div></div>`;
    }
    case 'selfcheck': return `
      <div class="selfcheck">
        <div class="sc-head"><span class="sc-qmark">?</span> <span>Check yourself</span></div>
        <div class="sc-q">${esc(b.q)}</div>
        <div class="sc-actions"><button class="btn sm ghost showA">Show answer</button></div>
        <div class="sc-a" hidden>${esc(b.a)}</div>
      </div>`;
    /* Real-world case study: a problem a company actually had, the config that
     * solved it, how it was built, and the part that bit them. `ex`/`proj` ask
     * the learner to BUILD something; `case` shows what was already built, so it
     * carries no id, no stars and no self-rating - it is reference material, not
     * a graded activity. */
    case 'case': {
      const steps = (b.steps || []).map(s => `<li>${esc(s)}</li>`).join('');
      return `
        <div class="case-card">
          <div class="case-head">
            <span class="case-eyebrow">🏢 Real world</span>
            ${b.org ? `<span class="case-org">${esc(b.org)}</span>` : ''}
          </div>
          <h3 class="case-title">${esc(b.title)}</h3>
          <div class="case-label">🩹 The problem</div>
          <p class="case-p">${esc(b.problem)}</p>
          <div class="case-label">🛠️ The solution</div>
          <p class="case-p">${esc(b.solution)}</p>
          <div class="case-label">🔧 How it was built</div>
          <ol class="case-list">${steps}</ol>
          <div class="case-gotcha">⚠️ <b>What went wrong:</b> ${esc(b.gotcha)}</div>
          ${b.exam ? `<div class="case-exam">🎯 <b>Exam angle:</b> ${esc(b.exam)}</div>` : ''}
        </div>`;
    }
    case 'ex':
    case 'proj': {
      const isProject = b.t === 'proj';
      const items = b.steps || b.reqs || [];
      const lis = items.map(i =>
        typeof i === 'string'
          ? `<li>${esc(i)}</li>`
          : `<li class="ex-group"><b>${esc(i.h)}</b><ul>${i.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></li>`
      ).join('');
      const stars = '★'.repeat(b.stars) + '☆'.repeat(Math.max(0, 4 - b.stars));
      const code = b.code ? renderBlock({ t: 'code', ...b.code }) : '';
      const footer = isProject
        ? `<div class="ex-verify">🎯 Success — ${esc(b.success)}</div>`
        : `<div class="ex-verify">✅ Verify — ${esc(b.verify)}</div>`;
      const hasAnswer = typeof EXERCISE_ANSWERS !== 'undefined' && EXERCISE_ANSWERS[b.id];
      const answer = hasAnswer
        ? `<details class="ex-answer"><summary><span class="ea-ico">💡</span><span>Show answer</span><span class="ea-caret">▾</span></summary><div class="ex-answer-body">${md(EXERCISE_ANSWERS[b.id])}</div></details>`
        : '';
      /* PAB: self-rating row — persisted to store.stars, read by the scorecard */
      const myStars = exStars(b.id);
      const rateRow = `
        <div class="ex-rate">
          <span class="ex-rate-l">How well did you do?</span>
          <span class="ex-rate-btns">
            ${[1, 2, 3, 4].map(n => `<button class="rate-btn${n <= myStars ? ' on' : ''}" data-rate="${n}" title="${n}/4" aria-label="Rate ${n} of 4">★</button>`).join('')}
          </span>
          ${myStars ? `<button class="rate-clear" data-rate="0" title="Clear">✕</button>` : ''}
        </div>`;
      return `
        <div class="ex-card ${isProject ? 'proj' : ''}" data-stars="${b.stars}" data-ex-id="${esc(b.id)}">
          <div class="ex-head">
            <span class="ex-id">${esc(b.id)}</span>
            <span class="ex-stars">${stars}</span>
          </div>
          <h3 class="ex-title">${esc(b.title)}</h3>
          <p class="ex-obj">${esc(b.obj)}</p>
          ${code}
          <div class="ex-label">${isProject ? '📋 Requirements' : '🧭 Instructions'}</div>
          <ol class="ex-list">${lis}</ol>
          ${footer}
          ${answer}
          ${rateRow}
        </div>`;
    }
    default: return '';
  }
}

/* ------------------------- full guide page ------------------------- */

const GUIDE_DIR = 'guide/';
const guideCache = {};

function fetchGuide(mod) {
  const key = mod.guide;
  if (guideCache[key]) return Promise.resolve(guideCache[key]);
  if (!window.fetch) return Promise.reject(new Error('fetch unavailable'));
  return fetch(GUIDE_DIR + key)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(t => { guideCache[key] = t; return t; });
}

function renderGuide(mod) {
  const p = moduleProgress(mod.id);
  const read = guideRead(mod.id);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>›</span> <b>Full guide</b></div>

    <div class="guide-hero reveal" style="--c:${mod.color}">
      <div class="ph-ico">${mod.icon}</div>
      <div class="ph-body">
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · complete guide</div>
        <h1>${mod.title}</h1>
        <p class="qc-sub">The full roadmap guide is rendered right here — every section, table, code sample and checklist from ${esc(mod.guide)}. ${read ? '<b>You marked this guide as read.</b>' : 'Read it end-to-end, then mark it as read to complete the module.'}</p>
        <div class="guide-meta">
          ${mod.art.map(a => `<a class="artifact" target="_blank" rel="noopener" href="${repoHref(a.href)}" style="--c:${mod.color}"><span class="a-ico">🗂️</span> <span>${esc(a.label)}</span></a>`).join('')}
        </div>
      </div>
      <div class="ph-side">
        <div class="ring sm" style="--p:${p.pct};--c:${mod.color}"><span>${p.pct}<small>%</small></span></div>
        <div class="ph-stats"><span>${read ? '✓ guide read' : 'guide unread'}</span></div>
        <a class="btn ghost sm" target="_blank" rel="noopener" href="${GUIDE_PAGES}${mod.guide}">📄 raw on GitHub</a>
      </div>
    </div>

    <div class="guide-wrap reveal">
      <aside class="guide-toc" aria-label="Table of contents">
        <div class="toc-title">On this guide</div>
        <div id="guideToc"><div class="gt-loading">…</div></div>
      </aside>
      <article class="article guide-article" style="--c:${mod.color}">
        <div class="guide-loading"><span class="spinner"></span> Loading the full guide…</div>
      </article>
    </div>

    <div class="lesson-foot reveal">
      <div class="lf-left">
        <button class="btn primary" id="greadBtn">${read ? '✓ Guide read — toggle' : '✔ Mark guide as read'}</button>
      </div>
      <div class="lf-right">
        ${mod.n > 1 ? `<a class="btn ghost sm" href="#/guide/${MODULES[mod.n - 2].id}">← ${MODULES[mod.n - 2].title}</a>` : ''}
        ${mod.n < MODULES.length
          ? `<a class="btn primary sm" href="#/guide/${MODULES[mod.n].id}">${MODULES[mod.n].title} →</a>`
          : `<a class="btn primary sm" href="#/quiz/${mod.id}">🎯 Take the final quiz →</a>`}
      </div>
    </div>`;

  fetchGuide(mod).then(src => {
    const article = $('.guide-article');
    article.innerHTML = md(src, { skipH1: true });
    buildGuideToc();
    if (route.anchor) {
      const el = document.getElementById(route.anchor);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    }
    const fail = $('.guide-loading', article);
    if (fail) fail.remove();
  }).catch(() => {
    const article = $('.guide-article');
    article.innerHTML = `
      <div class="guide-fail">
        <div class="gf-ico">⚠️</div>
        <h3>Could not load the guide file</h3>
        <p>The full guide is served from <code class="inline">docs/guide/${esc(mod.guide)}</code> in this repo. If you are viewing a local file (not through GitHub Pages), the fetch may be blocked.</p>
        <a class="btn" target="_blank" rel="noopener" href="${GUIDE_PAGES}${mod.guide}">📄 Open the guide on GitHub</a>
      </div>`;
  });

  const rb = $('#greadBtn');
  if (rb) rb.addEventListener('click', () => { markGuideRead(mod.id, !guideRead(mod.id)); toast(guideRead(mod.id) ? 'Guide marked as read — module complete! 🎉' : 'Guide marked as unread'); render(); });

  store.lastOpen = { mid: mod.id, li: 0 }; save();
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

function buildGuideToc() {
  const toc = $('#guideToc');
  if (!toc) return;
  toc.innerHTML = '';
  if (!mdToc.length) { toc.innerHTML = '<div class="gt-empty">Smooth reading — no section headings in this file.</div>'; return; }
  mdToc.forEach(t => {
    const a = document.createElement('a');
    a.className = 'gt-item lvl' + t.lvl;
    a.textContent = t.label;
    a.href = '#/guide/' + route.mid + '/' + t.slug;
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById(t.slug);
      if (el) {
        route.anchor = t.slug;
        history.replaceState(null, '', '#' + hashFor());
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    toc.appendChild(a);
  });
}

/* ------------------------- quiz page -------------------------
 * PAB ADDITION — the real exam contains BOTH multiple-choice and
 * multiple-select questions. `a` may therefore be a number (single
 * answer) or an array of numbers (select-all-that-apply). A
 * multiple-select answer is only correct when the picked set matches
 * the answer set exactly — extra picks are marked wrong, mirroring
 * how the exam scores a multi-select response.                        */
function isMulti(q) { return Array.isArray(q.a); }
function answerSet(q) { return isMulti(q) ? q.a.slice().sort((x, y) => x - y) : [q.a]; }
function sameSet(picked, correct) {
  if (picked.length !== correct.length) return false;
  for (let i = 0; i < correct.length; i++) if (picked[i] !== correct[i]) return false;
  return true;
}

function renderQuiz(mod) {
  const qs = mod.quiz.questions;
  const prevBest = store.quiz[mod.id]; // fractional 0..1
  const nMulti = qs.filter(isMulti).length;
  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>›</span> <b>Quiz</b></div>

    <div class="quiz-top reveal" style="--c:${mod.color}">
      <div>
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · ${mod.quiz.title}</div>
        <h1>${mod.icon} ${mod.title} — Quiz</h1>
        <p class="qc-sub">${qs.length} questions${nMulti ? ' · ' + nMulti + ' of them <b>select all that apply</b>' : ''}. Answer all, get instant feedback + explanations, then save your score.</p>
      </div>
      <div class="quiz-best">
        ${prevBest != null
          ? `Best: <b>${Math.round(prevBest * qs.length)}/${qs.length}</b> · ${Math.round(prevBest * 100)}%`
          : 'No score yet'}
      </div>
    </div>

    <div class="quiz-list reveal" id="quizList"></div>
    <div class="lesson-foot reveal" id="quizFoot"></div>`;

  const list = $('#quizList');
  qs.forEach((q, qi) => {
    const multi = isMulti(q);
    const item = document.createElement('div');
    item.className = 'q-item';
    item.dataset.qi = qi;
    item.innerHTML = `
      <div class="q-head"><span class="q-num">Q${qi + 1}</span><span class="q-prog"></span></div>
      ${multi ? '<div class="q-multi-hint">⚠ Select all that apply — partial answers are marked wrong</div>' : ''}
      <div class="q-text">${esc(q.q)}</div>
      <div class="q-opts">
        ${q.opts.map((o, oi) => `
          <button class="q-opt${multi ? ' multi' : ''}" data-oi="${oi}">
            <span class="q-letter">${String.fromCharCode(65 + oi)}</span>
            <span class="q-otext">${esc(o)}</span>
            <span class="q-mark"></span>
          </button>`).join('')}
      </div>
      ${multi ? '<button class="q-submit" disabled>Submit answer</button>' : ''}
      <div class="q-why" hidden><div class="qw-label"></div><div class="qw-text">${esc(q.why)}${multi ? ' <span class="qw-partial">Correct: ' + answerSet(q).map(i => String.fromCharCode(65 + i)).join(', ') + '</span>' : ''}</div></div>`;
    list.appendChild(item);
  });

  // footer buttons
  const foot = $('#quizFoot');
  foot.innerHTML = `
    <div class="lf-left"><button class="btn ghost sm" id="resetQuiz">↺ Reset</button></div>
    <div class="lf-right">
      <button class="btn primary" id="saveScore" disabled>✓ Save my score</button>
      <a class="btn ghost sm" href="#/phase/${mod.id}">Back to module</a>
    </div>`;

  $('#resetQuiz').addEventListener('click', () => renderQuiz(mod));

  const saveBtn = $('#saveScore');
  let answered = 0, score = 0;

  $$('.q-item', list).forEach(item => {
    const qi = +item.dataset.qi;
    const prog = $('.q-prog', item);
    const correct = answerSet(qs[qi]);

    /* Shared grading + reveal routine */
    const grade = picked => {
      const ok = sameSet(picked.slice().sort((x, y) => x - y), correct);
      const partial = !ok && picked.length && correct.some(c => picked.includes(c));
      item.dataset.state = ok ? 'right' : 'wrong';
      prog.textContent = ok ? '✓ correct' : (partial ? '~ partial' : '✗');
      prog.classList.add(ok ? 'ok' : 'bad');

      $$('.q-opt', item).forEach(o => {
        const t = +o.dataset.oi;
        const isKey = correct.includes(t);
        const pickedIt = picked.includes(t);
        o.classList.add(isKey ? 'right' : 'dim');
        if (pickedIt && !isKey) o.classList.add('wrong');
        o.disabled = true;
      });
      const why = $('.q-why', item);
      why.hidden = false;
      $('.qw-label', why).textContent = ok ? '🎉 That\u2019s right'
        : partial ? '🟡 Partly right — the exam needs the exact set'
        : '🙈 Not quite';
      why.classList.add(ok ? 'ok' : 'bad');

      answered++; if (ok) score++;
      saveBtn.disabled = answered < qs.length;
      if (answered === qs.length) {
        const pct = Math.round(score / qs.length * 100);
        toast(`Quiz complete: ${score}/${qs.length} (${pct}%)`);
        if (pct === 100) confetti();
      }
    };

    if (!isMulti(qs[qi])) {
      $$('.q-opt', item).forEach(btn => {
        btn.addEventListener('click', () => {
          if (item.dataset.state) return;
          grade([+btn.dataset.oi]);
        });
      });
    } else {
      const picked = [];
      const submit = $('.q-submit', item);
      $$('.q-opt', item).forEach(btn => {
        btn.addEventListener('click', () => {
          if (item.dataset.state) return;
          const oi = +btn.dataset.oi;
          const at = picked.indexOf(oi);
          if (at >= 0) picked.splice(at, 1); else picked.push(oi);
          btn.classList.toggle('picked', at < 0);
          submit.disabled = picked.length === 0;
        });
      });
      submit.addEventListener('click', () => {
        if (item.dataset.state || !picked.length) return;
        submit.disabled = true;
        grade(picked);
      });
    }
  });

  saveBtn.addEventListener('click', () => {
    const pct = score / qs.length;
    if (prevBest == null || pct > prevBest) {
      store.quiz[mod.id] = pct;
      store.best[mod.id] = Math.round(pct * qs.length);
      save();
      toast('Score saved — keep it up! 🏆');
      saveBtn.textContent = '✓ Saved — nice work!';
      saveBtn.disabled = true;
    }
    renderSidebar();
  });
}

/* ------------------------- PAB: timed mock exam -------------------------
 * Mirrors the real delivery as closely as the authored question bank allows:
 * questions are sampled at the OFFICIAL section weightings, there is a
 * 105-minute countdown, one question per screen with NO going back, and a
 * 63% pass line. A per-domain breakdown shows which section to revise.
 *
 * HONEST DEGRADATION: the real exam is 60 scored questions. This bank only
 * contains questions from phases that exist so far, so the mock is built from
 * whatever is authored rather than padding with duplicates. The paper tells
 * you its real length (MOCK.qs.length) and, if it is short of 60, says so and
 * adjusts the clock proportionally so the per-question pace matches the exam. */
let MOCK = null;   // { qs:[{q,opts,a,why,domain,modTitle}], idx, picked:[], startAt, timer, phase, total, bank }

function mockBuild() {
  // how many of the 60 come from each section, straight from the published %
  const counts = {};
  DOMAINS.forEach(d => { counts[d.id] = Math.round(EXAM.questions * d.pct / 100); });

  const byDomain = {};
  DOMAINS.forEach(d => { byDomain[d.id] = []; });
  let bank = 0;
  MODULES.forEach(m => {
    const d = domainById(m.exam);
    if (!d) return;
    m.quiz.questions.forEach(q => {
      byDomain[d.id].push(Object.assign({}, q, {
        domain: d.id, domainName: d.name, color: d.color, modTitle: m.title, mid: m.id, mi: m.n
      }));
      bank++;
    });
  });

  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // take up to each section's weighted quota, never more than that section has
  const out = [];
  DOMAINS.forEach(d => {
    out.push(...shuffle(byDomain[d.id].slice()).slice(0, counts[d.id]));
  });
  // if weighted quotas under-fill (thin bank), top up with whatever is left
  let i = 0;
  while (out.length < EXAM.questions && bank > out.length) {
    for (const d of DOMAINS) {
      if (out.length >= Math.min(EXAM.questions, bank)) break;
      const pool = byDomain[d.id];
      if (i < pool.length) out.push(pool[i]);
    }
    i++;
  }
  return shuffle(out).slice(0, Math.min(EXAM.questions, bank));
}

function mockStop() {
  if (MOCK && MOCK.timer) clearInterval(MOCK.timer);
  MOCK = null;
}

/* Effective paper length: the full 60 once every phase is authored, fewer while
 * the bank is partial. Everything downstream reads MOCK.total, never EXAM.questions,
 * so a partial bank never displays a phantom "Question 47 of 60". */
function mockTotal() { return MOCK && MOCK.qs ? MOCK.qs.length : EXAM.questions; }

/* Clock scales with the paper so the per-question budget stays ~1.75 min either
 * way, instead of giving a 12-question paper the full 105 minutes. */
function mockMinutes() {
  const total = mockTotal();
  return total >= EXAM.questions ? EXAM.minutes : Math.max(5, Math.round(total * EXAM.minutes / EXAM.questions));
}

function mockStart() {
  mockStop();
  const qs = mockBuild();
  if (!qs.length) { toast('No questions authored yet — finish a phase quiz first'); return; }
  MOCK = { qs, idx: 0, picked: new Array(qs.length).fill(null), startAt: Date.now(), timer: null, phase: 'run', total: qs.length, bank: qs.length };
  render();
  MOCK.timer = setInterval(() => {
    const t = $('#mockTimer');
    if (!t) { mockStop(); return; }              // left the page
    const left = mockLeftMs();
    t.textContent = mockClock(left);
    t.classList.toggle('warn', left <= mockMinutes() * 60000 / 3 && left > mockMinutes() * 60000 / 6);
    t.classList.toggle('crit', left <= mockMinutes() * 60000 / 6);
    if (left <= 0) mockFinish(true);
  }, 1000);
}
function mockLeftMs() { return Math.max(0, mockMinutes() * 60000 - (Date.now() - MOCK.startAt)); }
function mockClock(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(ss).padStart(2, '0');
}

function renderMock() {
  if (!MOCK) return renderMockIntro();
  if (MOCK.phase === 'result') return renderMockResult();
  const q = MOCK.qs[MOCK.idx];
  const multi = Array.isArray(q.a);
  const answered = MOCK.picked.filter(p => p != null).length;
  const left = mockLeftMs();
  const total = mockTotal();
  const isLast = MOCK.idx === total - 1;

  view.innerHTML = `
    <div class="mock-bar reveal">
      <span class="mock-timer" id="mockTimer">${mockClock(left)}</span>
      <span class="mock-progress"><i style="width:${Math.round(answered / total * 100)}%"></i></span>
      <span class="mock-count">${answered}/${total} answered</span>
      <span class="mock-count">Q ${MOCK.idx + 1} of ${total}</span>
      <button class="btn ghost sm" id="mockQuit">✕ Abandon</button>
    </div>

    <div class="mock-qcard reveal" style="--c:${q.color}">
      <div class="mock-qmeta">
        <span class="mock-qn">Question ${MOCK.idx + 1} / ${total}</span>
        <span class="mock-tag" style="color:${q.color};border-color:${q.color}">${esc(q.domainName)}</span>
        <span class="mock-tag">Phase ${q.mi} · ${esc(q.modTitle)}</span>
        ${multi ? '<span class="mock-tag" style="color:var(--warn);border-color:rgba(245,177,61,.5)">select all that apply</span>' : ''}
      </div>
      <div class="mock-qtext">${esc(q.q)}</div>
      <div class="q-opts" id="mockOpts">
        ${q.opts.map((o, oi) => `
          <button class="q-opt${multi ? ' multi' : ''}" data-oi="${oi}">
            <span class="q-letter">${String.fromCharCode(65 + oi)}</span>
            <span class="q-otext">${esc(o)}</span>
            <span class="q-mark"></span>
          </button>`).join('')}
      </div>
      <div class="mock-foot">
        <button class="btn ghost sm" id="mockPrev" ${MOCK.idx === 0 ? 'disabled' : ''}>← locked</button>
        <button class="btn primary" id="mockNext">${isLast ? 'Finish exam' : 'Next →'}</button>
        <span class="mock-count" style="margin-left:auto">no going back — like the real exam</span>
      </div>
    </div>

    <div class="mock-dots reveal">${MOCK.qs.map((_, i) =>
      `<button class="mock-dot${i === MOCK.idx ? ' cur' : ''}${MOCK.picked[i] != null ? ' answered' : ''}" data-go="${i}">${i + 1}</button>`).join('')}</div>`;

  const picked = MOCK.picked[MOCK.idx];
  const isPicked = oi => picked != null && picked.includes(oi);

  $$('#mockOpts .q-opt').forEach(btn => {
    btn.classList.toggle('picked', isPicked(+btn.dataset.oi));
    if (picked != null) btn.classList.toggle('dim', !isPicked(+btn.dataset.oi));
    btn.addEventListener('click', () => {
      const oi = +btn.dataset.oi;
      if (picked == null) { MOCK.picked[MOCK.idx] = [oi]; btn.classList.add('picked'); }
      else if (isPicked(oi)) {
        const next = picked.filter(x => x !== oi);
        MOCK.picked[MOCK.idx] = next.length ? next : null;
        btn.classList.remove('picked');
      } else { MOCK.picked[MOCK.idx] = picked.concat(oi); btn.classList.add('picked'); }
      render();
    });
  });

  $('#mockPrev').addEventListener('click', () => { if (MOCK.idx > 0) { MOCK.idx--; render(); } });
  $('#mockNext').addEventListener('click', () => {
    if (MOCK.idx < total - 1) { MOCK.idx++; render(); }
    else mockFinish(false);
  });
  $('#mockQuit').addEventListener('click', () => { if (confirm('Abandon this attempt? Your answers will be lost.')) { mockStop(); render(); } });
  $$('.mock-dot').forEach(d => d.addEventListener('click', () => {
    const i = +d.dataset.go;
    if (MOCK.picked[i] != null) { MOCK.idx = i; render(); }   // only revisit answered questions
  }));
}

function mockFinish(timedOut) {
  if (!MOCK) return;
  /* Clear the interval WITHOUT discarding the attempt.
   * mockStop() nulls the whole MOCK object, so calling it here would destroy the
   * very state this function has just finished grading - MOCK.qs would be gone.
   * Only the timer needs clearing; the result stays readable for rendering. */
  if (MOCK.timer) { clearInterval(MOCK.timer); MOCK.timer = null; }

  let score = 0;
  const perDomain = {};
  DOMAINS.forEach(d => { perDomain[d.id] = { got: 0, total: 0 }; });
  MOCK.qs.forEach((q, i) => {
    const correct = answerSet(q);
    const p = MOCK.picked[i];
    const ok = p != null && sameSet(p.slice().sort((a, b) => a - b), correct);
    if (ok) score++;
    perDomain[q.domain].total++;
    if (ok) perDomain[q.domain].got++;
  });
  MOCK.phase = 'result';
  MOCK.result = { score, total: MOCK.qs.length, perDomain, timedOut };
  recordMock(score / MOCK.qs.length);
  render();
  window.scrollTo(0, 0);
}

function renderMockResult() {
  const r = MOCK.result;
  const pct = Math.round(r.score / r.total * 100);
  const pass = pct >= EXAM.passPct;
  if (pass) confetti();

  const bd = DOMAINS.map(d => {
    const s = r.perDomain[d.id];
    const sp = s.total ? Math.round(s.got / s.total * 100) : 0;
    return `<div class="mock-bd-row ${sp >= EXAM.passPct ? 'pass' : 'fail'}">
      <span class="dc-name"><i class="dc-dot" style="background:${d.color}"></i><span>${esc(d.name)}</span><span class="dc-w">${d.pct}% of exam</span></span>
      <span class="mock-bd-track"><i style="width:${sp}%;background:${d.color}"></i></span>
      <span class="mock-bd-pct">${s.got}/${s.total} <b>${sp >= EXAM.passPct ? '✓' : '✗'}</b></span>
    </div>`;
  }).join('');

  const weakest = DOMAINS
    .map(d => ({ d, s: r.perDomain[d.id], p: r.perDomain[d.id].total ? r.perDomain[d.id].got / r.perDomain[d.id].total : 0 }))
    .sort((a, b) => a.p - b.p).slice(0, 2);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <b>Mock exam result</b></div>

    <div class="mock-score reveal">
      <div class="ring-wrap">
        <div class="ring" style="--p:${pct}"><span>${pct}<small>%</small></span></div>
        <div class="ring-caption">${r.score}/${r.total} correct</div>
      </div>
      <div>
        <h1>${pass ? '🎉 Passing' : '📕 Not yet'} — ${pct}%</h1>
        <p class="mock-verdict">
          The pass mark is <b>${EXAM.passPct}%</b>. ${r.timedOut ? 'Time expired. ' : ''}
          ${pass
            ? 'You cleared the bar on a full-length paper. Sit it again in a few days to check it sticks — the real exam samples every section, so aim for consistency, not one lucky pass.'
            : 'You needed <b>' + Math.ceil(r.total * EXAM.passPct / 100) + '</b> correct for a pass.'}
          <br><br>
          <b>Revise first:</b> ${weakest.map(w => '<a href="#/domain/' + w.d.id + '" style="color:var(--accent)">' + esc(w.d.name) + ' (' + Math.round(w.p * 100) + '%)</a>').join(' · ')}
        </p>
      </div>
    </div>

    <div class="grid-head reveal"><h2>Section breakdown</h2><span>green = at or above ${EXAM.passPct}%</span></div>
    <div class="mock-breakdown reveal">${bd}</div>

    <div class="lesson-foot reveal">
      <div class="lf-left">
        <span class="quiz-best">Attempts: ${(store.mock || []).length} · Best: <b>${Math.round((mockBest() || 0) * 100)}%</b></span>
      </div>
      <div class="lf-right">
        <button class="btn ghost" id="mockAgain">🔁 Sit it again</button>
        <a class="btn primary" href="#/">Back to dashboard</a>
      </div>
    </div>`;

  $('#mockAgain').addEventListener('click', () => mockStart());
}

function renderMockIntro() {
  const bank = MODULES.reduce((a, m) => a + m.quiz.questions.length, 0);
  const mb = mockBest();
  const target = Math.min(EXAM.questions, bank);
  const partial = bank < EXAM.questions;
  const mins = target >= EXAM.questions ? EXAM.minutes : Math.max(5, Math.round(target * EXAM.minutes / EXAM.questions));
  const quota = d => Math.min(Math.round(EXAM.questions * d.pct / 100), MODULES.filter(m => m.exam === d.id).reduce((a, m) => a + m.quiz.questions.length, 0));

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <b>Mock exam</b></div>

    <div class="mock-hero reveal" style="--c:#F59E0B">
      <div class="ph-ico">🎯</div>
      <div>
        <div class="ph-kicker">${EXAM.code} · full-length practice paper</div>
        <h1>${target}-question timed mock exam${partial ? ' <span class="mock-partial-tag">partial bank</span>' : ''}</h1>
        <p>Questions are drawn from every phase quiz and sampled at the <b>official section weightings</b>
           (${DOMAINS.map(d => d.pct + '%').join(' / ')}), so the paper looks like the real one. You get
           <b>${mins} minutes</b> for <b>${target} questions</b> and <b>${EXAM.passPct}%</b> to pass.
           One question per screen, no going back — exactly how the real exam is delivered.</p>
        ${partial ? `<div class="mock-warn">The real exam is ${EXAM.questions} scored questions plus up to ${EXAM.unscored} unscored. This mock currently builds from <b>${bank}</b> authored question${bank === 1 ? '' : 's'}, so the paper is <b>${target} questions long</b> and the clock is scaled to keep the same ${(EXAM.minutes / EXAM.questions).toFixed(2)} min/question pace. It fills out as the remaining phases are authored.</div>` : ''}
        <div class="mock-facts">
          <span class="mock-fact">Exam code <b>${EXAM.code}</b></span>
          <span class="mock-fact">Questions <b>${EXAM.questions}</b> + ${EXAM.unscored} unscored</span>
          <span class="mock-fact">Duration <b>${EXAM.minutes} min</b></span>
          <span class="mock-fact">Pass <b>${EXAM.passPct}%</b></span>
          <span class="mock-fact">Prerequisites <b>${EXAM.prerequisites}</b></span>
          <span class="mock-fact">Question bank <b>${bank}</b></span>
          ${mb != null ? `<span class="mock-fact">Your best <b>${Math.round(mb * 100)}%</b></span>` : ''}
        </div>
      </div>
      <div class="mock-side">
        <button class="btn primary" id="mockGo">▶ Start the mock exam</button>
        <span class="mock-count">${bank} question${bank === 1 ? '' : 's'} available</span>
      </div>
    </div>

    <div class="domain-card reveal">
      <div class="dc-head"><h3>How this paper is built</h3><span class="dc-note">questions available per section vs its exam quota</span></div>
      <div class="dc-rows">
        ${DOMAINS.map(d => {
          const have = MODULES.filter(m => m.exam === d.id).reduce((a, m) => a + m.quiz.questions.length, 0);
          const q = quota(d);
          return `<div class="dc-row">
            <span class="dc-name"><i class="dc-dot" style="background:${d.color}"></i><span>${esc(d.name)}</span><span class="dc-w">${d.pct}%</span></span>
            <span class="dc-track"><i style="width:${Math.min(100, Math.round(q / EXAM.questions * 100))}%;background:${d.color}"></i></span>
            <span class="dc-pct">${q} q</span>
          </div>`;
        }).join('')}
      </div>
      <div class="dc-foot"><span>${target} questions in this paper · ${mins} minutes · pass at ${EXAM.passPct}%</span></div>
    </div>`;

  $('#mockGo').addEventListener('click', () => mockStart());
}

/* ------------------------- toast ------------------------- */

let toastTimer;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ------------------------- confetti ------------------------- */

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function confetti() {
  if (reduceMotion) return;
  const colors = ['#00A1E0', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#e8b93d'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    const x = Math.random() * 100;
    const d = Math.random() * 2.4 + 1.2;
    const s = 8 + Math.random() * 8;
    p.style.left = x + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = d + 's';
    p.style.width = p.style.height = s + 'px';
    p.style.setProperty('--tx', (Math.random() * 160 - 80) + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), d * 1000 + 400);
  }
}

/* ------------------------- events wiring ------------------------- */

document.addEventListener('click', e => {
  const sc = e.target.closest('.selfcheck');
  if (sc) {
    const a = $('.sc-a', sc); const btn = $('.showA', sc);
    if (a.hidden) { a.hidden = false; btn.textContent = 'Hide answer'; }
    else { a.hidden = true; btn.textContent = 'Show answer'; }
    return;
  }
  const copy = e.target.closest('.cb-copy');
  if (copy) {
    // lesson blocks carry an id -> <pre>; guide markdown fences carry raw text
    let txt = copy.dataset.copyText;
    if (txt == null) { const pre = document.getElementById(copy.dataset.copy); if (pre) txt = pre.innerText; }
    if (txt == null) return;
    const done = () => { copy.textContent = '✓ Copied'; setTimeout(() => copy.textContent = '⧉ Copy', 1400); };
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
      .then(done)
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(ta);
      });
  }

  /* PAB: exercise self-rating — writes the previously-dead store.stars */
  const star = e.target.closest('[data-rate]');
  if (star) {
    const card = star.closest('.ex-card');
    setExStars(card.dataset.exId, Number(star.dataset.rate));
    $$('[data-rate]', card).forEach(b2 => b2.classList.toggle('on', Number(b2.dataset.rate) <= exStars(card.dataset.exId)));
    toast('Rated ' + star.dataset.rate + '/4 — feeds your section readiness');
    renderSidebar();
  }
});

/* search */
let searchBox = null;
function ensureSearch() {
  if (searchBox) return searchBox;
  searchBox = document.createElement('div');
  searchBox.className = 'search-wrap';
  searchBox.innerHTML = `<input id="globalQ" type="search" placeholder="Search lessons, concepts, topics…" autocomplete="off" />
    <div class="search-results" id="searchRes"></div>`;
  document.body.appendChild(searchBox);

  const input = $('#globalQ', searchBox);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = $('.sr-item', wrap);
      if (first) { location.hash = first.getAttribute('href'); closeSearch(); }
    }
    if (e.key === 'Escape') closeSearch();
  });

  const wrap = $('#searchRes', searchBox);
  input.addEventListener('input', runSearch);
  input.addEventListener('focus', () => { if (input.value.trim().length >= 2) searchBox.classList.add('open'); });
  return searchBox;
}

/* PAB: block text extraction used by the search index — the base version only
   read `b.x` / `b.items`, so table cells, self-checks and exercise text were
   effectively invisible to search. */
function blockText(b) {
  if (!b) return '';
  if (b.x != null && b.t !== 'code') return String(b.x);
  if (b.t === 'code') return String(b.lang || '') + ' ' + String(b.x || '');
  if (Array.isArray(b.items)) return b.items.map(i => typeof i === 'string' ? i : (i.h || '') + ' ' + (i.items || []).join(' ')).join(' ');
  if (b.items && b.items.length) return b.items.join(' ');
  if (b.rows) return b.head.concat(...b.rows).join(' ');
  if (b.steps || b.reqs) {
    const own = (b.steps || b.reqs).map(i =>
      typeof i === 'string' ? i : (i.h || '') + ' ' + (i.items || []).join(' '));
    return [b.title, b.obj, b.verify, b.success].concat(own).filter(Boolean).join(' ');
  }
  if (b.q) return [b.q, b.a].filter(Boolean).join(' ');
  return '';
}
function lessonText(l) {
  return [l.title].concat((l.blocks || []).map(blockText)).join(' ');
}

function runSearch() {
  const sb = searchBox || ensureSearch();
  const input = $('#globalQ', sb);
  const wrap = $('#searchRes', sb);
  const q = input.value.trim().toLowerCase();
  wrap.innerHTML = '';
  if (q.length < 2) { sb.classList.remove('open'); return; }

  const results = [];
  MODULES.forEach(m => {
    const modHay = (m.title + ' ' + m.tagline + ' ' + m.objectives.join(' ')).toLowerCase();
    m.lessons.forEach((l, i) => {
      const hay = (modHay + ' ' + lessonText(l)).toLowerCase();
      if (hay.includes(q)) {
        results.push({ mod: m, li: i, label: m.title + ' → ' + l.title });
      }
    });
    (m.exerciseIds || []).forEach(xid => {
      const ex = EX_INDEX[xid];
      if (!ex) return;
      const hay = blockText(ex.block).toLowerCase();
      if (!hay.includes(q)) return;              // only surface real matches
      results.push({
        mod: m, li: ex.li, ex: true,
        label: `${ex.block.t === 'proj' ? 'Project' : 'Exercise'} ${xid} · ${ex.block.title}`
      });
    });
    m.quiz.questions.forEach(qq => {
      if ((qq.q + ' ' + qq.why + ' ' + qq.opts.join(' ')).toLowerCase().includes(q)) {
        results.push({ mod: m, quiz: true, label: `Quiz · ${m.title}: "${qq.q.slice(0, 60)}…"` });
      }
    });
  });
  const seen = new Set(); const uniq = [];
  results.forEach(r => {
    const k = r.quiz ? 'q' + r.label : r.ex ? 'e' + r.label : r.mod.id + ':' + r.li;
    if (!seen.has(k)) { seen.add(k); uniq.push(r); }
  });
  if (!uniq.length) { wrap.innerHTML = '<div class="sr-empty">No results — try "Dynamic Forms", "flow", "record type", "sharing", "report type"…</div>'; }
  else {
    uniq.slice(0, 12).forEach(r => {
      const a = document.createElement('a');
      a.className = 'sr-item';
      a.href = r.quiz ? '#/quiz/' + r.mod.id : r.ex ? '#/phase/' + r.mod.id : '#/lesson/' + r.mod.id + '/' + r.li;
      a.innerHTML = `<span class="sr-ico">${r.quiz ? '🧠' : r.ex ? '🧩' : r.mod.icon}</span><span>${esc(r.label)}</span><span class="sr-go">→</span>`;
      a.addEventListener('click', closeSearch);
      wrap.appendChild(a);
    });
  }
  sb.classList.add('open');
}

function openSearch() {
  const sb = ensureSearch();
  sb.classList.add('open');
  const inp = $('#globalQ', sb);
  inp.focus();
  const top = $('#topSearch');
  if (top) { inp.value = top.value; }
  runSearch();
}
function closeSearch() {
  if (searchBox) { searchBox.classList.remove('open'); const inp = $('#globalQ', searchBox); inp.value = ''; }
}

/* hotkey */
window.addEventListener('keydown', e => {
  const ae = document.activeElement;
  const typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
  if ((e.key === '/' || e.key === 'f') && !e.ctrlKey && !e.metaKey) {
    if (!typing) { e.preventDefault(); openSearch(); }
    return;
  }
  if (e.key === 'Escape') {
    if (searchBox && searchBox.classList.contains('open')) { closeSearch(); e.preventDefault(); return; }
  }
  if (e.key === 'ArrowLeft' && !typing && route.view === 'lesson') {
    const mod = byId(route.mid);
    if (route.li > 0) navigate('lesson', route.mid, route.li - 1);
  }
  if (e.key === 'ArrowRight' && !typing && route.view === 'lesson') {
    const mod = byId(route.mid);
    if (route.li < mod.lessons.length - 1) navigate('lesson', route.mid, route.li + 1);
  }
});

function bindTopSearch() {
  const topQ = $('#topSearch');
  if (!topQ || topQ.dataset.bound) return;
  topQ.dataset.bound = '1';
  topQ.addEventListener('focus', () => {
    const sb = ensureSearch();
    sb.classList.add('open');
    $('#globalQ', sb).value = topQ.value;
    runSearch();
  });
  topQ.addEventListener('input', () => {
    const sb = ensureSearch();
    sb.classList.add('open');
    $('#globalQ', sb).value = topQ.value;
    runSearch();
  });
}

/* ------------------------- lazy event (hashchange) ------------------------- */
window.addEventListener('hashchange', () => { route = parseHash(); render(); });

/* ------------------------- boot ------------------------- */
route = parseHash();
render();

/* mobile menu */
const menuBtn = $('#menuBtn');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('sb-open');
    if (document.body.classList.contains('sb-open')) {
      const first = $('.side-phase');
      if (first) first.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });
}
document.addEventListener('click', e => {
  if (document.body.classList.contains('sb-open') && !e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) {
    document.body.classList.remove('sb-open');
  }
});

/* theme toggle */
const themeBtn = $('#themeToggle');
if (themeBtn) {
  themeBtn.textContent = getTheme() === 'dark' ? '🌙' : '☀️';
  themeBtn.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}