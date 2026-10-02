# Phase 2: Security & Sharing Fundamentals

Who can see which record, and who can change which field. This phase is tagged
**Salesforce Fundamentals**, which is where the official exam guide places sharing
solutions.

Every security question in the exam reduces to a two-layer model. Layer one is **can this user
do anything with records of this object at all?** Layer two is **can they reach this specific
record, and see this specific field?**

## Learning Objectives

By the end of this phase, you will be able to:

- Read an org's access model as two layers: object-level access plus field-level access.
- Explain what org-wide defaults, roles and role hierarchies do to record visibility.
- Choose the correct sharing solution for a requirement: OWD, sharing rule, manual share,
  flow sharing or Apex.
- Describe how profiles, permission sets and roles differ, and why permission sets are
  preferred for new access.
- Diagnose "user cannot see / cannot edit this record" using a repeatable method.

---

## 1. Two Layers: Object Access and Field Access

### Layer 1 — object permissions (CRUD)

Every permission set and profile grants four object-level rights, often written as **CRUD**:

| Right | Means | Missing it looks like |
|-------|-------|----------------------|
| Create | May make new records | "Save" button missing or greyed |
| Read | May view records and fields | Tab hidden, or "insufficient access" |
| Update | May edit existing records | Fields render read-only |
| Delete | May delete records | No Delete action available |

**FLS** (Field-Level Security) is applied separately. A user can have Read on Account but no
Read on `Revenue__c`, in which case the object appears and that one field is simply absent.

> FLS and CRUD are independent. Turning off object Read hides the whole record; turning off
> field Read hides only that column. **The symptom tells you which layer to look at.**

### Layer 2 — record-level access (sharing)

Even with full CRUD, a user still needs access to each **individual record**.

| Sharing option | Scope | Declarative? |
|----------------|-------|--------------|
| Org-wide defaults | Baseline for the whole object | Yes |
| Role hierarchy | Above/below the user in the role tree | Yes |
| Sharing rules | Criteria-based, re-evaluated | Yes |
| Manual share | One record, one user, until revoked | Yes |
| Apex sharing | Code-defined, imperative | No |
| Lightning flow sharing | Criteria-based inside a flow | Yes |

### Checkpoint

> **A sales manager can open Account records, but "Annual Revenue" is blank and greyed out.
> Which layer is broken?**

Field-Level Security. Object-level Read is fine, because she can open the record — only that
field's Read is missing. Check the field's FLS in the permission set, not the object's sharing.

---

## 2. Org-Wide Defaults and the Role Hierarchy

**Org-wide defaults (OWD)** set the *floor* of visibility for every record of an object. Every
sharing tool can only ever **widen** access from that baseline.

| OWD setting | Who can see records | Who can edit |
|-------------|--------------------|--------------|
| **Private** | Only the record owner | Only the owner |
| **Controlled by Parent** | Records whose parent the user can see | Depends on the object |
| **Public Read Only** | Everyone | Only the owner |
| **Public Read/Write** | Everyone | Everyone |

> OWD cannot be made *more* restrictive by sharing settings — only less. Setting OWD to
> Public Read/Write and then trying to hide sensitive records with sharing rules means you are
> fighting your own baseline. **Decide OWD first, widen second.**

### Controlled by Parent, carefully

It inherits from the parent record, so on Opportunity (child of Account) a user who cannot see
the Account also cannot see its Opportunities. Convenient for hierarchy, dangerous when a child
carries data someone should see independently — and it is the most commonly mis-set OWD on the
exam.

### The role hierarchy

Roles form a **tree**. Users higher up automatically see records owned by users below them. The
hierarchy flows **upward only** — a junior user never sees their manager's records because of
the hierarchy. That is the opposite of the reporting line, so read role trees carefully.

> Internal users normally do **not** need Manual/External sharing when OWD is Private, because
> the role hierarchy already grants them their subordinates' data. Enabling it for internal
> users is a common workaround that quietly grants far more than intended.

### Profiles and permission sets

|  | Profile | Permission set |
|---|---------|----------------|
| Contains | Everything: object + field + tab + app + record type access | A subset, granted on top of a profile |
| How many | One per user | As many as needed |
| Users per profile | Exactly one | Any combination |
| Use for | The base job function | Extra access for a specific job |
| Best practice now | Kept minimal | Where all new access should go |

A profile is a fixed label the user wears. A permission set is a badge they wear *alongside*
their profile. Because every user has exactly one profile but can hold many permission sets,
permission sets grant access without duplicating whole configurations.

### Checkpoint

> **Why is OWD normally Private on Opportunity rather than Controlled by Parent?**

Because an Opportunity can contain commercially sensitive detail (amount, discount, competitor)
that the Account owner may legitimately see even when they cannot see the Account itself.
Controlled by Parent would hide that deal from the Account owner. Private is the safest
baseline; access is then widened deliberately.

---

## 3. Choosing the Right Sharing Solution

"Give this user access to that record" has several valid solutions. The exam wants the one
matching the **nature** of the requirement.

| Requirement shape | Correct tool | Why |
|-------------------|--------------|-----|
| These 3 records, just for now | Manual share | Ad hoc, per record, revocable |
| Everyone in role X sees their region's records | Sharing rule on role/territory field | Criteria-based, re-evaluates as data changes |
| Managers see all subordinates' records | Role hierarchy | Already implied by the role tree |
| Temporary exception during leave | Manual share | Time-boxed, auditable |
| Access granted by a business process at runtime | Lightning flow sharing | Declarative, inside an automation |
| Too complex for any of the above | Apex sharing | Last resort; adds a code dependency |

> **Sharing rules are the declarative workhorse.** If a requirement says "users should
> automatically see records that meet condition X", a sharing rule keyed on X is the intended
> answer. Apex sharing appears only when the logic genuinely cannot be expressed declaratively.

### The troubleshooting order

1. Can the user open the app and find the tab at all? → profile / app access.
2. Can they see the object but not its records? → object CRUD.
3. Can they open *some* records but not others? → record-level sharing. This is the big one.
4. Record opens but a field is missing or read-only? → field FLS, and Update if editing fails.
5. Record opens and fields look right, but a related list is empty? → related record access
   differs from parent access.

Follow it in order and you will never chase the wrong layer.

---

## 4. Exercises

### Exercise 2.1 — Diagnose four access reports

Map each vague symptom to the correct layer before touching any settings.

| Report | Layer at fault | Check first |
|--------|----------------|-------------|
| "The Opportunities tab is not visible in my app launcher" | Object/profile access | Object Read on Opportunity, and whether the tab is exposed |
| "I can open Opportunities, but Amount is empty and read-only" | Field FLS | FLS + Update on the Amount field |
| "My own Opportunity is there, but a colleague's in my region says insufficient access" | Record sharing | Sharing rules / role hierarchy for that record |
| "I can see Accounts, but not accounts assigned to the other region" | Record sharing at scale | OWD and sharing rules, not per-record |

### Exercise 2.2 — Set OWD and design the widening strategy

1. Note the current OWD for Opportunity, Account and Contact in Setup → Org-Wide Defaults.
2. Decide the correct OWD for each, with one sentence of justification per object.
3. Describe how a Regional Manager gains visibility of their region's reps' opportunities.
   Name the tool and the criteria field.
4. Decide whether Manual/External sharing should be enabled, and what that implies.
5. Note which setting to check if a user can see an Account but not its Opportunities.

**Expected:** Opportunity = Private (sensitive deal data, widened by a sharing rule on
Territory); Contact = Controlled by Parent is typical. The manager gets access via a sharing
rule keyed on `Territory__c`. Manual/External sharing is only for users *outside* the org. The
Account-but-not-Opportunity symptom points at Controlled by Parent on Opportunity.

### Project 2.3 — Design Brightline's security model

The access design that phases 12-16 will turn into actual permission set metadata.

1. **Role hierarchy:** name the roles and show the tree across East, Central and West. State who
   sees whom, and confirm visibility flows upward only.
2. **OWD** for Opportunity, `Quote_Request__c` and Contract, each justified.
3. **Sharing rules:** for each — object, target users, criteria fields, read or edit.
4. **Regional Manager access:** role hierarchy, sharing rule, or both? Explain.
5. **Permission sets** you will create (names and purpose), and what stays in the profile.
6. **Troubleshooting** for a rep who cannot see an Opportunity in their own territory that they
   do not own.

**Success criterion:** a one-page design — role tree, OWD choices with justification, named
sharing rules with criteria, permission set list, ordered troubleshooting path.

---

## 5. Phase Summary

- Security is two layers: object CRUD + field FLS, then record-level sharing on top.
- OWD is the *floor*; sharing only widens. Decide OWD first, Private is the safe default.
- Role hierarchy flows **upward only** — managers see subordinates, never the reverse.
- Sharing rules are the declarative workhorse for "automatically see records matching X".
- Profiles are the fixed base; permission sets layer extra access and are where new access
  belongs.

Next: **Phase 3 — Reports, Dashboards & Mobile UX**, the other two Salesforce Fundamentals
topics that also sit in this domain.