# Phase 1: Salesforce Fundamentals

The platform model every other phase stands on: how Salesforce stores data, how the
Lightning interface lets you reach it, and how to choose the right declarative feature
before you build anything. This phase is tagged **Salesforce Fundamentals**, the largest
exam section at roughly 23% of the paper.

Everything in this roadmap is built into **one** org: Brightline Equipment, a B2B
industrial-equipment reseller. Phases 2-17 extend the same objects and fields, so the
scenario you design here becomes the contract for the rest of the build.

## Learning Objectives

By the end of this phase, you will be able to:

- Distinguish objects, records and fields, and name the standard objects a Lead-to-Cash
  org depends on.
- Explain the difference between a standard and a custom object, and why the `__c` suffix
  matters in Setup, in the API and in exam questions.
- Navigate the Lightning interface confidently: the app launcher, tabs, list views, record
  pages and global search.
- Decide where a new piece of functionality belongs, using a repeatable decision order that
  prefers the lightest declarative feature.
- Recognize the five exam domains and their approximate weights.

---

## 1. The Salesforce Data Model in One Page

Almost every Platform App Builder question is a variation on one idea: Salesforce stores
data in a small number of objects, each holding rows of data (records), each row made of
columns (fields). Learn those three nouns and most of the exam becomes bookkeeping about
**who can see which row**.

| Term | What it actually is | Example |
|------|--------------------|---------|
| **Object** | A container for one kind of business thing. Built in or custom. | `Account`, `Opportunity`, or custom `Quote_Request__c` |
| **Record** | A single row inside an object, one real-world instance. | The account for "Northwind Traders" |
| **Field** | One column on an object, holding one value per record. | `Account → AnnualRevenue` (Currency) |
| **Tab** | The UI doorway to an object. **Not** a data container. | The Accounts tab |
| **Page layout** | Which fields appear where on a record page. Holds no data. | Stage + Amount on the left of an Opportunity |

Two distinctions do most of the work in this exam:

1. **A tab is not a data container.** It is a doorway onto an object. The object holds the
   data; the tab is how you reach it.
2. **A page layout and a record type change how a record is displayed.** Neither one adds a
   field, creates a record, or stores anything.

### Standard vs custom objects

Standard objects ship with Salesforce and **cannot be deleted**. Custom objects are ones you
create, are **required** to carry a `__c` suffix, and can be deleted along with all their
data. The exam cares about this: deleting a custom object is a reversible mistake, while
deleting a standard one is not even possible.

- **Standard object** — built in, no `__c` suffix, not deletable. Example: `Opportunity`.
- **Custom object** — created by you, `__c` suffix required, deletable. Example:
  `Discount_Request__c`.
- **Custom field on a standard object** — no new tab; the field simply appears in layouts and
  reports. Example: `Lead → Lead_Source_Detail__c`.

> The `__c` suffix is not cosmetic. It is how you recognise a custom object or field in the
> Setup UI, in the API, and in exam questions.

### The Lead-to-Cash objects

| Object | Role in Lead-to-Cash | Extended in |
|--------|---------------------|-------------|
| **Lead** | An unqualified enquiry. Converted into Account + Contact. | Custom fields, validation, assignment |
| **Account** | The customer company. The parent of the deal. | Custom fields, lookup filtering |
| **Contact** | The person at the customer company. | Lookup filtering, page layouts |
| **Opportunity** | A specific potential sale with an amount and stage. | Validation, flows, roll-ups |
| **Contract** | The signed agreement. Generated from a won Opportunity. | Approval process, validation |

### Checkpoint

> **Brightline wants to track "Warranty Expiry Date" on every Contract. Does that need a new
> object, and will it need a new tab?**

Neither. It is a custom **field** on the standard Contract object. Custom fields never create
a tab, because a tab exists per *object* and Contract already has one. Confusing a custom
field with a custom object is one of the most common traps in this exam.

---

## 2. Lightning Navigation You Must Be Fluent In

The exam is delivered in the Lightning interface, and several domains (App Builder, Dynamic
Forms, sharing decisions) are effectively judged by **where you would click**. Learn the four
navigation surfaces so you can go straight to the right one.

### 1. The app launcher — switching context

Top-left grid icon. It lists **apps**, and each app has its own set of tabs. You may see
several apps with an Account tab; the app decides which tabs exist, and roles and profiles
decide which apps a user can open at all. **App Builder** is where you create and configure
these.

### 2. Tabs and list views — finding records

A tab opens an object's **list view**. A list view is a saved, filterable search over that
object: "My Closed Won Opportunities this quarter" is a list view. List views are the fastest
way to scope work, and the exam asks you to choose the right one to isolate a record set.

### 3. Record pages — working on one record

Clicking a record opens its detail page: a header (name and key fields), a highlights panel,
related lists, and a tabbed body. Page layouts, record types and Lightning components control
what a user sees here. Dynamic Forms changes how the layout reacts to record data.

### 4. Global search — jumping across objects

The omnibox searches across the objects a user can access and opens results in a Lightning
modal. Its behaviour is governed by **search layouts**, which is how an administrator decides
which fields are searchable and which objects appear in search.

> Memorise the direction of control: a **tab shows many records**; a **record page shows one
> record**. A page layout organises fields on one record page; a list view organises which
> records appear in a list.

### Setup vs the app

| Where | Use it for | Examples |
|-------|-----------|---------|
| **Lightning app** (no Setup) | Day-to-day work on records | Opening a tab, editing a record, global search |
| **App Builder** (in Setup) | Configuring objects, fields, tabs, apps, layouts | Creating a custom object, adding a field, editing a page layout |
| **Setup** (gear → App Setup) | Admin configuration and security | Profiles, sharing, packaging, deployment |

### Checkpoint

> **A user says "I can't find open Opportunities over $50k." Which three tools do you reach
> for, in order?**

1. Confirm they have the right app and that the Opportunities tab exists in it.
2. Open the Opportunities tab and use or build a list view filtered to open AND `Amount`
   greater than 50,000.
3. If they cannot build that filter, check their profile and sharing — they may not see those
   records at all, which is a **sharing** problem, not a list view problem.

---

## 3. Where to Build: Choosing the Right Feature

A large share of the exam is "given this requirement, which feature do you use?" Those
questions are only hard if you have no default plan. Use this decision order and you can
justify an answer even when the wording shifts.

1. **Purely presentational** (field order, sections, related lists)? → Page layout or
   Lightning App Builder. No new data.
2. **New data on an existing thing?** → Custom field on that object.
3. **New kind of business thing** needing its own tab, records and lifecycle? → Custom
   object, optionally with a junction object to relate it.
4. **Calculated value derived from the record itself?** → Formula field.
5. **Value rolled up from child or related records** (e.g. total of an Opportunity's line
   items)? → Roll-up summary field.
6. **Hard "never allow this" rule that must reject the save?** → Validation rule.
7. **Automation on save** (assign, notify, update a related record)? → Record-triggered flow.
8. **Must be approved before it advances?** → Approval process.
9. **Who-can-see-what** for records or fields? → Sharing rules / OWD / roles; field-level
   security.

> Do not reach for automation (flow / workflow) to compute a value that a formula or roll-up
> summary can derive for free. Formulas and roll-ups are declarative, testable and cannot loop
> infinitely. The exam rewards the lighter choice.

### Declarative first

This roadmap is deliberately **declarative-first**. Ordering fields, calculations, validation
and simple automation are all point-and-click. Only when a requirement genuinely cannot be met
declaratively should code enter — and Platform App Builder is not a coding exam, so the correct
answer is almost never "write Apex".

### A worked example

**Requirement: "A Discount above 25% must be approved by the VP before it saves."**

1. It is a rule on saving an Opportunity, so a validation rule could push it, but a validation
   rule cannot *route for approval*.
2. Approval routing with submit / approve / reject is exactly an **Approval process** on the
   Opportunity.
3. Add a `Discount_Percent__c` number field to hold the discount.
4. To make it visible in a clean spot, drop the field onto the Opportunity page layout.

Each step picks the lightest feature that fits, and none of them require code.

### What the built artefact looks like

You configure all of this through Setup, but the same definition has an XML shape in source
format — the shape a `package.xml` manifest will contain once you deploy it:

```xml
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Discount Request</label>
    <pluralLabel>Discount Requests</pluralLabel>
    <nameField>
        <label>Discount Request Number</label>
        <type>AutoNumber</type>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <sharingModel>ReadWrite</sharingModel>
    <fields>
        <fullName>Requested_Discount__c</fullName>
        <label>Requested Discount %</label>
        <type>Percent</type>
    </fields>
    <relationshipLabels>
        <fullName>Opportunity_Discount_Requests__r</fullName>
        <label>Discount Requests</label>
    </relationshipLabels>
</CustomObject>
```

Two tells confirm your understanding:

- `Requested_Discount__c` carries the `__c` suffix because it is a **custom field**, and it
  lives in a `<fields>` collection *inside* the object. A field is part of an object, not a
  sibling of it.
- `relationshipLabels` exists because the object has a child relationship to Opportunity, which
  you created when you chose a lookup.

> You do not need to memorise XML. Learn to **read** the shape: what object it describes, what
> fields it carries, what relationships it implies. That is enough for "which metadata component
  is missing?" questions, which appear in the App Deployment domain.

---

## 4. Know the Exam Before You Study It

**Platform App Builder (CRT-403)** is a multiple-choice exam about deciding *which*
declarative Salesforce feature solves a business problem, and about configuring the platform
without code.

| Exam fact | Value |
|-----------|-------|
| Code | CRT-403 |
| Questions | 60 scored, plus up to 5 unscored |
| Time | 105 minutes |
| Pass mark | 63% |
| Prerequisites | None |

### The five domains

| Domain | Weight | What it wants from you |
|--------|--------|------------------------|
| Salesforce Fundamentals | ~23% | Platform model, navigation, sharing basics, reports/mobile concepts |
| Data Modeling & Management | ~22% | Objects, fields, relationships, formulas, roll-ups, validation |
| Business Logic & Process Automation | ~28% | Flow, approval processes, validation — the heaviest domain |
| User Interface | ~17% | Lightning App Builder, page layouts, Dynamic Forms |
| App Deployment | ~10% | Packages, deployment options, change sets, environments |

> **Business Logic & Process Automation is the biggest slice (~28%).** Budget your revision
> time accordingly.

### How this roadmap maps to the exam

Each phase carries a tag naming the exam domain it mainly serves, so the dashboard and the
mock exam can show you which section to revise. A tag reflects the *dominant* skill a phase
teaches; several phases legitimately touch two domains.

### Roadmap at a glance

| # | Phase | Domain |
|---|-------|--------|
| 1 | Salesforce Fundamentals | Fundamentals |
| 2 | Security & Sharing Fundamentals | Fundamentals |
| 3 | Reports, Dashboards & Mobile UX | Fundamentals |
| 4 | Custom Objects & Fields | Data Modeling |
| 5 | Relationships & Data Integrity | Data Modeling |
| 6 | Formula Fields | Data Modeling |
| 7 | Roll-Up Summaries & Validation | Data Modeling |
| 8 | Record Types & Business Processes | Business Logic |
| 9 | Flow Automation | Business Logic |
| 10 | Approval Processes | Business Logic |
| 11 | Workflow Rules, Assignment & Auto-Response | Business Logic |
| 12 | Lightning App Builder | User Interface |
| 13 | Dynamic Forms & Lightning Pages | User Interface |
| 14 | Lightning Console & Experience Sites | User Interface |
| 15 | Packaging & Metadata Deployment | App Deployment |
| 16 | Change Sets & Environment Strategy | App Deployment |
| 17 | Capstone: Lead-to-Cash Application | Business Logic |

---

## 5. Exercises

### Exercise 1.1 — Map the requirement to the feature

Practise the decision order so "which feature?" stops feeling ambiguous.

| Requirement | Feature | Why |
|-------------|---------|-----|
| A. Show Payment Terms above the Billing Address section | **Page layout** | Purely presentational; changes where an existing field sits |
| B. Track Part Number on every Product | **Custom field** `Part_Number__c` | A new column on an existing standard object, not a new object |
| C. Opportunity total equals the sum of its line items | **Roll-up summary** | Aggregate across a variable number of child records |
| D. Cannot be Closed Won unless Close Date is in the past | **Validation rule** | Rejects an impossible state; constrains the save |

### Exercise 1.2 — Explore a real org

1. Open Setup → **App Setup → Accounts**.
2. Name two standard and two custom Account fields. How can you tell them apart?
3. Open one Account record. Name the object and list the sections on its page layout.
4. Explain why the Accounts tab shows a list rather than a single record.
5. Find the API name of Opportunity in **Object Manager** and compare it to its label.

**Expected:** custom fields carry `__c`; a tab shows *many* records (a list view), a record page
shows *one*; Opportunity's API name has no suffix, while a custom object's matches its label
with `__c` (e.g. `Quote_Request__c`).

### Project 1.3 — Plan the Brightline Lead-to-Cash build

Produce the one-page requirements map that Phases 2-17 will build from, **before any config
exists**. Deliver:

1. The standard objects the process needs and one sentence on each role.
2. Three custom objects you would add, each with a purpose and whether it needs its own tab.
   Think about what has no home in the standard five — a quote request with multiple lines, a
   discount needing approval, a sales territory.
3. For each custom object, decide its **relationship** to the standard objects (master-detail,
   lookup, or many-to-many via a junction) and explain each choice.
4. The happy path in three to five steps, from a new web Lead to a signed Contract, naming
   which object is in play at each step.

**Success criterion:** you have a plan naming standard objects, three custom objects with clear
purposes and relationship types, and a Lead-to-Contract flow. The test for a custom object is:
**if it needs its own records, its own lifecycle or its own reporting, it deserves its own
object.**

---

## 6. Phase Summary

- Objects, records, fields — and the two traps: a tab is not a data container, and a page
  layout stores nothing.
- `__c` marks anything custom; a custom **field** never creates a tab.
- Four navigation surfaces: app launcher, tabs/list views, record pages, global search.
- The build decision order, and the rule that the lightest declarative feature wins.
- CRT-403: 60 + 5 questions, 105 minutes, 63% to pass, no prerequisites; Business Logic &
  Process Automation is the heaviest domain at ~28%.

Next: **Phase 2 — Security & Sharing Fundamentals**, where the tabs and list views from this
phase become a question of *which* records a user may see at all.