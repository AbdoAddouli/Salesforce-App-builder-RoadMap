# Phase 14: Lightning Console & Experience Sites

Side-by-side working, pinned context, and a brand users recognise.

## Learning Objectives

- Describe what a console app does that a standard app cannot.
- Distinguish primary tabs, secondary tabs, panes and subtabs.
- Build a console tab set with a sensible primary and secondary structure.
- Choose which navigation items belong in the app and which belong in the utility bar.
- Explain what a theme controls and what it does not.
- Explain the difference between a theme, a branding set and My Domain.

## 1. What a console app actually adds

A standard Lightning app shows **one record at a time**. You open an Opportunity, decide you need the
Account, click through, and the Account replaces the Opportunity. Then you click back.

A **console app** shows **several records at once**, in panes, and keeps them all live while the user
moves between them.

| Element | What it is | Behaviour |
|---|---|---|
| **Primary tab bar** | The main navigation row at the top of a console | Clicking one **replaces** the content in the single main pane |
| **Main pane** | The one big area under the primary tabs | Holds exactly one primary tab at a time |
| **Secondary tabs** | A row inside a primary tab | Opens a **split pane** or a **three-pane** layout — parent on the left, child on the right |
| **Subtabs** | Related lists and high-signal sections on a record | Swap content **within** a pane, never across panes |

> **Primary tabs replace; secondary tabs sit beside.** If a design says "keep the Account visible while
> I work the Opportunity", that is a secondary tab. If it says "go to Accounts instead", that is a
> primary tab.

## 2. Why a console changes the work

- **No navigating back.** Nothing is replaced, so nothing needs restoring.
- **Context is visible.** The user can see whether the Account is an Enterprise deal *before* approving
  anything.
- **Fewer records to reopen.** A support rep working a queue of Cases does not lose their place.
- **Cost.** More components, more queries, more data in one page.

> Console apps are a **Lightning Experience** feature. A Lightning console app cannot be rendered in
> Salesforce Classic, and the classic console is a different, older feature. Do not conflate them.

## 3. The console tab set

The structure lives in a **console tab set**:

- Which **primary tabs** exist.
- Which **secondary tabs** each one opens.
- Whether each secondary tab opens in a **split pane** or a **three-pane** layout.
- Which tabs are **pinned by default**.

The tab set is then added to an app as a navigation item, so one structure can be reused across apps.

Users can **pin** console tabs to keep them permanently available. Pinning is a convenience, not a
security control — it changes nothing about who can see a record.

## 4. The navigation item types

| Item type | Hosts | Use when |
|---|---|---|
| **Standard object tab** | The built-in list view and record pages | The object needs its own top-level space |
| **Web tab** | A URL | An external system genuinely belongs in the nav |
| **App page** | App Builder content with no record behind it | Dashboards, trackers, a pipeline overview |
| **Lightning page tab** | A Lightning page from App Builder | A custom tab built from components |
| **Console tab** | A console tab set of primary and secondary tabs | Work needs records side by side |
| **Report tab** | A folder of reports and dashboards | Users need the reports as a destination |
| **Utility bar items** | Actions and tools available everywhere | Always-available actions, not navigation |

> Avoid **duplicating** the same destination in two places. A Lightning page tab *and* a standard tab for
> Opportunities gives two places to look and two sets of confusion. Pick one.

## 5. App navigation versus the utility bar

| Belongs in the app | Belongs in the utility bar |
|---|---|
| A **destination** the user visits | An **action** the user performs |
| Pipeline, Quotes, My Day, Reports | Log a Call, New Task, Notes and Files |
| Something with a record or list behind it | Something that works on whatever record is open |
| Changes as the user moves between jobs of work | Stays put while the record underneath changes |

A utility bar item is available **across the app** and appears in the same position wherever the user
is. That makes it right for a recurring action and wrong for a place to navigate to.

Other navigation worth naming:

- The **app launcher** (the nine-dot grid) switches between apps, and its contents are
  **profile-filtered**.
- **App navigation** is the left rail of items, with **workspace folders** beneath it.
- **Lightning pages** can be added as tabs to a console app as well as a standard app.
- The **utility bar** can hold items, and its own settings control what appears on mobile versus desktop.

**Workspace folders** group navigation items under a collapsible label, so a rep sees "Sell", "Quote",
"Deliver" instead of fourteen undifferentiated tabs. This is presentation, not permission — grouping does
not restrict who sees what.

## 6. What a theme controls

| Theme setting | What it affects |
|---|---|
| **Logo and name** | The logo in the header and on the login page |
| **Color palette** | Header background, link and accent colors, highlight colors |
| **Font** | The typeface used across the app |
| **Text treatments** | Field-type colors — how a lookup, a URL or an encrypted field renders |
| **Lookup field color** | Distinguishes a lookup from ordinary text at a glance |

> **Text treatments** are the quiet feature. A theme can make every encrypted custom field render in a
> distinct color, so a rep spots a stored card number without reading it.

### Two ways a theme can be applied

- **Theme by record type** — one theme per record type. Useful when Enterprise records should look
  visibly different from SMB records.
- **Theme by app, tab and app page** — the default pattern.

## 7. Branding sets and My Domain

A **branding set** is broader than a theme. It carries the logo, images and colors used by the **app
frame, the login experience and the mobile app**, and it can be set as the org-wide default or assigned
to a specific app.

| Layer | Question it answers |
|---|---|
| **Theme** | What do the pages *inside* this app look like? |
| **Branding set** | What does this app look like *from the outside*? |
| **My Domain** | What is the org called in a URL and an email signature? |

> Plan the palette before activating. A theme that is active is not freely editable afterwards, and
> switching it changes colors on every page at once.

**My Domain** is the single custom address for the org — for example `brightline.my.salesforce.com`. It
appears in the URL, in email templates, and in links users share. There is **one My Domain per org**.
Additional **domains** can be registered for specific purposes such as a branded site or a custom login
address, and those are separate from My Domain.

## 8. Experience Sites, in awareness terms

An **Experience Site** (formerly Community or Partner Central) is an externally facing, branded site
with its own URL, its own navigation, a **guest user** running the site, and its own sharing.

Brightline's partner portal is the example: partners log in without being Salesforce users and see only
their own deals. The overlap with console and themes is the branding; the difference is that the site
runs as a guest and needs **sharing** to decide what the guest can reach.

## 9. Phase Summary

- **Primary tabs replace; secondary tabs sit beside.** That is the whole console idea.
- **Navigation item = destination. Utility bar item = action.** Duplicating a destination is a mistake.
- A **theme** styles pages inside an app; a **branding set** styles the app frame, login and mobile app.
- **My Domain** is the URL and org name — it restyles nothing.
- Workspace folders solve *too many tabs* without changing access.

**Next:** Phase 15 — Packaging & Metadata Deployment. First phase in the deploy domain (10%).