# Phase 8: Record Types & Business Processes

Start the automation domain. Record types decide **how a record is handled**, not **what data it
holds**.

## Learning Objectives

- Decide whether record types solve your problem, or whether they are the wrong tool.
- Configure record types, page layout assignments, and business processes.
- Explain what a business process does and how it differs from a flow.
- Navigate the record type matrix and read a page layout assignment.
- Explain how record types interact with sharing, picklists and business rules.

## 1. Record types: what they are

A record type divides one object's records into categories with different handling: page layouts,
available picklist values, business processes, assignment rules.

- Does **not** change the object schema. The same fields exist on every type.
- Does **not** control who sees a record (Phase 2 handles that).
- Two flavours: **Master** record types and **Business** record types.

### What a record type controls

| Configuration | Effect |
|---|---|
| Page layout assignment | Which layout each type uses |
| Business process | The inline Stage → Path guide |
| Picklist value sets | Restrict picklist values per type |
| Assignment rules | Route records to the right owner |
| Active / inactive | Hide a type from the creation picker |
| Default record type | Which type applies when none is chosen |

## 2. Choosing the right tool

| Need | Use |
|---|---|
| Records handled differently by category | Record type |
| One field differing by category, no layout change | Picklist |
| A guided set of stages | Business process |
| Completely different menus per group | Separate apps |
| A field visible only for certain types | Conditional layout rules (Phase 12) |

> Record types are not the default answer. A picklist solves a lighter problem with less
> configuration.

## 3. Page layouts and picklist value sets

- A record type with **no layout assigned** falls back to the object's default layout.
- A field not on the assigned layout is **hidden**, not restricted — it still exists and still
  appears in reports.
- **Required** is per-object. To require a field **only for one record type**, use a **business
  rule** scoped to that record type.
- A **picklist value set** restricts which picklist values each type sees: SMB sees only "Net 30",
  Enterprise sees "Net 30 / Net 60 / Net 90".

## 4. Business processes

A business process is a guided path of Stages shown as a path on the record page. It replaces a free
status picklist on objects that support it (Opportunity, Lead, Case, and some custom objects).

- **Stage** — one step, e.g. Qualify / Approve / Complete.
- **Path** — the ordered set of stages.
- **Entry criteria** — a formula gating entry to a path.
- **Business process** — the feature bundling path and stages.

A business process does **not** send emails, update other records, or run multi-step logic. That is
flow's job (Phase 9).

## 5. Record types in the wider design

- **Sharing**: a record type can be a criterion in a sharing rule, but the sharing rule does the
  access control. Record types alone grant nothing.
- **Reports**: Record Type is a filterable field on every report and list view.
- **Creation**: one active type can be the default (no picker); several active types show a selection
  screen; inactive types keep historical data but create no new records.
- You cannot deactivate the default type until another becomes default.

## 6. Phase Summary

- Record types change handling, not schema.
- Required-for-one-type = business rule scoped to that type.
- Business process = visual path; flow = automation.
- Deactivate, don't delete, when retiring a type.

**Next:** Phase 9 — Flow Automation (logic domain, the largest at 28%).