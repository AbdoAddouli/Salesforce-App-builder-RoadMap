# Phase 6: Formula Fields

The most heavily tested declarative skill on the exam. Still **data** (22%).

## Learning Objectives

By the end of this phase, you will be able to:

- Write a formula using the three-function structure: left operand, operator, function.
- Use text, date, math and conditional functions correctly — including knowing which ones are *not*
  available.
- Handle blanks and nulls deliberately rather than getting an error or a misleading zero.
- Work around the types that cannot appear in a formula, using helper fields.
- Know what a formula cannot do, and pick the right tool when it cannot.

---

## 1. The Three-Function Structure

Every formula follows one shape: **a left operand, an operator, and a function**.

| Part | What it is | Example |
|------|-----------|---------|
| **Left operand** | A field reference, using the API name as in the field picker | `Quantity__c` |
| **Operator** | Arithmetic or concatenation | `+ - * / &` |
| **Function** | The operation, wrapping arguments | `IF()`, `TEXT()` |

```
Unit_Price__c * Quantity__c          // not valid on its own

IF(Quantity__c > 0, Unit_Price__c * Quantity__c, 0)
// ^function  ^arguments                        ^default
```

A formula with **no function is invalid**, even for simple arithmetic. `Unit_Price__c *
Quantity__c` will not save; wrapping it in `IF()` makes it work.

Field references use the **API name**. A formula is **read-only** — users cannot type into it, so a
requirement to "let users edit this" can never be met by a formula.

> **The ordering trap:** a formula can reference a formula defined **before** it, not one defined
> after. If a formula errors on save, check creation order — Salesforce processes formula fields in
> the order they were created.

### The functions that matter most

| Function | Returns | Typical use |
|----------|---------|-------------|
| `IF(cond, then, else)` | one of two values | the workhorse — **three** arguments |
| `AND(...)`, `OR(...)` | true/false | combine conditions |
| `TEXT(value, format)` | Text | convert number/date to text |
| `VALUE(text)` | Number | the inverse of TEXT |
| `CONCAT(a, b, ...)` | Text | join many values, unlike `&` which joins two |
| `LEFT/TEXT/MID` | Text pieces | extract part of a text field |
| `TODAY()`, `NOW()` | Date / DateTime | today, with and without time |
| `DATEVALUE(text)` | Date | text → date |
| `DATE(y, m, d)` | Date | build a date from three numbers |
| `YEAR/MONTH/DAY(d)` | Number | pull a component out of a date |
| `ADDMONTHS(d, n)` | Date | date arithmetic by months, handles month lengths |
| `ISBLANK(field)` | true/false | correct test for text and number empties |
| `ISPICKVAL(field)` | true/false | safe test for picklists, checkboxes, dates |
| `BLANKVALUE(a, b)` | Value | return a default when the first is empty |

Note `&` joins exactly **two** operands. Three or more needs `CONCAT`.

### Checkpoint

> **A formula `Unit_Price__c * Quantity__c` refuses to save. Why?**

A formula requires at least one function — bare arithmetic is invalid. Wrap it:
`IF(Quantity__c > 0, Unit_Price__c * Quantity__c, 0)`. The second benefit is blank-handling.

---

## 2. Blanks, Nulls, and the Types You Cannot Use

More marks are lost to blank-handling than to syntax. A blank is **not zero** and **not an empty
string** — it is a **null**, and arithmetic on null produces an *error*.

`Unit_Price__c * Quantity__c` with a blank Quantity does not return 0. It returns a **null error**,
which poisons every report column built on it.

| Instead of | Use | Because |
|------------|-----|---------|
| Arithmetic on a possibly-blank field | `IF(ISPICKVAL(field), ...)` | guards the arithmetic |
| `Quantity__c = 0` to test for empty | `ISBLANK(Quantity__c)` | a blank is not zero; the comparison silently fails |
| `Text__c != ""` | `ISBLANK()` or `ISPICKVAL()` | empty text and null are different |
| `StageName = null` | `ISPICKVAL(StageName)` | picklists need `ISPICKVAL` |
| `Checkbox__c = false` | `NOT(ISPICKVAL(Checkbox__c))` | an unchecked checkbox is blank, not false |

> `ISBLANK` is correct for text and numbers; `ISPICKVAL` is the safe choice for picklists, checkboxes
> and dates. Using `ISPICKVAL` throughout is a pragmatic, accepted style.

### The types that cannot appear in a formula

**Currency, Text Area and Rich Text cannot be referenced directly inside a formula.** You cannot
`SUM(Unit_Price__c)` when it is Currency, nor concatenate a Rich Text field.

The fix is a **helper field** — a second formula of type Number that converts the currency:

```
// Unit_Price__c is CURRENCY and cannot be read directly.

// Step 1 - helper formula, return type NUMBER:
IF(ISPICKVAL(Unit_Price__c), Unit_Price__c, 0)

// Step 2 - the real formula can now use the helper:
Price_As_Number__c * Quantity__c
```

The other escape routes are a **roll-up summary** (aggregates Currency children and returns a
usable value) and a **flow** (Phase 9, no type restrictions at all).

### What formulas cannot do

| Need | Formula? | Use instead |
|------|----------|-------------|
| Sum an unknown number of child records | No | Roll-up summary (Phase 7) |
| Let a user type a value | No — read-only | A plain field |
| Update a record, send email, create a task | No | Flow or workflow (Phase 9/11) |
| React to a change on another record | No | Record-triggered flow (Phase 9) |
| Display a value conditionally | **Yes** | — and this is a classic exam answer |

### Checkpoint

> **Why does `Amount - Amount * Discount_Percent__c / 100` fail?**

Because a formula cannot reference a **Currency** field directly. This is exactly why Phase 4 chose
**Percent** for the discount — a formula *can* read Percent, so only the currency side needs a
helper.

---

## 3. Formulas in the Exam and in the Roadmap

Question shapes cluster, and recognising the shape tells you what is being asked.

| Question shape | What it tests | Reach for |
|----------------|---------------|-----------|
| "What is wrong with this formula?" | Blank handling, null comparison, type, ordering | `ISBLANK` / `ISPICKVAL` / helper field |
| "Which function does X?" | Function vocabulary | The functions table above |
| "How do I display A conditionally?" | Nested IF | `IF()` with three arguments |
| "Which field cannot be used?" | Type restrictions | Currency / Text Area / Rich Text |
| "How do I total child records?" | Knowing the limit | "A roll-up summary" |
| "A formula errors, why?" | Reference order | Reorder the fields |
| "Which TWO are true?" | Shape + behaviour | Read distractors for the false claim |

> In "which function" questions the distractors are usually **real functions in the wrong place** —
> `CONCAT` when `&` suffices, `TEXT` when the value is already text, `DATEVALUE` on something that
> is already a date. Check the *type* of what you have before choosing the function.

### The formulas Brightline actually uses

| Object | Formula field | Purpose |
|--------|---------------|---------|
| Quote_Line__c | `Line_Total__c` (Number) | Unit Price × Quantity, blank-safe |
| Quote_Line__c | `Price_As_Number__c` (Number) | Helper for the Currency Unit Price |
| Quote_Request__c | `Days_Open__c` (Number) | Today minus Requested Date |
| Quote_Request__c | `Expiry_Status__c` (Text) | Expired / Expiring soon / Active |
| Quote_Request__c | `Is_Overdue__c` (Checkbox) | TRUE when Expiry Date has passed |
| Opportunity | `Discounted_Amount__c` (Currency) | Amount after Discount % |
| Opportunity | `Priority__c` (Text) | HIGH / MEDIUM / LOW by amount |
| Opportunity | `Is_Stale__c` (Checkbox) | TRUE when no activity for 30 days |

> Note which are formulas and which are roll-ups. `Days_Open__c` is a formula — same record. A
> "Total Quoted Value" on a quote request is a **roll-up** — children. Confusing those two is
> expensive.

### Checkpoint

> **Why is "Is Overdue" a formula rather than a flow?**

Because it is a pure derivation from fields on the same record, always true at all times. A formula
recalculates on save and is automatically filterable and reportable. A flow would only update on a
trigger, so it would go stale when someone edits the Expiry Date, and it would not be filterable in
reports.

---

## 4. Exercises

### Exercise 6.1 — Write and deconstruct formulas

| Requirement | Formula |
|-------------|---------|
| **F1** Line total, showing 0 when Quantity is blank | `IF(ISPICKVAL(Quantity__c), Unit_Price__c * Quantity__c, 0)` |
| **F2** Label: Account name + hyphen + Quote Number | `Account__c.Name & " - " & Quote_Request__c.Name` |
| **F3** Days open, or "Not started" | `IF(ISPICKVAL(Requested_Date__c), TODAY() - Requested_Date__c, "Not started")` |
| **F4** Priority by amount, three outcomes | `IF(Amount__c > 100000, "HIGH", IF(Amount__c > 25000, "MEDIUM", "LOW"))` |
| **F5** Expiry status, three outcomes | `IF(NOT(ISPICKVAL(Expiry_Date__c)), "No date", IF(Expiry_Date__c < TODAY(), "Expired", IF(Expiry_Date__c - TODAY() <= 30, "Expiring soon", "Active")))` |

For each, name the blank risk and how the formula avoids it. Note that F3's `IF` returns **two
different types** — a number and a string — which is allowed for a Text-returning formula.

### Exercise 6.2 — Fix the broken formulas

| Broken | Defect | Fix |
|--------|--------|-----|
| **B1** `Unit_Price__c * Quantity__c` | Bare arithmetic; null error when Quantity blank | wrap in `IF(ISPICKVAL(...), ...)` |
| **B2** `IF(Quantity__c = 0, 0, ...)` | A blank is null, **not** zero — the guard never fires | `IF(ISPICKVAL(Quantity__c), ...)` |
| **B3** `IF(StageName = "Closed Won", ...)` | Unreliable picklist comparison | `ISPICKVAL(StageName)` or `ISBLANK` |
| **B4** `StageName & " - " & Amount` | Two problems: Amount is Currency, and `&` handles only two operands | helper field + `CONCAT` |
| **B5** `IF(TODAY() > Expiry_Date__c, ...)` | Blank expiry makes the comparison behave unexpectedly | `NOT(ISPICKVAL(...))` guard first |
| **B6** `TEXT(Today() - Requested_Date__c) + " days"` | Subtract already yields a number, and `+` does not concatenate text | drop `TEXT`, use `&` or `CONCAT` |

For each rewrite, name the function used and why that one.

### Project 6.3 — Build Brightline's formula layer

1. **Nine formula fields** across `Quote_Request__c`, `Quote_Line__c` and Opportunity. For each:
   label, API name, return type, full formula, purpose.
2. **At least three blank-safe** using `ISBLANK`/`ISPICKVAL` — name the guard and why that one.
3. **At least one helper-field workaround** for the Currency limitation. Explain the two-step pattern.
4. **At least one nested IF** with three or more outcomes.
5. **One requirement deliberately NOT built as a formula** — name the tool you used instead and why.
6. For each formula, state where a blank could break it and confirm your version is safe.
7. **Three formulas that would break if their referenced field were renamed**, and why.

**Success criterion:** all declarative, all blank-safe, with the helper pattern and one nested IF
present.

---

## 5. Phase Summary

- Three parts: **left operand, operator, function**. At least one function is mandatory.
- A blank is a **null**, not a zero — arithmetic on null errors. Guard with `IF(ISPICKVAL(...))`.
- **Currency, Text Area and Rich Text** cannot be read in a formula; use a helper Number field.
- `&` joins two operands; `CONCAT` joins many.
- Formulas evaluate in **creation order** and cannot reference a later field.
- Formulas are **read-only** and cannot aggregate children — that is a roll-up.

Next: **Phase 7 — Roll-Up Summaries & Validation**, completing the data domain.