# Phase 3: Reports, Dashboards & Mobile UX

Turn records into answers, then put the answers where someone will actually look. Like Phase 2,
this phase is tagged **Salesforce Fundamentals**.

A report is an answer to a question. A dashboard is a set of answers arranged for one audience.
Most reporting mistakes come from building the thing before naming the question.

## Learning Objectives

By the end of this phase, you will be able to:

- Match the five report types to the question they answer, and tell summary from matrix from joined.
- Configure filters, groupings and the date field so a report answers the question you were
  actually asked.
- Build a dashboard that answers real questions instead of filling space with gauges.
- Explain what a dashboard does on mobile versus a Lightning Experience page.
- Troubleshoot a report: running user, sharing, row limits, and fields that will not group.

---

## 1. Five Report Types, Five Kinds of Question

Name the question first and the type picks itself. Pick the type first and you will build the
wrong report, then try to fix it with more widgets.

| Type | Question it answers | Rows / columns |
|------|---------------------|----------------|
| **Summary** | How many, and what is the total? | One row of totals |
| **Matrix** | How does this measure break down by that other measure? | Rows **and** columns grouped |
| **Detail** | Show me the individual records. | One row per record |
| **Joined** | Show me these records together with related records. | Parent rows, child rows nested |
| **Tabular** | Show me these fields from records in a fixed order. | One row per record, columns you chose |

The distinction that catches people: **summary and matrix group; detail, tabular and joined do
not.** "Grouping" means rolling many records up into one row. If a request says "by region",
something must be grouping — which rules out tabular immediately.

> **Tabular** is the only type where you pick the exact columns and their order, and the only one
> that prints and exports sensibly. "A spreadsheet" means tabular. "A list" probably means detail.

### Detail vs tabular

Both show one row per record. Detail uses the object's page-layout field order and lets you add
charts on the fly. Tabular lets you choose and order fields explicitly. When a request says "list
the deals", **detail** is the safe default — you rarely know in advance which fields matter.

### Joined reports and the primary object

Joined reports combine a **primary** object with related child records. The classic use is one
Account with its Contacts, or one Opportunity with its Products.

> A joined report counts **primary** records, not child rows. An Account-and-Contacts report says
> "12 accounts", not "47 people". Put the object you want counted in the primary position, or
> your total will be wrong in a way that is very hard to spot.

### Checkpoint

> **A VP wants "revenue by territory by quarter". Which type?**

**Matrix.** Both "by territory" and "by quarter" are groupings, and matrix is the only type that
groups on two axes at once. A summary can group on one axis only, so you would need two reports.

---

## 2. Filters, Groupings and the Date Field

The report type is half the work. A correctly-typed report with bad filters is still wrong.

A report filter narrows **which records are included** before grouping and totalling. It is not
the same as a list view filter: report filters are part of the report definition and travel with
it; a list view filter is a saved view on the object.

| Filter need | Correct approach | Common mistake |
|-------------|------------------|----------------|
| Only my records | Owner = running user, or a report folder with "run as" | Hardcoding your own name |
| Only this quarter | Date field + relative range (this quarter) | Hardcoding a start/end date |
| Exclude blanks | Filter requiring a value on the field | Assuming blank rows disappear |
| Certain statuses | Filter on the status field | Using a formula to hide them |

> **Relative date ranges** — "this quarter", "last 90 days", "this fiscal year" — are recalculated
> when the report runs. **Absolute dates are frozen.** Almost every exam question about dates wants
> the relative option, because it is the only one that stays correct.

### The date field trap

When you group by a date, Salesforce offers behaviours that differ in whether they keep the year:

| Date option | Groups by | Use when |
|-------------|-----------|----------|
| Calendar month | Month, **ignoring year** | Rarely right |
| Calendar quarter | Quarter, **ignoring year** | Rarely right for multi-year work |
| Calendar year | Year | Annual totals |
| Day in month | Day of month, ignoring everything else | Almost never |

For a monthly or quarterly trend across years, use the **date field with a grouping level**
applied (Day → Week → Month → Quarter → Year) and hide the levels you do not want. Grouping by
"Calendar quarter" without the year collapses Q1 2024 and Q1 2026 into one row and destroys the
trend.

### The running user

A report runs **as the user who runs it**. Two consequences:

- It only shows records that user can see — so a report can look empty for a low-privilege user
  and fine for an admin.
- A **"My" filter means the person viewing it**, not the report owner.

Reports in folders can be set to run as a specific user, which is how you build "show everyone
leadership's view" dashboards.

> "My Opportunities" on a dashboard means "the Opportunities of whoever is looking at it". That is
> correct for a rep and wrong for a VP expecting their team's total.

### Checkpoint

> **A report grouped by Calendar Quarter shows one row labelled "Q1" containing revenue from 2024,
> 2025 and 2026. What did you do wrong?**

You used Calendar Quarter, which groups on quarter and ignores the year. Use the date field with a
Quarter grouping level and keep the Year level visible.

---

## 3. Dashboards, Mobile and Troubleshooting

A report is an answer. A dashboard is a set of answers arranged for **one audience**.

### Components

| Component | Shows | Use it for |
|-----------|-------|------------|
| **Metric** | One big number | A single KPI: total pipeline, open quotes |
| **Gauge** | A number against a target, with a needle | Progress toward a goal |
| **Chart** | Any chart built from a report | Trends, breakdowns, comparisons |
| **Lightning component** | A specific Lightning component | A funnel, a leaderboard, recent items |
| **Dashboard filter** | A filter applying to the whole dashboard | Letting the viewer choose territory or period |

A **dashboard filter** changes the filters of every report component beneath it — the cheapest
way to make one dashboard serve three regions. But a component whose report lacks the filter
field cannot be filtered, which is a common source of "the filter does nothing on this chart".

> **Gauges vs metrics.** A gauge needs a *goal* to point at, and reading a needle is slower than
> reading a number. Reserve gauges for genuine progress toward a target. For everything else use
> a metric or bar chart, which people can compare across a row at a glance.

> Do not fill a dashboard with twenty gauges. If the viewer cannot say what to *do* about a
> component in one sentence, it is decoration. Four to eight components aimed at real questions
> beats twenty aimed at filling space.

### Mobile — the part most often underestimated

**Dashboards are not available in the Salesforce mobile app.** They live in Lightning Experience
on desktop only. Mobile users get the mobile record page and the mobile navigation.

- The mobile app uses a dedicated **mobile layout**: condensed components, different navigation,
  narrower screens.
- Mobile record pages still respect page layout assignments, but component visibility can differ
  and some components have no mobile equivalent.
- A Lightning page built in App Builder is **not** automatically a mobile page. Mobile experience
  needs deliberate design (Phase 14).
- Reports can be viewed in mobile; a report's dashboard cannot.

> A requirement saying "rep dashboard managers can check from their phones" is a trap. Decide
> early whether it means the mobile app (no dashboards) or mobile browser (Lightning Experience,
> dashboards work). The answer changes what you build.

### Troubleshooting order

1. Does the report run at all? Errors often mean an incompatible field in a filter.
2. Is it empty? Check the running user's record access before assuming no data exists.
3. Are totals wrong on a joined report? Check which object is primary.
4. Are trend rows collapsing? Check for a calendar grouping instead of a date field with levels.
5. Is one dashboard component wrong? Check whether it points at its own report, unfiltered.
6. Does a dashboard filter do nothing? Check the component's report has the filter field.

---

## 4. Exercises

### Exercise 3.1 — Pick the report type and justify it

| Request | Type | Grouping | Measure |
|---------|------|----------|---------|
| A: "How many open Opportunities, and total value?" | Summary | none | Count + SUM Amount |
| B: "Every Opportunity over 50k with account, owner, close date, stage" | Detail / Tabular | none | — |
| C: "Pipeline by territory, split by stage" | Matrix | rows Territory, columns Stage | SUM Amount |
| D: "Each Account, with its open Opportunities underneath" | Joined, **Account primary** | — | — |
| E: "A fixed export, exactly these nine columns in this order" | **Tabular** | none | — |

For **D**, Account must be primary so it counts accounts. Make Opportunity primary and the total
becomes opportunities — and if someone expected the contact count, Contact must be primary.

### Exercise 3.2 — Spec two reports that will not go stale

Write a specification rather than clicking a report, so the design survives a new user and a new
quarter. For each report state: type, primary object, exact filter list, row grouping, column
grouping, measures.

**1. "Open Pipeline by Territory"** (for the VP)
Summary · Opportunity · filter CloseDate = THIS QUARTER (relative) · Stage not Closed Won/Lost ·
row grouping Territory__c · measures COUNT and SUM Amount · date grouping on CloseDate with
Quarter and Year visible.

**2. "Deals Closed Last 90 Days"** (rep's own review)
Summary or Detail · Opportunity · CloseDate = LAST 90 DAYS · Stage = Closed Won · decide whether
the "My" filter applies.

Decide in each case whether the report is org-wide or viewer-specific. Note one thing that would
make it return **zero rows for a legitimate user**, and how you would tell that apart from "no data
exists".

### Project 3.3 — Build Brightline's reporting layer

The reporting design that phases 12-16 will wire into actual dashboard metadata.

1. **Five reports.** For each: name, type, primary object, filter list, grouping, measures.
   Cover at minimum: a pipeline summary, a multi-axis breakdown, a per-record list, a
   parent-with-children report, and a monthly trend.
2. **Trend report:** specify the date field behaviour explicitly and justify it.
3. **Running user:** for each report, say whether a "My" filter is appropriate or whether it
   should be forced to a specific user or run org-wide.
4. **Two dashboards** — one Regional Manager, one rep. List components, the report behind each,
   and the answer each component gives.
5. **Mobile:** mark which dashboard would need rebuilding for mobile, and what you would build
   instead.
6. **Triage note:** the three most likely causes of an empty report for one legitimate user.

**Success criterion:** a written spec — five report definitions, two dashboard layouts with a
stated question per component, an explicit mobile decision, and an empty-report triage note. No
report relies on hardcoded dates or hardcoded owner names.

---

## 5. Phase Summary

- Five report types, five question shapes. Grouping is the dividing line: summary and matrix
  group, the rest do not.
- Joined reports count **primary** records — pick primary deliberately.
- Relative date ranges stay correct; absolute dates go stale. Never group a trend by
  "Calendar quarter".
- Reports run as the **running user**, which is why "My" filters are dangerous on a leadership
  dashboard.
- Dashboards are **desktop-only**; mobile needs mobile record pages or Lightning pages.
- A dashboard component should answer a question the viewer can act on.

Next: **Phase 4 — Custom Objects & Fields**, the first of four data phases (22% of the exam).