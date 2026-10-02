# Phase 5: Relationships & Data Integrity

Master-detail vs lookup, and every declarative tool that stops bad data existing. Still in the
**data** domain (22% of the exam).

## Learning Objectives

By the end of this phase, you will be able to:

- Choose master-detail or lookup correctly, and predict the consequences of each choice.
- Explain ownership, sharing inheritance and cascade delete behaviour in plain terms.
- Enforce data integrity declaratively: required, unique, validation rules, lookup filters.
- Name the declarative tools that stop a record referencing something it should not.
- Diagnose why records cannot be deleted, and how to find orphan data.

---

## 1. Master-Detail vs Lookup: The Choice and Its Consequences

Two relationship types, and the choice propagates into ownership, sharing, deletion, roll-ups and
permissions.

|  | **Master-detail** | **Lookup** |
|---|------------------|------------|
| Child exists without parent | **No** — required | Yes — optional |
| Ownership | Child is **owned by** the parent | Child has its **own owner** |
| Sharing | Child inherits the parent's access | Independent sharing |
| Delete parent | Children **cascade-deleted** (unless orphan rows enabled) | Children become **orphans** |
| Roll-up summaries | **Allowed** on the parent | **Not available** |
| Multiple parents per child | One only | Up to 20 lookups on one object |
| Rolls ownership to grandparent | Yes, through the chain | No |

**The mental model:** master-detail means *"this child is part of that parent"* — a line item is
*part of* an order. A lookup means *"this child merely points at that record"* — a discount request
*references* an opportunity, but is not part of it.

> Ask: **does deleting the parent invalidate this child?** If yes, master-detail. If the child is
> still meaningful without the parent, lookup. Quote lines are the classic master-detail; a
> discount approval referencing a deal is the classic lookup.

### Ownership and its knock-on effects

A master-detail child is **owned by** its parent, so it shows the parent as its owner and cannot
have a separate owner field. The parent's sharing controls who sees the child. Reassigning the
parent reassigns everything below it.

> A master-detail child inherits the **parent's object permissions**. A user who cannot see
> Accounts cannot see that account's master-detail children — even with direct child access in a
> permission set. This surprises people who granted child CRUD correctly.

### Orphan rows

By default deleting a parent **deletes** master-detail children with it. Enabling **Allow orphan
records** lets children survive with a blank parent — almost always a data-integrity mistake you do
not want.

### Checkpoint

> **You need a roll-up of total quoted value on `Quote_Request__c`, totalling its `Quote_Line__c`
> records. What relationship?**

**Master-detail**, parent to child. Roll-ups aggregate over master-detail children only — a lookup
would make the roll-up unavailable entirely, not merely limited.

---

## 2. Lookup Filters and Validation Across the Relationship

A plain lookup enforces nothing. A `Discount_Request__c` can point at a Closed Won opportunity, or
one in another territory. Two declarative tools close that gap.

### Lookup filters

A **lookup filter** restricts which records may be selected when filling the lookup, chosen from
fields on the target record. It is a *selection* restriction at the moment of choosing.

| Need | Tool | Why |
|------|------|-----|
| Only select Products from an active price list | Lookup filter | The user cannot pick an inactive one |
| Quote can only reference an Opportunity in the same territory | Lookup filter or validation rule | Filter prevents; validation catches |
| Blocked at save even if set by a flow or API | **Validation rule** | Filters only govern interactive selection |
| Check a value on a related record | Cross-object validation rule | Can traverse the relationship |
| Prevent deleting a parent that has children | Validation rule, or remove Delete in a permission set | Both declarative |

> Lookup filters are a **convenience guardrail, not a guarantee**. A flow assignment, import or API
> call sets a lookup value without going through the picker. A **validation rule** fires on every
> save regardless, so for a hard rule use validation.

### Validation rules

A validation rule has an **error condition formula** and an **error message**. When the formula is
true, the save is rejected. The powerful part: the formula can traverse a relationship, up to five
levels up.

```
AND(
  ISPICKVAL(StageName),          // Stage is populated...
  NOT(ISPICKVAL(CloseDate)),     // ...but no close date yet
  CloseDate < TODAY()            // ...and the date has passed
)
// Error: "A closed-stage Opportunity must have a Close Date that has not passed."
```

Three things to remember:

- They fire **only on save** of the record holding the rule.
- They do **not** fire when a related record changes.
- They cannot **modify** data — only reject it.

> A validation rule on `Quote_Line__c` checking the parent is not Expired will **not** fire when
> someone later changes the parent to Expired. Reacting to a parent change needs a
> record-triggered flow on the parent (Phase 9).

### The declarative integrity toolkit

- **Unique** — no two records share the value. A platform guarantee.
- **Required** — presence only; no correctness.
- **Validation rule** — arbitrary formula on save, can traverse relationships.
- **Lookup filter** — restricts selection, not storage.
- **Delete restriction via permission set** — remove Delete so nobody orphans the children.

### Checkpoint

> **A rep must pick only Products from the "Standard" price list, and the system must block a
> Standard-list Product being replaced by a retired one. Which tools?**

A **lookup filter** scoped to the active price list prevents interactive selection. Because a filter
only governs the picker, a **validation rule** on `Quote_Line__c` is needed to block the value
arriving by flow, import or API. **Both**: the filter is the UX, the rule is the guarantee.

---

## 3. Diagnosing Integrity Problems

When data is wrong the question is never "what broke?" but **"what allowed it?"** — usually one of a
few declarative gaps.

| Symptom | Most likely cause | Check here |
|---------|-------------------|------------|
| "Cannot delete" error | Master-detail children exist; orphan records not allowed | The parent's related lists |
| Some children visible, others not | Master-detail children inherit parent sharing | Parent access first |
| A lookup points at nothing | Parent deleted, lookup children survived | List views on a blank lookup |
| A roll-up total is wrong | Children with a blank parent are excluded silently | Orphan check on the child |
| A validation rule did not fire | It only fires on save; a related record changed | Did the triggering save happen? |
| A rule fired unexpectedly | A related field changed as a side effect of this save | The rule's cross-object references |
| Duplicate records keep appearing | No Unique flag on the identifying field | Field uniqueness settings |

### Finding orphan data

Blank-lookup orphans are findable declaratively: a **list view on the child object filtered to the
parent lookup = blank**. Orphans appear as a list you can export and fix.

> Two reports worth having in any data project: (1) child records with a blank parent lookup,
> (2) parents whose status implies completion but with zero children. Those are the two gaps that
> quietly corrupt totals, and Phase 3's report design is what makes them visible.

### Order of enforcement on save

1. Before-save flows.
2. Custom validation rules — can reject the save.
3. Duplicate rules.
4. Roll-up summaries recalculate.
5. Workflow rules (field update, email alert, auto-task, assign).
6. Record-triggered flows.
7. Before-trigger Apex → record commits → after-trigger Apex and record-triggered flows.

> Consequence: a **before-save flow** can change a field *before* validation rules see it. And
> because record-triggered flows run *after* the record commits, they **cannot reject the save** — if
> you need to stop a save, use a validation rule.

### Checkpoint

> **A rule on `Quote_Line__c` should block lines on an Expired quote. A rep changes the parent to
> Expired and the existing lines remain, with no error. Why?**

Validation rules fire **on save of the record holding them**. Saving the parent does not re-save the
children, so the rule never evaluated. Reacting needs automation on the parent — a record-triggered
flow (Phase 9) or a process (Phase 10).

---

## 4. Exercises

### Exercise 5.1 — Choose the relationship and predict the fallout

| Pair | Choice | Deciding reason |
|------|--------|-----------------|
| 1. `Quote_Line__c` → `Quote_Request__c`, line cannot exist alone | **Master-detail** | "cannot exist without"; unlocks the roll-up |
| 2. `Discount_Request__c` → Opportunity, pending approval must survive close | **Lookup** | "must survive independently" |
| 3. Contact → Account, deleting Account should not leave contacts | **Master-detail** | Orphan contacts are meaningless (standard config) |
| 4. `Product_Kit_Line__c` → Product | **Lookup** | Catalogue items are independent |

Pair 4 needs two relationships stated: lookup to Product, master-detail to the kit.

**For Pair 3 (master-detail):** the Contact has no independent owner — it inherits Account ownership;
sharing follows the Account; a roll-up on Account would sum the Contacts.

**For Pair 2 (lookup):** deleting the Opportunity leaves `Discount_Request__c` records pointing at
nothing. Prevent it with a validation rule, or accept and monitor for blank lookups.

**Orphan records for Pair 1:** should **not** be enabled — an orphaned quote line is meaningless and
would corrupt the roll-up total.

### Exercise 5.2 — Close the integrity gaps declaratively

Write the rules themselves, not just their names:

1. **`Quote_Line__c` with an Expired parent.** Error condition referencing
   `Quote_Request__c.Request_Status__c = "Expired"`; message: "Cannot add lines to an expired quote
   request."
2. **Submitted quote with zero lines.** Requires a child count — `COUNT()` over the related
   `Quote_Line__c` records = 0 while status is Submitted. **This rule only works because the
   relationship is master-detail**, and it is the same capability that powers roll-ups.
3. **`Discount_Request__c` referencing a Closed Lost opportunity.** Add an `ISNULL(Opportunity__c)`
   guard so a blank lookup does not trip the rule.
4. **Quantity between 0 and 10,000 exclusive.** `OR(Quantity__c <= 0, Quantity__c > 10000)`.

**Lookup filters** improve the product-selection UX (rule-adjacent), but rules 1, 2, 3 and 4 are all
required **despite** any filter, because a filter only governs interactive selection.

### Project 5.3 — Specify Brightline's integrity layer

1. **Five relationships.** For each: from/to, master-detail or lookup, deciding reason.
2. **Consequences per relationship:** ownership, sharing inheritance, delete behaviour, roll-up
   availability.
3. **Six validation rules** with full error conditions and messages, including **at least two
   cross-object** rules that traverse a relationship.
4. For each: whether a lookup filter improves UX, and whether the rule is still needed despite one.
5. **Two gap-detection reports:** object, filter, grouping.
6. **Deletion policy:** consequences per relationship, plus where a validation rule or a permission
   set Delete restriction prevents unwanted deletion.
7. **One case** where a validation rule silently does not fire, and the declarative fix.

**Success criterion:** every rule expressible without Apex.

---

## 5. Phase Summary

- **Master-detail:** required parent, no independent owner, inherited sharing, cascade delete,
  roll-ups available. **Lookup:** independent owner, own sharing, orphans on delete, no roll-ups.
- Test: *does deleting the parent invalidate this child?*
- Master-detail children inherit the **parent's object permissions** — child CRUD alone is not
  enough.
- **Lookup filters** guard the picker; **validation rules** guard the data. Use both.
- Cross-object validation rules work, but **only fire when the child is saved**.
- Record-triggered flows run after commit, so they **cannot reject a save**.
- Orphan data is findable: a list view filtered to the parent lookup being blank.

Next: **Phase 6 — Formula Fields**, the exam's most heavily tested declarative skill.