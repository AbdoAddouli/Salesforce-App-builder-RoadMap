# Phase 4: Custom Objects & Fields

Decide what deserves to be its own object, then give it fields that survive contact with real
users. This is the first of four **data** phases, worth 22% of the exam.

## Learning Objectives

By the end of this phase, you will be able to:

- Decide whether a new business concept is a field on an existing object or a new custom object.
- Create custom objects and fields declaratively, and tell label, API name and record name apart.
- Match field types to real-world data: text, number, currency, picklist, lookup, date, formula.
- Explain what uniqueness, required fields and validation do — and why required is not the same as
  validated.
- Explain why deleting or renaming fields is effectively permanent.

---

## 1. Field or Object? The Decision That Scales Everything

**Does this need its own records, its own lifecycle, or its own reporting?** If yes, it deserves a
custom object. If it is one more attribute of something you already track, it is a field.

| If the requirement is… | Build | Because |
|----------------------|-------|---------|
| A new attribute of an existing thing (Warranty Expiry on a Contract) | A **field** on that object | One more column; the records already exist |
| Something with its own records and lifecycle (a Quote Request that is submitted, approved, expires) | A **custom object** | It needs its own status, owner and sharing |
| Something that happens *to* a record at a point in time | Usually a **field** (a date, a status) | It is an event about a record, not a separate thing |
| Repeating lines under a parent (quote lines) | A **child object** with a relationship | One parent has many children, so each child needs its own record |
| A configurable preference | Often **nothing declarative** — config or metadata | Avoid modelling what config was designed for |

A useful pressure test: **would a manager ask "show me all the ones that are late?"** If yes, you
want a queryable object with a status. If the answer is always "show me that one contract's warranty
date", it is a field.

> Do not create a custom object to hold a single value. An object per attribute produces a tab per
> attribute, a sharing rule per attribute, and reports nobody can read. This is the most common
> beginner design mistake.

### Extend the standard objects, don't replace them

| Standard object | Extend it for | Do **not** create a custom |
|----------------|---------------|--------------------------|
| Account | Territory, customer tier, credit terms | your own "Customer" object |
| Contact | Buying role, job detail | your own "Person" object |
| Lead | Source detail, product interest | your own "Enquiry" object |
| Opportunity | Discount %, competitor, territory | your own "Deal" object |
| Product | Part number, weight, lead time | your own "Item" object |

Doing so inherits everything standard: reports, forecasting, activities, sharing and mobile
layouts.

**The exception:** a custom object modelling a *genuinely different* process — an internal approval
request, a service case, a quote request — is correct and common. The test is whether the process
is the standard object's process or something new bolted onto it.

### Checkpoint

> **You need a Warranty Expiry date on every Contract. Object or field?**

**Custom field.** It is one attribute of an existing record. Contract already has a tab, standard
reporting and its own sharing; a `Warranty__c` object holding one date per record would add a tab
and sharing rules for no queryable benefit.

---

## 2. Field Types and Naming

A custom field has three names, and confusing them causes real deployment pain.

| Name | What it is | Can it change? |
|------|-----------|----------------|
| **Field name** (API name) | The developer identifier, e.g. `Territory__c` | **Never**, once data exists |
| **Label** | What users see, e.g. "Sales Territory" | Yes, freely |
| **Field label for reports** | A longer label for reports and exports | Yes, freely |

> Rename the **label** freely — it is presentation. Never rename the **API name**: every formula,
> flow, validation rule, permission set and report referencing it breaks. API names follow
> `Object__c` / `object__c` and are what appear in the metadata XML (Phase 15).

### Choosing a type

| Type | Use for | Watch out for |
|------|---------|---------------|
| Text | Names, part numbers | Set a sensible length, not 255 blindly |
| Text Area | Long free text | Single line in reports |
| Number / Currency / Percent | Amounts, rates | **Currency is not formula-friendly** (Phase 6) |
| Date / DateTime | Close date, expiry | DateTime carries a timezone |
| Picklist | A controlled short list you pick | Fixed in config; not an entity |
| Multi-select Picklist | Tags, categories | Hard to group by |
| Lookup | A reference to another record | Enforces nothing by itself (Phase 5) |
| Checkbox | A yes/no | Cannot be meaningfully "required" |
| Formula | Computed from other fields | Read-only (Phase 6) |
| Roll-Up Summary | A total from child records | Master-detail children only (Phase 7) |

The exam-relevant detail: **Currency, Text Area and Rich Text cannot be referenced directly inside
a formula.** You often need a hidden helper Number formula to bridge the gap. This is a very common
multi-step question.

### Picklist vs lookup

A **picklist** stores a value that means nothing elsewhere. A **lookup** points at a real record
with its own identity, owner, reports and sharing.

> Ask: **will someone ever need to own this, report on it, or attach something to it?** If yes,
> lookup. If it is purely a label on this record, a picklist is lighter and simpler.

### Checkpoint

> **Which field types cannot be referenced directly in a formula?**

Currency, Text Area and Rich Text. That is why formulas are a trap: a formula summing a Currency
field fails, and you must first create a helper formula field of type Number to convert it, then
reference that.

---

## 3. Required, Unique, and the Limits of Declarative Config

Field-level settings are the cheapest guardrails you will ever build — but know exactly what each
one does **not** do.

### Required

**Required** blocks saving a record without a value. It does **not** validate the value: a required
Date field accepts a date 200 years ago. Required is a presence check, nothing more.

> A **checkbox cannot be meaningfully required**: an unchecked checkbox submits as blank, so it
> either passes a presence check or fails unpredictably. If you need "this must be explicitly
> decided", use a picklist with a value like "Not decided".

### Unique

**Unique** prevents two records sharing the same value in that field, enforced by the platform on
save — a genuine guarantee, not a suggestion.

> **External ID + Unique** is how you upsert. The field becomes the key you can load data by instead
> of a Salesforce record ID, which is exactly what an integration needs.

### Default values

Applied on creation through the UI or a flow, but **not** reliably applied to records created by
API load or data import. Do not treat a default as a data guarantee.

### Record names

A custom object chooses a **record name** display type:

| Record name type | Gives you | Best for |
|------------------|-----------|----------|
| Auto Number | 0001, 0002 | Cases, tickets, orders |
| Text | A user-entered name | Accounts, products |
| Auto Number + Text | Both | Opportunities |

Record names are what users see in reports and list views. They are **not a field**, which
surprises people.

### What is effectively irreversible

- **Deleting a field** removes it and its data; UI recovery is via the Recycle Bin for a short
  window only.
- **Renaming an API name** is not supported in place — create a new field and migrate.
- **Deleting a custom object** deletes its fields and records.
- **Removing an object from a package** needs a destructive-changes manifest (Phase 15).

### Checkpoint

> **You mark Discount_Percent__c Required. A rep submits 250%. Did Required catch it?**

No. Required only checks presence. You need a **validation rule** for the 0–100 range (Phase 7).
This is exactly the distinction the exam tests: **required is presence, validation is
correctness.**

---

## 4. Exercises

### Exercise 4.1 — Field or object, and justify it

| Requirement | Decision | Reasoning to give |
|-------------|----------|-------------------|
| R1: Warranty Expiry date on every Contract | **Field on Contract** | One attribute of an existing record |
| R2: Quote requests with lines and a Draft→Submitted→Approved→Expired lifecycle | **Custom object** `Quote_Request__c` + child `Quote_Line__c`, **master-detail** from request | Own records, own lifecycle, own reporting; lines cannot exist without a parent |
| R3: Which territory each Opportunity belongs to | **Field** — picklist *or* lookup to `Territory__c` | One attribute; filtering works either way |
| R4: Each user personalises app navigation and home page | **Neither** | This is what app navigation and Personalization Types already do |
| R5: Discounts above 30% with an approval each | **Custom object** `Discount_Request__c`, **lookup** to Opportunity | Own approval lifecycle; a lookup because the request must survive independently of the Opportunity's state |

Note R5's relationship choice: lookup, not master-detail, because a master-detail child would roll
its field ownership and deletion behaviour up to the Opportunity in ways a pending approval should
not have.

### Exercise 4.2 — Design a schema and justify every choice

Four fields on Opportunity:

| Label | API name | Type | Required | Unique |
|-------|----------|------|----------|--------|
| Sales Territory | `Territory__c` | picklist or lookup — **state which test decided it** | Yes | No |
| Discount % | `Discount_Percent__c` | **Percent** | No | No |
| Primary Competitor | `Primary_Competitor__c` | Text | No | No |
| Expected Close Date | `Expected_Close_Date__c` | Date | No | No |

Points to make:

- **Percent, not Currency**, for the discount — sidesteps the Phase 6 formula limitation entirely.
- **Territory** decision test: if you need to own territories, report on them, or attach to them,
  it is a lookup to `Territory__c`. If it is purely a label, a picklist is enough — and note that
  the Phase 2 sharing rules keyed on `Territory__c` filter fine on a picklist.
- If "Expected Close Date" actually means *the quote was sent*, rename it `Quote_Sent_Date__c` now,
  while renaming is free.
- Renaming an **API name** breaks formulas, flows, validation rules and reports; renaming the
  **label** breaks nothing.

### Project 4.3 — Model Brightline's data layer

The schema every later phase extends.

1. **Five custom objects.** For each: plural label, singular label, API name, record name type, and
   a one-sentence justification for why it is an object rather than a field.
2. **Two or three important fields each**: label, API name, type, required?, unique?, and why that
   type.
3. **Extend** Lead, Account, Contact, Opportunity and Product with at least one custom field each.
4. **Every relationship typed** — master-detail or lookup — with a reason.
5. **Required vs Unique+External ID** identified exactly, each justified.
6. **The "do not create these" section**: three things you deliberately modelled as fields or
   config instead.
7. **Immutable names**: any API name that must never change, and what would break if it did.

**Success criterion:** a written schema with nothing in it that needs Apex to be useful.

---

## 5. Phase Summary

- **Own records, own lifecycle, own reporting** → custom object. Everything else → field.
- Extend standard objects; you inherit their behaviour for free.
- **Label is presentation and renameable. API name is a contract and effectively permanent.**
- Required is **presence**; validation rules are **correctness**.
- Unique + External ID is the declarative upsert key.
- Currency, Text Area and Rich Text cannot be referenced directly in a formula.

Next: **Phase 5 — Relationships & Data Integrity** (cascade rules, validation across the
relationship, and the declarative enforcement tools).