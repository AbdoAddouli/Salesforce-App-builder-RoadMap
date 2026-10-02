# Phase 13: Dynamic Forms & Lightning Pages

Record types with fields, layouts and guidance — served to the right user.

## Learning Objectives

- Describe what a dynamic form does and when it beats a record type layout.
- Configure dynamic form sections, including rules and field visibility.
- Add guidance text and instructional text to a dynamic form.
- Explain how dynamic forms interact with record types and permissions.
- Build a Lightning page that hosts a form, flow and related records together.
- Choose between a dynamic form, a page layout, a screen flow and a Lightning page.

## 1. What a dynamic form does

A **dynamic form** is a set of **sections**, each with visibility rules, that sits inside a Lightning page.
Instead of one flat layout, the form shows only the sections that apply to *this* record in *this* state.

| Problem | Solution |
|---|---|
| Every user sees every field | Sections appear only when their rules match |
| Guidance buried in field descriptions | **Guidance text** sits in the section, beside the fields it explains |
| Different roles need different fields | Rules can key off the **current user** and permissions |
| Fields appear after a state change | Rules key off **record values**, so the form reshapes |
| Long forms force scrolling | Short, conditional sections with clear titles |

> Dynamic forms do **not** control **requiredness**. Conditionally-required fields are a **validation
> rule**.

## 2. Choosing the tool

| Need | Use |
|---|---|
| Fields differ by **record type** | Record type + its page layout |
| Fields appear based on **field values** or record state | **Dynamic form** section rules |
| Fields differ by **user** or **permission** | **Dynamic form** rules |
| Field **required** only in some situations | Validation rule |
| Stop a save on a condition | Validation rule |
| Multi-step data capture with logic | Screen flow |
| Embed the form with related records | Lightning page |
| Change the record type itself | Record type field or screen flow |

A layout cannot evaluate another field's value, and cannot see the current user. That gap is exactly
what dynamic forms fill.

## 3. Sections and rules

| Rule on | Example | Use for |
|---|---|---|
| **A field value** | Shows when `Discount_Percent__c > 15` | Record state |
| **The record type** | Shows for "Enterprise" | Usually better as a separate layout |
| **The current user** | Shows for the "Sales Manager" profile | Role-based visibility |
| **User permissions** | Shows when the user can edit `Credit_Terms__c` | Permission-aware forms |
| **A picklist value** | Shows when status is "Closed Lost" | Stage-specific guidance |
| **Blank / not blank** | Shows when `Account__c` is blank | Capture steps before linking |

Section rules are combined with the section's configured logic: **AND** (all must match) or **OR** (any
may match). Getting that wrong is the usual cause of a section appearing when it should not.

## 4. Guidance vs instructional text vs field help

| Feature | Where | Best for |
|---|---|---|
| **Guidance text** | Inside the section, above the fields | What the *section* is for |
| **Instructional text** | Section-level block, no fields | Warnings and the rules that apply |
| **Field description** | Under one field | One field's meaning or format |
| **Rich Text** | Anywhere on the page | Static guidance unrelated to the form |

> Guidance text on a section beats help text on every field: twenty descriptions are twenty places to
> look; one paragraph is read once.

## 5. Interaction with record types and permissions

| Layer | Controls | Does NOT control |
|---|---|---|
| Record type | Which layout and business process | Which fields a user sees |
| Page layout | Which fields are on the page | Requiredness, field-vs-field conditions |
| **Dynamic form** | Which sections show, per record and user | Requiredness, validation, saving |
| **Validation rule** | What is valid; can reject a save | Anything visual |
| **FLS / object permissions** | Which fields a user can read or edit at all | Field order |

> A dynamic form can show a field the user cannot edit, and can try to show one they cannot read — which
> errors. Align the form with a permission set.

## 6. Components on a page

| Requirement | Component |
|---|---|
| Conditional fields with guidance | **Dynamic Form** |
| A flat field group | Record Details |
| Key-fields summary | Record Highlights Panel |
| Step-by-step capture with logic | **Screen Flow** (Flow component) |
| One-click record creation | **Quick Action** |
| One-question form, e.g. a rating | **Flow** in Feedback Layout mode |
| Related records with filters | Related List — Single |

> A screen flow as a Flow component **replaces the form view**. Right for a guided process, wrong for
> "edit these five fields".

### Order that works

1. Record Highlights Panel — the five fields that identify the record.
2. Dynamic Form — the main work area, centred.
3. Related List — Single — context needed while filling the form.
4. Flow — actions and secondary logic, below the fold.
5. Rich Text — guidance at the **bottom**, so it does not push the form down.

## 7. Activation and review

- Activate the page per record type, as in Phase 12.
- Test **with no data** — a rule on a blank field can behave unexpectedly.
- Test as **each persona**: rep, manager, finance, read-only.
- Test on **mobile** — one column, section order changes.
- **Check the validation rules.** A hidden field can still be required by a rule.

> The classic dynamic-form bug: a section hides "Approval Notes", but a validation rule still requires
> it above 15% discount. The user cannot see the field, so they cannot satisfy the rule.

## 8. Phase Summary

- Dynamic forms control **visibility**, not requiredness and not validity.
- Rules can key off field values, record type, the current user, or permissions.
- Guidance text on a section beats help text on every field.
- Screen flows replace the form view — do not use them to edit a few fields.
- Audit every conditional-required validation rule against what the form actually shows.

**Next:** Phase 14 — Lightning Console & Experience Sites. Last topic in the UI domain (17%).