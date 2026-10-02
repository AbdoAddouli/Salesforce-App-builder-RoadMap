# Phase 11: Workflow Rules, Assignment & Auto-Response

The legacy automation tool — deprecated for new builds, still fully examinable.

## Learning Objectives

- Name the workflow rule evaluation order and why it matters.
- Configure a rule with criteria and actions, and pick the right action type.
- Explain why workflow rules run after save and cannot stop a save.
- Configure auto-response rules for leads and cases.
- Use assignment rules, auto-response rules and queues together correctly.
- Decide when to use workflow rules and when to use flow instead.

## 1. Anatomy of a workflow rule

| Part | What it is |
|---|---|
| **Evaluation criteria** | *When* to evaluate: on create, on every edit, or when a specific field is edited |
| **Criteria** | The formula that must be TRUE for the rule to act |
| **Actions** | What happens when the criteria match |

> Evaluation criteria decides *when to check*; criteria decides *whether to act*. Confusing the two is
> why rules email on every save.

### Action types

| Action | What it does |
|---|---|
| **Field Update** | Sets a field, optionally from a formula |
| **Email Alert** | Sends an email to a recipient, via a template |
| **Task** | Creates a task with an owner and due date |
| **Outbound Message** | Sends to an external endpoint |
| **Update Record** | Updates a **related** record's field |
| **Assign Owner** | Changes the owner to a user, role or queue |

On a Field Update, the setting that matters is *re-evaluate after every update*. Turning it off is the
most effective way to stop a workflow rule looping on itself.

## 2. Evaluation order

1. **Validation rules** — reject the save.
2. **Duplicate rules** — reject the save.
3. **Workflow rules and flows** — after save, in **undefined order between themselves**.
4. **Roll-up summaries** recalculate.
5. **Apex, commits, after-trigger automation.**

> Workflow rules run after save, so they **cannot stop a save**. "Prevent this save" = a validation rule.

## 3. Assignment rules

Set the **owner** on a new record. The Lead-routing workhorse.

| Setting | Meaning |
|---|---|
| Rule order | Top to bottom, **first match wins** and stops evaluation |
| Entry criteria | Whether the rule can be evaluated at all |
| Criteria | The matching formula |
| Assign owner | To a user, role or queue |
| Default assignment | Where records go when no rule matches |
| Enable for sandbox / production | Enabled **separately** for each |

Order most specific first: a broad "everything to EMEA" rule above "French Enterprise to Jean" makes the
narrow rule dead code, with no warning.

## 4. Auto-response rules

Automatic email when a record is **created**, or when it is **assigned to a user or queue**, with an
optional **task**. Exists for **Lead** and **Case**.

- Attach an **email template** (classic, with merge fields) or a **Lightning email template**.
- The "assigned" trigger fires on any **owner change**, including one made by an assignment rule.
- Enabling both triggers sends two emails. Pick the one the requirement actually needs.

## 5. Queues

A holding area owned by nobody. Members are users and public groups; any member can **Take Ownership**.

> A **queue is not a security boundary**. Members need record access, normally via a **sharing rule**
> scoped to records owned by the queue.

## 6. How they cooperate

1. New Lead arrives.
2. Assignment rules evaluate; first match assigns the owner.
3. No match → default queue.
4. Auto-response rule on "assigned to a user or queue" emails that owner.
5. Optional task created.
6. Members take ownership from the record or a queue list view.

## 7. What to build today instead

| Requirement | Build this |
|---|---|
| Stop a save because a field is invalid | Validation rule |
| Change a field before save | Before-save flow, or formula field |
| Set a field, email or task after save, one record | Record-triggered flow (preferred) or workflow rule (legacy) |
| Update a related record after save | Record-triggered flow |
| Notify on approval steps | Approval process email alert or task |
| React at a time, or in bulk | Scheduled flow or scheduled path |

### Auditing what you inherited

1. Inventory active rules per object and their criteria.
2. Flag rules using **after-update re-evaluation** — each is a potential loop.
3. Flag rules emailing on **every save** (broad evaluation + broad criteria).
4. Check for rules that set a field another rule reads — an undefined-order dependency.
5. Decide per rule: **leave**, **migrate to flow**, or **replace** with a rule/formula.

> Migration is not like-for-like: a Field Update maps to a flow **Update Records** element, and
> "re-evaluate after update" maps to re-running the entry condition. Test the flow against the rule's
> *behaviour*, not the builder's preview.

## 8. Phase Summary

- Validation rules → duplicate rules → workflow/flows → roll-ups.
- Evaluation criteria = when to check. Criteria = whether to act.
- Assignment rules: first match wins, so order most specific first.
- Queues need a sharing rule to be useful.
- Build new automation in flows; audit and migrate workflow rules.

**Next:** Phase 12 — Lightning App Builder. The logic domain (28%) is complete.