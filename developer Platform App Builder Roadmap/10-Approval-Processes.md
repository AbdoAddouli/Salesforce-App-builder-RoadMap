# Phase 10: Approval Processes

Multi-step human sign-off, with locking, rejection and resubmission.

## Learning Objectives

- Build an approval process with entry criteria, criteria, steps and a final approver.
- Choose between a user approver, a queue, and a manager or role hierarchy approver.
- Explain field locking, and what happens on submit, approve, reject, recall and cancel.
- Design multiple approval processes on one object and explain the order they run in.
- Combine approval processes with flows without them duplicating each other.
- Configure email alerts and a wizard for a complete approval experience.

## 1. The building blocks

| Piece | What it does |
|---|---|
| **Entry criteria** | Whether an approval request can be *created* on a record at all |
| **Criteria** | Whether this *process* applies to a record being submitted |
| **Approver** | Who decides: user, queue, related user, manager, role hierarchy |
| **Step** | One level of a multi-step approval, with its own approver and fields |
| **Final approver** | The last step; locks the approval layout fields on approval |
| **Approval layout** | The layout approvers see |
| **Approval history** | Related list: who did what, when, and why |
| **Initial submitter** | Who creates the request, usually the owner |
| **Initial submission actions** | Actions, emails, tasks, field updates on submit |
| **Final approval actions** | Actions, emails, tasks, field updates on final approval |
| **Outbound message** | A reusable email template |
| **Wizard** | The guided popup for choosing approvers on submit |
| **Allow recall / cancel** | Whether the submitter can pull back or end the request |
| **Allow submission by the creator** | Whether the creator may approve their own request |

### Approver types

| Type | Resolves to |
|---|---|
| Specify users | A queue of named users; first to act wins |
| Let the submitter choose | One person picked at submit time via the wizard |
| Related user | The Owner, a Manager on a related record, a field value |
| Manager / role hierarchy | The submitter's manager, or a level of the hierarchy |

> `${!User.Id}` means "the Opportunity Owner" — the standard way to say the deal owner approves.

## 2. Lifecycle

| State | Fields on the approval layout |
|---|---|
| **Draft** | Editable |
| **Submitted** | Read-only for the approver |
| **Approved (final)** | **Locked** |
| **Rejected** | **Editable**, then resubmit |
| **Recalled** | Editable, effectively draft again |
| **Cancelled** | Terminal |

Three limits:

1. A record can be **submitted three times**; after that only recall or cancel remain.
2. A **finally approved** record cannot be recalled.
3. **Rejected** is not terminal — the submitter edits and resubmits.

> Final approval locks only the fields **on the approval layout**. Other fields stay editable, and an
> admin with Manage Users permission can override, audited.

## 3. Multiple processes on one object

- The **first** process whose criteria match uses up the submission and runs to completion.
- The next is considered only once the previous is no longer pending.
- Entry criteria are checked first: if none match, no request can be created at all.

Order matters when criteria overlap — put the most specific process first, or a small-discount
process swallows a large-discount request.

## 4. Approval and flow together

| Requirement | Tool |
|---|---|
| A human must approve | Approval process |
| Then create a task for Contracts | Record-triggered flow on the approved status |
| Then lock the commercial fields | Approval layout locking |
| Reject a save because a field is invalid | Validation rule, never an approval |
| Then update 200 records | Scheduled flow |

**The rule of thumb: the approval process decides, the flow does the work that follows.**

> A flow that re-checks the approval criteria duplicates the decision logic, and the two will drift
> apart when the threshold changes.

## 5. Approver experience checklist

- Email alerts on every step, plus a task — otherwise approvals sit unnoticed.
- An approval layout with only what the approver needs.
- Comments on every step, marked required, so rejections are actionable.
- Approval History on the page (Phase 12).
- "Allow submission by the creator" off where self-approval is a risk.

## 6. Phase Summary

- Final approval locks the approval layout fields. Nothing else.
- Three submissions maximum.
- Processes on one object run in order; the first match consumes the submission.
- Validation rules run on submit, not on approve.
- Approval decides, flow acts.

**Next:** Phase 11 — Workflow Rules (logic domain, the last of the four).