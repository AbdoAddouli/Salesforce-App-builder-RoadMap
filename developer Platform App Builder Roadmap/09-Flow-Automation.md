# Phase 9: Flow Automation

The declarative automation engine, and the largest topic on the exam.

## Learning Objectives

- Name the three flow types and pick the right one from the requirement.
- Design entry conditions, decisions and loops without creating infinite runs.
- Configure a record-triggered flow, including the before-save variant.
- Configure a scheduled flow and a scheduled path for time-based automation.
- Explain transaction behaviour, and what Fault and error paths are for.
- Debug a flow using run history, the flow debugger, and safe testing.

## 1. The three flow types

| Type | Runs when | Runs in | Can block the save? |
|---|---|---|---|
| **Record-triggered** | Record created or updated | After save (after-commit) | No |
| **Record-triggered — before save** | Record created or updated, pre-commit | Before save (fast field update) | **Yes** |
| **Scheduled** | At a set time, once or repeating | After commit | No |

Plus **Autolaunched** flows (invoked by another flow or process) and **event-driven** flows
(Platform Event–triggered).

### The record-triggered pattern

1. **When** — the trigger, with any entry conditions.
2. **Find matching records** — optional Get Records.
3. **Elements** — Decisions, Assignments, Updates, Tasks, Emails, Subflows.
4. **End**.

### Entry conditions that matter

| Requirement | Entry condition |
|---|---|
| Only on create | Trigger = Record Created only |
| When a field becomes a value | Created and Updated + `AND(ISCHANGED(Field__c), Field__c = "X")` |
| When several fields agree | One `AND(...)` |
| When any one applies | One `OR(...)` |
| Every save | Blank entry condition |

> "Only when it **changes to** X" differs from "only when it **is** X". The second fires again on every
> later save while the value is still X.

## 2. Elements

| Element | Purpose | Note |
|---|---|---|
| **Decision** | Branch on a formula | Has a default outcome |
| **Assignment** | Set a field or variable | Can target the record or a related record |
| **Update Records** | Save field changes | The cross-record update tool |
| **Get Records** | Query records | Declarative SOQL substitute |
| **Loop** | Repeat over a collection | Consumes elements |
| **Subflow** | Call another flow | Passes variables in and out |
| **Fault** | Surface an error | **Before-save flows only** |
| **Wait** | Pause the run | Scheduled and autolaunched only |
| **Roll Back Records** | Undo the transaction | Record-triggered flows only |

> A flow run is limited to **50 elements**. A large loop can exhaust the limit and roll back the
> transaction.

### Transactions

Everything in a run commits together or rolls back together. So:

- A record-triggered flow that updates its own record **can re-trigger itself** — guard with
  `ISCHANGED()`.
- A before-save flow runs in the fast field update transaction: field updates yes, related records no.
- A before-save flow has **no record ID** for a newly created record yet.

## 3. Scheduled flows and scheduled paths

- **Scheduled flow** — starts from a scheduled trigger, runs once or repeating (daily, weekly).
- **Scheduled path** — part of a record-triggered flow or approval process; fires on a *record* after a
  wait on a branch. Time counts from when the record entered the path.

A scheduled flow runs in the **system context**: it sees all records regardless of sharing and runs as
the automated process user.

## 4. Debugging

1. **Flow Runs** — status: Finished, Failed, Waiting, Paused.
2. **Error message** — usually names the failing element and reason.
3. **The flow debugger** — step through, inspect data at each element.
4. **Test the failure paths**, on scratch records, never production data.

> "Flow is in an error state" on a record means the flow stopped. The record is fine.

## 5. Flow vs everything else

| Requirement | Tool |
|---|---|
| Stop a save because this record is invalid | Validation rule |
| Change a field before save | Before-save flow or formula field |
| React to another record's save | Record-triggered flow |
| Act at a specific time | Scheduled flow or scheduled path |
| Multi-step approval with approvers | Approval process |
| Simple field update or email on save | Workflow rule |
| Logic no declarative tool covers | Apex trigger |

## 6. Phase Summary

- Before-save flow + Fault is the only way to reject a save declaratively.
- `ISCHANGED()` in the entry condition is the self-retrigger guard.
- 50 elements per run; loops are expensive.
- Scheduled flow = bulk sweep on a clock. Scheduled path = per-record wait.
- Roll Back Records keeps a failed run from leaving partial data.

**Next:** Phase 10 — Approval Processes (logic domain).