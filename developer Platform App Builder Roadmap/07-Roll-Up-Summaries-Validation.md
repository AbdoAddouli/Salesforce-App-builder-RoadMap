# Phase 7: Roll-Up Summaries & Validation

Totalling children declaratively, and rejecting bad data before it is saved. Completes the
**data** domain (22%).

## Learning Objectives

- Configure a roll-up summary with the right aggregate function over master-detail children.
- Choose between COUNT, SUM, MIN, MAX and COUNT (Distinct).
- Write a validation rule with a correct error condition and a useful error message.
- Handle blanks in validation rules so they fire on the cases you meant.
- Choose the right tool among validation rule, duplicate rule, workflow and flow.

## 1. Roll-Up Summaries

A roll-up is the declarative answer to "how much, or how many, of the children?" — the thing a
formula cannot do (Phase 6).

- Requires a **master-detail** relationship. The parent holds the roll-up; children are aggregated.
- The value is **read-only**, maintained by the platform.
- Recalculates automatically when children change.
- If children are **orphans** (blank parent), they are **silently excluded** — the total is wrong
  with no error.

### Aggregate functions

| Function | Returns | Use when |
|---|---|---|
| **COUNT** | Number of child records | "How many" |
| **COUNT (Distinct)** | Distinct values of a chosen child field | Different products, not just lines |
| **SUM** | Total of a numeric child field | Totals, amounts |
| **MIN** | Smallest value | Earliest date, lowest price |
| **MAX** | Largest value | Latest date, highest price |

> **Distinct COUNT**: "how many different Products appear on this quote?" needs COUNT (Distinct) on
> the Product field. Plain COUNT returns the number of lines.

## 2. Validation Rules

Two parts: the **error condition formula** (when TRUE, reject) and the **error message** (tells the
user how to fix it).

The message must be useful — name the field and what is wrong. "Quantity must be greater than zero
and no more than 10,000." is useful; "invalid data" is not.

### Patterns

- Value out of range: `OR(Quantity__c <= 0, Quantity__c > 10000)`
- Blank lookup: `ISBLANK(Field__c)`
- Cross-object: `AND(NOT(ISNULL(Parent__c)), Parent__c.Field__c = "X")`
- Guard blanks with `ISNULL`/`ISBLANK`/`ISPICKVAL` before comparisons

> **ISNULL guards are not optional when traversing a relationship.** A blank lookup referenced in a
> comparison behaves unreliably.

## 3. Choosing the Right Tool

| Tool | Does | Cannot |
|---|---|---|
| **Roll-up summary** | Aggregates child records | Stop a save |
| **Validation rule** | Rejects a save when a condition is true | Modify data; react to a change on another record |
| **Duplicate rule** | Stops two records matching a comparison | Reference another object |
| **Workflow rule** | Field updates, emails, tasks after save | Stop a save |
| **Flow** | Full automation before or after save | Stop a save (after-save flow only) |

## 4. Exercises & Phase Summary

- Use **COUNT (Distinct)** when you need "different X", not total lines.
- Orphans are **silently excluded** from roll-ups — avoid orphan records if you rely on totals.
- Validation rules fire **only when the record holding the rule is saved**.
- A duplicate rule compares against **existing records of the same object**.
- Validation rules run **before** duplicate rules.

**Next:** Phase 8 — Record Types & Business Processes (logic domain).