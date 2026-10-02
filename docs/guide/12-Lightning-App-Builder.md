# Phase 12: Lightning App Builder

Pages, apps and navigation without a single line of code. First topic of the **UI** domain (17%).

## Learning Objectives

- Build a Lightning page using App Builder components and configure properties.
- Activate and deactivate pages, and understand activation per record type.
- Build an app and its navigation, including lightning page tabs and app pages.
- Use utility bars, record pages and App Builder record actions.
- Configure a Lightning app for mobile, and explain what differs on mobile.
- Secure and troubleshoot a Lightning page you have built.

## 1. The three page types

| Page type | Used for | Key property |
|---|---|---|
| **Record page** | The page shown when you open one record | Which record types it applies to |
| **App page** | A tab of content with no record behind it | Which app it appears in |
| **Lightning page** | A custom tab hosting components built-in tabs cannot | What content it hosts |

> App Builder is the only way to customise a Lightning **record page**. The Page Layout Editor still
> governs the older Classic record detail page, and the two coexist — App Builder wins where activated.

## 2. Components to recognise

| Component | Renders |
|---|---|
| **Record Highlights Panel** | Key fields pinned at the top |
| **Record Details** | Main field groups, per section |
| **Related Lists** | Related records with filterable columns |
| **Related List — Single** | One related list with a filter bar |
| **Accordion / Tab / Carousel** | Layout containers |
| **Rich Text** | Instructions and links |
| **Chart** / **Report** / **Dashboard** | Reports inline |
| **Lightning Component** | A custom or packaged component |
| **Flow** | Runs a flow inline — replaced Visualforce pages |
| **Record Action** | Adds a Quick Action or custom action |
| **Utility Bar item** | Adds an item to the utility bar |

## 3. Activation

Building a page does not publish it. Activation is the most examined concept in this phase.

| Question | Answer |
|---|---|
| Activated for one record type | Applies to **that type only**; others keep the previous page |
| No page for a record type | The **default page** applies |
| Lightning **tab** page | Activated automatically on creation |
| **App page** | Activated automatically, appears in the nav immediately |
| Across orgs | App Builder is metadata, so it deploys like any other |

> A page that does not appear is usually (1) not activated, or (2) activated for a different record type.
> Both are correct behaviour, not bugs.

## 4. Navigation item types

| Item | Hosts |
|---|---|
| **Standard tab** | A standard object list |
| **Web tab** | A URL |
| **App page** | App Builder content |
| **Lightning page tab** | A Lightning Page |
| **Reports tab** | Reports and dashboards |
| **Utility bar items** | Actions on records and the app (not in console) |

## 5. Building an app

1. Create the app: name, developer name, description, image.
2. Set the **app profile**: internal, external, or custom.
3. Choose **navigation style**: standard tabs, or **console** (Phase 14).
4. Add utility bar items.
5. Add navigation items.
6. **Activate** the app.
7. **Assign** it to users via a **permission set**.

> Building is not assigning. Until assignment, nobody sees the app — the most common "it vanished"
> ticket.

## 6. When a Lightning page tab is justified

An **app page** covers most needs. A Lightning page tab earns its place when you need:

- A custom object as a navigation destination.
- **Flow components with parameters** no standard tab can host.
- Separate activation and its own record actions.
- A dedicated page for one audience.

## 7. Mobile

| Desktop | Mobile |
|---|---|
| Multi-column | One column, components stack |
| Utility bar docked bottom | Same, fewer items fit |
| Full side panel | Overlay panel |
| Popups and modals | Native equivalents |

Design mobile-first for field reps: a compact Highlights Panel and one primary action beat forty
fields. Test in the mobile app, not a narrow browser window.

## 8. Record actions

| Action | Launches |
|---|---|
| **Quick Action** | A pre-filled record create or update, no screen |
| **Custom Lightning action** | A screen flow, modal, or Apex action |
| **Update record action** | Pre-populated edit of the current record |
| **Global action** | Available anywhere, not tied to one record type |

A **Quick Action** beats a screen flow when the user changes one or two fields. Reach for a flow only
when there is real logic.

## 9. Troubleshooting

1. **Page not showing** — not activated, or activated for another record type.
2. **Component blank** — no records, or the user cannot see the underlying records (sharing).
3. **Component error** — a permission set or object permission gap.
4. **Flow component silent** — flow inactive, entry condition did not match, or no record access.
5. **Tab missing** — the app is not assigned, or the item was never added.
6. **Stale after deploy** — App Builder metadata deployed but not activated in the target org.

> Every component that queries records respects the user's sharing. A page full of blank components is
> a permissions problem, not a page design problem.

## 10. Phase Summary

- Build → activate → assign, in that order.
- Activation is per record type.
- App page for dashboards; Lightning page tab when components must be custom.
- Quick Action for simple one-field actions; flows for logic.
- Permissions and sharing explain most "broken" pages.

**Next:** Phase 13 — Dynamic Forms & Lightning Pages.