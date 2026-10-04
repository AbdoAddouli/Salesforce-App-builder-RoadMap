/* ============================================================================
 * curriculum.js — Salesforce Certified Platform App Builder academy
 * ----------------------------------------------------------------------------
 * THE DATA CONTRACT (enforced offline by scripts/check-site-data.js, so run
 * `npm run check:site` after editing this file):
 *
 *   ACADEMY: array of module objects, in order. `n` MUST equal the 1-based
 *   position. Required on every module: id, n, title, icon, color (6-digit hex),
 *   tagline, guide, exam, objectives, lessons, quiz.
 *
 *   lessons[]: { title, mins, blocks[] }.
 *
 *   blocks[] — ONLY these types (this is renderBlock() in docs/assets/app.js;
 *   anything else renders as nothing at all):
 *     p         { x }                     paragraph
 *     h         { x }                     section heading
 *     list      { items[] }               bullet list
 *     num       { items[] }               numbered list
 *     table     { head[], rows[][] }      table; every row must have head.length cells
 *     code      { lang, x }               code block; `lang` picks the highlighter
 *     callout   { kind: 'tip'|'warn', x } highlighted note
 *     selfcheck { q, a }                  "check yourself" reveal
 *     ex        { id, title, obj, stars, steps[], verify }
 *     proj      { id, title, obj, stars, reqs[],  success }
 *     case      { title, problem, solution, steps[], gotcha, org?, exam? }
 *                real-world use case. Reference material, NOT a graded activity,
 *                so it carries no id, no stars and no self-rating.
 *
 *   `ex.id` / `proj.id` is the primary key: EXERCISE_ANSWERS is keyed by it and
 *   the self-rating stars are stored under it. Must be unique across the WHOLE
* academy. Convention: "1.3" = Phase 01 exercise 3, "17.2" = Phase 17 project 2.
 *
 *   GUIDE: base URL the phase guides are served from. Consumed by the Abdo's
 *   Salesforce Academy hub (build/build-guides.mjs) to build "view source" links,
 *   so it must be declared - every other academy declares one too.
 *
 *   quiz.questions[]: { q, opts[2+], a, why }.
 *     `a` is an option INDEX; use an ARRAY of 2+ indices for multi-select, which
 *     is graded on the exact set. `why` is mandatory — instant feedback is the
 *     entire point of the quiz.
 *
 * Exercise ids are NOT listed anywhere: docs/assets/app.js derives them by
 * walking the lesson block tree, so an exercise cannot exist in a module array
 * that the page never renders.
 *
 * ----------------------------------------------------------------------------
 * THE SCENARIO. Every phase builds into ONE org: Brightline Equipment, a B2B
 * industrial-equipment reseller. It sources leads, converts them to Accounts and
 * Opportunities, and closes the loop with quotes, orders and contracts. Phases
 * deliberately reuse the same objects and fields, so later phases extend earlier
 * work instead of restarting. Naming follows Salesforce conventions.
 * ========================================================================== */

const GUIDE = 'https://github.com/AbdoAddouli/Salesforce-App-builder-RoadMap/blob/main/developer%20Platform%20App%20Builder%20Roadmap/';

const ACADEMY = [
  {
    id: 'fundamentals',
    n: 1,
    title: 'Salesforce Fundamentals',
    icon: '🏗️',
    color: '#0EA5E9',
    tagline: 'Objects, records, tabs and the UI you will spend the rest of the exam inside',
    exam: 'fund',
    guide: '01-Salesforce-Fundamentals.md',
    objectives: [
      'Distinguish objects, records and fields, and name the standard objects a Lead-to-Cash org depends on',
      'Navigate the Lightning interface: app launcher, tabs, list views, record pages and global search',
      'Decide where a new piece of functionality belongs before you build anything',
      'Recognise the five exam domains and what each one is actually asking you to do'
    ],
    /* The "real artifacts in this repo" grid on the phase page, linking to the
     * metadata this phase adds. Rendered from `art`, so it is required (enforced
     * by scripts/check-site-data.js). Phase 1 is design + inspection, so it adds
     * no org metadata yet - the grid says so rather than being omitted. */
    art: [],
    lessons: [
      {
        title: 'The Salesforce data model in one page',
        mins: 6,
        blocks: [
          { t: 'p', x: 'Almost every Platform App Builder question is a variation on one idea: Salesforce stores data in a small number of standard objects, each holding rows of data (records), each row made of columns (fields). Learn those three nouns and most of the exam becomes bookkeeping about who can see which row.' },
          { t: 'h', x: 'Object, record, field' },
          {
            t: 'table',
            head: ['Term', 'What it actually is', 'Example'],
            rows: [
              ['Object', 'A container for one kind of business thing. Built in or custom.', 'Account, Opportunity, or a custom Quote_Request__c'],
              ['Record', 'A single row inside an object — one real-world instance.', 'The account for "Northwind Traders"'],
              ['Field', 'One column on an object, holding one kind of value per record.', 'Account → AnnualRevenue (Currency)'],
              ['Tab', 'The UI doorway to an object. A tab is NOT a data container.', 'the Accounts tab'],
              ['Page layout', 'Which fields appear where on a record page. Holds no data.', 'Stage + Amount on the left of an Opportunity']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'A record is sometimes called a row; a field is sometimes called a column. The exam uses both vocabularies. A page layout and a record type change HOW a record is displayed — neither adds fields or records.' },
          { t: 'h', x: 'The objects in a Lead-to-Cash org' },
          { t: 'p', x: 'This academy builds one continuous scenario. These five standard objects carry most of it, and you will be adding custom objects alongside them in later phases.' },
          {
            t: 'table',
            head: ['Object', 'Role in Lead-to-Cash', 'Phase that extends it'],
            rows: [
              ['Lead', 'An unqualified enquiry. Converted into Account + Contact.', 'Custom fields, validation, assignment'],
              ['Account', 'The customer company. The parent of the deal.', 'Custom fields, restricted/lookup filtering'],
              ['Contact', 'The person at the customer company.', 'Lookup filtering, page layouts'],
              ['Opportunity', 'A specific potential sale with an amount and stage.', 'Validation, flows, roll-ups'],
              ['Contract', 'The signed agreement. Generated from a won Opportunity.', 'Approval process, validation']
            ]
          },
          { t: 'h', x: 'Standard versus custom' },
          { t: 'p', x: 'Standard objects ship with Salesforce and cannot be deleted. Custom objects are ones you create, named with a "__c" suffix, and they can be deleted (along with all their data). The exam cares about this distinction: deleting a custom object is a reversible mistake, deleting a standard one is not even possible.' },
          { t: 'list', items: [
            'Standard object — built in, "__" suffix absent, not deletable. Example: Opportunity.',
            'Custom object — created by you, "__c" suffix required, deletable. Example: Discount_Request__c.',
            'Custom field on a standard object — no new tab; the field just appears in layouts and reports. Example: Lead → Lead_Source_Detail__c.'
          ] },
          { t: 'callout', kind: 'warn', x: 'The "__c" suffix is not cosmetic. It is how you recognise a custom object or field in the Setup UI, in the API, and in exam questions.' },
          { t: 'selfcheck', q: 'Brightline wants to track "Warranty Expiry Date" on every Contract. Does that need a new object, and will it need a new tab?', a: 'Neither. It is a custom FIELD on the standard Contract object. Custom fields never create a tab — a tab only exists per object, and Contract already has one. This distinction (custom field vs custom object) is a common exam trap.' },
          {
            t: 'case',
            title: 'The single-object mistake',
            org: 'Kettle & Sons Fabrication (UK manufacturing, 40 staff)',
            problem: 'A consultant sold them one big custom object, Business_Event__c, holding every enquiry, order, invoice and service visit as a row. It felt tidy: one tab, one object, one report. Six months in nobody could report on anything. You cannot ask "revenue this quarter" when invoices and service visits are rows of the same object — the filter has no way to tell the rows apart, and the object had already passed 60 fields.',
            solution: 'Split by lifecycle, not by department. Three objects, each with its own lifecycle and its own thin field set: Enquiry__c (14 fields), Order__c (16), Service_Visit__c (9). All three hold a lookup to Account, and Order__c holds a lookup to Product. Reporting became trivial because each object now means exactly one thing.',
            steps: [
              'List the distinct THINGS the business acts on, not the departments that touch them. Kettle & Sons had four: enquiries, orders, invoices, service visits.',
              'Give each one its own object. The test: does it need its own records, its own status, or its own reporting? If yes, it deserves an object.',
              'Keep only the fields that describe that one thing. Order__c carries PO_Number__c and Total_Value__c; it does not carry a "last service date" — that belongs on the service visit.',
              'Relate them to Account with lookups rather than one giant object with no relationships at all.',
              'Delete the old object once the new ones are populated, in that order, and validate in sandbox first.'
            ],
            gotcha: 'They had used a master-detail from Order__c to Account, which made sense until they wanted to delete a single cancelled order and found they had to delete the whole account with it. Master-detail means the child cannot exist alone and its roll-ups are guaranteed accurate — a bargain you should only take when it is genuinely true. Where it is not, use a lookup and a roll-up summary.',
            exam: 'Data modeling questions are mostly testing whether you can tell a custom OBJECT from a custom FIELD, and whether you can justify a split. The Kettle & Sons story is the argument for one-thing-per-object: it is the same reason Phase 4 makes you create objects before adding fields.'
          }
        ]
      },
      {
        title: 'Lightning navigation you must be fluent in',
        mins: 7,
        blocks: [
          { t: 'p', x: 'The Platform App Builder exam is delivered in the Lightning interface, and several domains (App Builder, Dynamic Forms, sharing decisions) are judged by where you would click. Learn the four navigation surfaces below so you can go straight to the right one.' },
          { t: 'h', x: '1. The app launcher — switching context' },
          { t: 'p', x: 'Top-left grid icon. It lists apps, and each app has its own set of tabs. You may see several apps with an Account tab; the app decides which tabs exist, and roles / profiles decide which apps a user can even open. App Builder is how you create and configure these.' },
          { t: 'h', x: '2. Tabs and list views — finding records' },
          { t: 'p', x: 'A tab opens an object\'s list view. A list view is a saved, filterable search over that object — "My Closed Won Opportunities this quarter" is a list view. List views are the fastest way to scope work, and the exam asks you to choose the right one to isolate a record set.' },
          { t: 'h', x: '3. Record pages — working on one record' },
          { t: 'p', x: 'Clicking a record opens its detail page: a header (name + key fields), highlights panel, related lists, and a tabbed body. Page layouts, record types and Lightning components control what a user sees here. Dynamic Forms changes how the layout reacts to record data.' },
          { t: 'h', x: '4. Global search — jumping across objects' },
          { t: 'p', x: 'The omnibox searches across the objects a user can access and opens results in a Lightning modal. Its behaviour is governed by search layouts, which is how an administrator decides which fields are searchable and which objects appear in search.' },
          { t: 'callout', kind: 'tip', x: 'Memorise the direction of control: a tab shows many records; a record page shows one record. A page layout organises fields on ONE record page; a list view organises which RECORDS appear in a list.' },
          { t: 'h', x: 'Setup vs the app' },
          {
            t: 'table',
            head: ['Where', 'Use it for', 'Examples'],
            rows: [
              ['Lightning app (no Setup)', 'Day-to-day work on records', 'opening a tab, editing a record, global search'],
              ['App Builder (in Setup)', 'Configuring objects, fields, tabs, apps, layouts', 'creating a custom object, adding a field, editing a page layout'],
              ['Setup (gear, then App Setup)', 'Admin configuration and security', 'profiles, sharing, packaging, deployment']
            ]
          },
          { t: 'selfcheck', q: 'A user says "I can\'t find open Opportunities over $50k." Which three tools would you reach for, in order?', a: '1) Check they have the right app and the Opportunities tab exists in it. 2) Open the Opportunities tab and use or build a list view filtered to Stage = Open Won-ish / open AND Amount greater than 50,000. 3) If they cannot build the filter, check their profile/sharing — they may not see those records at all, which is a sharing problem, not a list view problem.' },
          {
            t: 'case',
            title: '"I cannot find my deals"',
            org: 'Northgate Plumbing Supplies (trade distributor, 90 users)',
            problem: 'Every rep opened a ticket saying the same thing: they could not find their open deals. The records were there and they were allowed to see them. The problem was navigation. Northgate had four Lightning apps, each with its own Accounts and Opportunities tab, and each tab carried a different pile of saved list views. The view a rep actually wanted - their own open opportunities above 50,000 - did not exist anywhere.',
            solution: 'One app, one default view. They built a single Lightning app, "Northgate Sales", put it in the rep profile so it is the only one they open, and made one list view - "My open deals", filtered on Owner = current user, Stage not Closed, Amount greater than 50000 - the default view for the Opportunities tab.',
            steps: [
              'Ask the user to reproduce it before changing anything: open the Opportunities tab and write down exactly what they see. In Northgate\'s case the answer was "four apps, all different", which is a navigation bug, not a data bug.',
              'Check whether the records are actually visible by finding one through Global Search. If search finds it, sharing is fine and you can stop looking at OWD and roles.',
              'Build the missing list view and set it as the tab default, so the view they want is what they land on.',
              'Reduce the number of apps their profile can see, so there is one obvious place to work.',
              'Write the filter as a sentence they can repeat back: "mine, still open, over fifty thousand".'
            ],
            gotcha: 'Northgate spent two days rebuilding sharing rules and the role hierarchy before anyone checked Global Search. Sharing fixes "you cannot SEE it"; a list view fixes "you cannot FIND it". Running Global Search is a thirty-second test that splits those two problems in half, and it is also the correct first move on any "missing records" ticket.',
            exam: 'UI and fundamentals questions are deliberately ambiguous about this. The skill being tested is diagnosing WHICH surface is wrong - app, tab, list view, page layout, search layout, or sharing - rather than reaching for the most powerful-sounding fix.'
          }
        ]
      },
      {
        title: 'Where to build: choosing the right feature',
        mins: 6,
        blocks: [
          { t: 'p', x: 'A large share of the exam is "given this requirement, which feature do you use?" Those questions are only hard if you have no default plan. Use this decision order and you will be able to justify an answer even when the wording shifts.' },
          { t: 'h', x: 'The build decision order' },
          {
            t: 'num',
            items: [
              'Is it purely presentational (field order, sections, related lists)? → Page layout or Lightning App Builder. No new data.',
              'Is it a new piece of data being tracked on an existing thing? → Custom field on that object.',
              'Is it a new kind of business thing needing its own tab, records and lifecycle? → Custom object (+ optionally a junction object to relate it).',
              'Is it a calculated value derived from the record itself? → Formula field.',
              'Is it a value rolled up from child or related records (e.g. total value of an Opportunity\'s line items)? → Roll-up summary field.',
              'Is it a hard "never allow this" business rule that must reject the save? → Validation rule.',
              'Is it automation on save (assign, notify, update a related record)? → Record-triggered flow.',
              'Is it an approval (must be approved before it advances)? → Approval process.',
              'Is it who-can-see-what for records or fields? → Sharing rules / OWD / roles; field-level security.'
            ]
          },
          { t: 'callout', kind: 'warn', x: 'Do not reach for automation (flow / workflow) to compute a value that a formula or roll-up summary can derive for free. Formulas and roll-ups are declarative, testable, and cannot loop infinitely; automation is the heavier tool. The exam rewards the lighter choice.' },
          { t: 'h', x: 'Declarative first' },
          { t: 'p', x: 'This academy is deliberately declarative-first. Order fields, calculations, validation and simple automation are all point-and-click. Only when a requirement genuinely cannot be met declaratively (complex multi-object logic, custom UI) should code enter — and Platform App Builder is not a coding exam, so the correct answer is almost never "write Apex".' },
          { t: 'h', x: 'A worked example' },
          { t: 'p', x: 'Requirement: "A Discount above 25% must be approved by the VP before it saves." Step through it:' },
          {
            t: 'num',
            items: [
              'It is a rule on saving an Opportunity → validation rule can push, but it cannot route for approval.',
              'Approval routing with submit/approve/reject is exactly an Approval process on the Opportunity.',
              'Add a Discount_Percent__c number field to hold the discount.',
              'To make it visible in a clean spot, drop the field on the Opportunity page layout.'
            ]
          },
          { t: 'p', x: 'Notice each step picks the lightest feature that fits, and none of them require code.' },
          { t: 'h', x: 'What the built artefact looks like' },
          { t: 'p', x: 'You will configure all of this through Setup. It is worth seeing the end state now, because every phase in this roadmap adds to the same org. A custom object is defined in Setup, but the same definition has an XML shape in source format (what a `package.xml` manifest will contain once you deploy it):' },
          {
            t: 'code',
            lang: 'xml',
            x: '<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">\n    <label>Discount Request</label>\n    <pluralLabel>Discount Requests</pluralLabel>\n    <nameField>\n        <label>Discount Request Number</label>\n        <type>AutoNumber</type>\n    </nameField>\n    <deploymentStatus>Deployed</deploymentStatus>\n    <sharingModel>ReadWrite</sharingModel>\n    <fields>\n        <fullName>Requested_Discount__c</fullName>\n        <label>Requested Discount %</label>\n        <type>Percent</type>\n    </fields>\n    <relationshipLabels>\n        <fullName>Opportunity_Discount_Requests__r</fullName>\n        <label>Discount Requests</label>\n    </relationshipLabels>\n</CustomObject>'
          },
          { t: 'p', x: 'Read the two tells that confirm your understanding. `Requested_Discount__c` carries the `__c` suffix because it is a custom field, and it lives in a `<fields>` collection INSIDE the object — a field is part of an object, not a sibling of it. `relationshipLabels` exists because the object has a child relationship to Opportunity, which you created when you chose a lookup.' },
          { t: 'callout', kind: 'tip', x: 'You do not need to memorise XML. Learn to READ the shape: what object it describes, what fields it carries, and what relationships it implies. That is enough to answer "which metadata component is missing?" style questions, which appear in the App Deployment domain.' },
          {
            t: 'ex',
            id: '1.1',
            title: 'Map the requirement to the feature',
            obj: 'Practise the decision order above so the "which feature?" questions stop feeling ambiguous.',
            stars: 1,
            steps: [
              'Read each requirement below and name the ONE feature you would use first. Do not add extras — the point is the first correct choice.',
              'Requirement A: "Show Payment Terms on the Account record page, above the Billing Address section."',
              'Requirement B: "We sell replacement parts, so we need to track Part Number on every Product."',
              'Requirement C: "The total value of an Opportunity should equal the sum of its line item amounts."',
              'Requirement D: "An Opportunity cannot be marked Closed Won unless its Close Date is in the past."',
              'Write one sentence per requirement naming the feature and the object it attaches to.'
            ],
            verify: 'A = page layout (presentation, no new data). B = custom field Part_Number__c on Product (new column, not a new object). C = roll-up summary field on Opportunity summing child line items (aggregate across children = roll-up, not formula). D = validation rule on Opportunity (reject an impossible state; you are constraining the save, not computing a value).'
          },
          {
            t: 'ex',
            id: '1.2',
            title: 'Explore a real org and name what you find',
            obj: 'Ground the object/record/field vocabulary in a live UI before building anything.',
            stars: 2,
            steps: [
              'Open your sandbox or the Setup in a scratch org and go to App Setup → Accounts.',
              'Write down two fields on Account that are standard and two that are custom. How can you tell the difference from the field label?',
              'Open one Account record. Name the object, and list the sections shown on its page layout.',
              'Go to the Accounts tab. Explain in one sentence why you see a list of records here instead of a single record.',
              'Open Setup → Object Manager and find the API name of the Opportunity object. Compare it to its label.'
            ],
            verify: 'Custom fields carry the "__c" suffix; standard fields do not. A list view shows MANY records (a filtered list of rows); a record page shows ONE record with its fields and related lists. The Opportunity API name is "Opportunity" (no suffix) while a custom object\'s API name matches its label with "__c", e.g. Quote_Request__c.'
          },
          {
            t: 'case',
            title: 'The discount nobody approved',
            org: 'Harbour Fitness Group (12 gyms, 400 staff)',
            problem: 'Gym membership reps could set any discount they liked, and finance discovered the damage at month end: 40,000 off memberships nobody had approved. The commercial director wanted a control and asked for the system to stop them saving.',
            solution: 'An approval process on Opportunity, not a validation rule. The rep raises the discount, the regional manager approves or rejects, and only an approved record can be marked Closed Won. A custom field holds the requested percentage and a page layout puts it somewhere visible.',
            steps: [
              'Add Requested_Discount__c (Percent) to Opportunity. The number has to exist as data before it can be governed, and this is the step people skip.',
              'Build an approval process on Opportunity with one step assigned to the regional manager, entry criteria Requested_Discount__c greater than 10, and allow submission enabled so the rep can save the record without waiting.',
              'Decide what approval actually CONTROLS. They chose the final step: only an approved Opportunity may move to Closed Won, enforced with a validation rule that reads the approval status.',
              'Add the field to the Opportunity page layout so both rep and manager see the number being approved.',
              'Test the negative path: submit above 10% and try to set Closed Won before approval. It has to fail.'
            ],
            gotcha: 'The first attempt was a validation rule blocking any save with a discount over 10%. It worked, and it was a disaster: the rep could not save at all, had no route to request approval, and simply lost the deal. A validation rule can only say no. If the business needs a "no, but ask someone" path, the answer is an approval process.',
            exam: 'This is the canonical "which feature?" question, and the tell is the phrase "must be approved". Validation rejects a save, formula computes a value, roll-up aggregates children, flow reacts after the fact. Only an approval process has submit, approve and reject.'
          }
        ]
      },
      {
        title: 'Know the exam before you study it',
        mins: 5,
        blocks: [
          { t: 'p', x: 'Platform App Builder (exam code CRT-403) is a multiple-choice exam about deciding WHICH declarative Salesforce feature solves a business problem, and about configuring the platform without code. Knowing its shape removes a lot of avoidable stress.' },
          {
            t: 'table',
            head: ['Exam fact', 'Value'],
            rows: [
              ['Code', 'CRT-403'],
              ['Questions', '60 scored, plus up to 5 unscored'],
              ['Time', '105 minutes'],
              ['Pass mark', '63%'],
              ['Prerequisites', 'None'],
              ['Domains', 'Salesforce Fundamentals · Data Modeling · Business Logic & Automation · User Interface · App Deployment']
            ]
          },
          { t: 'h', x: 'The five domains and what each rewards' },
          {
            t: 'table',
            head: ['Domain', 'Rough weight', 'What it wants from you'],
            rows: [
              ['Salesforce Fundamentals', '~23%', 'Platform model, navigation, sharing basics, reports/mobile concepts'],
              ['Data Modeling & Management', '~22%', 'Objects, fields, relationships, formulas, roll-ups, validation'],
              ['Business Logic & Process Automation', '~28%', 'Flow, approval processes, validation — the heaviest domain'],
              ['User Interface', '~17%', 'Lightning App Builder, page layouts, Dynamic Forms'],
              ['App Deployment', '~10%', 'Packages, deployment options, change sets, environments']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Business Logic & Process Automation is the biggest slice (~28%). Budget your revision time accordingly. The academic matches this phase 1: by the end of this module you should already know the five domains by feel.' },
          { t: 'h', x: 'How this roadmap maps to the exam' },
          { t: 'p', x: 'Each phase is tagged with the exam domain it mainly serves, so the dashboard and the mock exam can show you which section to revise. The tag reflects the dominant skill a phase teaches — several phases legitimately touch two domains.' },
          {
            t: 'proj',
            id: '1.3',
            title: 'Plan the Brightline Lead-to-Cash build',
            obj: 'Produce the requirements map that every later phase will build from, before any config exists.',
            stars: 3,
            reqs: [
              'Scenario: Brightline Equipment sells industrial equipment. Leads arrive from web, trade shows and referrals. They convert to Accounts, become Opportunities, and close with signed Contracts. Parts are sold as Product records.',
              'Identify the standard objects the process needs (Lead, Account, Contact, Opportunity, Contract, Product) and what one sentence each of their role is.',
              'Propose THREE custom objects you would add and, for each, name its purpose and whether it needs its own tab. Hint: think about what has no home in the standard five — e.g. a discount needing approval, or a quote request with multiple lines.',
              'For each proposed custom object, decide its RELATIONSHIPS to the standard objects (master-detail, lookup, or many-to-many via a junction). Explain each choice.',
              'Sketch the happy path in three to five steps: from a new web Lead to a signed Contract. Name which object is "in play" at each step.'
            ],
            success: 'You have a one-page plan naming standard objects, three custom objects with clear purposes and relationship types, and a Lead-to-Contract flow. This plan becomes the contract for Phases 2-17.'
          },
          {
            t: 'case',
            title: 'The flow that calculated itself into a deadlock',
            org: 'Tideline Water Utilities (regional water utility, 600 staff)',
            problem: 'Their operations team needed Order_Total__c on the parent Account to always equal the sum of its child Meter_Reading__c values. A consultant built a record-triggered flow on Meter_Reading__c that looked up the Account and wrote the sum back. It worked for six months. Then a Data Loader import of 40,000 readings hit "Maximum CPU time limit exceeded" and the nightly job stopped dead.',
            solution: 'A roll-up summary field on Account summing Meter_Reading__c.Reading__c, and the flow deleted. Salesforce recalculates roll-ups at the platform level, so there is no automation to time out and no risk of one update re-triggering the thing that caused it.',
            steps: [
              'Name the requirement precisely: "a value on the parent that is the sum of an unknown number of children". That phrase is the roll-up summary, by definition.',
              'Create the roll-up summary on Account, choose SUM as the function, and pick Reading__c on Meter_Reading__c as the source.',
              'Delete the flow. Nothing else in the flow was doing anything the roll-up does not do better.',
              'Re-run the Data Loader import to confirm it completes, then check one Account by hand against its children.'
            ],
            gotcha: 'The failure mode was recursion, and it is worth understanding rather than just avoiding. The flow updated the Account, the Account save re-entered the flow, and the chain repeated until the CPU budget ran out. Roll-up summary fields cannot do this: they are declarative, they are not triggered by their own result, and they cannot loop. The general rule is that a formula reads the record, a roll-up aggregates children, and automation is the tool you reach for only when neither can express the requirement.',
            exam: 'Business Logic and Process Automation is the heaviest domain at roughly 28% of the exam, and this is the pattern it rewards: recognise the declarative feature first. Reaching for flow when a roll-up or formula expresses the requirement is the single most common wrong answer on this domain.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'Brightline adds a "Preferred Contact Window" field to the Lead object. What does this require?',
          opts: ['A new custom object and tab', 'A custom field on Lead, with no new tab', 'A new page layout only', 'A roll-up summary field on Account'],
          a: 1,
          why: 'It is new DATA on an existing thing (a Lead), so it is a custom field. Custom fields never create a tab, and a page layout only controls where the field appears. A roll-up summary would be for aggregating child records, which this is not.'
        },
        {
          q: 'Which statement about the relationship between a tab and an object is correct?',
          opts: [
            'Each tab is a separate database table',
            'Each tab lets you enter data for a different type of record',
            'Each tab is a customized view of an object',
            'You can only create one tab per object'
          ],
          a: 2,
          why: 'A tab is the UI doorway onto an object — a place to see and edit its records — but it is not a data container. The object holds the data; the tab is how you reach it. Multiple tabs per object are allowed (custom list views appear as tabs under an object).'
        },
        {
          q: 'Which feature is BEST suited to calculating the total value of an Opportunity from all of its line items?',
          opts: ['Formula field', 'Roll-up summary field', 'Validation rule', 'Record-triggered flow'],
          a: 1,
          why: 'A roll-up summary field aggregates a value from a child or related record set onto the parent. A formula can only use fields on the same record (plus related-record lookups one level away) — it cannot sum an arbitrary number of children. Validation rules reject bad data; flows are heavier automation you would avoid for a built-in calculation.'
        },
        {
          q: 'A user cannot find their open Opportunities over $50,000. Which TWO steps do you check FIRST? (Choose all that apply.)',
          opts: [
            'That the user has the right app and the Opportunities tab exists',
            'That a list view filter on Stage and Amount exists',
            'That the user has a Flow Interview role',
            'That the record types include a Special Pricing type'
          ],
          a: [0, 1],
          why: 'The first two are navigation and filtering — how you scope the record set. Flow Interview roles have nothing to do with finding records, and record types affect which layout appears, not which records appear in a list. If the user still cannot see them after this, THEN suspect sharing.'
        },
        {
          q: 'Why does an Opportunity page layout not need a new object to show a highlight panel chart?',
          opts: [
            'Because highlight panels store their data in the layout',
            'Because the chart is a related component that reads existing Opportunity and child data',
            'Because page layouts can compute new fields automatically',
            'Because charts require a custom object to store the numbers'
          ],
          a: 1,
          why: 'A page layout organises existing fields and components; it does not create or store data. A related-list summary chart (like one summing product line items) simply reads existing related records. Storing new data is what custom fields/objects are for; computing a value is what formulas/roll-ups are for.'
        },
        {
          q: 'Your company tracks Warranty Expiry on each Contract. Do you need a custom object for this?',
          opts: ['Yes, because Contracts are standard', 'No, it should be a custom field on Contract', 'Yes, because it needs its own tab', 'No, because it can only be a formula'],
          a: 1,
          why: 'Contract is already a standard object with a tab, so adding a custom field (Warranty_Expiry__c) puts the data in the right place without a new object. A formula would only work if the value were derived; a stored date like a warranty expiry is entered by the user, so it is a plain custom field.'
        }
      ]
    }
  },
  {
    id: 'security',
    n: 2,
    title: 'Security & Sharing Fundamentals',
    icon: '🔐',
    color: '#8B5CF6',
    tagline: 'Who can see which record, and who can change which field',
    exam: 'fund',
    guide: '02-Security-Sharing-Fundamentals.md',
    objectives: [
      'Read an org\'s access model as two layers: object-level access plus field-level access',
      'Explain what org-wide defaults, roles and role hierarchies actually do to record visibility',
      'Choose the correct sharing solution for a requirement: OWD, sharing rules, manual share, Apex or flows',
      'Describe how profiles, permission sets and roles differ, and why permission sets are preferred for new work',
      'Diagnose "user cannot see / cannot edit this record" using a repeatable method'
    ],
    art: [],
    lessons: [
      {
        title: 'Two layers: object access and field access',
        mins: 7,
        blocks: [
          { t: 'p', x: 'Almost every security question in this exam reduces to a two-layer model, and most wrong answers pick the wrong layer. Layer one is **can this user do anything with records of this object at all?** Layer two is **can they see and edit this specific field?**' },
          { t: 'h', x: 'Layer 1: object permissions (CRUD + FLS)' },
          { t: 'p', x: 'Every permission set and profile grants four object-level rights, often written as **CRUD**:' },
          {
            t: 'table',
            head: ['Right', 'Means', 'Missing it looks like'],
            rows: [
              ['Create', 'May make new records', '"Save" button missing or greyed'],
              ['Read', 'May view records and fields', 'The tab is hidden, or "insufficient access"'],
              ['Update', 'May edit existing records', 'Fields render read-only'],
              ['Delete', 'May delete records', 'No Delete action, or "Delete" is blocked']
            ]
          },
          { t: 'p', x: '**FLS** is Field-Level Security and is applied separately. A user can have Read on Account but no Read on `Revenue__c`, in which case the object appears and the field is simply absent. This is the single most common cause of "I can see the record but not the number I expected".' },
          { t: 'callout', kind: 'warn', x: 'FLS and CRUD are independent. Turning off object Read hides the whole record; turning off field Read hides only that column. Read the symptom carefully - it tells you which layer to look at.' },
          { t: 'h', x: 'Layer 2: record-level access (sharing)' },
          { t: 'p', x: 'Even with full CRUD, a user still needs to be granted access to each **individual record**. That is what sharing does, and it is where the real configuration lives.' },
          {
            t: 'table',
            head: ['Sharing option', 'Scope', 'Declarative?'],
            rows: [
              ['Org-wide defaults (OWD)', 'Baseline for the whole object', 'Yes'],
              ['Role hierarchy', 'Above/below the user in the role tree', 'Yes'],
              ['Sharing rules', 'Criteria-based, re-evaluated', 'Yes'],
              ['Manual share', 'One record, one user, until revoked', 'Yes'],
              ['Apex sharing', 'Code-defined, imperative', 'No'],
              ['Lightning flow sharing', 'Criteria-based inside a flow', 'Yes']
            ]
          },
          { t: 'selfcheck', q: 'A sales manager can open Account records, but the "Annual Revenue" box is blank and greyed out. Which layer is broken?', a: 'Field-Level Security. The object-level Read permission is fine, because she can open the record. Only that specific field\'s Read is missing. Check the field\'s FLS in the permission set, not the object\'s sharing.' },
          {
            t: 'ex',
            id: '2.1',
            title: 'Diagnose four access reports',
            obj: 'Practise mapping a vague symptom to the correct layer before touching any settings.',
            stars: 2,
            steps: [
              'For each report below, name WHICH layer is at fault (object CRUD, field FLS, record sharing, or profile/app access) and what you would check first.',
              'Report 1: "The Opportunities tab is not visible anywhere in my app launcher."',
              'Report 2: "I can open Opportunities, but Amount is empty and I cannot type in it."',
              'Report 3: "My own Opportunity is there, but a colleague\'s Opportunity in my region says \'insufficient access\'."',
              'Report 4: "I can see Account records, but not any of the accounts assigned to the other region."'
            ],
            verify: '1 = object/profile access: the user lacks object Read on Opportunity, or their profile does not expose the tab. 2 = field FLS on Amount (plus Update for editing) - object Read clearly works. 3 = record-level sharing for that specific record. 4 = record-level sharing at scale, i.e. an OWD or sharing-rule problem rather than a per-record one.'
          },
          {
            t: 'case',
            title: 'The four-layer ticket',
            org: 'Brightline Equipment (internal rollout)',
            problem: 'A Brightline sales rep logged a ticket: "I can open the Opportunity tab, but when I open Acme Paper Mill, I can\'t see the Annual Revenue field, and for some other opportunities I can\'t open them at all."',
            solution: 'Split it by layer. Object access must be true. If a record opens but a field is blank/greyed, that is Field-Level Security. If a record cannot open, that is record-level sharing (ownership, OWD, role, sharing rule, manual share).',
            steps: [
              'Step one (object): can they open any record of that object? If no, fix profile/permission set - expose the tab, grant Read.',
              'Step two (record): if object is fine but some records are blocked, check ownership, OWD and sharing. Start at the level of the record (manual share), then rule-based (sharing rules), then role hierarchy.',
              'Step three (field): if they reach the record detail but a field is missing from UI entirely, check page layout visibility. If it is present but greyed/blank, check FLS for their profile/PS.',
              'Treat the three as layers you test in order, not in parallel. Do not touch sharing to fix a greyed field.'
            ],
            gotcha: 'They tried to add the rep to the VP\'s role to "give more access". That would have changed visibility for everything in that branch - a massive overreach for a single field. FLS on that single field in the rep\'s permission set would have fixed it in minutes with zero blast radius.',
            exam: 'This is the same trap as the "Annual Revenue is blank" question: object Read can be true while FLS is false. When diagnosing, always ask "can they open the record" first - the answer tells you which of the four layers you are in.'
          }
        ]
      },
      {
        title: 'Org-wide defaults and the role hierarchy',
        mins: 8,
        blocks: [
          { t: 'p', x: '**Org-wide defaults (OWD)** set the *floor* of visibility for every record of an object. Every sharing tool in Salesforce can only ever *widen* access from that baseline - nothing grants less than OWD. This is why OWD is the most important security decision in a new org.' },
          {
            t: 'table',
            head: ['OWD setting', 'Who can see records', 'Who can edit'],
            rows: [
              ['Private', 'Only the record owner', 'Only the owner'],
              ['Controlled by Parent', 'Records whose parent the user can see', 'Depends on the object'],
              ['Public Read Only', 'Everyone', 'Only the owner'],
              ['Public Read/Write', 'Everyone', 'Everyone']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'OWD cannot be made MORE restrictive by sharing settings - only less. Setting OWD to Public Read/Write and then trying to hide sensitive records with sharing rules is a design mistake; you are fighting your own baseline. Decide OWD first, widen second.' },
          { t: 'p', x: '**Controlled by Parent** deserves care. It inherits from the parent record, so on Opportunity (child of Account) a user who cannot see the Account also cannot see its Opportunities. Convenient for hierarchy, dangerous when a child carries data someone should see independently - and it is the most commonly mis-set OWD on the exam.' },
          { t: 'h', x: 'The role hierarchy' },
          { t: 'p', x: 'Roles form a **tree**. Users higher up automatically see records owned by users below them. The hierarchy flows *upward only* - a junior user never sees their manager\'s records because of the hierarchy. This is the opposite of the reporting line, so read role trees carefully in questions.' },
          { t: 'callout', kind: 'tip', x: 'Internal users normally do NOT need Manual/External sharing enabled when OWD is Private, because the role hierarchy already grants their subordinates\' data to them. Enabling it for internal users is a common workaround that quietly grants far more than intended.' },
          { t: 'h', x: 'Briefly: profiles and permission sets' },
          {
            t: 'table',
            head: ['', 'Profile', 'Permission set'],
            rows: [
              ['Contains', 'Everything: object + field + tab + app + record type access', 'A subset, granted on top of a profile'],
              ['How many', 'One per user', 'As many as needed'],
              ['Users per profile', 'Exactly one', 'Any combination'],
              ['Use for', 'The base job function (Sales Rep, Finance Analyst)', 'Extra access for a specific job (Regional Manager)'],
              ['Best practice now', 'Kept minimal', 'Where all new access should go']
            ]
          },
          { t: 'p', x: 'A profile is a fixed label the user wears. A permission set is a badge they can wear alongside their profile. Because every user has exactly one profile but can hold many permission sets, permission sets are how you grant access without duplicating whole configurations.' },
          { t: 'selfcheck', q: 'Why is OWD normally set to Private on Opportunity, rather than Controlled by Parent?', a: 'Because an Opportunity can contain commercially sensitive detail (amount, discount, competitor) that the Account owner may legitimately be entitled to see even when they cannot see the Account itself. Controlled by Parent would hide that deal from the Account owner. Private is the safest baseline; access is then widened deliberately via sharing rules.' },
          {
            t: 'ex',
            id: '2.2',
            title: 'Set OWD and design the widening strategy',
            obj: 'Reason from the baseline outwards, which is how the exam frames every sharing question.',
            stars: 2,
            steps: [
              'In Setup, open Org-Wide Defaults and note the current OWD for Opportunity, Account and Contact in your sandbox.',
              'Decide the correct OWD for each of those three objects for Brightline, and write one sentence of justification per object.',
              'For Opportunity, describe how a Regional Manager gains visibility of their region\'s reps\' opportunities. Name the specific tool and say which field it uses as the criteria.',
              'Decide whether Manual/External sharing should be enabled, and explain what that choice implies for portal or external users.',
              'Note which setting you would check if a user could see an Account but not its Opportunities.'
            ],
            verify: 'A defensible answer: Opportunity = Private (sensitive deal data, widened by a sharing rule on Territory); Account = Private or Controlled by Parent; Contact = Controlled by Parent is typical. The manager gets access via a sharing rule or a flow sharing rule keyed on Territory__c. Manual/External sharing is needed only for users outside the org (partner/portal), not for internal staff. The Account-but-not-Opportunity symptom points at Controlled by Parent on Opportunity.'
          },
          {
            t: 'case',
            title: 'The OWD nobody could walk back',
            org: 'Harrow & Voss LLP (commercial law firm, 120 staff)',
            problem: 'A trainee opened a matter for an unrelated client and could see the strategy notes on it. The matter object had been left on its out-of-the-box Public Read Only default since the sandbox was first built, and nobody had ever reviewed it. The first fix attempt was worse: they tightened the profile of the person who reported it, which locked three paralegals out of their own files and did nothing at all for anyone else.',
            solution: 'Treat org-wide defaults as the baseline and set it to Private on anything commercially sensitive. Then widen deliberately, one mechanism at a time: the role hierarchy for supervising partners, sharing rules keyed on practice group and responsible partner, and a permission set for the document team. Every widening is a thing you can point at in the audit rather than an accident of a profile.',
            steps: [
              'List every object holding privileged or commercially sensitive material before touching a single setting.',
              'Set the org-wide default on each of them to Private, working from a backup so the change is reversible.',
              'Add back access one mechanism at a time, writing down which mechanism grants what.',
              'Use the role hierarchy for the supervisory chain rather than sharing every record to a group.',
              'Put the extra access in permission sets so it can be reviewed and removed without rebuilding profiles.'
            ],
            gotcha: 'Org-wide defaults only ever widen. They can never restrict below what they are set to, so a Public Read Only default means every user in the org can read every record and no amount of profile tightening closes that off for anyone you forget. Decide the baseline before you design the access, never after.',
            exam: 'Questions that describe a leak usually want Private as the baseline plus a named widening mechanism. Being able to say which of the four defaults you would choose and why is most of the marks.'
          }
        ]
      },
      {
        title: 'Choosing the right sharing solution',
        mins: 7,
        blocks: [
          { t: 'p', x: '"Give this user access to that record" can be solved several ways, and the exam wants the one that matches the *nature* of the requirement, not just the quickest click.' },
          { t: 'h', x: 'Match the requirement shape to the tool' },
          {
            t: 'table',
            head: ['Requirement shape', 'Correct tool', 'Why'],
            rows: [
              ['These 3 specific records, just for now', 'Manual share', 'Ad hoc, explicitly per record, revocable'],
              ['Everyone in role X sees their region\'s records', 'Sharing rule on the role / territory field', 'Criteria-based and re-evaluates as data changes'],
              ['Managers see all subordinates\' records', 'Role hierarchy', 'Already implied by the role tree - no extra config'],
              ['A temporary exception while someone is on leave', 'Manual share (or Apex sharing)', 'Time-boxed, auditable'],
              ['Access granted by a business process at runtime', 'Lightning flow sharing', 'Declarative, runs inside an automation'],
              ['Too complex for any of the above', 'Apex sharing', 'Last resort; adds a code dependency']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Sharing RULES are the declarative workhorse. If a requirement says "users should automatically see records that meet condition X", a sharing rule keyed on X is the intended answer. Apex sharing appears only when the logic genuinely cannot be expressed declaratively.' },
          { t: 'h', x: 'The classic troubleshooting order' },
          {
            t: 'num',
            items: [
              'Can the user open the app and find the tab at all? → profile / app access.',
              'Can they see the object but not the object\'s records? → object CRUD.',
              'Can they open some records but not others? → record-level sharing. This is the big one.',
              'Record opens but a field is missing or read-only? → field FLS, and Update if editing fails.',
              'Record opens and fields look right, but a related list is empty? → related record access differs from parent access.'
            ]
          },
          { t: 'p', x: 'Follow it in order and you will never chase the wrong layer. Steps 1 and 2 are object-level; step 3 is record-level; steps 4 and 5 are field-level. The symptom tells you where to start.' },
          { t: 'selfcheck', q: 'A contractor must see exactly one Account, and only until the engagement ends. Which tool, and why not the others?', a: 'Manual share (or an external sharing rule if it is data-driven). The role hierarchy cannot express "one record" or an end date. A sharing rule would keep granting access after the engagement ends unless criteria change. Apex sharing would work but adds a code dependency for no benefit. Manual share is explicit, revocable and auditable.' },
          {
            t: 'proj',
            id: '2.3',
            title: 'Design Brightline\'s security model',
            obj: 'Produce the access design the rest of the roadmap\'s automation and permission sets will build on.',
            stars: 3,
            reqs: [
              'Scenario: Brightline sells across three territories (East, Central, West). Each territory has two reps, one manager, and several inside-sales staff who need read-only visibility of deals they support but do not own.',
              'Design the ROLE HIERARCHY: name the roles and show the tree. State explicitly who sees whom, and confirm that visibility flows upward only.',
              'Choose and justify the OWD for Opportunity, Quote_Request__c (from Phase 1) and Contract.',
              'Name the SHARING RULES you need: for each, state the object, the target users, the criteria fields, and whether it grants read or edit.',
              'Decide how the Regional Manager gains their region\'s visibility: role hierarchy, sharing rule, or both. Explain the choice.',
              'List the PERMISSION SETS you will create (names and purpose), and state what stays in the profile versus what goes into a permission set.',
              'Write the troubleshooting steps for a rep who reports "I cannot see an Opportunity in my own territory that I do not own".'
            ],
            success: 'A one-page security design: role tree, OWD choices with justification, named sharing rules with criteria, permission set list, and an ordered troubleshooting path. Phases 12-16 will turn this into actual permission set metadata.'
          },
          {
            t: 'case',
            title: 'Never reach for Apex first',
            org: 'Brightline Equipment',
            problem: 'A contractor must see exactly one Account, and only until the engagement ends. Someone suggested Apex sharing.',
            solution: 'Use a manual share, revoked automatically by expiry. Sharing rules cannot reliably "expire"; Apex can, but it is a code dependency for one-off access.',
            steps: [
              'Prefer manual share for a single record with a known end date.',
              'If it must be criteria-driven and recurring, use a sharing rule with a scheduled process to remove it, but recognise the edge cases.',
              'Only use Apex sharing when the logic cannot be expressed declaratively.',
              'Document revocation - the audit needs to show who can revoke, and how.'
            ],
            gotcha: 'Apex sharing works, but now every time that logic changes you need a developer. For this single-record time-limited case, it is overkill.',
            exam: 'The exam asks you to pick the lightest declarative tool. Manual share wins for ad-hoc, time-limited record access.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'What is the MOST restrictive org-wide default you can set on an object and still use sharing rules to widen access?',
          opts: ['Public Read Only', 'Controlled by Parent', 'Private', 'Full Access'],
          a: 2,
          why: 'Private is the tightest baseline: only the record owner sees the record by default. Sharing rules, role hierarchy and manual shares can only ever widen from OWD, never restrict below it, so starting at Private and widening deliberately is the safest pattern.'
        },
        {
          q: 'A user can open an Opportunity record, but the Amount field is blank and cannot be typed into. What is the most likely cause?',
          opts: [
            'The user lacks record-level sharing on that Opportunity',
            'The user lacks Field-Level Security access to the Amount field',
            'The user lacks the Read permission on the Opportunity object',
            'The Amount field is in an inactive layout section'
          ],
          a: 1,
          why: 'They can open the record, so object-level Read and record sharing are both fine. A missing read-only field with the record otherwise visible is the classic Field-Level Security symptom. Missing record sharing would prevent opening the record at all, and an inactive layout section would hide the field rather than show it greyed out.'
        },
        {
          q: 'Which TWO statements about the role hierarchy are correct? (Choose all that apply.)',
          opts: [
            'Users higher in the hierarchy automatically see records owned by users below them',
            'A user lower in the hierarchy automatically sees records owned by their manager',
            'Role hierarchy access applies to internal users as well as external users',
            'Role hierarchy is a substitute for object-level permissions'
          ],
          a: [0, 2],
          why: 'The hierarchy grants access upward, so managers see subordinates\' records (correct). It does NOT work downward - a junior user does not see their manager\'s records because of the hierarchy (so option 2 is wrong). It does apply to internal users, which is why Manual/External sharing is usually unnecessary for them. It is not a substitute for object permissions; you still need CRUD to reach the object at all.'
        },
        {
          q: 'A requirement says "Regional Managers must see all Opportunities in their own territory, refreshed automatically". Which is the BEST solution?',
          opts: ['Manual share each record', 'A sharing rule on the territory field', 'Apex sharing in a trigger', 'Set the object org-wide default to Public Read Only'],
          a: 1,
          why: '"Refreshed automatically" is the giveaway - it needs to keep working as data changes, which is exactly what a criteria-based sharing rule does. Manual share is per record and does not maintain itself. Apex sharing adds a code dependency for logic that is declaratively expressible. Public Read Only would over-share to every user in the org, which is the opposite of the requirement.'
        },
        {
          q: 'Why do profiles and permission sets both exist, and what is the current best practice?',
          opts: [
            'Profiles are for admins and permission sets are for users',
            'Profiles grant field access and permission sets grant object access',
            'A profile is a fixed base and permission sets layer extra access on top; new access should go in permission sets',
            'They are interchangeable ways of doing the same thing'
          ],
          a: 2,
          why: 'Every user has exactly one profile but can hold many permission sets. A profile is the base job function; a permission set is extra access for a specific situation layered on top. Best practice is to keep profiles minimal and put all new access in permission sets, because duplicating whole configurations across profiles does not scale.'
        },
        {
          q: 'What is the practical consequence of setting an object to Controlled by Parent?',
          opts: [
            'Records inherit their sharing from the parent record, so a user who cannot see the parent cannot see the child',
            'Child records automatically become editable by the parent owner',
            'The object no longer needs sharing rules',
            'Records inherit field-level security from the parent'
          ],
          a: 0,
          why: 'Controlled by Parent derives record visibility from the parent record. On Opportunity (a child of Account) it means anyone who cannot see the Account also cannot see its Opportunities. This is convenient for hierarchy but risky when a child carries data someone should see independently - and it is a commonly mis-set OWD on the exam.'
        }
      ]
    }
  },
  {
    id: 'reporting',
    n: 3,
    title: 'Reports, Dashboards & Mobile UX',
    icon: '📊',
    color: '#14B8A6',
    tagline: 'Turn records into answers, then put the answers where someone will actually look',
    exam: 'fund',
    guide: '03-Reports-Dashboards-Mobile-UX.md',
    objectives: [
      'Match the five report types to the question they answer, and tell summary from matrix from joined',
      'Configure filters, groupings and the date field so a report answers the question you were actually asked',
      'Build a dashboard that answers real questions instead of filling space with gauges',
      'Explain what a dashboard does on mobile versus a Lightning Experience page',
      'Troubleshoot a report: running user, sharing, row limits, and fields that will not group'
    ],
    art: [],
    lessons: [
      {
        title: 'Five report types, five kinds of question',
        mins: 7,
        blocks: [
          { t: 'p', x: 'Every report type answers a specific shape of question. If you can name the question first, the type picks itself — and if you pick the type first you will build the wrong report and then be tempted to fix it with more widgets.' },
          {
            t: 'table',
            head: ['Type', 'Question it answers', 'Rows / columns'],
            rows: [
              ['Summary', 'How many, and what is the total?', 'One row of totals across everything'],
              ['Matrix', 'How does this measure break down by that other measure?', 'Rows AND columns both grouped'],
              ['Detail', 'Show me the individual records.', 'One row per record'],
              ['Joined', 'Show me these records together with related records.', 'Parent rows with child rows nested'],
              ['Tabular', 'Show me these fields from records in a fixed order.', 'One row per record, columns you chose and ordered']
            ]
          },
          { t: 'p', x: 'The distinction that catches people: **summary and matrix group; detail, tabular and joined do not.** "Grouping" means rolling many records up into one row. If a question asks "by region", something must be grouping — that rules out tabular immediately.' },
          { t: 'callout', kind: 'tip', x: 'Tabular is the only type where you pick the exact columns and their order, and the only one that will print sensibly. If someone asks for "a spreadsheet", they want tabular. If they ask for "a list", they probably want detail.' },
          { t: 'h', x: 'Detail vs tabular' },
          { t: 'p', x: 'Both show one row per record. Detail uses the object\'s page-layout field order and lets you insert charts on the fly. Tabular lets you choose and order fields explicitly, and it is the only type suited to export. When a question says "list the deals", detail is the safe default because you rarely know in advance which fields matter.' },
          { t: 'h', x: 'Joined' },
          { t: 'p', x: 'Joined reports are built from a **primary** object plus related child records. The classic use is a master-detail or lookup relationship: one Account and its Contacts, one Opportunity and its Products. The row count is driven by the **primary** object — so put the object you want counted in the primary position, or your total will be wrong in a way that is very hard to spot.' },
          { t: 'callout', kind: 'warn', x: 'A joined report counts PRIMARY records, not child rows. An Account-and-Contacts report says "12 accounts", not "47 people". If a stakeholder expected 47, you picked the wrong primary object.' },
          { t: 'selfcheck', q: 'A VP wants "revenue by territory by quarter". Which report type?', a: 'Matrix. Both "by territory" and "by quarter" are groupings, and matrix is the only type that groups on two axes at once. A summary report can only group on one axis, so you would have to build two reports instead of one.' },
          {
            t: 'ex',
            id: '3.1',
            title: 'Pick the report type and justify it',
            obj: 'Stop reading the request as a field list and start reading it as a question shape.',
            stars: 2,
            steps: [
              'For each request below, name the report type, the grouping field(s), and the measure.',
              'Request A: "How many open Opportunities do we have, and what is their total value?"',
              'Request B: "Show me every Opportunity over 50,000 with account name, owner, close date and stage."',
              'Request C: "Pipeline by territory, split by stage."',
              'Request D: "Each Account, with all its open Opportunities underneath it."',
              'Request E: "A fixed-width export I can hand to the finance team, exactly these nine columns in this order."',
              'For Request D, name which object must be primary and explain what happens to the row count if you get it wrong.'
            ],
            verify: 'A = Summary (Count + SUM of Amount, no grouping). B = Detail or Tabular; Detail if you do not know the field set yet, Tabular if you do — the request names the fields, so Tabular is the stronger answer. C = Matrix (rows = Territory, columns = Stage). D = Joined with Account primary and Opportunity as the related object, so it counts accounts; make Opportunity primary and the total becomes opportunities instead. E = Tabular, explicitly, because it names both the column set and the order.'
          },
          {
            t: 'case',
            title: 'Two reports and one wrong number',
            org: 'Coldchain Logistics Network (UK temperature-controlled transport, 300 staff)',
            problem: 'Asked for every account with its open loads underneath, someone built a joined report and put the load object in the primary position. The dashboard headline read 240. The operations director expected 96 and had said so in the request. Nobody spotted it for three weeks, because 240 is a perfectly plausible number of deliveries for a haulier running that many lorries, and nobody re-counted a number they were not suspicious of.',
            solution: 'Rebuilt as a joined report with Account in the primary position and the load joined underneath. The headline now reads 96 accounts, each with its loads nested below, and the number means something a human can sanity check against the depot list.',
            steps: [
              'Read the request as a question shape before opening the report builder.',
              'Decide what the headline number has to mean, then put the object that carries that meaning in the primary position.',
              'Join the child records underneath it rather than listing them as the driver.',
              'Check the headline against a number you already trust from outside Salesforce.'
            ],
            gotcha: 'A joined report counts primary records, never child rows. Choose the primary object by the question being asked, not by which object happens to hold the fields you need - swapping it is the single most common way a joined report becomes quietly wrong.',
            exam: 'Five report types, one discriminator: summary and matrix group, detail, tabular and joined do not. A joined report also needs its primary object identified, and that is often the whole question.'
          }
        ]
      },
      {
        title: 'Filters, groupings and the date field',
        mins: 8,
        blocks: [
          { t: 'p', x: 'The report type is only half the work. A correctly-typed report with bad filters is still wrong, and the exam likes questions about filter scope, date fields and the running user.' },
          { t: 'h', x: 'What a filter actually does' },
          { t: 'p', x: 'A report filter narrows **which records are included** before grouping and totalling happen. It is not the same as a list view filter: report filters are part of the report definition and travel with it, while a list view filter is a saved view on the object.' },
          {
            t: 'table',
            head: ['Filter need', 'Correct approach', 'Common mistake'],
            rows: [
              ['Only my records', 'Owner = the running user, or a report folder shared with "run as"', 'Hardcoding your own name, which breaks for everyone else'],
              ['Only this quarter', 'Date field + relative date range (this quarter)', 'Hardcoding a start and end date, which goes stale tomorrow'],
              ['Exclude blanks', 'Add a filter on the field, or set the filter to require a value', 'Assuming blank rows just disappear'],
              ['Certain statuses only', 'Filter on the status field with values selected', 'Using a formula to hide them']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Relative date ranges like "this quarter", "last 90 days" or "this fiscal year" are calculated when the report runs. Absolute dates are frozen. Almost every exam question about dates wants the relative option, because it is the only one that stays correct.' },
          { t: 'h', x: 'The date field trap' },
          { t: 'p', x: 'When you group by a date, Salesforce asks which date behaviour you want, and picking wrong is the single most common report bug:' },
          {
            t: 'table',
            head: ['Date option', 'Groups by', 'Use when'],
            rows: [
              ['Calendar month', 'Month, ignoring year', 'You only ever compare within one year — usually a mistake'],
              ['Calendar quarter', 'Quarter, ignoring year', 'Rarely right for multi-year trend work'],
              ['Calendar year', 'Year', 'You want annual totals'],
              ['Day in month', 'Day of month, ignoring everything else', 'Almost never what you want']
            ]
          },
          { t: 'p', x: 'For a monthly or quarterly trend across years, you want the **date field with a grouping level** applied (Day → Week → Month → Quarter → Year) and then hide the levels you do not want. Grouping by "Calendar quarter" without the year collapses Q1 of 2024 and Q1 of 2026 into a single row and destroys the trend.' },
          { t: 'h', x: 'The running user' },
          { t: 'p', x: 'A report runs **as the user who runs it**. This has two consequences: it only shows records that user can see (so a report can look empty for a low-privilege user and fine for an admin), and a **"My" filter means the person viewing it**, not the report owner. Reports in folders can be set to run as a specific user, which is how you build "for everyone, showing leadership\'s view" dashboards.' },
          { t: 'callout', kind: 'warn', x: '"My Opportunities" on a dashboard means "the Opportunities of whoever is looking at the dashboard". That is usually correct for a rep and usually wrong for a VP expecting their team\'s total.' },
          { t: 'selfcheck', q: 'A report grouped by Calendar Quarter shows one row labelled "Q1" containing revenue from 2024, 2025 and 2026. What did you do wrong?', a: 'You used Calendar Quarter, which groups on quarter and ignores the year. Use the date field with a Quarter grouping level and keep the Year level visible (or hide only the levels you do not need). Otherwise all Q1s collapse into one row.' },
          {
            t: 'ex',
            id: '3.2',
            title: 'Spec two reports that will not go stale',
            obj: 'Build report specifications rather than clicking reports, so the design survives a new user and a new quarter.',
            stars: 2,
            steps: [
              'Write a specification for a report titled "Open Pipeline by Territory" for the VP.',
              'State: report type, primary object, the exact filter list, the row grouping, the column grouping (if any), and each measure.',
              'Decide how the date filter should be written so the report stays correct next quarter, and say which option you rejected and why.',
              'Decide whether the report should show the viewer\'s records or everyone\'s, and what "My" would mean on this report.',
              'Then write a second specification: "Deals Closed Last 90 Days" for a rep\'s own pipeline review.',
              'For each report, note one thing that would make it return zero rows for a legitimate user, and how you would tell that apart from "no data exists".'
            ],
            verify: 'Pipeline report: Summary, Opportunity, filter CloseDate = THIS QUARTER (relative, not hardcoded), Stage not equal to Closed Won/Lost, row grouping Territory__c, measure COUNT and SUM of Amount, date grouping on CloseDate with Quarter and Year visible. Decide explicitly whether it is org-wide or restricted. The zero-row diagnosis is the key part: "closed won deals only" + OWD Private + no sharing rule is indistinguishable from "no data" until you check the running user.'
          },
          {
            t: 'case',
            title: 'Filters go stale',
            org: 'Brightline Equipment',
            problem: 'The old sales report froze "Close Date between 1 Jan 2026 and 31 Mar 2026" and by March it was still filtering Q1, so leadership saw nothing for Q2.',
            solution: 'Use relative date ranges (THIS QUARTER, NEXT 90 DAYS) and a stable filter set. Freeze dates are for an audit, not a live dashboard.',
            steps: [
              'Pick THIS QUARTER, THIS MONTH, THIS YEAR or a sliding window for live reports.',
              'Keep a separate archive report with absolute dates.',
              'Explain the date grouping when grouping by dates.',
              'Test at month-end boundaries.'
            ],
            gotcha: 'Relative ranges are calculated at run time. Hardcoded dates expire and are the most common "nothing shows up" complaint.',
            exam: 'The exam almost always wants the relative option for operational reports.'
          }
        ]
      },
      {
        title: 'Dashboards, mobile and where things actually show up',
        mins: 7,
        blocks: [
          { t: 'p', x: 'A report is an answer to a question. A dashboard is a set of answers arranged for one audience. The most common dashboard mistake is ignoring the second half of that sentence.' },
          { t: 'h', x: 'Dashboard components' },
          {
            t: 'table',
            head: ['Component', 'Shows', 'Use it for'],
            rows: [
              ['Metric', 'One big number', 'A single KPI: total pipeline, open quotes'],
              ['Gauge', 'A number against a target, with a needle', 'Progress toward a goal'],
              ['Chart (report source)', 'Any chart built from a report', 'Trends, breakdowns, comparisons'],
              ['Lightning component', 'A specific Lightning component you pick', 'A funnel, a leaderboard, a recent-items list'],
              ['Dashboard filter', 'A filter that applies to the whole dashboard', 'Letting the viewer choose territory or period']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'A dashboard filter changes the filters of every report component beneath it. It is the cheapest way to make one dashboard serve three regions — but a component whose report has no matching filter field cannot be filtered, which is a common source of "the filter does nothing on this chart".' },
          { t: 'p', x: '**Gauges vs metrics.** A gauge needs a *goal* to point at, and reading a needle is slower than reading a number. Reserve gauges for genuine progress toward a target — quota attainment, days to close. For everything else use a metric or a bar chart, which people can compare across a row in a glance.' },
          { t: 'callout', kind: 'warn', x: 'Do not fill a dashboard with twenty gauges. If the viewer cannot say what to *do* about a component in one sentence, it is decoration. Four to eight components aimed at real questions beats twenty aimed at filling space.' },
          { t: 'h', x: 'Mobile' },
          { t: 'p', x: 'This is the part most often underestimated: **dashboards are not available in Salesforce mobile app.** Dashboards live in Lightning Experience on desktop only. What mobile users get instead is the mobile record page and the mobile navigation.' },
          { t: 'list', items: ['The Salesforce mobile app uses a dedicated mobile layout: a condensed set of components, different navigation, and narrower screens.', 'Mobile record pages still respect page layout assignments, but component visibility can differ, and some components have no mobile equivalent.', 'A Lightning page built in App Builder is not automatically a mobile page. If mobile matters, mobile experience needs designing deliberately (Phase 14).', 'Reports can be viewed in mobile, but a report\'s dashboard is not.'] },
          { t: 'callout', kind: 'warn', x: 'A requirement saying "rep dashboard that managers see on mobile" is a trap. Decide early whether that means the mobile app (no dashboards) or mobile browser (Lightning Experience, dashboards work). The answer changes what you build.' },
          { t: 'h', x: 'Troubleshooting order for a report or dashboard' },
          {
            t: 'num',
            items: [
              'Does the report run at all? Errors often mean an incompatible field in a filter.',
              'Is it empty? Check the running user\'s record access before assuming no data exists.',
              'Are totals wrong for a joined report? Check which object is primary.',
              'Are trend rows collapsing? Check whether you used a calendar grouping instead of a date field with levels.',
              'Is one component wrong on the dashboard? Check whether it points at its own report rather than a filtered one.',
              'Does a dashboard filter do nothing? Check the component\'s report has the filter field available.'
            ]
          },
          { t: 'selfcheck', q: 'A stakeholder asks for "a dashboard the sales team can check from their phones". What is the honest response?', a: 'Explain that dashboards are desktop-only in Lightning Experience, so there are two real options: (a) accept a desktop-only dashboard and design mobile record pages separately, or (b) build the same numbers as mobile-friendly Lightning pages, or surface the key metrics as fields on records. Do not quietly build a desktop dashboard and hope.' },
          {
            t: 'proj',
            id: '3.3',
            title: 'Build Brightline\'s reporting layer',
            obj: 'The reporting design that phases 12-16 will wire into actual dashboard and Lightning page metadata.',
            stars: 3,
            reqs: [
              'Scenario: Brightline has three territories. Leadership wants pipeline visibility; reps want their own numbers; finance wants contract value.',
              'Design FIVE reports. For each: name, type, primary object, filter list, grouping, and measures.',
              'Cover at least: a pipeline summary, a multi-axis breakdown, a per-record list, a parent-with-children report, and a monthly trend.',
              'For the trend report, specify the date field behaviour explicitly and justify it.',
              'Note for each report whether the running-user "My" filter is appropriate, or whether it should be forced to a specific user or org-wide.',
              'Design TWO dashboards: one for a Regional Manager, one for a rep. For each, list the components, the report behind each, and the answer each component gives.',
              'Mark which dashboard would need to be rebuilt for mobile, and state what you would build instead.',
              'Write the troubleshooting note: the three most likely causes of an empty report for one legitimate user.'
            ],
            success: 'A written reporting spec: five report definitions, two dashboard layouts with a stated question per component, an explicit mobile decision, and an empty-report triage note. No report relies on hardcoded dates or hardcoded owner names.'
          },
          {
            t: 'case',
            title: 'Dashboards do not live on mobile',
            org: 'Brightline Equipment',
            problem: 'Sales reps wanted a dashboard in the Salesforce mobile app. They were told it already existed.',
            solution: 'Explain the platform reality: Lightning Experience dashboards are desktop-only. Design a mobile-first view using a mobile record page or a Lightning app page optimised for small screens instead.',
            steps: [
              'State the reality clearly: the Salesforce mobile app does not render dashboards.',
              'Define what they DO see on mobile: record pages, navigation, and lists.',
              'Build a mobile record page with the top four metrics as fields/components.',
              'Alternatively, put key metrics on the Account/Opportunity record page with dynamic visibility.',
              'If they need a list, use list views, which work in mobile.'
            ],
            gotcha: 'Assuming browser behaviour carries over to the mobile app. It does not. The exam loves this.',
            exam: 'Mobile UX in this module: dashboards are not mobile-ready.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'A VP asks for "pipeline by territory, split by stage". Which report type is the ONLY one that can do this in a single report?',
          opts: ['Summary', 'Matrix', 'Detail', 'Joined'],
          a: 1,
          why: 'Matrix is the only report type that groups on two axes at once — rows (territory) and columns (stage). Summary groups on one axis only. Detail and joined show individual records rather than aggregating, so neither produces a territory-by-stage breakdown.'
        },
        {
          q: 'You build an Account report with Opportunities and Contacts as child objects. It reports "340 accounts" when you expected roughly 2,400 contacts. What is the cause?',
          opts: [
            'Account is the primary object, so the report counts accounts rather than child rows',
            'The report has a filter excluding most Contacts',
            'Joined reports cannot include more than two child objects',
            'The Contact object is not shared with the running user'
          ],
          a: 0,
          why: 'A joined report counts records of its PRIMARY object. With Account primary, the row count and the totals are accounts, not children. If you wanted the contacts counted, Contact would have to be primary. This is the classic joined-report counting mistake.'
        },
        {
          q: 'A report grouped by "Calendar Quarter" displays a single row labelled "Q1" combining data from three different years. Why?',
          opts: [
            'The date field was set to CreatedDate instead of CloseDate',
            'Calendar Quarter groups on quarter and ignores the year, so all Q1s collapse into one row',
            'The report is running as a different user',
            'Quarterly grouping requires an Apex trigger to separate years'
          ],
          a: 1,
          why: 'Calendar Quarter rolls records up by quarter number only and discards the year, so Q1 2024, Q1 2025 and Q1 2026 land in one row. For a multi-year trend you need the date field with a Quarter grouping level and the Year level visible.'
        },
        {
          q: 'Which TWO statements about report filters and relative dates are correct? (Choose all that apply.)',
          opts: [
            'A relative date range such as "this quarter" is recalculated each time the report runs',
            'A hardcoded start and end date stays correct indefinitely',
            'Report filters are part of the report definition, unlike list view filters',
            'A "My" filter in a report folder set to run as an admin always reflects the person viewing it'
          ],
          a: [0, 2],
          why: 'Relative ranges are recalculated on each run, so they stay correct (correct). A hardcoded date range goes stale the moment the period ends, which is why relative ranges are preferred. Report filters belong to the report and travel with it, whereas list view filters belong to the object view. And a "My" filter reflects the RUNNING user — a report folder set to run as a specific user makes it reflect THAT user, not the viewer.'
        },
        {
          q: 'A Regional Manager opens a dashboard showing "My Opportunities" and sees only their own three deals, not their reps\' deals. Why?',
          opts: [
            'The manager\'s sharing rules are not active',
            'The report runs as the viewing user, so "My" means the manager, not the team',
            'The dashboard filter is filtering out the reps\' records',
            'Dashboards always show org-wide data regardless of permissions'
          ],
          a: 1,
          why: 'A report runs as the user who runs it, so a "My" filter means the person currently viewing. The manager sees only their own records through that filter. To show a team total you must remove the "My" filter and rely on sharing rules plus a grouping field, or set the report folder to run as a specific user.'
        },
        {
          q: 'Which of these is TRUE of dashboards in Salesforce?',
          opts: [
            'Dashboards are available in both desktop Lightning Experience and the Salesforce mobile app',
            'Dashboards are only available in Salesforce Classic',
            'Dashboards are desktop-only in Lightning Experience; mobile users get mobile record pages and navigation instead',
            'Dashboards automatically become Lightning pages on mobile'
          ],
          a: 2,
          why: 'Dashboards are a Lightning Experience desktop feature and do not exist in the Salesforce mobile app. Mobile users get mobile record pages and the mobile navigation experience. A requirement for "dashboards on mobile" therefore needs a deliberate decision: build Lightning pages or surface the numbers as record fields instead.'
        }
      ]
    }
  },
  {
    id: 'objects',
    n: 4,
    title: 'Custom Objects & Fields',
    icon: '🧱',
    color: '#F59E0B',
    tagline: 'Decide what deserves to be its own object, then give it fields that survive contact with real users',
    exam: 'data',
    guide: '04-Custom-Objects-Fields.md',
    objectives: [
      'Decide whether a new business concept is a field on an existing object or a new custom object',
      'Create custom objects and fields declaratively, and read the difference between label, API name and field name',
      'Match field types to real-world data: text, number, currency, picklist, lookup, date and formula',
      'Explain uniqueness, required fields and validation at the field level, and why required is not the same as validated',
      'Explain why deleting or renaming fields is effectively permanent'
    ],
    art: [],
    lessons: [
      {
        title: 'Field or object? The decision that scales everything',
        mins: 7,
        blocks: [
          { t: 'p', x: 'The single highest-leverage question in a data design: **does this need its own records, its own lifecycle, or its own reporting?** If yes, it deserves a custom object. If it is just one more attribute of something you already track, it is a field.' },
          {
            t: 'table',
            head: ['If the requirement is…', 'Build', 'Because'],
            rows: [
              ['A new attribute of an existing thing (Warranty Expiry on a Contract)', 'A **field** on that object', 'One more column; the records already exist'],
              ['Something with its own set of records and its own lifecycle (a Quote Request that is submitted, approved, expires)', 'A **custom object**', 'It needs its own status, its own owner, its own sharing'],
              ['Something that happens to a record at a point in time', 'Usually a **field** (a date, a status picklist)', 'It is an event *about* a record, not a separate thing'],
              ['A list of repeating lines under a parent (order lines, quote lines)', 'A **child custom object** with a master-detail or lookup', 'One parent has many children, so each child needs its own record'],
              ['A configurable per-user or per-record preference', 'Often **nothing declarative** — use a custom setting or metadata', 'Avoid modelling what config was designed for']
            ]
          },
          { t: 'p', x: 'A useful pressure test for the "custom object" side: **would a manager ask "show me all the ones that are late?"** If yes, you want a queryable object with a status field. If the answer is always "show me that one contract\'s warranty date", it is a field.' },
          { t: 'callout', kind: 'warn', x: 'Do not create a custom object to hold a single value. An object per attribute produces a tab per attribute, a sharing rule per attribute, and reports nobody can read. This is the most common beginner design mistake and the exam penalises it.' },
          { t: 'h', x: 'Standard objects you extend rather than replace' },
          { t: 'p', x: 'In a Lead-to-Cash org you almost never need to build your own "Opportunity". You extend the standard objects with custom fields, because doing so inherits all the standard behaviour: standard reports, forecasting, activities, sharing rules, and the mobile layouts.' },
          {
            t: 'table',
            head: ['Standard object', 'Extend it for', 'Do NOT create a custom'],
            rows: [
              ['Account', 'Territory, customer tier, credit terms', 'Your own "Customer" object'],
              ['Contact', 'Job title detail, buying role', 'Your own "Person" object'],
              ['Lead', 'Source detail, product interest', 'Your own "Enquiry" object'],
              ['Opportunity', 'Discount %, competitor, territory', 'Your own "Deal" object'],
              ['Product', 'Part number, weight, lead time', 'Your own "Item" object']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'The exception: a custom object that **models a genuinely different process** — an internal approval request, a service case, a quote request — is correct and common. The test is whether the process is the same as the standard object\'s, or something new bolted onto it.' },
          { t: 'selfcheck', q: 'You need to track a Warranty Expiry date on every Contract. Custom object or custom field?', a: 'Custom field on Contract. Warranty Expiry is one attribute of an existing record type — Contract already exists, already has a tab, and already inherits standard reporting. A Warranty__c object holding one date per record would add a tab and sharing rules for no queryable benefit.' },
          {
            t: 'ex',
            id: '4.1',
            title: 'Field or object, and justify it',
            obj: 'Make the modelling decision explicitly before touching Setup, because objects are expensive and fields are cheap.',
            stars: 2,
            steps: [
              'For each requirement, decide FIELD on an existing object, NEW CUSTOM OBJECT, or NEITHER (use config). Give one sentence of reasoning.',
              'R1: Track the Warranty Expiry date for every signed Contract.',
              'R2: Track every product quote a customer has asked for, each with multiple line items and a status that moves Draft → Submitted → Approved → Expired.',
              'R3: Track which territory (East, Central, West) each Opportunity belongs to.',
              'R4: Let each user personalise the app navigation order and which objects appear on their home page.',
              'R5: Track discounts above 30%, with each needing its own approval, its own approver, and its own decision history.',
              'For R2 and R5, name the standard object you would extend (if any) and the relationship type you would use for the child records.'
            ],
            verify: 'R1 = field on Contract. R2 = custom object Quote_Request__c with a child Quote_Line__c, master-detail from Quote_Request__c so lines cannot exist without their parent. R3 = field (picklist or lookup to Territory__c) on Opportunity. R4 = neither - personalisation is exactly what Salesforce Personalization Types and app navigation handle, so a custom object would be wrong. R5 = custom object Discount_Request__c with a lookup to Opportunity (lookup, not master-detail, because the discount request must be able to exist before or independently of any Opportunity state change) plus approval fields.'
          },
          {
            t: 'case',
            title: 'An object per appointment slot',
            org: 'Marchmont Family Dental (12-site dental group, 90 clinical staff)',
            problem: 'Someone modelled appointment slots as a custom object, one record per chair per half hour. Fourteen chairs across eight hours and 260 days is about 29,000 rows a year, all of which had to be created in advance and deleted on a rolling basis. Booking a patient then meant writing to the slot object as well as to the patient record, and the two drifted apart every time a booking was cancelled by phone instead of in the system.',
            solution: 'One field. A booked timestamp on the appointment record plus a status picklist, with the chair roster held as configuration rather than data. Slots were never the thing anyone wanted to report on; bookings were.',
            steps: [
              'Ask whether the thing needs its own records, its own lifecycle, or its own reporting.',
              'Apply the pressure test: would a manager ever ask to see all the late ones, or all the unused ones this month?',
              'If the answer is never, it is a field or configuration, not an object.',
              'Keep the per-unit roster in custom metadata or a picklist, not in records.'
            ],
            gotcha: 'The pressure test is the whole decision. Slots could not answer "show me every unfilled slot today" without a separate query against an object that held no business meaning, and bookings answered it immediately because the booking is the record.',
            exam: 'Field versus custom object is decided by own records, own lifecycle, own reporting. The exam rarely needs the nuance; it needs the three questions asked in that order.'
          }
        ]
      },
      {
        title: 'Field types and naming',
        mins: 7,
        blocks: [
          { t: 'p', x: 'A custom field has three names, and confusing them causes real deployment pain. Get them straight once.' },
          {
            t: 'table',
            head: ['Name', 'What it is', 'Can it change?'],
            rows: [
              ['**Field name** (API name)', 'The developer-facing identifier, e.g. `Territory__c`', 'Never, once data exists'],
              ['**Label**', 'What users see in the UI, e.g. "Sales Territory"', 'Yes, freely'],
              ['**Field label for reports**', 'A separate, longer label for reports and exports', 'Yes, freely']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Rename the **label** freely — it is presentation. Never rename the **API name**: every formula, flow, validation rule, permission set and report that references it breaks. API names follow the convention `Object__c` and `object__c`, and they are what appears in the metadata XML (Phase 15).' },
          { t: 'h', x: 'Choosing a type' },
          {
            t: 'table',
            head: ['Type', 'Use for', 'Watch out for'],
            rows: [
              ['Text', 'Names, descriptions, part numbers', 'Length limit; set a sensible length, not 255 blindly'],
              ['Text Area', 'Long free text', 'Single line in reports — use Rich Text for formatted long text'],
              ['Number / Currency / Percent', 'Amounts, rates, totals', 'Currency is NOT a formula-friendly type (Phase 6)'],
              ['Date / DateTime', 'Close date, expiry', 'DateTime carries a timezone and renders confusingly'],
              ['Picklist', 'A controlled short list you pick', 'Values are fixed in config; no reporting across records you might add later'],
              ['Multi-select Picklist', 'Tags or categories', 'Hard to group by; use a junction object if you need to filter on pairs'],
              ['Lookup', 'A reference to another record', 'Enforces nothing unless you configure it (Phase 5)'],
              ['Checkbox', 'A yes/no', 'Cannot be truly required — unchecked just means blank'],
              ['Formula', 'A value computed from other fields', 'Read-only; you cannot type into it (Phase 6)'],
              ['Roll-Up Summary', 'A total from child records', 'Master-detail children only (Phase 7)']
            ]
          },
          { t: 'p', x: 'The exam-relevant detail: **Currency cannot be used directly inside a formula**, and neither can Text Area or Rich Text. You often need a hidden helper formula field to bridge the gap (Phase 6). This is a very common multi-step question.' },
          { t: 'h', x: 'Picklist vs lookup — the durable distinction' },
          { t: 'p', x: 'A **picklist** stores a value that means nothing elsewhere. A **lookup** points at a real record that has its own identity, owner, reports and sharing.' },
          { t: 'callout', kind: 'tip', x: 'Ask "will someone ever need to own this, report on it, or attach something to it?" If yes, it is a lookup to an object. If the answer is no — it is purely a label on this record — a picklist is lighter and simpler. If the list may change over time, or you need to add properties, lean lookup.' },
          { t: 'selfcheck', q: 'Which field types cannot be referenced directly in a formula?', a: 'Currency, Text Area and Rich Text (also encrypted fields in some contexts). That is why formulas are a common trap: a formula that SUMs a Currency field fails, and you must first create a helper formula field of type Number that converts the currency, then reference that.' },
          {
            t: 'ex',
            id: '4.2',
            title: 'Design a schema and justify every choice',
            obj: 'Produce the data model a real implementation would follow, with the reasoning written down.',
            stars: 2,
            steps: [
              'Design four fields for Opportunity in Brightline: Sales Territory, Discount %, Primary Competitor, and Expected Close Date.',
              'For each, give: label, API name, field type, whether it is required, and whether it is unique.',
              'Decide carefully whether Sales Territory is a picklist or a lookup — and state the test you applied.',
              'Explain what you would do differently if "Expected Close Date" were actually the date the quote was sent.',
              'Explain what happens to formulas, flows and reports if the API name of Discount % is renamed, and why the label is safe.',
              'Explain how Currency-versus-Number bites you when you later build a formula totalling this Opportunity (forward reference to Phase 6).'
            ],
            verify: 'Territory: label "Sales Territory", API Territory__c, type = lookup to Territory__c if you want territory owner/reporting, or picklist if it is purely a label — state which test drove it, and note that the sharing rules in Phase 2 keyed on Territory__c need a field you can filter on (a picklist works for filtering too). Discount_Percent__c = Percent, not Currency, which sidesteps the Phase 6 trap. Primary_Competitor__c = Text (a name, not an entity needing ownership). Expected_Close_Date__c = Date. None unique. Renaming an API name breaks every downstream reference; renaming the label breaks nothing.'
          },
          {
            t: 'case',
            title: 'The field nobody dared rename',
            org: 'Wexford Berry Farms (soft fruit grower, 60 staff, 400 hectares)',
            problem: 'Yield forecast went in as a text field, then a currency field, then a number field, each time retyping the same numbers. By the end there was a formula referencing Harvest_Yield__c that pointed at an API name nobody could remember, so nobody dared change the label to match. The exported column headers read Yld_Fcst_v2_FINAL and the field carried a length of 255 because that is what the wizard defaulted to.',
            solution: 'One field, correctly typed from the first day: a Number with three decimal places, labelled Yield Forecast (t per hectare), with the API name Harvest_Yield__c left alone. Three years of workbooks still resolve, because the label is presentation and the API name was never touched.',
            steps: [
              'Pick the type from the data, not from how the field is displayed.',
              'Treat the API name as permanent from the moment the field is created.',
              'Change labels freely, including the report label, whenever the business wording moves on.',
              'Set a sensible text length rather than accepting the default.'
            ],
            gotcha: 'Currency is not a formula-friendly type. It does not aggregate into a numeric formula cleanly, so a forecast stored in currency leaves you writing a conversion later. Pick Number or Percent for anything you intend to calculate with.',
            exam: 'Three names, one immutable. The API name is referenced by formulas, flows, validation rules, permission sets, reports and the metadata XML, and renaming it breaks all of them at once.'
          }
        ]
      },
      {
        title: 'Required, unique, and the limits of declarative config',
        mins: 7,
        blocks: [
          { t: 'p', x: 'Field-level settings are the cheapest guardrails you will ever build. Learn exactly what each one does and, more importantly, what it does **not** do.' },
          { t: 'h', x: 'Required' },
          { t: 'p', x: '**Required** blocks saving a record without a value. It does **not** validate the value — a required Date field happily accepts a date 200 years ago. Required is a presence check, nothing more.' },
          { t: 'callout', kind: 'warn', x: 'A **checkbox cannot be meaningfully required**: an unchecked checkbox submits as blank, which passes a presence check or fails it unpredictably. If you need "this must be explicitly decided", use a picklist with a value like "Not decided" rather than a checkbox.' },
          { t: 'h', x: 'Unique' },
          { t: 'p', x: '**Unique** (with optional case-sensitivity) prevents two records sharing the same value in that field. It is enforced by the platform on save, so it is a genuine guarantee rather than a suggestion.' },
          { t: 'callout', kind: 'tip', x: 'External ID plus Unique is how you upsert. Marking a field External ID and Unique means you can load data by that value instead of a Salesforce record ID — which is exactly what an integration needs. This is a favourite exam detail.' },
          { t: 'h', x: 'Default values' },
          { t: 'p', x: 'A default value is applied when a record is created through the UI or a flow, but it is **not** reliably applied to records created by API loads or data imports, which can bypass it. Do not treat a default as a data guarantee.' },
          { t: 'h', x: 'Record names versus custom fields' },
          { t: 'p', x: 'When you create a custom object you choose a **record name** display type: Text, Auto Number, or an Auto Number + Text pattern. Record names are what users see in reports and list views, and they are configurable in Setup — they are not a field, which surprises people.' },
          {
            t: 'table',
            head: ['Record name type', 'Gives you', 'Best for'],
            rows: [
              ['Auto Number', 'A sequential number like 0001, 0002', 'Cases, tickets, orders, where order is the identity'],
              ['Text', 'User-entered name', 'Accounts, products, anything with a human name'],
              ['Auto Number + Text', 'Both a number and a name', 'Opportunities, which benefit from both']
            ]
          },
          { t: 'h', x: 'What is effectively irreversible' },
          { t: 'list', items: ['**Deleting a field** removes it and its data. Salesforce does not offer an undo in the UI; recovery is via the Recycle Bin for a short window, then the metadata is gone.', '**Renaming an API name** is not directly supported — you would create a new field and migrate, which is why it is treated as permanent.', '**Deleting a custom object** deletes its fields and its records, and is subject to retention rules in newer orgs.', '**Adding an object to a package** is easily done; removing it requires a destructive-changes manifest (Phase 15).'] },
          { t: 'selfcheck', q: 'You mark Discount_Percent__c as Required. A rep submits 250%. Did Required catch it?', a: 'No. Required only checks presence, not range or validity. You would need a validation rule for the 0-100 range (Phase 7), and possibly a Percent validation built into the field. This is the exact distinction the exam tests: required is presence, validation is correctness.' },
          {
            t: 'proj',
            id: '4.3',
            title: 'Model Brightline\'s data layer',
            obj: 'The schema that every later phase extends, specified precisely enough to build from.',
            stars: 3,
            reqs: [
              'Scenario: Brightline sells industrial equipment across three territories with formal quotes, discounts needing approval, and contracts. Twenty internal users, three external portal users.',
              'Create FIVE custom objects. For each: plural label, singular label, API name, record name type, and a one-sentence justification for why it is an object rather than a field.',
              'For each object, design the two or three most important fields: label, API name, type, required?, unique?, and why that type.',
              'Extend the standard Lead, Account, Contact, Opportunity and Product objects with at least one custom field each, with the same detail.',
              'Decide the relationship type between every custom object and every standard object it touches. Master-detail or lookup — and say why.',
              'Identify exactly which fields must be Required and which must be Unique+External ID, and justify each.',
              'Write the "do not create these objects" section: three things you deliberately modelled as fields or config instead.',
              'Note any field whose API name must never change, and what would break if it did.'
            ],
            success: 'A written schema: five custom objects with names and record name types, all custom fields with types and constraints, every relationship typed and justified, plus an explicit list of what you refused to model as an object. Nothing in it needs Apex to be useful.'
          },
          {
            t: 'case',
            title: 'Unique on a text field',
            org: 'Northgate Sixth Form (1,400 students, 90 teaching staff)',
            problem: 'Student numbers were held in a text field marked Unique. Because it was text, "1042", " 1042" and "1042 " counted as three different students, and a leading zero carried over from the old system produced a fourth duplicate of a number that already existed. Nobody noticed for a term. The same field was also being used to record the exam centre, so it held two different kinds of value and neither was a number.',
            solution: 'Split the concept in two: Student_Number__c as Text, length 8, marked Unique, plus Exam_Centre__c as a lookup to a centre object. A validation rule rejects anything that is not exactly eight digits after trimming, so the uniqueness guarantee is applied to a value that is actually normalised.',
            steps: [
              'Decide what the value is before deciding how to store it. Here it was two things wearing one field.',
              'Choose the type that makes the value behave: text with a fixed length, not a number field, because the leading zero is part of it.',
              'Add a validation rule that normalises and then checks, so Unique is applied to a value that means one thing.',
              'Keep a separate field for the second concept rather than overloading the first.'
            ],
            gotcha: 'Unique is a platform guarantee on the exact stored value and nothing else. It does not trim whitespace, ignore case or strip leading zeros, so two teams entering the same number slightly differently will both succeed.',
            exam: 'Required checks presence only, Unique is an exact-value guarantee, and a validation rule is where correctness lives. Knowing which of the three does what is the whole question.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'You need to track a Warranty Expiry date for every signed Contract. What is the correct design?',
          opts: [
            'Create a Warranty__c custom object with a link to Contract',
            'Add a Warranty_Expiry__c Date field to the Contract object',
            'Add a formula field on Contract referencing a custom object',
            'Add a picklist on Contract with values like "Active" and "Expired"'
          ],
          a: 1,
          why: 'Warranty Expiry is one attribute of an existing record type. Contract already exists with a tab, standard reporting and its own sharing, so a custom field puts the data in the right place with no new object. A picklist loses the date; an object per attribute is the classic over-modelling mistake; a formula cannot store an entered date.'
        },
        {
          q: 'You want to track every quote a customer requests, each with several line items and a status moving Draft → Submitted → Approved → Expired. What do you need?',
          opts: [
            'A picklist on Opportunity, since quotes belong to deals',
            'A Quote_Request__c custom object with a child object for lines',
            'A text area on Account listing the quotes',
            'A formula field that counts quotes on Opportunity'
          ],
          a: 1,
          why: 'This has its own records, its own lifecycle with a status, and its own reporting need — all three tests for a custom object. Each request also has multiple line items, and repeating lines require a separate child object with one record per line. The status moves independently of the standard Opportunity lifecycle, so a picklist on Opportunity cannot model it.'
        },
        {
          q: 'A field is marked Required. Which of these does Required actually prevent? (Choose all that apply.)',
          opts: [
            'Saving a record with the field left blank',
            'Entering a value outside the sensible range, such as 250% for a percent field',
            'Entering a duplicate value in a field marked Unique',
            'Leaving the field blank on record creation'
          ],
          a: [0, 3],
          why: 'Required is purely a presence check: it blocks saving or creating a record with the field blank (options 1 and 4 are the same guarantee stated twice). It does NOT validate the value — 250% on a required Percent field saves perfectly happily; that needs a validation rule. Uniqueness is enforced by the separate Unique flag, not by Required.'
        },
        {
          q: 'Why is a Currency field problematic inside a formula?',
          opts: [
            'Currency fields can only be used on Opportunity',
            'Currency cannot be referenced directly in a formula; you need a helper formula of type Number',
            'Currency fields are automatically converted to text',
            'Currency fields cannot be summed in any report either'
          ],
          a: 1,
          why: 'Currency, Text Area and Rich Text cannot be referenced directly in a formula. The standard workaround is to create a second formula field of type Number that converts the currency value, then reference that helper field from the formula you actually need. Currency still sums fine in reports, so the limitation is specific to formulas.'
        },
        {
          q: 'What is the practical consequence of renaming a custom field\'s API name?',
          opts: [
            'Nothing — API names are cosmetic like labels',
            'Formulas, flows, validation rules and reports referencing it break; the API name is effectively immutable',
            'Only reports break, and they can be rebuilt automatically',
            'The field is deleted and the data is lost'
          ],
          a: 1,
          why: 'Every declarative reference — formulas, flows, validation rules, approval processes, permission sets, reports — points at the API name. Renaming it breaks all of them, and Salesforce does not support renaming an API name in place, so the usual path is creating a new field and migrating data. The LABEL is safe to rename freely because it is presentation only.'
        },
        {
          q: 'What is the difference between a picklist value and a lookup relationship?',
          opts: [
            'A picklist stores a value; a lookup points at a real record with its own identity, owner and reporting',
            'A picklist can only hold 100 values; a lookup is unlimited',
            'A lookup requires a custom object; a picklist works on standard objects',
            'They are interchangeable, and picklists are the newer feature'
          ],
          a: 0,
          why: 'A picklist value is a label with no identity of its own — it has no owner, no reports, no attachments. A lookup points at an actual record, so you can report on the parent, own it, attach things to it and share it. Use the test: will someone ever need to own it, report on it, or attach something to it? If yes, lookup; if it is purely a label on this record, a picklist is lighter.'
        }
      ]
    }
  },
  {
    id: 'relationships',
    n: 5,
    title: 'Relationships & Data Integrity',
    icon: '🔗',
    color: '#EF4444',
    tagline: 'Master-detail vs lookup, and every declarative tool that stops bad data existing',
    exam: 'data',
    guide: '05-Relationships-Data-Integrity.md',
    objectives: [
      'Choose master-detail or lookup correctly, and predict the consequences of each choice',
      'Explain ownership, sharing inheritance and cascade delete behaviour in plain terms',
      'Enforce data integrity declaratively: required, unique, validation rules, lookup filters',
      'Name the declarative tools that stop a record referencing something it should not',
      'Diagnose why records cannot be deleted, and how to find orphan data'
    ],
    art: [],
    lessons: [
      {
        title: 'Master-detail vs lookup: the choice and its consequences',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Two relationship types, and the choice between them propagates into ownership, sharing, deletion, roll-ups and permissions. Learn the consequences, not just the definitions.' },
          {
            t: 'table',
            head: ['', 'Master-detail', 'Lookup'],
            rows: [
              ['Child exists without parent', '**No** — required', 'Yes — optional'],
              ['Ownership', 'Child is **owned by** the parent; you never see a separate owner on the child', 'Child has its **own owner**'],
              ['Sharing', 'Child inherits the parent\'s access by default', 'Independent sharing rules'],
              ['Delete parent', 'Children are **cascade-deleted** (unless orphan rows enabled)', 'Children become **orphans** (blank lookup)'],
              ['Roll-up summaries', '**Allowed** on the parent', '**Not available**'],
              ['Multiple parents per child', 'One only', 'Up to 20 lookups on one object'],
              ['Rolls ownership up to the **grandparent**', 'Yes, through the chain', 'No']
            ]
          },
          { t: 'p', x: 'The mental model: **master-detail means "this child is part of that parent"** — a line item is *part of* an order; it has no independent existence. A lookup means "this child merely points at that record" — a discount request *references* an opportunity, but is not part of it.' },
          { t: 'callout', kind: 'tip', x: 'Ask "does deleting the parent invalidate this child?" If yes, master-detail. If the child is still meaningful without the parent, lookup. Quote lines are the classic master-detail; a discount approval request referencing a deal is the classic lookup.' },
          { t: 'h', x: 'Ownership and its knock-on effects' },
          { t: 'p', x: 'Because a master-detail child is owned by its parent, the child record shows the parent as its owner, and the parent\'s sharing controls who can see the child. This is why you cannot create a separate owner field on a master-detail child, and why reassigning the parent reassigns everything below it.' },
          { t: 'callout', kind: 'warn', x: 'A master-detail child inherits the parent\'s object permissions. If a user cannot see Accounts, they cannot see that account\'s master-detail children — even if they have access to the child object directly. This surprises people who granted child access in a permission set.' },
          { t: 'h', x: 'Orphan rows' },
          { t: 'p', x: 'By default, deleting a parent **deletes** master-detail children with it. Enabling **Allow orphan records** changes this: the child survives with a blank parent reference, which is almost always a data-integrity mistake you do not want.' },
          { t: 'selfcheck', q: 'You need a roll-up summary of total quoted value on Quote_Request__c, totalling its Quote_Line__c records. What relationship do the two objects need?', a: 'Master-detail from Quote_Request__c to Quote_Line__c. Roll-up summary fields can only aggregate over **master-detail** children, so a lookup would make the roll-up unavailable entirely, not just limited.' },
          {
            t: 'ex',
            id: '5.1',
            title: 'Choose the relationship and predict the fallout',
            obj: 'Choose correctly AND state the consequences, which is where the exam marks actually are.',
            stars: 2,
            steps: [
              'For each pair, choose master-detail or lookup, and state the deciding reason.',
              'Pair 1: Quote_Line__c records belong to a Quote_Request__c, and a line cannot exist without one.',
              'Pair 2: Discount_Request__c references the Opportunity it affects, and a pending approval must survive that Opportunity closing.',
              'Pair 3: Contact records belong to an Account, and deleting the Account should not leave contacts behind.',
              'Pair 4: A Product_Kit_Line__c names a catalogue Product, and deleting the kit should leave the Product in the catalogue.',
              'For Pair 3 (master-detail), explain what happens to the Contacts\' Owner field, their sharing, and what happens to a roll-up on Account if one existed.',
              'For Pair 2 (lookup), explain what happens to the Discount_Request__c records if the Opportunity is deleted, and how you would prevent that.',
              'State whether "Allow orphan records" should ever be enabled for Pair 1, and why.'
            ],
            verify: '1 = master-detail, "cannot exist without" (and it unlocks the roll-up). 2 = lookup, "must survive independently". 3 = master-detail for Contact→Account (the standard configuration; orphan contacts are meaningless). 4 = lookup from line to Product, master-detail from line to kit — two relationships, different directions. For Pair 3: the Contact has no independent owner (it inherits Account ownership), sharing follows the Account, and a roll-up on Account would sum the Contacts. For Pair 2: deleting the Opportunity leaves Discount_Request__c records pointing at nothing — prevent it with a validation rule, or accept it and monitor for blank lookups. Orphan records should NOT be enabled for Pair 1: an orphaned quote line is meaningless and would corrupt the roll-up total.'
          },
          {
            t: 'case',
            title: 'The roll-up that would not create',
            org: 'Redland Marine Systems (boat builder, 120 staff)',
            problem: 'Build tasks were related to orders by a lookup, because a task sometimes moved between orders and the team wanted to keep that flexible. Then somebody asked for a roll-up summary of hours on the order. The field simply would not create - the wizard refused it, the error message pointed at the relationship rather than the field, and the project stopped for a week while people argued about whether Salesforce was broken.',
            solution: 'Two relationships instead of one. Master-detail from the order to its build tasks, so the tasks belong to the order and the roll-up works, and a separate lookup from each task to the production order it is currently allocated to, which is what actually needed to be flexible.',
            steps: [
              'Decide the relationship by asking whether deleting the parent invalidates the child.',
              'If a roll-up is needed on the parent, that alone forces master-detail - there is no partial answer.',
              'Where the real requirement is flexibility, add a second lookup rather than weakening the first relationship.',
              'Check the consequences list before committing: required parent, no independent owner, cascade delete, inherited sharing.'
            ],
            gotcha: 'Roll-up summary fields can only aggregate over master-detail children. A lookup relationship makes the roll-up unavailable entirely, not merely limited, and there is no configuration trick that unlocks it.',
            exam: 'Know the consequences of each relationship type cold: master-detail means required parent, no independent owner, cascade delete, inherited sharing, roll-ups allowed. Lookup means optional, own owner, orphans, independent sharing, no roll-ups.'
          }
        ]
      },
      {
        title: 'Lookup filters and validation across the relationship',
        mins: 8,
        blocks: [
          { t: 'p', x: 'A plain lookup enforces nothing. You can point a Discount_Request__c at a Closed Won opportunity, or at one in a different territory. Two declarative tools close that gap.' },
          { t: 'h', x: 'Lookup filters' },
          { t: 'p', x: 'A **lookup filter** restricts which records a user may select when filling that lookup, chosen from the fields on the target record. It is a *selection* restriction, applied at the moment of choosing.' },
          {
            t: 'table',
            head: ['Need', 'Tool', 'Why'],
            rows: [
              ['Only select Products from an active price list', 'Lookup filter', 'The user physically cannot pick an inactive one'],
              ['Quote can only reference an Opportunity in the same territory', 'Lookup filter on Territory, or a validation rule', 'Filter prevents; validation catches'],
              ['Blocked at save time even if the value was set by a flow or API', '**Validation rule**', 'Filters only govern interactive selection'],
              ['Check a value on a related record', 'Cross-object validation rule', 'Can traverse the relationship'],
              ['Prevent deleting a parent that has children', 'Validation rule, or restrict Delete in permission set', 'Declarative either way']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Lookup filters are a **convenience guardrail**, not a guarantee. A flow assignment, a data import or an API call can set a lookup value without going through the picker. A **validation rule** fires on every save regardless of how the value got there, so for a hard rule use validation.' },
          { t: 'h', x: 'Validation rules and where they can look' },
          { t: 'p', x: 'A validation rule has an **error condition formula** and an **error message**. When the formula evaluates true, the save is rejected. The powerful part is that the formula can traverse a relationship — up to five levels up — so you can validate a child against its parent.' },
          { t: 'code', lang: 'formula', x: 'AND(\n  ISPICKVAL(StageName),          // Stage is populated...\n  NOT(ISPICKVAL(CloseDate)),   // ...but no close date yet\n  CloseDate < TODAY()          // ...and the date has passed\n)\n// Error: "A closed-stage Opportunity must have a Close Date that has not passed."' },
          { t: 'p', x: 'Three things to remember about validation rules: they **only fire on save** (so they do not fire when a related record changes — that is what Phase 9 flows with record-triggered logic is for); they evaluate **before** roll-ups and flows in the save order; and they cannot **modify** data, only reject it.' },
          { t: 'callout', kind: 'warn', x: 'A validation rule does not re-evaluate when the **parent** changes. A rule on Quote_Line__c checking that the parent is not Expired will not fire when someone later changes the parent to Expired. If you need reaction to a parent change, that is a record-triggered flow on the parent (Phase 9).' },
          { t: 'h', x: 'Unique, required, and the third integrity tool' },
          { t: 'list', items: ['**Unique** — no two records may share the value. A genuine platform guarantee.', '**Required** — presence only; no correctness.', '**Validation rule** — an arbitrary formula evaluated on save, able to traverse relationships.', '**Lookup filter** — restricts what a user may select, not what may be stored.', '**Delete restriction via permission set** — remove Delete on the object so nobody can orphan the children.'] },
          { t: 'selfcheck', q: 'A rep must only be able to pick Products from the "Standard" price list, and the system must also block a Standard-list Product being replaced by a retired one. Which tools?', a: 'A **lookup filter** scoped to the active price list prevents selecting a non-standard product interactively. But because a filter only governs the picker, a **validation rule** on the Quote_Line__c is needed to block the value arriving by flow, import or API. Use both: the filter is the good UX, the rule is the guarantee.' },
          {
            t: 'ex',
            id: '5.2',
            title: 'Close the integrity gaps declaratively',
            obj: 'Write the actual rules, not just names — this is the shape an exam answer needs.',
            stars: 2,
            steps: [
              'Scenario: Quote_Line__c has Product (lookup), Quantity (Number, required) and Unit_Price__c (Currency, required). Quote_Request__c has Request_Status__c and an Account lookup.',
              'Write a cross-object validation rule that rejects saving a Quote_Line__c whose parent Quote_Request__c status is Expired. Give the error condition and the error message.',
              'Write a validation rule on Quote_Request__c rejecting a quote with zero lines when its status is Submitted. Explain which relationship capability makes this possible.',
              'Decide: what relationship do Quote_Line__c and Quote_Request__c need, and why does that relationship type make both of the above possible?',
              'Write a validation rule preventing a Discount_Request__c from referencing an Opportunity whose StageName is Closed Lost.',
              'Write a validation rule requiring Quantity to be greater than zero and no more than 10,000.',
              'Decide which of these five rules needs a lookup filter as well, and which need one DESPITE the filter.'
            ],
            verify: 'Line-vs-parent status: error condition like AND(Quote_Request__c.Request_Status__c = "Expired", ...) with the message "Cannot add lines to an expired quote request." Zero-lines rule: COUNT() of the Quote_Line__c related records = 0 while status is Submitted — needs a master-detail relationship because COUNT() over children requires it, and roll-ups only work on master-detail. Discount-vs-closed-lost: AND(ISNULL(Opportunity__c), FALSE, Opportunity__c.StageName = "Closed Lost") with the lookup guard. Quantity: OR(Quantity__c <= 0, Quantity__c > 10000) with an appropriate message. Lookup filters help for the product selection UX, but rules 1, 2, 3 and 5 all need validation rules regardless, because a filter only governs interactive selection.'
          },
          {
            t: 'case',
            title: 'The filter that stopped filtering',
            org: 'Tidewater Stays (boutique hotel group, 9 properties)',
            problem: 'Housekeeping relied on a lookup filter to stop a room being booked while it was out of service. It worked for two years. Then a bulk reservation import ran overnight, and because an import sets the value without ever showing the picker, sixty reservations landed on rooms that were already sold or closed for maintenance. The morning shift found out from the guests.',
            solution: 'The lookup filter stayed, because it is still the right guardrail for people. Underneath it they added a cross-object validation rule on the booking that traverses to the room and rejects the save if the room status is Out of Service or if an overlapping booking already exists. The rule fires however the value arrived.',
            steps: [
              'Use the lookup filter for the human path so the right answer is the easy answer.',
              'Add a validation rule for everything else, because flows, imports and API calls all bypass the picker.',
              'Traverse the relationship in the rule formula so it checks the room, not just the booking.',
              'Give the error message the actual room number and status so the user can fix it without opening a second record.'
            ],
            gotcha: 'A lookup filter only governs the picker. Any value set by a flow assignment, a data import or an API call goes straight past it, so a rule that matters has to be a validation rule. Using the filter as your only defence is fine right up until the first import.',
            exam: 'Filter restricts selection, validation rule guarantees at save time and can traverse the relationship. A question that says users must not be able to choose X usually wants both, and the reasoning is the marks.'
          }
        ]
      },
      {
        title: 'Diagnosing integrity problems',
        mins: 7,
        blocks: [
          { t: 'p', x: 'When data is wrong, the question is never "what broke?" but "what allowed it?" — and the answer is usually one of a small number of declarative gaps.' },
          {
            t: 'table',
            head: ['Symptom', 'Most likely cause', 'Check here'],
            rows: [
              ['"Cannot delete" error on a record', 'Master-detail children exist, and orphan records are not allowed', 'The parent record\'s related lists'],
              ['Users can see children but not some of them', 'Master-detail children inherit the parent\'s sharing', 'Parent access, then child access'],
              ['A lookup points at nothing', 'Parent deleted while lookup children survived', 'List views filtered on a blank lookup'],
              ['A roll-up total is wrong', 'Children with a blank parent are excluded silently', 'Orphan check on the child object'],
              ['A validation rule did not fire', 'It only fires on save — a related record changed', 'The rule exists but the trigger event never happened'],
              ['A validation rule fires when you did not expect', 'A related field changed value as a side effect of saving this record', 'The rule\'s cross-object references'],
              ['Duplicate records keep appearing', 'No Unique flag on the identifying field', 'Field uniqueness settings']
            ]
          },
          { t: 'h', x: 'Finding orphan data' },
          { t: 'p', x: 'Blank-lookup orphans are findable declaratively. Create a list view on the child object filtered to **the parent lookup field = blank**, and the orphans appear as a list you can export and fix.' },
          { t: 'callout', kind: 'tip', x: 'Two reports worth having in any data project: (1) child records where the parent lookup is blank, (2) parents with a status implying completion but zero children. They are the two integrity gaps that quietly corrupt totals, and Phase 3\'s report design is what makes them visible.' },
          { t: 'h', x: 'Order of enforcement on save' },
          { t: 'p', x: 'When a record is saved, several things race to act. Knowing the order explains most "why did my rule not stop this" questions.' },
          {
            t: 'num',
            items: [
              'Custom validation rules run and can reject the save.',
              'Duplicate rules run (a second, different declarative check).',
              'Roll-up summaries recalculate.',
              'Workflow rules (Field Update, Email Alert, Auto-Task, Assign) run.',
              'Record-triggered flows run (before-save flows run even earlier, before 1).',
              'Before-trigger Apex runs, then the record commits, then after-trigger Apex and record-triggered flows run.'
            ]
          },
          { t: 'callout', kind: 'warn', x: 'Consequence: a **before-save** flow can change a field before validation rules see it, so a rule may evaluate against a modified value. And because record-triggered flows run *after* the record commits, they cannot reject the save — if you need to stop a save, use a validation rule.' },
          { t: 'selfcheck', q: 'A validation rule on Quote_Line__c should block lines on an Expired quote. A rep changes the parent to Expired and the existing lines remain, with no error. Why?', a: 'Validation rules fire **on save of the record that holds them**. Saving the parent Quote_Request__c does not re-save the Quote_Line__c children, so the rule never evaluated. To react, you need automation on the parent — a record-triggered flow that alerts or a process that marks the lines (Phase 9/10).' },
          {
            t: 'proj',
            id: '5.3',
            title: 'Specify Brightline\'s integrity layer',
            obj: 'The relationships and rules that the validation and automation phases will build on.',
            stars: 3,
            reqs: [
              'Scenario: Quote_Request__c with Quote_Line__c children (Product lookup, Quantity, Unit_Price__c Currency). Discount_Request__c referencing Opportunity. Territory__c on Opportunity. Contracts referencing Opportunities.',
              'Specify FIVE relationships: for each, from and to, master-detail or lookup, and the deciding reason.',
              'For each relationship, state: ownership behaviour, sharing inheritance, delete behaviour, and roll-up availability.',
              'Write SIX validation rules with full error conditions and error messages, including at least two cross-object rules that traverse a relationship.',
              'For each of the six, note whether a lookup filter would improve the user experience, and state whether the rule is still required despite any filter.',
              'Identify the two reports that would surface integrity gaps, naming the object, the filter, and the grouping.',
              'Explain the deletion consequences for each relationship, and state where you would add a validation rule or a permission set restriction to prevent unwanted deletion.',
              'Describe one symptom where a validation rule silently does not fire, and the declarative fix for it.'
            ],
            success: 'A written integrity spec: five typed relationships with consequences, six complete rules, lookup filter decisions, two gap-detection reports, and a deletion policy. Every rule is expressible without Apex.'
          },
          {
            t: 'case',
            title: 'The delete that took four thousand rows with it',
            org: 'Bracken & Co Pharmacy (independent pharmacy group, 25 branches)',
            problem: 'An administrator deleted a supplier record they were certain was a duplicate. It was a master-detail parent, so 4,100 dispensing records went with it, along with a decade of stock history for one branch. There was no backup taken beforehand, and by the time anyone realised, the recycle bin was past its window.',
            solution: 'Rebuilt from the nightly data export, which is the only reason the branch reopened the same week. Then Delete was removed from the object in a permission set assigned to everything except the two admins, so the only remaining way to remove a parent is a deliberate admin action.',
            steps: [
              'Before deleting anything, find out whether the object is a master-detail parent. That single check would have prevented the whole incident.',
              'Take an export, not a backup, and know where last night\'s copy actually lives.',
              'Remove Delete from the object in a permission set rather than relying on training.',
              'Add a validation rule where deleting a parent with children should never be allowed at all.'
            ],
            gotcha: 'Cascade delete is silent. There is no confirmation prompt listing the children that will go, and recovery is only possible inside the recycle bin window, which for most objects is a matter of days. The check that matters is one question: is this a master-detail parent?',
            exam: 'Unique, required, validation rules and cascade delete are four different integrity mechanisms with different scope. Being able to say which one prevents which kind of damage is the point of the lesson.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'Which TWO are true ONLY of a master-detail relationship? (Choose all that apply.)',
          opts: [
            'The child record is required to have a parent',
            'Roll-up summary fields can aggregate the child records on the parent',
            'The child has its own independent record owner',
            'The child can be pointed at a different parent without affecting the original'
          ],
          a: [0, 1],
          why: 'A master-detail child requires a parent, and roll-up summaries work on it because the platform guarantees the child belongs to exactly one parent. The other two describe lookups: a lookup child has its own independent owner, and it can be repointed to a different parent freely. Remember the giveaway pair: required parent + roll-ups = master-detail; independent owner + repointable = lookup.'
        },
        {
          q: 'A user can see some Quote_Line__c records but not others, even though they have full CRUD on Quote_Line__c in a permission set. What is the MOST likely explanation?',
          opts: [
            'The permission set has not been assigned to all users',
            'The Quote_Line__c records are master-detail children of Quote_Request__c, and they inherit the parent Quote_Request__c\'s record access',
            'Validation rules are hiding the non-visible lines',
            'Quote lines were created before the permission set existed'
          ],
          a: 1,
          why: 'Master-detail children inherit their parent\'s sharing. A user who cannot see certain parent Quote_Request__c records cannot see those parents\' lines, even with full CRUD on the child object. Object-level CRUD gets you to the object; record-level access to the parent then governs the children.'
        },
        {
          q: 'A lookup filter is set on the Product lookup of Quote_Line__c to show only active products. Which statement is TRUE?',
          opts: [
            'It guarantees no inactive product can ever be saved on a line, because the filter blocks it',
            'It restricts what a user can SELECT when filling the lookup, but a flow, import or API could still set an inactive product — so a validation rule is still needed for a hard guarantee',
            'It is equivalent to a validation rule and replaces the need for one',
            'It only works on standard objects'
          ],
          a: 1,
          why: 'A lookup filter governs the interactive picker, so it improves the experience and prevents accidental selection. It does not govern values set programmatically — a flow assignment, data import or API call bypasses the picker. For a genuine guarantee, pair it with a validation rule, which fires on every save regardless of how the value arrived.'
        },
        {
          q: 'You want a roll-up summary on Quote_Request__c summing all its Quote_Line__c values. What must the relationship be?',
          opts: ['A lookup, as long as it is required', 'A master-detail relationship', 'Either works — roll-ups support both', 'A formula field with COUNT() on the parent'],
          a: 1,
          why: 'Roll-up summary fields aggregate over **master-detail** children only. A lookup relationship makes the roll-up unavailable altogether, not merely restricted. The reason is structural: the platform can only guarantee that a master-detail child belongs to exactly one parent, which is what makes the aggregation well-defined.'
        },
        {
          q: 'A validation rule on Quote_Line__c checks that the parent Quote_Request__c is not Expired. A rep changes the parent to Expired and no error appears. Why?',
          opts: [
            'The validation rule was written incorrectly',
            'Validation rules only fire when the record containing the rule is saved; saving the parent does not re-save its children',
            'Validation rules cannot reference parent records',
            'The rule fires only on record creation, not update'
          ],
          a: 1,
          why: 'Validation rules evaluate on **save of the record that holds them**. Saving Quote_Request__c does not re-save Quote_Line__c children, so the rule never ran. This is a very common exam point: cross-object rules CAN traverse relationships, but they only fire when the child itself is saved. To react to a parent change you need automation on the parent — a record-triggered flow or process.'
        },
        {
          q: 'What is the most reliable way to find records whose parent lookup is blank (orphans)?',
          opts: [
            'Export the entire object and inspect it manually',
            'Write a report grouped by the parent, and look for a group with a low count',
            'Create a list view filtered to the parent lookup field = blank',
            'Add a roll-up summary of COUNT() to the parent and watch for zero'
          ],
          a: 2,
          why: 'A list view filtered to "parent lookup = blank" returns exactly the orphans as a list, which you can inspect, export and fix. Manually exporting everything is impractical, a roll-up of COUNT() on the parent cannot count records that have no parent, and grouping a report by the parent groups the orphans into an unhelpful blank group.'
        }
      ]
    }
  },
  {
    id: 'formulas',
    n: 6,
    title: 'Formula Fields',
    icon: '🧮',
    color: '#6366F1',
    tagline: 'The most heavily tested declarative skill on the exam',
    exam: 'data',
    guide: '06-Formula-Fields.md',
    objectives: [
      'Write a formula correctly using the three-function structure: left operand, operator, function',
      'Use text, date, math and conditional functions correctly, including the functions that are NOT available',
      'Handle blanks and nulls deliberately rather than getting an error or a misleading zero',
      'Work around the types that cannot appear in a formula, using helper fields',
      'Know what a formula cannot do, and pick the right tool when it cannot'
    ],
    art: [],
    lessons: [
      {
        title: 'The three-function structure',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Every formula you will ever write follows one shape: **a left operand, an operator, and a function**. Recognising the three parts is most of the skill.' },
          {
            t: 'table',
            head: ['Part', 'What it is', 'Example'],
            rows: [
              ['Left operand', 'A field reference. Field names appear exactly as in the field picker.', 'Quantity__c'],
              ['Operator', 'An arithmetic or concatenation operator', '+ - * / &'],
              ['Function', 'The operation, wrapped around arguments', 'IF(), TEXT(), DATEVALUE()']
            ]
          },
          { t: 'code', lang: 'formula', x: "Unit_Price__c * Quantity__c\n\n// three functions:\n//   IF()      the function\n//   Unit_Price__c * Quantity__c   its arguments\n\nIF(Quantity__c > 0, Unit_Price__c * Quantity__c, 0)\n//   ^function  ^arguments                        ^default value" },
          { t: 'p', x: 'A formula with **no function** is not valid in the formula editor, even for simple arithmetic — you need at least one function. `Unit_Price__c * Quantity__c` on its own will not save; wrapping it in `IF()` or `VALUE()` makes it work.' },
          { t: 'h', x: 'Field references, and the read-only consequence' },
          { t: 'p', x: 'Field references use the **API name** and are case-insensitive in the editor, but the API name is what appears in the metadata. A formula field is **read-only**: users cannot type into it, so a requirement to "let users edit this" can never be met by a formula.' },
          { t: 'callout', kind: 'tip', x: 'The classic ordering trap: **a formula can reference another formula defined before it, but not one defined after it.** If a formula gives an error on save, check the order — Salesforce processes formula fields in the order they were created. Deleting and recreating the earlier field fixes it.' },
          { t: 'h', x: 'The functions that matter most' },
          {
            t: 'table',
            head: ['Function', 'Returns', 'Typical use'],
            rows: [
              ['IF(cond, then, else)', 'One of two values', 'The workhorse — always three arguments'],
              ['AND(...), OR(...)', 'True/False', 'Combine conditions, up to 20 arguments'],
              ['NOT(x), NOT(cond, a, b)', 'Inverts', 'The two-argument NOT is a trap; it reads as "not equal to" in some contexts'],
              ['TEXT(value, format)', 'Text', 'Convert a number or date to text for display'],
              ['VALUE(text)', 'Number', 'The inverse — convert text to a number'],
              ['CONCAT(a, b, ...)', 'Text', 'Join many values, unlike & which joins two'],
              ['LEFT/TEXT/MID', 'Text pieces', 'Extract part of a text field'],
              ['TODAY(), NOW()', 'Date / DateTime', 'Today\'s date; NOW includes the time'],
              ['DATEVALUE(text)', 'Date', 'Convert text to a date'],
              ['DATE(y, m, d)', 'Date', 'Build a date from three numbers'],
              ['YEAR/MONTH/DAY(d)', 'Number', 'Pull a component out of a date'],
              ['ADDMONTHS(d, n)', 'Date', 'Date arithmetic by months, handling month lengths'],
              ['ISBLANK(field)', 'True/False', 'Test for empty — the correct way to avoid a null error'],
              ['ISPICKVAL(field)', 'True/False', 'Test whether a picklist or checkbox has any value'],
              ['ISNUMBER, ISTEXT', 'True/False', 'Type tests'],
              ['BLANKVALUE(a, b)', 'Value', 'Return a default when the first is empty']
            ]
          },
          { t: 'selfcheck', q: 'A formula `Unit_Price__c * Quantity__c` refuses to save. Why?', a: 'A formula requires at least one function — bare arithmetic between two fields is not valid. Wrap it: IF(Quantity__c > 0, Unit_Price__c * Quantity__c, 0). The second benefit is handling the blank case, since a blank Quantity multiplied into a price yields a null error.' },
          {
            t: 'ex',
            id: '6.1',
            title: 'Write and deconstruct formulas',
            obj: 'Practise the left-operand / operator / function reading that every formula question depends on.',
            stars: 2,
            steps: [
              'Write a formula for each requirement, and for each one also identify the three parts (left operand, operator, function).',
              'F1: Line_Total__c = Unit Price × Quantity, showing 0 rather than an error when Quantity is blank.',
              'F2: A text label concatenating Account name, a hyphen, and the Quote Number.',
              'F3: Days_Open__c on a quote request: days between Requested_Date__c and today, showing "Not started" when the request date is blank.',
              'F4: A "Priority" text formula: "HIGH" if the amount is over 100,000, "MEDIUM" if over 25,000, otherwise "LOW".',
              'F5: An Expiry_Status__c formula: "Expired", "Expiring soon" if within 30 days, otherwise "Active".',
              'For each formula, name the risk of getting a blank or a null wrong, and how your formula avoids it.'
            ],
            verify: 'F1: IF(ISPICKVAL(Quantity__c), Unit_Price__c * Quantity__c, 0) — the function guards the blank. F2: Account__c.Name & " - " & Quote_Request__c.Name, where & is the concatenation operator. F3: IF(ISPICKVAL(Requested_Date__c), TODAY() - Requested_Date__c, "Not started") — note the IF returns two different types, which is allowed for Text. F4: nested IF with three arguments per level. F5: nested IF using NOT(ISPICKVAL(Expiry_Date__c)) first, then Expiry_Date__c < TODAY(), then Expiry_Date__c - TODAY() <= 30. In every case ISPICKVAL or ISBLANK is the guard that prevents a blank propagating into an error.'
          },
          {
            t: 'case',
            title: 'The blank that broke every report',
            org: 'Brightline Equipment',
            problem: 'Finance built a report of Quote_Line__c.Line_Total__c and every single row showed "#Error!". The records were fine and the numbers were correct in the data export - the error was only in the formula.',
            solution: 'Quantity__c was left blank on lines where a rep entered only a description. A blank is null, not zero, so Unit_Price__c * Quantity__c propagated a null error. Guarding the multiplication with ISPICKVAL fixed all 4,000 rows at once, with no data cleanup.',
            steps: [
              'Confirm the data is genuinely blank rather than zero: open a failing record and look at the field directly.',
              'Wrap the arithmetic so the blank branch returns a value: IF(ISPICKVAL(Quantity__c), Unit_Price__c * Quantity__c, 0).',
              'Save the formula once - Salesforce recalculates every record automatically, so there is no backfill to run.',
              'Re-run the report. The #Error! column becomes numbers with no data migration.'
            ],
            gotcha: 'The obvious "fix" was to run a Data Loader job writing 0 into the blank quantities. That invented data - the rep genuinely did not enter a quantity - and it would have to be repeated after every import. Fixing the formula handles every future blank automatically.',
            exam: 'Blank-versus-zero is the highest-yield formula distinction on the exam. ISBLANK and ISPICKVAL are the only two ways to test it, and a bare arithmetic expression between two fields is not a valid formula at all.'
          }
        ]
      },
      {
        title: 'Blanks, nulls and the types you cannot use',
        mins: 8,
        blocks: [
          { t: 'p', x: 'More exam marks are lost to blank-handling than to syntax. In formulas, a blank is not zero and not an empty string — it is a **null**, and arithmetic on null produces an error.' },
          { t: 'p', x: 'The problem in one example: `Unit_Price__c * Quantity__c` where Quantity is blank does not return 0. It returns a **null error** on the record, which displays as a formula error in the UI and poisons every report column built on it.' },
          {
            t: 'table',
            head: ['Instead of', 'Use', 'Because'],
            rows: [
              ['Arithmetic on a possibly-blank field', 'IF(ISPICKVAL(field), ...)', 'Guards the arithmetic; returns your default otherwise'],
              ['`Quantity__c = 0` to test for empty', 'ISBLANK(Quantity__c)', 'A blank is not zero; the comparison silently fails'],
              ['`Text__c != ""` to test for empty text', 'ISBLANK() or ISPICKVAL()', 'Empty text and null are not the same thing'],
              ['`StageName = null`', 'ISPICKVAL(StageName)', 'Picklists need ISPICKVAL; null is not a valid comparison'],
              ['`Checkbox__c = false`', 'NOT(ISPICKVAL(Checkbox__c)) or ISBLANK()', 'An unchecked checkbox is blank, not false'],
              ['Formatting a date inline repeatedly', 'A DATEVALUE() or a text helper', 'Reuse beats repeating']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'ISBLANK and ISPICKVAL are not interchangeable in habit even though they often behave the same. ISPICKVAL is the safe choice for picklists, checkboxes, and date fields; ISBLANK is correct for text and numbers. Using ISPICKVAL everywhere is a pragmatic, accepted style.' },
          { t: 'h', x: 'The types that cannot appear in a formula' },
          { t: 'p', x: 'This trips up almost everyone at least once. **Currency, Text Area and Rich Text cannot be referenced directly inside a formula.** A formula cannot do `SUM(Unit_Price__c)` when Unit_Price__c is Currency, and it cannot concatenate a Rich Text field.' },
          { t: 'p', x: 'The standard fix is a **helper field**: a second formula of type Number that converts the currency, which the real formula then reads.' },
          { t: 'code', lang: 'formula', x: "// Unit_Price__c is CURRENCY and cannot be read by a formula.\n\n// Step 1 - helper formula, type NUMBER:\nIF(ISPICKVAL(Unit_Price__c), Unit_Price__c, 0)\n// (Salesforce accepts Currency in a formula ONLY as the argument to\n//  a Number-typed formula like this, which is the documented workaround.)\n\n// Step 2 - the real formula, now able to use the helper:\nPrice_As_Number__c * Quantity__c" },
          { t: 'callout', kind: 'tip', x: 'The other escape routes: a **roll-up summary** can aggregate Currency children and gives back a Number or Currency you *can* use, and a **flow** (Phase 9) can do arithmetic with no type restrictions at all. When a formula genuinely cannot express something, those are the declarative alternatives.' },
          { t: 'h', x: 'What formulas cannot do' },
          {
            t: 'table',
            head: ['Need', 'Formula?', 'Use instead'],
            rows: [
              ['Sum an unknown number of child records', 'No', 'Roll-up summary (Phase 7)'],
              ['Read a field from a related record', 'Yes, one level up', '— but only one level for the *direct* formula; deeper needs a chain'],
              ['Let a user type a value', 'No — formulas are read-only', 'A plain field, or a formula plus a separate input field'],
              ['Update a record, send email, create a task', 'No', 'Flow or workflow (Phase 9 / 11)'],
              ['React to a change on another record', 'No', 'Record-triggered flow (Phase 9)'],
              ['Aggregate on the same record across many children', 'No', 'Roll-up summary (Phase 7)'],
              ['Display a value conditionally with a picklist', 'Yes', '— and this is a classic exam answer']
            ]
          },
          { t: 'selfcheck', q: 'You need a formula that totals an Opportunity\'s Amount (Currency) after applying a discount. Why does `Amount - Amount * Discount_Percent__c / 100` fail?', a: 'Because a formula cannot reference a Currency field directly. The fix is a helper Number formula for the amount (or use a roll-up/flow). Note that this is exactly why Phase 4 chose Percent for the discount field — a formula CAN read a Percent field, so only the currency side needs help.' },
          {
            t: 'ex',
            id: '6.2',
            title: 'Fix the broken formulas',
            obj: 'Diagnose why each formula fails and rewrite it correctly — the most valuable formula drill there is.',
            stars: 2,
            steps: [
              'Each formula below has a real defect. For each: state what goes wrong, and rewrite it correctly.',
              'B1: `Unit_Price__c * Quantity__c` saved as a Number formula on Quote_Line__c.',
              'B2: `IF(Quantity__c = 0, 0, Unit_Price__c * Quantity__c)` on the same object.',
              'B3: `IF(StageName = "Closed Won", "Won", "Open")` on Opportunity.',
              'B4: `StageName & " - " & Amount` on Opportunity.',
              'B5: `IF(TODAY() > Expiry_Date__c, "Expired", "Active")` on Quote_Request__c.',
              'B6: `TEXT(Today() - Requested_Date__c) + " days open"` on Quote_Request__c.',
              'For each rewrite, state which of IF / ISBLANK / ISPICKVAL / TEXT / CONCAT / & you used and why that one.'
            ],
            verify: 'B1: it saves as bare arithmetic but yields a null error when Quantity is blank — rewrite as IF(ISPICKVAL(Quantity__c), Unit_Price__c * Quantity__c, 0). B2: Quantity__c = 0 does not test for blank; a blank quantity is null, not zero, so the guard misses it — the ISPICKVAL version fixes it. B3: comparing a picklist to a string with = is unreliable; use ISPICKVAL(StageName) or ISBLANK. B4: two problems — Amount is Currency so it cannot be concatenated, and & handles only two operands (use CONCAT or nest &). B5: a blank Expiry_Date__c makes the comparison behave unexpectedly; guard with NOT(ISPICKVAL(Expiry_Date__c)) first. B6: the subtraction yields a number so TEXT is unnecessary, and + does not concatenate text — use & or CONCAT.'
          },
          {
            t: 'case',
            title: 'The discount formula that would not compile',
            org: 'Brightline Equipment',
            problem: 'Sales Ops wanted Discounted_Amount__c on Opportunity: Amount minus a discount percentage. The formula Amount - Amount * Discount_Percent__c / 100 was rejected by the editor with no useful error message.',
            solution: 'Amount is a Currency field, and Currency cannot be referenced directly in a formula at all. The workaround is two steps: a helper Number field that exposes the currency as a number, then the real Currency formula that uses the helper.',
            steps: [
              'Create Amount_As_Number__c (Number, formula) on Opportunity reading the currency amount as a plain number.',
              'Create Discounted_Amount__c (Currency) using Amount_As_Number__c and Discount_Percent__c, then format the result as currency.',
              'Set the formula return type to Currency on the second field so reports group and total it correctly.',
              'Never try to concatenate the currency into a text label - a helper is required there too.'
            ],
            gotcha: 'The error message does not say "Currency is not allowed here". People assume their syntax is wrong and rewrite the same expression five different ways. Knowing Currency, Text Area and Rich Text are the three types a formula cannot touch saves the whole afternoon.',
            exam: '"Which field type cannot be used in a formula?" is a direct question, and the helper-field two-step pattern is the correct answer to any requirement that needs a currency value inside a formula.'
          }
        ]
      },
      {
        title: 'Formulas in the exam and in the roadmap',
        mins: 6,
        blocks: [
          { t: 'p', x: 'Formula questions cluster into a small number of shapes. Recognising the shape tells you what the question is really asking.' },
          {
            t: 'table',
            head: ['Question shape', 'What it tests', 'You should reach for'],
            rows: [
              ['"What is wrong with this formula?"', 'Blank handling, null comparison, wrong type, ordering', 'ISBLANK / ISPICKVAL / a helper field'],
              ['"Which function does X?"', 'Function vocabulary', 'The functions table in lesson 1'],
              ['"How do I display A conditionally?"', 'Nested IF', 'IF() with three arguments'],
              ['"Which field cannot be used in a formula?"', 'Type restrictions', 'Currency / Text Area / Rich Text'],
              ['"How do I total child records?"', 'Knowing the limit', '"A roll-up summary" — not a formula'],
              ['"A formula gives an error, why?"', 'Reference order, or a reference to a field created later', 'Reorder the fields'],
              ['"Which two statements are true?"', 'Combining shape + behaviour', 'Read the distractors for the false claim']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'In a "which function" question, the distractors are usually real functions used in the wrong place — `CONCAT` when `&` suffices, `TEXT` when the value is already text, `DATEVALUE` when the value is already a date. Check the *type* of what you have before choosing the function.' },
          { t: 'h', x: 'Formulas in the Brightline design' },
          { t: 'p', x: 'The formulas this roadmap actually uses, so you can see they are load-bearing rather than decorative:' },
          {
            t: 'table',
            head: ['Object', 'Formula field', 'Purpose'],
            rows: [
              ['Quote_Line__c', 'Line_Total__c (Number)', 'Unit Price × Quantity, blank-safe'],
              ['Quote_Line__c', 'Price_As_Number__c (Number)', 'Helper for the Currency Unit Price'],
              ['Quote_Request__c', 'Days_Open__c (Number)', 'Today minus Requested Date, or blank-safe default'],
              ['Quote_Request__c', 'Expiry_Status__c (Text)', 'Expired / Expiring soon / Active, nested IF'],
              ['Quote_Request__c', 'Is_Overdue__c (Checkbox)', 'TRUE when Expiry Date has passed'],
              ['Opportunity', 'Discounted_Amount__c (Currency)', 'Amount after Discount %'],
              ['Opportunity', 'Priority__c (Text)', 'HIGH / MEDIUM / LOW by amount'],
              ['Opportunity', 'Is_Stale__c (Checkbox)', 'TRUE when no activity for 30 days']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'Note which of these are formulas and which are roll-ups. \`Days_Open__c\` is a formula (same record). A "Total Quoted Value" on a quote request is a **roll-up** (children), because a formula cannot aggregate children. Confusing those two is a common and expensive mistake.' },
          { t: 'selfcheck', q: 'You need a checkbox "Is Overdue" on Quote_Request__c that is TRUE when Expiry Date is in the past. Why a formula rather than a flow?', a: 'Because it is a pure derivation from fields on the same record, always true at all times. A formula recalculates whenever the record is saved and is visible in reports and filters automatically, with no automation to maintain. A flow would only update it on a trigger, so it could go stale when someone edits Expiry Date — and it would not be filterable in reports.' },
          {
            t: 'proj',
            id: '6.3',
            title: 'Build Brightline\'s formula layer',
            obj: 'The calculated fields the roll-up and automation phases depend on.',
            stars: 3,
            reqs: [
              'Scenario: Quote_Request__c (Requested_Date__c, Expiry_Date__c, Request_Status__c, Account lookup). Quote_Line__c (Quantity Number required, Unit_Price__c Currency required). Opportunity (Amount Currency, Discount_Percent__c Percent, CloseDate, LastActivityDate).',
              'Write NINE formula fields across the three objects. For each: label, API name, return type, the full formula, and what it is for.',
              'At least three must handle blanks correctly using ISBLANK or ISPICKVAL — show which guard you used and why that one.',
              'At least one must work around the Currency limitation with a helper field. Explain the two-step pattern.',
              'At least one must be a nested IF with three or more outcomes.',
              'Write one formula that is deliberately NOT built as a formula, and explain which tool you would use instead and why.',
              'For each formula, state where a blank value could break it, and confirm your version is safe.',
              'List the three formulas that would break if their referenced field were renamed, and say why.'
            ],
            success: 'Nine correct, blank-safe formulas with stated return types, including one helper-field workaround and one nested IF, plus an explicit note on which tool replaces the one formula you did not build. All declarative.'
          },
          {
            t: 'case',
            title: 'The field the reports could not see',
            org: 'Brightline Equipment',
            problem: 'Leadership asked for a report of open Opportunities bucketed by a new Priority__c text field. The field existed on the record page but would not appear in the report grouping picker.',
            solution: 'Priority__c was a formula, and formula fields ARE reportable - but this one returned different TYPES across its nested IF branches. A formula returning mixed types cannot be grouped reliably, so the field was split into a Text formula returning one consistent type.',
            steps: [
              'Confirm the field exists and is populated by opening the record - if it renders there, the field is fine.',
              'Check the return type: a formula declared as Text but sometimes returning a number is the failure mode.',
              'Make every branch return the same type, or wrap numbers with TEXT().',
              'Recheck the grouping picker - the field appears once the type is consistent.'
            ],
            gotcha: 'The team had also considered building Priority__c as a flow-updated field, which would have been filterable but would have gone stale whenever Amount was edited without a save triggering the flow. A formula is always current because it recalculates on every save.',
            exam: 'The general principle worth memorising: use a FORMULA when the value is derived from the same record and must always be true. Use a FLOW only when something must HAPPEN. Deriving is not happening.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'What is the required structure of a formula field in Salesforce?',
          opts: [
            'A single function applied to one field',
            'A left operand, an operator, and a function',
            'Any valid SOQL statement',
            'A list of fields joined by commas'
          ],
          a: 1,
          why: 'Every formula decomposes into three parts: a left operand (a field reference), an operator (+ - * / &), and a function wrapping the arguments. Recognising the three parts is most of the skill. Note that bare arithmetic such as Quantity * Price will not save on its own, because a formula needs at least one function.'
        },
        {
          q: 'A Number formula on Quote_Line__c is `Unit_Price__c * Quantity__c`. Records with a blank Quantity show a formula error. Why?',
          opts: [
            'Currency fields cannot be used in formulas at all',
            'A blank value is null, and arithmetic on null produces an error rather than zero — it needs a guard such as IF(ISPICKVAL(Quantity__c), ...)',
            'Number fields must use SUM() rather than multiplication',
            'The formula must be declared as a Currency field, not a Number'
          ],
          a: 1,
          why: 'A blank is a null, not a zero, so multiplying by it produces an error rather than 0. The fix is to guard the arithmetic: IF(ISPICKVAL(Quantity__c), Unit_Price__c * Quantity__c, 0). This is the single most common formula defect and the most common exam topic.'
        },
        {
          q: 'Which TWO field types cannot be referenced directly inside a formula? (Choose all that apply.)',
          opts: ['Currency', 'Percent', 'Text Area', 'Date'],
          a: [0, 2],
          why: 'Currency, Text Area and Rich Text cannot be referenced directly in a formula. Percent, Number, Date, DateTime, Text, picklists, checkboxes, lookups and formula fields all can. The standard workaround for Currency is a helper Number formula field that converts the value.'
        },
        {
          q: 'What is the CORRECT way to test whether a picklist or checkbox field has any value?',
          opts: [
            'ISBLANK(field) only, and nothing else works',
            'field = null',
            'ISPICKVAL(field), which is the safe test for picklists, checkboxes and dates',
            'NOT(field = "")'
          ],
          a: 2,
          why: 'ISPICKVAL returns TRUE if the field has any value, and it is the safe test for picklists, checkboxes and date fields — an unchecked checkbox is blank rather than false, and a picklist should not be compared to null directly. ISBLANK is correct for text and number fields, and in practice either works, but ISPICKVAL is the habit that avoids the edge cases.'
        },
        {
          q: 'A formula field references another formula field that was created AFTER it, and the formula errors. What is the cause?',
          opts: [
            'Formula fields cannot reference other formula fields',
            'Formula fields are evaluated in creation order, so a formula can only reference fields defined before it',
            'The referenced field must be a roll-up summary',
            'The referencing formula must be of type Text'
          ],
          a: 1,
          why: 'Salesforce processes formula fields in the order they were created, so a formula may reference fields defined earlier but not later. The fix is to recreate the dependency in the right order — often by deleting and re-saving the later field, or creating a fresh formula so it is processed last.'
        },
        {
          q: 'You need a total of an Account\'s related Opportunities\' Amount values. Why can a formula field NOT do this?',
          opts: [
            'Formulas can reference only fields on the same record',
            'Because it requires aggregating an unknown number of child records, which needs a roll-up summary field',
            'Because Amount is a Currency field',
            'Because formulas cannot appear in reports'
          ],
          a: 1,
          why: 'A formula works on fields of the record it lives on, plus one level of related record field references — but it cannot aggregate across a set of child records. Totalling child values needs a **roll-up summary** field on the parent, which is Phase 7. Note that the Currency type is a separate, smaller limitation and not the reason here.'
        }
      ]
    }
  },
  {
    id: 'rollups',
    n: 7,
    title: 'Roll-Up Summaries & Validation',
    icon: '🛡️',
    color: '#10B981',
    tagline: 'Totalling children declaratively, and rejecting bad data before it is saved',
    exam: 'data',
    guide: '07-Roll-Up-Summaries-Validation.md',
    objectives: [
      'Configure a roll-up summary with the right aggregate function over master-detail children',
      'Choose between COUNT, SUM, MIN, MAX and the distinct COUNT variants',
      'Write a validation rule with a correct error condition and a useful error message',
      'Handle blanks in validation rules so the rule fires on the cases you meant',
      'Choose the right tool among validation rule, duplicate rule, workflow and flow'
    ],
    art: [],
    lessons: [
      {
        title: 'Roll-up summaries',
        mins: 7,
        blocks: [
          { t: 'p', x: 'A roll-up summary is the declarative answer to "how much, or how many, of the children?" — the thing a formula cannot do (Phase 6).' },
          { t: 'list', items: ['Requires a **master-detail** relationship. The parent holds the roll-up; the children are aggregated.', 'Requires the child to be a child — you cannot roll up a lookup set.', 'The value is **read-only**: maintained by the platform, never typed by a user.', 'It recalculates automatically when children change, which is why it beats keeping a number in a plain field.', 'If children are **orphans** (blank parent), they are **silently excluded** — the total is wrong with no error.'] },
          { t: 'h', x: 'The aggregate functions' },
          {
            t: 'table',
            head: ['Function', 'Returns', 'Use when'],
            rows: [
              ['**COUNT**', 'The number of child records', 'You want "how many"'],
              ['**COUNT (Distinct)**', 'Number of **distinct** values of a chosen child field', 'Lines repeat a Product; you want "how many different products"'],
              ['**SUM**', 'The total of a chosen numeric child field', 'Totals: value, quantity, amount'],
              ['**MIN**', 'The smallest value of a child field', 'Earliest date, lowest price'],
              ['**MAX**', 'The largest value of a child field', 'Latest date, highest price']
            ]
          },
          { t: 'callout', kind: 'warn', x: '**Distinct COUNT is the most examined option on the exam.** "How many different Products are on this quote?" needs COUNT(Distinct) on the Product field. Plain COUNT counts *lines*, so a quote with the same product on three lines says 3 when the answer is 1.' },
          { t: 'p', x: 'The return type matters too: a roll-up over a **Numeric** child field can return Number, Currency or Percent; over a **Date** field it returns a Date. A SUM of dates is meaningless, so the platform restricts which combinations are offered.' },
          { t: 'selfcheck', q: 'A quote request has 5 lines, 3 of which are the same Product. "How many distinct Products did they ask for?" Which aggregate?', a: 'COUNT(Distinct) on the Product lookup field. Plain COUNT returns 5 — the number of lines. The distinct variant collapses the three duplicate rows to 1, giving 4 distinct products.' },
          {
            t: 'ex',
            id: '7.1',
            title: 'Configure four roll-ups',
            obj: 'Choose the aggregate function by reading the question, not by habit.',
            stars: 2,
            steps: [
              'For each requirement, name the roll-up: child object, aggregate function, source field, return type, and why that aggregate.',
              'R1: On Quote_Request__c, the total value of all its Quote_Line__c Line_Total__c fields.',
              'R2: On Quote_Request__c, how many DIFFERENT Products appear on its lines.',
              'R3: On Quote_Request__c, how many lines it has — to decide whether a "Submitted with no lines" rule can work.',
              'R4: On Account, the date of the most recent Contract signed.',
              'R5: On Quote_Request__c, the earliest line delivery date across its lines.',
              'For R1 and R2, explain what happens if a line is deleted, and what happens if Allow orphan records were enabled.',
              'For R3, explain why a roll-up is not a validation rule, and what it is instead.'
            ],
            verify: 'R1 = SUM over Line_Total__c, return type Currency or Number. R2 = COUNT(Distinct) over the Product lookup. R3 = plain COUNT. R4 = MAX over Contract StartDate (MAX for "most recent"), return Date. R5 = MIN over the delivery date, return Date. On deletion the roll-up recalculates immediately, so the value stays correct; orphan records would be silently EXCLUDED, making the total wrong with no error — which is why orphan records stay off. R3 is a roll-up, not a validation rule: a roll-up computes a value, a validation rule rejects a save. A rule would use the roll-up count inside its error condition.'
          },
          {
            t: 'case',
            title: 'The total that never matched the invoice',
            org: 'Brightline Equipment',
            problem: 'Customer service kept promising order totals that did not match the invoices. They were adding Quote_Line__c.Line_Total__c by hand in a spreadsheet, and the spreadsheet disagreed with finance by small amounts every month.',
            solution: 'A roll-up summary field on Quote_Request__c summing Line_Total__c across its Quote_Line__c children. Salesforce recalculates it whenever any child line is created, edited or deleted, so it is correct at all times and appears in reports and list views for free.',
            steps: [
              'Create Quoted_Total__c on Quote_Request__c as a Roll-up Summary, SUM function, filtered to nothing (all lines).',
              'Choose Line_Total__c on Quote_Line__c as the source value.',
              'Add it to the Quote_Request__c page layout and to the list view columns reps read.',
              'Spot-check three quotes by comparing the roll-up against the sum of their lines.'
            ],
            gotcha: 'The team first tried a formula on the parent. A formula cannot reach an unknown number of children - it reads the record and at most one level of lookup fields. Rolling up an unknown number of children is exactly what a roll-up summary exists for, and no amount of formula nesting will get you there.',
            exam: 'Sum across children is a roll-up, never a formula. The exam pairs this with the type restrictions on formulas precisely to see whether you keep the two straight.'
          }
        ]
      },
      {
        title: 'Validation rules and error messages',
        mins: 8,
        blocks: [
          { t: 'p', x: 'A validation rule has exactly two parts, and an exam question usually tests whether you know both.' },
          { t: 'num', items: ['**Error condition formula** — when this evaluates TRUE, the save is rejected.', '**Error message** — what the user sees. This is where most real-world rules fail.'] },
          { t: 'p', x: 'The message is not decoration. A rule saying "Error: invalid data" tells the user nothing, they cannot fix it, and they will route around it. **Name the field and the rule**: "Quantity must be greater than zero."' },
          { t: 'h', x: 'Writing the condition' },
          {
            t: 'table',
            head: ['Need', 'Condition pattern'],
            rows: [
              ['Value out of range', '`OR(Quantity__c <= 0, Quantity__c > 10000)`'],
              ['Required in practice, but not marked Required', '`ISBLANK(Field__c)`'],
              ['Only when another field is set', '`AND(ISPICKVAL(Trigger__c), ISBLANK(Dependent__c))`'],
              ['Picklist has a specific value', '`ISPICKVAL(Status__c) && Status__c = "Approved"`'],
              ['Checkbox must be checked', '`!ISPICKVAL(Approved__c)`'],
              ['Cross-object check', '`AND(NOT(ISNULL(Parent__c)), Parent__c.Field__c = "X")`'],
              ['Field changed on this save only', '`AND(ISCHANGED(Amount__c), Amount__c < 0)`'],
              ['Date must be in the future', '`AND(ISPICKVAL(CloseDate), CloseDate <= TODAY())`']
            ]
          },
          { t: 'code', lang: 'formula', x: "// Quantity must be between 0 and 10,000 - the shape almost every rule uses:\nOR(Quantity__c <= 0, Quantity__c > 10000)\n// Error message:\n// \"Quantity must be greater than zero and no more than 10,000.\"\n\n// A cross-object rule with the guard that makes it safe:\nAND(\n  NOT(ISNULL(Opportunity__c)),\n  Opportunity__c.StageName = \"Closed Lost\"\n)\n// \"A discount cannot be requested against a Closed Lost opportunity.\"\n// ^ the ISNULL guard stops a blank lookup reaching the comparison" },
          { t: 'callout', kind: 'tip', x: '**ISNULL guards are not optional when traversing a relationship.** A blank lookup referenced in a comparison behaves unreliably, and it is the most common reason a rule "sometimes does not fire" for new records with no parent selected yet.' },
          { t: 'h', x: 'Blank handling in rules' },
          { t: 'p', x: 'Phase 6 applies verbatim: a blank is null, not zero. A rule meant to require a quantity can silently pass a blank field. Decide deliberately whether the rule should reject blanks (add `ISBLANK(Quantity__c)` to the `OR`) or ignore them.' },
          { t: 'callout', kind: 'warn', x: '`ISCHANGED()` is true only when the user actually modified that field in this save — useful for "cannot make it worse", useless for "is always true". It also behaves oddly for API and flow updates, which can mark fields as changed without a human editing them.' },
          { t: 'selfcheck', q: 'A rule rejects editing an Opportunity once it is Closed Won. Why is `NOT(ISCHANGED(StageName))` the wrong condition?', a: 'It tests whether Stage was NOT edited this time, which has nothing to do with the current stage. Test the value directly: `AND(ISPICKVAL(StageName), StageName = "Closed Won", ISCHANGED(Amount__c))` — the stage is the gate, and ISCHANGED(Amount) says "only complain if the amount moved".' },
          {
            t: 'ex',
            id: '7.2',
            title: 'Write six rules that actually help the user',
            obj: 'Produce complete rules — condition AND message — because a rule without a usable message is half-built.',
            stars: 2,
            steps: [
              'For each, write the error condition formula and the error message.',
              'V1: Quantity on Quote_Line__c must be greater than zero and at most 10,000.',
              'V2: A Discount_Request__c cannot reference a Closed Lost Opportunity, and cannot be saved with a blank Opportunity.',
              'V3: A Quote_Request__c cannot be set to Submitted when it has zero lines.',
              'V4: An Opportunity cannot be moved to Closed Won with a Close Date in the past.',
              'V5: Unit Price on Quote_Line__c must be greater than zero.',
              'V6: An Account cannot be marked Inactive while it has open Opportunities.',
              'For each rule, state whether it fires on create, on update, or both, and which guard survives a blank field.'
            ],
            verify: 'V1: OR(Quantity__c <= 0, Quantity__c > 10000), message "Quantity must be greater than zero and no more than 10,000." V2: OR(ISNULL(Opportunity__c), Opportunity__c.StageName = "Closed Lost"), message "A discount requires an Opportunity that is not Closed Lost." V3: AND(Request_Status__c = "Submitted", Line_Count__c = 0) using the roll-up from 7.1, message "A quote request cannot be Submitted without at least one line." V4: AND(ISPICKVAL(StageName), StageName = "Closed Won", ISPICKVAL(CloseDate), CloseDate < TODAY()), message "A Closed Won Opportunity must have a Close Date that is not in the past." V5: ISPICKVAL(Unit_Price__c) && Unit_Price__c <= 0, message "Unit price must be greater than zero." V6: AND(Account_Status__c = "Inactive", Open_Opportunity_Count__c > 0) with a cross-object roll-up. V1, V2, V4, V5 fire on both create and update; V3 and V6 also fire on both. Guards: ISNULL for lookups, ISPICKVAL for picklists/dates/currency.'
          },
          {
            t: 'case',
            title: 'The discount rule nobody could satisfy',
            org: 'Brightline Equipment',
            problem: 'Sales asked for a rule: a discount above 25% must be approved by the VP before it saves. The first implementation was a validation rule that simply blocked the save above 25%.',
            solution: 'A validation rule that blocks the save is only half the requirement - it says no but offers no route forward. Keep the validation rule to enforce the ceiling, and add an approval process for the exception path so a rep can submit and a VP can approve.',
            steps: [
              'Write the validation rule with a readable error message, not Error condition 1.',
              'Choose the error location deliberately - a rule on Discount_Percent__c highlights the field, a rule on a different field shows a page-level message.',
              'Build the approval process for the above-threshold case with entry criteria on the discount.',
              'Test both branches: a compliant save, and a non-compliant one that must be blocked.'
            ],
            gotcha: 'Their error message read "Error Condition 1" because they never edited the default. Users submitted tickets asking what it meant. A validation rule with a message that names the field, the limit and the next step is half the feature.',
            exam: 'Validation rules reject a save. Approval processes route a decision. If the requirement contains the word approved, you need an approval process - the validator alone will be marked wrong even though it prevents the bad data.'
          }
        ]
      },
      {
        title: 'Choosing between the declarative tools',
        mins: 7,
        blocks: [
          { t: 'p', x: 'Four tools look similar and do different jobs. Picking the wrong one produces something that works in testing and fails in production.' },
          {
            t: 'table',
            head: ['Tool', 'What it does', 'Cannot'],
            rows: [
              ['**Roll-up summary**', 'Computes a value from child records', 'Stop a save'],
              ['**Validation rule**', 'Rejects a save when a condition is true', 'Modify data; react to another record changing'],
              ['**Duplicate rule**', 'Stops two records matching a comparison rule', 'See another object; see fields changing on the same save'],
              ['**Workflow rule**', 'Field update, email, task, auto-assign — *after* save', 'Stop a save; run before save'],
              ['**Validation formula** (legacy)**', 'Only blocks a **specific field** becoming non-null', 'Conditionals; cross-object; deprecated'],
              ['**Flow**', 'Full automation, before or after save, multi-step', 'Stop a save (after-save flow)']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'The **legacy validation formula** is a genuine exam trap. It can only block one particular field from being populated. It cannot express "if A then B" or reference another object. For any conditional or cross-object check the answer is a **validation rule**.' },
          { t: 'h', x: 'Duplicate rules, specifically' },
          { t: 'list', items: ['Fires when a record being saved matches an **existing** record of the **same object**.', 'Matching can require the **same** or **different** values, and can be case-sensitive.', 'Matching can **ignore blank values**, or allow blanks to match blanks.', 'It sees only fields **on that object** — it cannot compare against another object, and it cannot reference fields that change as a side effect of this same save.'] },
          { t: 'h', x: 'Order of enforcement, and why it decides your tool' },
          { t: 'num', items: ['Before-save flows (can change values before rules see them).', 'Validation rules — reject the save.', 'Duplicate rules — reject the save.', 'Roll-ups recalculate.', 'Workflow rules run (field update, email, task, assign).', 'Record-triggered flows run.', 'Before-trigger Apex, commit, after-trigger Apex and record-triggered flows.'] },
          { t: 'selfcheck', q: 'A requirement says "prevent two Products having the same Part Number". Which single tool?', a: 'A **duplicate rule** matching on Part_Number__c with the same-value requirement. A validation rule cannot — it evaluates one record against field conditions, not against other records. Marking the field Unique also works and is arguably stronger, but a duplicate rule allows case-insensitive matching and can ignore blanks, which Unique cannot.' },
          {
            t: 'proj',
            id: '7.3',
            title: 'Build Brightline\'s integrity engine',
            obj: 'The roll-ups and rules that make the Lead-to-Cash data trustworthy.',
            stars: 3,
            reqs: [
              'Scenario: Quote_Request__c with Quote_Line__c children. Discount_Request__c referencing Opportunity. Contracts referencing Opportunities. Accounts with open opportunities.',
              'Specify SIX roll-up summary fields: object, child relationship, aggregate function, source field, return type, and the business question each answers.',
              'For at least two, explain why a formula could not do the job (Phase 6) and what the alternative would have been.',
              'Write EIGHT validation rules, each with a full error condition and a genuinely useful error message.',
              'At least two must be cross-object, and at least one must use a roll-up from your list of six.',
              'Write ONE duplicate rule: object, matching rule, same-vs-different values, and blank handling.',
              'For each of the eight rules, state whether it fires on create, update, or both.',
              'Write the note on what your rules CANNOT catch — at least two gaps and the declarative tool that closes each.',
              'State what happens to each roll-up if orphan records were enabled, and whether you recommend it.'
            ],
            success: 'A written integrity engine: six roll-ups with justified aggregates, eight complete rules with messages, one duplicate rule, and an honest list of what remains uncatchable declaratively. No Apex anywhere.'
          },
          {
            t: 'case',
            title: 'Automating a number that never changed',
            org: 'Brightline Equipment',
            problem: 'Is_Overdue__c on Quote_Request__c was built as a record-triggered flow so the checkbox would flip when the expiry date passed. Six months on, 400 quotes were showing the wrong answer.',
            solution: 'Replaced with a formula checkbox. A formula is evaluated on every save, so it cannot go stale, needs no automation to maintain, and is immediately filterable in reports and list views.',
            steps: [
              'Classify the requirement: is it a value derived from the record, or an action that must happen?',
              'For a derived value, build a formula and delete the flow.',
              'Confirm the field is now available as a report filter, which the flow-maintained version never was.',
              'Delete the now-redundant flow and check nothing else referenced it.'
            ],
            gotcha: 'The flow only ran on record save. A quote that simply sat there past its expiry date never re-saved, so the checkbox stayed FALSE forever. This is the classic staleness trap with trigger-based automation: automation runs when something happens, a formula is true whenever the record is read.',
            exam: 'Derived value on the same record means formula. Anything that must send, create, update or notify is automation. Getting this boundary right is most of the Business Logic domain.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'A quote request has 5 line items, 3 referencing the same Product. The business asks "how many DIFFERENT products?" Which roll-up aggregate is correct?',
          opts: ['COUNT', 'COUNT (Distinct) on the Product field', 'SUM', 'MIN'],
          a: 1,
          why: 'COUNT (Distinct) collapses duplicate values of the chosen field, giving 4 distinct products. Plain COUNT returns 5 — the number of line records, not the number of different products. SUM and MIN do not count anything. Distinct COUNT is one of the most frequently examined aggregates on the exam.'
        },
        {
          q: 'Which relationship is REQUIRED for a roll-up summary field?',
          opts: ['Any lookup relationship', 'A master-detail relationship', 'A hierarchical relationship', 'A lookup with the Delete restriction enabled'],
          a: 1,
          why: 'Roll-up summary fields aggregate over master-detail children only. That is why the aggregate is well-defined: the platform guarantees each child belongs to exactly one parent. A lookup relationship makes the roll-up unavailable entirely, not merely restricted.'
        },
        {
          q: 'What happens to a roll-up summary total if "Allow orphan records" is enabled and some children lose their parent?',
          opts: [
            'The roll-up counts them anyway, since they still exist',
            'The orphan children are silently EXCLUDED, so the total is wrong with no error',
            'The roll-up field errors and users cannot save',
            'The roll-up resets to zero and stays wrong'
          ],
          a: 1,
          why: 'The platform aggregates by parent, so a child with no parent belongs to no roll-up. Orphan records are silently excluded, leaving the total understated with nothing to indicate a problem. This is why enabling orphan records on a relationship that has roll-ups is dangerous.'
        },
        {
          q: 'A validation rule checks a value on a related Opportunity. Why is the ISNULL(Opportunity__c) guard important?',
          opts: [
            'It makes the rule evaluate faster',
            'It prevents a blank lookup from reaching the comparison, where the result would be unreliable on new records with no parent selected',
            'It is required for the rule to compile',
            'It converts the rule into a duplicate rule'
          ],
          a: 1,
          why: 'A blank lookup referenced in a comparison behaves unreliably, and it is the most common reason a cross-object rule "sometimes does not fire" — specifically on create, before the user has chosen a parent. Guarding with ISNULL makes the rule\'s behaviour predictable in both the selected and unselected cases.'
        },
        {
          q: 'Which TWO statements about a DUPLICATE rule are correct? (Choose all that apply.)',
          opts: [
            'It stops a record being saved when it matches an EXISTING record of the same object',
            'It can compare the record against a related object\'s fields',
            'It can require the same value or a different value, and can ignore blanks',
            'It is evaluated before validation rules'
          ],
          a: [0, 2],
          why: 'A duplicate rule compares the record being saved against existing records of the SAME object, and its matching rule can require same or different values, be case-sensitive, and ignore or match blank values. It cannot reference another object, so option 2 is wrong. Validation rules run BEFORE duplicate rules, so option 4 is wrong too.'
        },
        {
          q: 'What can a legacy validation FORMULA do that a validation RULE cannot?',
          opts: [
            'Nothing — it can only block one specific field from being populated',
            'It can reference fields on a related object',
            'It can compare the record against existing records',
            'It can reject a save based on a conditional'
          ],
          a: 0,
          why: 'The direction of that question is the trick: a legacy validation formula is far MORE limited than a rule. It can only prevent one particular field from becoming populated. It cannot express conditionals, reference related objects, or compare against other records. For any conditional or cross-object requirement the answer is a validation rule.'
        }
      ]
    }
  },
  {
    id: 'recordtypes',
    n: 8,
    title: 'Record Types & Business Processes',
    icon: '🎭',
    color: '#A855F7',
    tagline: 'Start the automation domain: the first thing in the logic domain (28% of the exam)',
    exam: 'logic',
    guide: '08-Record-Types-Business-Processes.md',
    objectives: [
      'Decide whether record types solve your problem, or whether they are the wrong tool',
      'Configure record types, page layout assignments, and business processes',
      'Explain what a business process does and how it differs from a flow',
      'Navigate the record type matrix and read a page layout assignment',
      'Explain how record types interact with sharing, picklists and business rules'
    ],
    art: [],
    lessons: [
      {
        title: 'Record types: what they are and when NOT to use them',
        mins: 7,
        blocks: [
          { t: 'p', x: 'A **record type** divides one object\'s records into categories that behave differently: different page layouts, different picklist values, different business processes, different assignment rules. It changes **how a record is handled**, not **what data it holds**.' },
          { t: 'h', x: 'What a record type can control' },
          {
            t: 'table',
            head: ['Configuration', 'What it does', 'Example'],
            rows: [
              ['Page layout assignment', 'Which layout each type uses', 'B2B Customer layout vs Retail Customer layout'],
              ['Business process', 'An inline guided process (Stage → Path)', 'New → Screening → Approval → Complete'],
              ['Picklist value sets', 'Restrict which picklist values each type sees', '"Standard" types see Net 30 only'],
              ['Assignment rules', 'Route records to the right owner', 'Enterprise vs SMB lead queues'],
              ['Active/inactive', 'Hide a type from the creation picker', 'Retire "Wholesale" after a reorg'],
              ['Default record type', 'Which type applies when none is chosen', 'The most common type'],
              ['Business rules (per type)', 'Restrict fields per record type', 'Required fields differ by type']
            ]
          },
          { t: 'callout', kind: 'warn', x: '**Record types do NOT change the object schema.** The same fields exist on all types of an object. A record type is not a field and not a security boundary in the record-access sense — it does not by itself control who can see records (Phase 2 handles that). People conflate these constantly.' },
          { t: 'h', x: 'The right tool for the job' },
          {
            t: 'table',
            head: ['If the need is…', 'Use', 'Not'],
            rows: [
              ['Records behave differently by category (layout, process, picklists)', '**Record type**', 'Separate objects (overkill)'],
              ['One field that differs by category', 'A **picklist** with values', 'Record types (heavier than needed)'],
              ['A guided set of stages on one object', 'Business **process**', 'A record type per stage (absurd)'],
              ['A guided path across a **custom** object', 'Business process (if available) or a **flow**', '—'],
              ['Users see completely different menus for different groups', 'Separate **apps**', 'Record types'],
              ['A field appears only for certain record types', 'Conditional **page layout** rules (Phase 12) plus record types', '—']
            ]
          },
          { t: 'p', x: 'Record types come in two flavours: **Master** and **Business** (for objects supporting them). Master record types are the full type definition; business record types are sub-types within a master used mainly for page layout and picklist restrictions on standard objects.' },
          { t: 'selfcheck', q: 'A company wants to track "Enterprise customers" and "SMB customers" with different fields and approval processes. Should these be two record types, two objects, or something else?', a: 'Two **record types** on the Account object. Same core fields, different page layouts and different business processes. Two separate objects would fragment reporting and duplicate standard Account behaviour; a single picklist could not drive layouts and processes. Record types are exactly for "one object, different handling by category".' },
          {
            t: 'ex',
            id: '8.1',
            title: 'Choose record type or something else',
            obj: 'Pick the lightest tool that solves the problem — record types are not the default answer.',
            stars: 2,
            steps: [
              'For each need, choose: RECORD TYPE, PICKLIST, BUSINESS PROCESS, APP, or a separate OBJECT. Give a one-sentence reason.',
              'N1: Customers are "Enterprise", "SMB" or "Partner", each with a different page layout and a different approval process.',
              'N2: An Opportunity has a simple two-stage guided path: Qualify → Close.',
              'N3: The Sales team and the Service team need completely different navigation menus.',
              'N4: A single field "Type" on Account with values Direct / Channel / Partner, used just for filtering in reports.',
              'N5: Quote requests are handled by two different teams, each needing different fields visible.',
              'For N1 and N5, name what a record type does that a picklist does not.'
            ],
            verify: 'N1 = RECORD TYPE (different layout + approval process per category is the definition of record type). N2 = BUSINESS PROCESS (a guided path on one object; a record type per stage would be absurd). N3 = APP (menus differ by user group — apps, not record types). N4 = PICKLIST (one field, used for filtering; no different handling needed). N5 = RECORD TYPE (different fields visible per team = different page layouts). What a record type does that a picklist cannot: assign a whole page layout, drive a business process, and drive assignment rules — a picklist value only stores data.'
          },
          {
            t: 'case',
            title: 'Five record types for one object',
            org: 'Brightline Equipment',
            problem: 'Support created a record type per customer segment - Retail, wholesale, distributor, government, OEM - so each segment got its own layout and picklist values. Six months on, no one could report on Opportunities across segments and new reps could not tell which type to use.',
            solution: 'Collapsed to two record types that reflect a genuine difference in PROCESS (Standard Sale, Contract Sale), and moved the segment distinction into a picklist field. Reporting and filtering became possible because segment was a value on one object rather than a record type on five.',
            steps: [
              'Ask what actually changes between the variants: different fields, different picklists, different approval path, or just a different label?',
              'If only values differ, that is a picklist field, not a record type.',
              'Reserve record types for a real process fork with its own layout and business rules.',
              'Re-point existing records and verify the reports now work across all of them.'
            ],
            gotcha: 'Record types fragment your data. Every report, list view and flow has to be built per type, and types multiply quietly until nobody can build anything new. This is the single most common record-type mistake, and the exam tests the distinction between a process difference and a data difference.',
            exam: 'When the requirement says the layout should show different fields depending on a value already on the record, the intended answer is Dynamic Forms - not record types. Record types are for when you genuinely cannot share one layout.'
          }
        ]
      },
      {
        title: 'Page layouts, picklists and business processes',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Once a record type exists, three things are wired to it: the **page layout**, the **picklist value set**, and the **business process** (where supported).' },
          { t: 'h', x: 'Page layout assignment per type' },
          { t: 'p', x: 'Each record type is assigned a page layout (or none). The layout determines which fields and sections appear. Two important rules:' },
          {
            t: 'list', items: ['If a record type has **no** layout assigned, records of that type open with the object\'s default layout.', 'A field **not on the assigned layout is hidden** for that type — but it is still on the object and still in reports. Hiding is not restricting.', 'Changing which layout a record type uses affects **all records of that type**, so test carefully before deploying.']
          },
          { t: 'callout', kind: 'warn', x: 'A record type does not make a field "required for this type" by itself. Required is per-object (Phase 4). To require a field **only for one record type**, use a **business rule** scoped to that record type — a separate declarative tool from validation rules (Phase 7).' },
          { t: 'h', x: 'Picklist value sets' },
          { t: 'p', x: 'A record type can restrict **which values of a picklist are available**. An Account of type "SMB" might only see "Net 30" for Credit Terms, while "Enterprise" sees "Net 30 / Net 60 / Net 90". The picklist values themselves are defined once on the object; the record type just filters which are visible for editing.' },
          { t: 'callout', kind: 'tip', x: 'Picklist value restriction **by record type is the clean declarative way** to make a field behave differently by category without duplicating the field or the object.' },
          { t: 'h', x: 'Business processes' },
          { t: 'p', x: 'A **business process** is a guided path of Stages (each a step) shown as a **path** on the record page. It replaces a free picklist for "status" on objects that support it (Opportunity, Lead, Case, and custom objects).' },
          {
            t: 'table',
            head: ['Concept', 'Meaning'],
            rows: [
              ['Stage', 'One step on the path (e.g. Qualify, Approve, Complete)'],
              ['Path', 'The ordered set of stages shown on the record'],
              ['Entry criteria', 'What must be true to enter a path (a formula)'],
              ['Business process', 'The record-type-assigned feature bundling path + stages']
            ]
          },
          { t: 'p', x: 'A business process differs from a flow: it is a **UI guide** showing where a record is and what is next. It does not itself send emails, update other records, or enforce logic beyond its entry criteria. That is flow\'s job (Phase 9).' },
          { t: 'callout', kind: 'warn', x: 'Not every object supports business processes. Opportunity, Lead and Case do; a custom object may or may not depending on org settings. When an object does not support them, a flow or a guided picklist does the job.' },
          { t: 'selfcheck', q: 'A business process shows "Qualify → Approve → Complete" on the record. Does it also send an email to the approver when a record reaches Approve?', a: 'No. A business process is a visual path guiding the user; it does not trigger actions. Sending an email at a stage change is automation — use a record-triggered flow (Phase 9) or a workflow rule (Phase 11).' },
          {
            t: 'ex',
            id: '8.2',
            title: 'Configure record types and layouts',
            obj: 'Build a record type configuration and explain each decision.',
            stars: 2,
            steps: [
              'For the Account object in Brightline, create two record types: "Enterprise" and "SMB".',
              'For each, state: assigned page layout (name it), and which two fields differ between them.',
              'Decide how Credit Terms__c (Net 30/60/90) is restricted so SMB sees only Net 30 and Enterprise sees all three. Name the exact feature.',
              'Explain whether making a field "required for Enterprise only" is done by record type, business rule, or validation rule — and why.',
              'Describe what a rep sees if a record has a record type with no page layout assigned.',
              'Explain the difference between a business process and a flow in one sentence each.'
            ],
            verify: 'Two record types each with an assigned layout. Fields differing: Credit Terms options and (say) an "Employees" or "Contract Terms" field relevant to enterprise. Credit Terms restriction uses a **picklist value set scoped per record type**. Required-for-one-type is done with a **business rule** scoped to that record type (a validation rule applies to all types unless further conditioned). A record type with no layout assigned falls back to the object default layout. A business process is a visual path/stage guide on the record; a flow is action automation that sends emails, updates records and runs logic.'
          },
          {
            t: 'case',
            title: 'The picklist that let reps invent territories',
            org: 'Brightline Equipment',
            problem: 'Territory__c on Opportunity was a free-text field. Reps typed "North East", "NE", "NorthEast" and "Northern", so territory reporting returned nine regions instead of three and the dashboard was useless.',
            solution: 'A restricted picklist with a value set, restricted further by record type to the territories that region is allowed to sell into. Free text becomes a closed list, and the restricted picklist becomes a business rule enforced by the platform.',
            steps: [
              'Replace the text field with a restricted picklist and define the value set.',
              'Set field-level restrictions per record type so each region sees only its own values.',
              'Clean up the existing free-text values before switching, or the existing rows will not match the picklist.',
              'Confirm new values can only be added by an admin, not by users.'
            ],
            gotcha: 'Switching a text field to a picklist fails on every record whose value is not in the value set - the deploy or save is rejected. Deduplicate the data first. This ordering dependency is what makes it a genuine gotcha rather than a settings change.',
            exam: 'Restricted picklists are a business process tool, not just a data-quality one. The order of operations - value set, then restrictions, then data cleanup - is examinable.'
          }
        ]
      },
      {
        title: 'Record types and the wider design',
        mins: 6,
        blocks: [
          { t: 'p', x: 'Record types touch more than layouts, and the exam likes to ask about the interactions.' },
          { t: 'h', x: 'Record types and sharing' },
          { t: 'p', x: 'A record type does **not** define who sees records — that is org-wide defaults, role hierarchy and sharing rules (Phase 2). However, a record type **can be part of a sharing rule criterion**, and **business rules / assignment rules can route records by type**. And because different types have different layouts, the same sharing can surface very different fields to different people.' },
          { t: 'callout', kind: 'tip', x: 'If a requirement is "only Enterprise reps can see Enterprise accounts", that is a **sharing rule filtered by record type**, not a record type setting. Record types create the category; sharing rules control access to it.' },
          { t: 'h', x: 'Record types and reports' },
          { t: 'p', x: 'Record type is a filterable field on every report and list view of the object. Good practice: include "Record Type" in list views where the categories matter operationally, otherwise users see a mixed list with no way to tell them apart.' },
          { t: 'h', x: 'Record types and the creation experience' },
          { t: 'list', items: ['One **active** record type can be the **default**, so the "new" button skips the type picker entirely.', 'Multiple active types show a **record type selection screen** when the user clicks "New".', 'Inactive types are hidden from the picker but existing records keep their type — so deactivating is a safe way to retire a category without breaking old data.', 'You cannot deactivate the default type until another is made default.'] },
          { t: 'selfcheck', q: 'A company wants to retire the "Wholesale" record type but keep historical Wholesale records intact. What is the safest action?', a: 'Set the Wholesale record type to **inactive**. It disappears from the creation picker (so no new Wholesale records) but all existing Wholesale records keep the type and their data. Deleting the record type would be a destructive change and is not what you want.' },
          {
            t: 'proj',
            id: '8.3',
            title: 'Design Brightline\'s record-type architecture',
            obj: 'The record-type and business-process layer the flow and approval phases build on.',
            stars: 3,
            reqs: [
              'Scenario: Brightline sells equipment to Enterprise and SMB customers, and to Partners (resellers). Quote requests and Opportunity both have status needs.',
              'Decide which objects get record types and which do not. Give the reason for each decision.',
              'For Account, specify the record types (names), and for each the assigned page layout and the two fields that differ.',
              'For Quote_Request__c, decide between a record type per team and a single status picklist. Explain the trade-off.',
              'Choose the picklist-value-set feature to restrict something per record type, and name what you restrict.',
              'Decide how "this field is required for Enterprise only" is enforced, and name the exact tool.',
              'Sketch a business process for Opportunity or Quote_Request__c: list the stages and the entry criteria.',
              'Write the record-type-and-sharing note: how would you restrict viewing to Enterprise reps only, and which Phase 2 tool does the actual work?',
              'Describe how to retire a record type later without breaking historical data.'
            ],
            success: 'A written record-type architecture: which objects get types and why, per-type layouts, picklist restrictions, the required-for-one-type mechanism, a business-process sketch, the sharing note, and the retirement plan. All declarative.'
          },
          {
            t: 'case',
            title: 'The layout that grew to nine tabs',
            org: 'Brightline Equipment',
            problem: 'The Opportunity page layout had accumulated nine sections and four tabs over two years. Reps complained the fields they needed daily were always below the fold, and every new field request made it worse.',
            solution: 'One page layout per genuinely different process, with a deliberate section order: identity and amount high, history and detail low. Fields that only matter to one record type moved into that record type\'s layout instead of cluttering the shared one.',
            steps: [
              'Decide the section order by how often the field is read, not by when it was added.',
              'Move detail fields to the bottom - they can be scrolled to, they cannot be un-noticed.',
              'Split only where the process genuinely differs; otherwise one layout with Dynamic Forms visibility rules.',
              'Prune fields nothing reads. Most long-lived layouts are carrying dead weight.'
            ],
            gotcha: 'Page layout changes do not affect Classic pages, so teams are often surprised that Classic users see the old arrangement. Conversely, hiding a field on a layout does not remove it from the API - it is still editable via Data Loader, so a hidden sensitive field still needs field-level security.',
            exam: 'Layout controls presentation only. Removing a field from a layout is not a security control; field-level security is. The exam pairs those two concepts deliberately.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'Which of these can a record type control? (Choose all that apply.)',
          opts: [
            'Which page layout the record uses',
            'Which values of a picklist are available',
            'Who can see the record',
            'Which business process / stage path applies'
          ],
          a: [0, 1, 3],
          why: 'A record type assigns a page layout, restricts picklist values, and drives a business process / stage path — plus assignment rules. It does NOT control who can see a record; that is org-wide defaults, role hierarchy and sharing rules. Record type can be a criterion in a sharing rule, but the sharing rule does the actual access control.'
        },
        {
          q: 'You need a field to be REQUIRED only for "Enterprise" record type, not for "SMB". Which is the correct declarative tool?',
          opts: [
            'Mark the field Required on the object (this makes it required for all types)',
            'A business rule scoped to the Enterprise record type',
            'A validation rule with an ISBLANK check (this applies to all types)',
            'A duplicate rule on the field'
          ],
          a: 1,
          why: 'Required on the object applies to every record type. A validation rule would also apply across all types unless further conditioned, and cannot be limited to one type as a first-class concept. The intended tool is a **business rule scoped to a specific record type**, which is exactly the per-type requirement mechanism.'
        },
        {
          q: 'What does a business process provide that a flow does NOT?',
          opts: ['The ability to send emails and update records', 'A guided visual path of stages shown on the record page', 'The ability to route records to owners', 'The ability to enforce entry criteria'],
          a: 1,
          why: 'A business process is a visual guide — a path of stages shown on the record — and it can gate entry to a path with criteria. It does NOT send emails, update other records, or do multi-step action logic; that is what a flow is for. The other three options describe flow behaviour, not business process.'
        },
        {
          q: 'A business process shows "Qualify → Approve → Complete". Does it send an email to the approver at the Approve stage?',
          opts: [
            'Yes, business processes notify the next stage owner automatically',
            'No — a business process is a visual path; notification is automation done by a flow or workflow rule',
            'Yes, but only if the record type is active',
            'Yes, via the record type assignment rule'
          ],
          a: 1,
          why: 'A business process is purely a visual guide showing where the record is and what is next; it does not trigger actions. Emailing an approver when a stage changes is automation, done by a record-triggered flow (Phase 9) or a workflow email alert (Phase 11).'
        },
        {
          q: 'A rep opens an Account of a record type that has NO page layout assigned. What layout do they see?',
          opts: [
            'None — the record opens blank',
            "The object's default page layout",
            'The layout assigned to the default record type only if this is the default type',
            'A blank layout with only the record name'
          ],
          a: 1,
          why: 'If a record type has no page layout assigned, records of that type fall back to the object\'s **default page layout**. The record never opens blank; the default layout applies. This matters because "no layout assigned" means "use default", not "hide fields".'
        },
        {
          q: 'What is the safest way to retire a record type while keeping historical records intact?',
          opts: [
            'Delete the record type and reassign its records to another type first',
            'Set the record type to INACTIVE — it disappears from the creation picker but existing records keep the type',
            'Rename the record type to "Legacy"',
            'Remove the record type from all page layout assignments'
          ],
          a: 1,
          why: 'Deactivating hides a type from the "New" record picker so no more are created, while all existing records keep their type and data intact. Deleting is a destructive change you specifically do not want here. You also cannot deactivate the default type until another is set as default.'
        }
      ]
    }
  },
  {
    id: 'flows',
    n: 9,
    title: 'Flow Automation',
    icon: '⚡',
    color: '#0EA5E9',
    tagline: 'The declarative automation engine — and the biggest topic on the exam',
    exam: 'logic',
    guide: '09-Flow-Automation.md',
    objectives: [
      'Name the three flow types and pick the right one from the requirement',
      'Design entry conditions, decision elements and loops without creating infinite runs',
      'Configure a record-triggered flow, including the before-save variant',
      'Configure a scheduled flow and a scheduled path for time-based automation',
      'Explain flow transaction behaviour, and what "fault" and error paths are for',
      'Debug a flow: run history, the flow debugger, and testing a flow safely'
    ],
    art: [],
    lessons: [
      {
        title: 'The three flow types',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Flow is the declarative automation engine, and it replaced workflow rules and approval processes (Phases 10–11 keep those for exam knowledge). Three types cover everything.' },
          {
            t: 'table',
            head: ['Type', 'When it runs', 'Runs in', 'Can block the save?'],
            rows: [
              ['**Record-triggered**', 'When a record is created or updated', 'After save (after-commit)', 'No'],
              ['**Record-triggered — before save**', 'When a record is created or updated, before the record is committed', 'Before save (fast field updates)', '**Yes — can reject**'],
              ['**Scheduled**', 'At a set time (once, or repeating)', 'After commit, in its own transaction', 'No']
            ]
          },
          { t: 'p', x: 'There is also the **Autolaunched flow**, invoked by another flow or process, and the **event-driven** variant (Platform Event–triggered). On the exam, the three above plus autolaunched cover essentially everything.' },
          { t: 'h', x: 'Record-triggered: the core pattern' },
          { t: 'num', items: ['**When** — the trigger: Record Created and/or Updated, and any entry conditions.', '**Find matching records** — optional: a "Get Records" so the flow can look up related data.', '**Elements** — Decisions, Assignments, Updates, Tasks, Emails, Subflows, and the rest.', '**End** — where the run finishes.'] },
          { t: 'p', x: 'The classic exam question is the **entry condition**, so get its logic exactly right.' },
          {
            t: 'table',
            head: ['Requirement', 'Entry condition'],
            rows: [
              ['Only on **create**', 'Trigger = Record Created only. No formula needed.'],
              ['Only when a field becomes a certain value', 'Record Created **and** Updated, *plus* \`Trigger__c = "Approved"\`'],
              ['Only when it **changes to** that value', 'Record Created and Updated, *plus* \`AND(ISCHANGED(Trigger__c), Trigger__c = "Approved")\` (this also runs on **create**, where ISCHANGED is TRUE — add \`$Record.CreatedDate\` handling if that matters)'],
              ['Only when **several** fields agree', 'One \`AND(...)\` combining every clause'],
              ['Only when **any one** of several applies', 'One \`OR(...)\` combining every clause'],
              ['Runs on every save, no filter', 'Trigger = Created and Updated, entry condition **blank**']
            ]
          },
          { t: 'callout', kind: 'warn', x: '**"Only when it changes to X" and "only when it is X" are different requirements.** The second fires repeatedly whenever the record is saved with that value already set — including an unrelated field edit, and including a flow that updates another field, causing a second run. \`ISCHANGED()\` is how you separate them.' },
          { t: 'selfcheck', q: 'A flow should create a task when a Quote_Request__c moves to "Approved". Which trigger and entry condition?', a: 'Trigger on Record Created **and** Record Updated, entry condition \`AND(ISCHANGED(Request_Status__c), Request_Status__c = "Approved")\`. Using only the value test means the task is recreated every time the record is saved for any reason. Using ISCHANGED limits it to the save that actually changed the status.' },
          {
            t: 'ex',
            id: '9.1',
            title: 'Trigger and entry conditions',
            obj: 'Read a requirement and write the exact trigger and entry condition.',
            stars: 2,
            steps: [
              'For each, state the trigger type (record-triggered, before-save record-triggered, or scheduled) and the exact entry condition formula.',
              'F1: When a new Lead is created, and its Country is not blank, create a task for the owner.',
              'F2: When a Quote_Request__c status changes to "Submitted" (not merely while it is Submitted), set Request_Submitted_Date__c to today.',
              'F3: When a Quote_Request__c is saved and its status is "Submitted", prevent the save and show an error if it has zero lines.',
              'F4: Every night at 2am, find all Quote_Request__c that have been "Submitted" for more than 7 days and mark them Expired.',
              'F5: When an Account changes to "Inactive", and only then, notify the owner.',
              'For F2 and F5, explain what happens if you drop ISCHANGED().'
            ],
            verify: 'F1: record-triggered, Created only, entry `NOT(ISBLANK(Country))`. F2: record-triggered, Created and Updated, `AND(ISCHANGED(Request_Status__c), Request_Status__c = "Submitted")`. F3: BEFORE-save record-triggered, Created and Updated, entry `Request_Status__c = "Submitted"`, then a Decision checking `Line_Count__c = 0` leading to a Fault with the message. F4: scheduled flow, scheduled once daily at 2am, Get Records where `Request_Status__c = "Submitted"` and `Request_Submitted_Date__c <= TODAY() - 7`. F5: record-triggered, Created and Updated, `AND(ISCHANGED(Account_Status__c), Account_Status__c = "Inactive")`. Without ISCHANGED in F2, saving the record for any reason — even an unrelated field edit, or a flow updating another field — retriggers the assignment. In F5 the owner would be notified on every save of an inactive Account.'
          },
          {
            t: 'case',
            title: 'Four flows doing one job',
            org: 'Brightline Equipment',
            problem: 'Sales Ops reported that lead assignment was "random". Investigation found four separate record-triggered flows on Lead, each with its own criteria, each assigning to a different queue - built over two years by three different people.',
            solution: 'Consolidated into one record-triggered flow with a single decision chain that evaluates source, then region, then territory, and falls back to the default queue. Assignment became predictable and there was one flow to maintain instead of four.',
            steps: [
              'List every automation currently touching the object. Use Setup > Flow, not memory.',
              'Decide which one is the decision authority and delete or narrow the others.',
              'Order the decisions from most specific to least, with a final default path so no lead is left unassigned.',
              'Test with one record per branch, plus one that matches nothing.'
            ],
            gotcha: 'Multiple flows on the same object run in an order that is not obvious and not something to rely on. When two both assign, the outcome is effectively arbitrary. Automation sprawl is a design problem, not a bug - and consolidating is often the real answer to "it is not working".',
            exam: 'Screen flow is for user-initiated work with screens. Record-triggered is for automatic before-save and after-save. Scheduled is for batch at a set time. Choosing the wrong one for the job is a common wrong answer.'
          }
        ]
      },
      {
        title: 'Elements, decisions, loops and transactions',
        mins: 9,
        blocks: [
          { t: 'p', x: 'A flow is a sequence of **elements**. You need to know what each does and, more importantly, how flows behave when something goes wrong.' },
          { t: 'h', x: 'The elements you must recognise' },
          {
            t: 'table',
            head: ['Element', 'Purpose', 'Exam note'],
            rows: [
              ['**Decision**', 'Branch on a formula', 'A rule with multiple outcomes; there is a default outcome'],
              ['**Assignment**', 'Set a field or variable', 'Can set the record, a related record, or a variable'],
              ['**Update Records**', 'Save field changes', 'The one to use for cross-record updates'],
              ['**Get Records**', 'Query records and store them', 'The declarative substitute for SOQL'],
              ['**Create Records**', 'Insert new records', '—'],
              ['**Loop**', 'Repeat over a collection', 'Can hit the flow-element limit'],
              ['**Subflow**', 'Call another flow', 'Reusable logic; passes variables in and out'],
              ['**Fault**', 'Surface an error to the user', '**Only works in before-save flows**'],
              ['**Wait**', 'Pause the run', 'Only in scheduled and autolaunched flows'],
              ['**Custom Error**', 'Define a named error', 'A Fault can reference it'],
              ['**Roll Back Records**', 'Undo all records created in this transaction', 'Available only in record-triggered flows']
            ]
          },
          { t: 'callout', kind: 'warn', x: '**The Fault element only works in a before-save record-triggered flow.** In an after-save flow the record is already committed — there is nothing to stop. This is the single most examined flow limitation.' },
          { t: 'h', x: 'Loops and the element limit' },
          { t: 'p', x: 'A flow run is limited to **50 elements**. A Loop that iterates a large collection burns elements one per iteration, so a loop over 60 records can exhaust the limit mid-run and the transaction rolls back. Design loops to process small, bounded collections — aggregate first with a roll-up, then act.' },
          { t: 'callout', kind: 'tip', x: 'Roll Back Records is the declarative safety net: if a flow creates five records and the sixth fails, Roll Back Records removes all five, so you never keep a partial set.' },
          { t: 'h', x: 'Transactions: the mental model' },
          { t: 'p', x: 'A flow run is **one transaction**. Everything either succeeds together or is rolled back together. Two consequences drive most flow design decisions:' },
          {
            t: 'num', items: ['A record-triggered flow that updates a record can **re-trigger itself**. Guard the update with \`ISCHANGED()\`, or check that the new value differs from the old.', 'A before-save flow operates in the **fast field update** transaction: field updates are allowed, but you cannot create related records, and the user sees the record is in flux.', 'A before-save flow has **no access to record IDs** for newly created records yet, so an element that needs an ID must be an after-save flow.']
          },
          { t: 'code', lang: 'formula', x: "// Self-retrigger guard - the most useful pattern in flow\nTrigger: Quote_Request__c, Created and Updated\nEntry: AND(\n  ISCHANGED(Request_Status__c),\n  Request_Status__c = \"Approved\"\n)\n\n// inside the flow, an Update on the SAME record is safe because\n// the entry condition now fails: ISCHANGED(Request_Status__c)\n// is FALSE when the flow's own update did not touch that field." },
          { t: 'selfcheck', q: 'A record-triggered flow on Opportunity updates Amount whenever Stage becomes "Closed Won". Users report the Amount is sometimes wiped. Why?', a: 'The flow fires, then an element sets Amount — likely from a variable or a null value — and the update writes that blank over the real amount. Two usual causes: the flow is reading Amount from a Get Records that returned nothing, or it assigns an empty collection. Fix by guarding the assignment with a null check, and by using Roll Back Records so a partial run does not leave the record half-updated.' },
          {
            t: 'ex',
            id: '9.2',
            title: 'Design the elements of a flow',
            obj: 'Choose the right element for each step and defend the design.',
            stars: 2,
            steps: [
              'For each flow, list the elements in order and name each one\'s type.',
              'E1: Get the Account for this Opportunity, and if its Credit Terms are "Net 90", create a task on the owner to review credit.',
              'E2: Update every Quote_Request__c with status "Draft" and a requested date more than 30 days ago, setting status to "Expired".',
              'E3: For each Quote_Line__c belonging to one request, copy the parent\'s Request_Status__c onto the line.',
              'E4: In a before-save flow, reject the save with a message when the Quantity is zero.',
              'For E1, state which element does the lookup and which does the branching.',
              'For E3, name the element and the limit you must respect.',
              'For E4, explain why a before-save flow is the only one that can do this.'
            ],
            verify: 'E1: Get Records (lookup the Account) → Decision (check Credit_Terms__c = "Net 90") → Create Records (the task). The Get is the lookup, the Decision is the branching — two different elements. E2: Get Records (all Draft lines older than 30 days) → Update Records. No loop needed. E3: Get Records (the child lines) → Loop → Update Records (set Request_Status__c on each). The element that repeats is Loop, and the limit is the 50-element cap: one Loop iteration plus one Update per line means roughly 48 lines max, so this design only works for a quote with a small number of lines. For a large request, aggregate with a roll-up on the parent instead. E4: a Fault element, which only functions in a before-save record-triggered flow — after save the record is already committed and cannot be rejected.'
          },
          {
            t: 'case',
            title: 'The approval email that never arrived',
            org: 'Brightline Equipment',
            problem: 'When a rep submitted a Quote_Request__c for approval, no notification reached the approver. The approval itself worked - the record did enter Submitted status - but the approver only found it by opening the approval list every morning.',
            solution: 'Added an action in the flow that fires when the record enters the waiting-for-approval state, creating a Task and emailing the assigned approver. The notification is part of the same transaction as the status change, so it cannot drift out of sync.',
            steps: [
              'Set the flow to start on the status change that indicates approval is required, not on every save.',
              'Add an action to notify the approver, choosing email plus a Task for a durable record.',
              'Resolve the approver from the record rather than hardcoding a user, so it follows reassignment.',
              'Test the rejection path too - the rep must be told, not just the approver.'
            ],
            gotcha: 'They first tried to trigger on every record save, which meant an email on every keystroke-level edit during an approval and users turned notifications off entirely. Trigger on the meaningful transition, not on save. A flow that emails too much gets muted, and then it is worse than no automation at all.',
            exam: 'Actions in a flow - create record, update record, email, task - are what make it do something. The exam asks which action type matches the requirement: send a message is an email action, create a follow-up is a Task, update a related record is an Update action.'
          }
        ]
      },
      {
        title: 'Scheduled flows, debugging, and flow vs everything else',
        mins: 8,
        blocks: [
          { t: 'h', x: 'Scheduled flows and scheduled paths' },
          { t: 'p', x: 'A **scheduled flow** runs at a time you choose — once, or on a repeating schedule (daily, weekly). It starts from a scheduled trigger, then usually Get Records → update them.' },
          { t: 'p', x: 'A **scheduled path** is different: it belongs to a **record-triggered flow or approval process**, and it fires on a *record* after a waiting period on a particular branch. Time is measured **from when the record entered the path**, not from the flow start. Waiting elements exist only in scheduled and autolaunched flows.' },
          { t: 'callout', kind: 'warn', x: 'A scheduled flow runs in the **system context** — it sees all records regardless of sharing, and it runs as the automated process user. Sharing rules do not limit it. That is what makes it able to expire stale quotes, and also why it must be written carefully.' },
          { t: 'h', x: 'Debugging a flow' },
          { t: 'num', items: ['**Flow Runs** — the run history. Read the status: Finished, Failed, Waiting, Paused.', '**Error message** — a failure usually names the element and the reason (e.g. a required field is null, or too many elements).', '**The flow debugger** — step through a run, see each element\'s outcome and the data at that point.', '**Test with a scratch record** — never test on real production data, and always test the *failure* paths, not just the happy path.'] },
          { t: 'callout', kind: 'tip', x: '"Flow is in an error state" on a record means the flow **failed and stopped**. The record itself is fine. Check Flow Runs for the failing element — most often a null required field or an exceeded element limit.' },
          { t: 'h', x: 'Flow vs the other automation tools' },
          {
            t: 'table',
            head: ['Requirement', 'Tool'],
            rows: [
              ['Stop a save because this record is invalid', '**Validation rule** (Phase 7)'],
              ['Change a field value before save', '**Before-save flow**, or a formula field'],
              ['React to a save on another record, after commit', '**Record-triggered flow**'],
              ['Do something at a specific time, or on a schedule', '**Scheduled flow** or **scheduled path**'],
              ['Multi-step business approval with steps and approvers', '**Approval process** (Phase 10)'],
              ['Simple field update or email alert on save', '**Workflow rule** (Phase 11) — legacy, but still examinable'],
              ['Logic no declarative tool covers', '**Apex trigger** (rare, and a sign to rethink)']
            ]
          },
          { t: 'selfcheck', q: '"When a quote is not answered within 7 days, expire it." Flow, scheduled flow, or scheduled path?', a: 'Both work, and the exam accepts either with a correct trigger. A **scheduled flow** running nightly finds all Submitted quotes older than 7 days in bulk — simpler and easier to test. A **scheduled path** on a record-triggered flow fires 7 days after each individual record enters the path, which is more precise but creates one pending scheduled action per quote. Choose the scheduled flow for a bulk sweep.' },
          {
            t: 'proj',
            id: '9.3',
            title: 'Build Brightline\'s automation layer',
            obj: 'The flows that carry a quote from submitted to contracted, with no Apex.',
            stars: 3,
            reqs: [
              'Scenario: Quote_Request__c with Quote_Line__c children, Discount_Request__c on Opportunity, Contract on Opportunity. Phase 7 gave you the roll-ups and rules.',
              'Design FIVE flows. For each: name, type (record-triggered / before-save / scheduled / autolaunched), trigger, exact entry condition, and the ordered list of elements.',
              'At least one must be a before-save flow, and at least one a scheduled flow.',
              'At least one must use a Decision, and at least one must use Get Records to look up a related record.',
              'For every flow that updates the record it is triggered on, state the exact guard that prevents self-retrigger, and why that guard works.',
              'Add a Roll Back Records explanation for one flow: what partial data would otherwise survive a failure?',
              'Choose ONE flow to write as an autolaunched flow instead, and justify the choice (reuse, not logic).',
              'Name the two flows that must NOT overlap with your Phase 7 validation rules, and explain why each belongs to flow rather than a rule.',
              'Write the debugging plan: where you look when a run fails, and the two failure paths you will deliberately test.',
              'For each flow, note one scenario where the flow could loop or run twice, and the guard you added.'
            ],
            success: 'Five fully specified flows with exact triggers, entry conditions and element lists; explicit self-retrigger guards; a Roll Back Records rationale; a justified autolaunched flow; and a testing plan that includes failure paths. No workflow rules used as a shortcut, no Apex.'
          },
          {
            t: 'case',
            title: 'The nightly job that chased its own tail',
            org: 'Brightline Equipment',
            problem: 'A scheduled flow marked overdue Quote Requests as Closed every night at 2am. Users then manually reopened them during the day, and the next night it closed them again. The report was right for eight hours a day and wrong for sixteen.',
            solution: 'Stopped writing status at all. Expiry_Status__c became a formula derived from Expiry_Date__c and TODAY(), so it is correct at the moment of reading rather than correct only after the nightly batch. The scheduled flow was deleted.',
            steps: [
              'Decide whether the value is a FACT about the record or an EVENT that happened.',
              'A fact derived from dates is a formula - always current, no job to run, filterable in reports.',
              'An event (a notification sent, a record created) is automation and needs a trigger.',
              'Delete the scheduled flow and verify no report depended on the job having run.'
            ],
            gotcha: 'Scheduled flows are for batch work - recalculating aggregates, generating records, sending digests. They are the wrong tool for keeping a field in sync, because the field is wrong between runs. This is the most common misuse of scheduled paths.',
            exam: 'If the requirement says the value must be correct whenever a user looks at it, it is a formula. If it says something must happen on a schedule, it is a scheduled flow.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'Which flow type can REJECT a save and show an error to the user?',
          opts: ['Record-triggered flow (after save)', 'Record-triggered flow configured as BEFORE save', 'Scheduled flow', 'Autolaunched flow'],
          a: 1,
          why: 'Only a **before-save record-triggered flow** runs before the record is committed, so a Fault element can stop the save and surface a message. An after-save record-triggered flow runs on a record that is already committed — there is nothing left to reject. Scheduled and autolaunched flows are likewise after-commit.'
        },
        {
          q: 'A flow must create a task only when a status CHANGES to "Approved", not on every save while the status is Approved. Which entry condition?',
          opts: [
            'Trigger on Created only, no entry condition',
            'Created and Updated, entry `Request_Status__c = "Approved"`',
            'Created and Updated, entry `AND(ISCHANGED(Request_Status__c), Request_Status__c = "Approved")`',
            'Created and Updated, entry `ISNULL(Request_Status__c)`'
          ],
          a: 2,
          why: 'Testing the value alone (`Status = "Approved"`) fires on every save of an already-approved record, including unrelated field edits and updates from other flows. `ISCHANGED()` restricts the run to the save that actually changed the field. Note this condition is also TRUE on create, which is why it can behave as "created or changed to Approved".'
        },
        {
          q: 'What is the element limit for a single flow run, and what happens when it is exceeded?',
          opts: [
            '100 elements; the extra elements are skipped',
            '50 elements; the transaction rolls back and the run is marked as failed',
            '1,000 elements; the flow is paused for review',
            'There is no limit for record-triggered flows'
          ],
          a: 1,
          why: 'A flow run is limited to **50 elements**. Exceeding it fails the run and rolls back the transaction. This is why a Loop over a large collection is risky — each iteration consumes elements — and why you aggregate with a roll-up before acting.'
        },
        {
          q: 'Which statement about the Fault element is correct?',
          opts: [
            'It can stop any save, in any flow type',
            'It can only surface an error in a before-save record-triggered flow',
            'It only works in scheduled flows',
            'It rolls back all records created by the flow'
          ],
          a: 1,
          why: 'A Fault element surfaces an error and stops the run, but it only functions in a **before-save record-triggered flow** — after save there is no transaction left to stop. Undoing partial work is the job of the separate **Roll Back Records** element, not the Fault.'
        },
        {
          q: 'A record-triggered flow updates the record it is triggered on. What is the standard way to stop it re-triggering itself?',
          opts: [
            'Set the flow to run only on Record Created',
            'Add an ISCHANGED() guard to the entry condition so a re-run that did not change the watched field does not satisfy it',
            'Add a Decision that checks the value did not change, at the end of the flow',
            'Turn off the flow activation'
          ],
          a: 1,
          why: 'The entry condition is the gate for the whole run, so it is the right place to stop a self-retrigger. `ISCHANGED()` is FALSE when the flow\'s own update did not modify the watched field, so the second run never starts. Checking at the end still incurs a run, an extra transaction and an extra element count.'
        },
        {
          q: 'Which TWO statements about a scheduled flow are correct? (Choose all that apply.)',
          opts: [
            'It runs at the time and frequency you define, once or repeating',
            'It runs in the system context, seeing all records regardless of sharing',
            'It can reject a save using a Fault element',
            'It must be attached to a record-triggered flow to run'
          ],
          a: [0, 1],
          why: 'A scheduled flow starts from a scheduled trigger at a defined time and frequency, and runs in the **system context** — it is not limited by sharing rules, which is what lets it sweep stale quotes org-wide. It cannot reject a save (Faults need a before-save record-triggered flow), and it runs independently of any record-triggered flow.'
        }
      ]
    }
  },
  {
    id: 'approvals',
    n: 10,
    title: 'Approval Processes',
    icon: '✅',
    color: '#22C55E',
    tagline: 'Multi-step human sign-off, with locking, rejection and resubmission',
    exam: 'logic',
    guide: '10-Approval-Processes.md',
    objectives: [
      'Build an approval process with entry criteria, criteria, steps and a final approver',
      'Choose between a user approver, a queue, and a manager or role hierarchy approver',
      'Explain field locking, and what happens on submit, approve, reject, recall and cancel',
      'Design multiple approval processes on one object and explain the order they run in',
      'Combine approval processes with flows without them duplicating each other',
      'Configure email alerts and a wizard for a complete approval experience'
    ],
    art: [],
    lessons: [
      {
        title: 'The building blocks',
        mins: 8,
        blocks: [
          { t: 'p', x: 'An approval process lets **people** approve a record. Flow automates; an approval process asks a human to decide. On the exam, knowing which one a requirement calls for is half the marks.' },
          { t: 'h', x: 'The pieces' },
          {
            t: 'table',
            head: ['Piece', 'What it does'],
            rows: [
              ['**Entry criteria**', 'Decides whether an approval request **can be created** on a record at all. A formula.'],
              ['**Criteria**', 'Decides whether this **process** applies to a record being submitted. A formula.'],
              ['**Initial submitter**', 'Who creates the request — usually the record owner.'],
              ['**Approver**', 'Who decides. Can be a user, a queue, a related user, a manager, or a role hierarchy member.'],
              ['**Step**', 'One level in a multi-step approval, each with its own approver and fields.'],
              ['**Final approver**', 'The last step. On final approval the fields on the approval layout are **locked**.'],
              ['**Approval layout**', 'The page layout approvers see. Its fields are locked on final approval.'],
              ['**Approval history**', 'The related list on the record: who did what, when, and any comments.'],
              ['**Initial submission actions**', 'Record actions, email alerts, tasks and field updates on submit.'],
              ['**Final approval actions**', 'Record actions, tasks, email alerts and field updates on final approval.'],
              ['**Outbound message**', 'An email template sent at a step. Named, and reusable.'],
              ['**Wizard**', 'The guided popup for selecting approvers on submit. Optional but expected.'],
              ['**Allow recall**', 'Submitter can pull it back before anyone decides.'],
              ['**Allow cancel**', 'Submitter can end it outright.'],
              ['**Allow submission by the creator**', 'If off, the record creator cannot approve their own request.']
            ]
          },
          { t: 'h', x: 'Three ways to pick the approver' },
          {
            t: 'table',
            head: ['Approver type', 'Who it resolves to', 'Use when'],
            rows: [
              ['**Specify users** (a queue)', 'Named users, all of whom can act, first to act wins', 'A role like "any of the three Finance Directors"'],
              ['**Let the submitter choose** (a queue + wizard)', 'One person picked at submit time', 'The right approver depends on the case'],
              ['**Specify a user related to the record**', 'The Owner, the Manager on a related object, a field value', 'The natural approver is already on the record'],
              ['**Use a manager or role hierarchy**', 'The submitter\'s manager, or a level of the role hierarchy', 'Any manager can approve, whoever they are']
            ]
          },
          { t: 'callout', kind: 'tip', x: '**\`${!User.Id}\`** in the approver formula means "the Opportunity Owner" — the manager field on the related record. It is the standard way to say "the person who owns the deal approves it".' },
          { t: 'selfcheck', q: 'Any one of three regional Finance Directors may approve, and whoever acts first wins. Which approver type?', a: '**Specify users** with all three added as a single approver queue. Any of them can act and the first decision resolves it. A role hierarchy or a manager would be wrong, because neither restricts to that specific set of three.' },
          {
            t: 'ex',
            id: '10.1',
            title: 'Design four approval processes',
            obj: 'Specify each requirement as a real approval process configuration.',
            stars: 2,
            steps: [
              'For each: object, entry criteria, criteria, approver type, approval layout, and whether a final approver applies.',
              'A1: A Discount_Request__c for 5000 USD or less goes to the Opportunity Owner for a yes/no.',
              'A2: A Quote_Request__c whose Total_Value__c exceeds 100000 must be approved by the VP Finance.',
              'A3: A Quote_Request__c above 250000 needs three named sign-offs in order: Sales Manager, Finance Director, then the VP.',
              'A4: An Opportunity may have any discount approved, and the rep picks which manager signs it off at submit time.',
              'For A1, say whether a rejected request can be edited and resubmitted, and why.',
              'For A2, name the extra field it consumes from Phase 7.',
              'For A3, state how many custom fields you add and why more than one.'
            ],
            verify: 'A1: object Discount_Request__c, entry criteria none, criteria AND(Amount__c <= 5000, Amount__c > 0), approver = specify the user related to the record (the Opportunity Owner, ${!User.Id}), approval layout with Amount__c and a comments field, final approver yes (one step is final). Reject then edit then resubmit is allowed because the criteria depend on fields the requester can change. A2: object Quote_Request__c, entry criteria none, criteria Total_Value__c > 100000, approver = specify the user (VP Finance), approval layout, final approver yes. The extra Phase 7 field is the SUM roll-up Total_Value__c — without it the threshold would drift from the real quote value. A3: object Quote_Request__c, criteria Total_Value__c > 250000, three steps each with its own approver, and three separate comment fields (Approval_1_Comments__c, Approval_2_Comments__c, Approval_3_Comments__c) plus a Final_Approver__c. More than one field because a single shared comments field cannot hold three independent approvers\' decisions — the second approver would overwrite the first.'
          },
          {
            t: 'case',
            title: 'Three approvers, one decision',
            org: 'Brightline Equipment',
            problem: 'Discounts over 25% needed sign-off. The first design built three separate approval processes - one for 25%, one for 40%, one for 60% - which meant reps had to guess which queue to submit to and approvers rarely knew their threshold.',
            solution: 'One approval process with entry criteria on Requested_Discount__c, and the step assigned dynamically to the approver for that band. One queue, one process, and the criteria decide who acts.',
            steps: [
              'Build ONE approval process on the object with entry criteria that capture the whole range.',
              'Assign the step to a dynamic user reference rather than a fixed person, so it survives people leaving.',
              'Set "allow submission" so the rep can save while waiting instead of being locked out.',
              'Decide what approval actually CONTROLS - which field or status cannot change until it is approved.'
            ],
            gotcha: 'Without allow submission, the rep cannot save edits to a record that is locked in an approval, and they work around it by keeping data in email or spreadsheets. Always enable it unless there is a specific reason not to.',
            exam: 'Approval processes are built from named components: process definition, steps, step approvers, entry criteria, and field updates. A question that lists these is asking you to identify which component is missing.'
          }
        ]
      },
      {
        title: 'Lifecycle: submit, approve, reject, recall, cancel',
        mins: 8,
        blocks: [
          { t: 'p', x: 'This is where exam questions concentrate, because the locking rules are counter-intuitive.' },
          {
            t: 'table',
            head: ['State', 'Who can act', 'Fields on the approval layout'],
            rows: [
              ['**Draft**', 'Requester', 'Editable'],
              ['**Submitted**', 'Approver', 'Read-only for the approver (nothing decided yet)'],
              ['**Approved (final)**', 'Nobody, plus an admin', '**Locked**'],
              ['**Rejected**', 'Requester', '**Editable** — then resubmit'],
              ['**Recalled**', 'Requester', 'Editable, effectively back to draft'],
              ['**Cancelled**', 'Nobody', 'Terminal. No further action.'],
              ['**Resubmitted**', 'Next approver', 'Read-only again']
            ]
          },
          { t: 'callout', kind: 'warn', x: '**Once finally approved, the fields on the approval layout are locked.** That is the entire point: the approval certified those values, so they must not change afterwards. Every other field stays editable. And an **admin** can always unlock with Manage Users permission, which is audited.' },
          { t: 'h', x: 'The three limits everyone gets wrong' },
          { t: 'num', items: ['A record can be **submitted three times**. After that the only options are recall or cancel.', 'Once **finally approved**, the record cannot be recalled. Approval is final.', '**Rejected** is not terminal — the submitter edits and resubmits, and the whole approval restarts.'] },
          { t: 'h', x: 'Multiple processes on one object' },
          { t: 'p', x: 'You can attach several approval processes to one object, and they are evaluated in a defined order. The exam question usually asks what happens when two could both apply.' },
          {
            t: 'table',
            head: ['Order', 'Meaning'],
            rows: [
              ['1', 'The first process that matches the criteria "uses up" the submission. It runs to completion (approved, rejected, recalled or cancelled) before another can start.'],
              ['2', 'A process is only considered once the previous one is no longer pending.'],
              ['3', 'Entry criteria are checked first: if none match, **no request can even be created**.']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Order matters when criteria overlap. Put the **most specific** process first, or a small-discount process will swallow a large-discount request that should have gone to a second approver.' },
          { t: 'h', x: 'Email alerts and the wizard' },
          { t: 'list', items: ['An **outbound message** is a reusable email template used on initial submit and on final approval.', '**Email alerts** can fire at each step, on recall and on cancel — turn these on or approvers never learn they have a request.', 'The **wizard** collects the approver choice and comments on submit. Without it, a process with a "select the approver" queue gives the user nowhere to choose.', 'Add a **task** on initial submit for the approver, or the request is invisible.'] },
          { t: 'selfcheck', q: 'A quote is finally approved. Can the rep still edit Total_Value__c? Can they edit Delivery_Method__c?', a: 'Total_Value__c is on the approval layout, so it is **locked**. Delivery_Method__c is not on that layout, so it stays editable — final approval locks only the fields the approvers saw. That asymmetry is deliberate: the approval certified the commercial terms, not the shipping preference.' },
          {
            t: 'ex',
            id: '10.2',
            title: 'Locking, rejection and the submission limit',
            obj: 'Answer the lifecycle questions precisely — the wording of the option matters.',
            stars: 2,
            steps: [
              'Answer each TRUE or FALSE, with a one-line reason.',
              'L1: After final approval, all fields on the record are locked.',
              'L2: After final approval, fields on the approval layout are locked.',
              'L3: After rejection, fields on the approval layout can be edited, then resubmitted.',
              'L4: A record can be submitted an unlimited number of times.',
              'L5: A record can be submitted three times maximum.',
              'L6: A finally approved record can be recalled by the submitter.',
              'L7: An admin with Manage Users permission can edit a locked field.',
              'L8: Validation rules run when the record is submitted for approval.',
              'L9: Validation rules run when the record is approved.',
              'L10: While an approval is pending, the submitter can still edit the approval layout fields.'
            ],
            verify: 'L1 FALSE — only fields on the approval layout are locked; everything else stays editable. L2 TRUE — the core purpose of final approval. L3 TRUE — rejection exists so the submitter can correct and resubmit; that is the reason the fields unlock. L4 FALSE — three submissions maximum, after which only recall or cancel. L5 TRUE — the standard limit, counted across all resubmissions. L6 FALSE — final approval is final; the only way out is an admin change or a new process. L7 TRUE — this is the audited override path, and it is why "locked" never means "uneditable forever". L8 TRUE — submitting runs the validation rules, so a record that cannot be saved cannot enter approval. L9 FALSE — approval does not re-run validation rules. L10 FALSE — while pending, the approval layout fields are read-only; only rejection releases them.'
          },
          {
            t: 'case',
            title: 'The recall that reset the approval',
            org: 'Brightline Equipment',
            problem: 'A rep recalled an approved discount request because the amount was wrong, edited it, and resubmitted - and it went straight back to the VP with no trace that it had already been through once. Finance found two approval records for one quote.',
            solution: 'Enabled recall on the approval process so a submitter can withdraw a pending request, and required the resubmission to create a fresh entry. Separately, they added a validation rule on Requested_Date__c that stops an already-approved request from having its amount edited at all.',
            steps: [
              'Enable Recall if a submitter legitimately needs to withdraw a pending request.',
              'Understand what each action does: submit enters the process, approve advances it, reject exits it, recall withdraws a pending one, cancel removes an in-progress one.',
              'Add a validation rule so approved data cannot be silently changed underneath the approver.',
              'Decide who can recall - submitter only, or anyone with edit access.'
            ],
            gotcha: 'Recall only works while a request is PENDING. Once the final step approves, the process is complete and nothing can recall it - the record is simply editable again. Teams who expect recall to undo a completed approval are surprised every time.',
            exam: 'Know the five lifecycle actions precisely: Submit, Approve, Reject, Recall, Cancel. Questions that describe a scenario and ask which action fits are testing exactly this vocabulary.'
          }
        ]
      },
      {
        title: 'Approval, flow, and the combined design',
        mins: 7,
        blocks: [
          { t: 'p', x: 'Approvals and flows are not rivals. The rule of thumb: the approval process **decides**, the flow **does the work that follows**.' },
          {
            t: 'table',
            head: ['The requirement', 'Tool'],
            rows: [
              ['A human must approve', 'Approval process'],
              ['Then create a task for the Contracts team', 'Record-triggered flow on the approved status'],
              ['Then lock the commercial fields', 'Approval layout locking'],
              ['Reject a save because a field is invalid', 'Validation rule — never an approval'],
              ['Then update 200 records in bulk', 'Scheduled flow'],
              ['Then notify on an email alert', 'Approval process email alert, or a flow email alert'],
              ['Then require a second approver over a threshold', 'A second approval process, or a step criteria']
            ]
          },
          { t: 'h', x: 'Chaining a flow to an approval' },
          { t: 'num', items: ['The approval sets a status field on final approval (a **final approval action** — a field update).', 'A record-triggered flow watches that field: entry \`AND(ISCHANGED(Approval_Status__c), Approval_Status__c = "Approved")\`.', 'The flow creates the downstream records and tasks.', 'The flow never re-submits, never rejects, and never checks the criteria. That stays in the approval process.'] },
          { t: 'callout', kind: 'warn', x: 'A flow that *checks the criteria itself* duplicates the approval logic and they will drift apart. If the approval threshold changes and only the flow is updated, records get approved under two different rules. Keep the decision in one place.' },
          { t: 'h', x: 'Designing for the approver experience' },
          { t: 'list', items: ['**Email alerts on** every step, plus a task — otherwise approvals sit unnoticed.', 'An **approval layout** with only what the approver needs to decide. A busy 40-field layout is a rejection risk.', '**Comments on every step**, and mark them required, so rejections are actionable.', 'Show **Approval History** on the page (Phase 12) so the context is visible without clicking through.', 'Set **Allow submission by the creator = off** where self-approval would be a problem.'] },
          { t: 'selfcheck', q: 'On final approval the business wants a Contract record created, the Quote locked, and Finance emailed. Which tool does each part?', a: '**Contract record + Finance email** → an approval process **final approval action** (create record, email alert). **Quote locked** → approval layout locking, by putting the commercial fields on that layout. If the downstream work grows past "one record plus an email", move it to a record-triggered flow keyed on the approval status, and keep the approval process to the decision.' },
          {
            t: 'proj',
            id: '10.3',
            title: 'Build Brightline\'s approval architecture',
            obj: 'The complete human sign-off layer, from draft to contract.',
            stars: 3,
            reqs: [
              'Scenario: Discount_Request__c on Opportunity (Phase 6 relationships). Quote_Request__c with roll-ups from Phase 7. Opportunity with a Discount_Percent__c field.',
              'Design THREE approval processes. For each: object, entry criteria, criteria, approver type, steps, approval layout fields, final approver, and which actions fire on initial submit and final approval.',
              'At least one must use a queue, and at least one must use the record owner or a manager as the approver.',
              'One must be multi-step with a per-step comments field. Name every custom field you add.',
              'Write the field-locking policy: exactly which fields go on which approval layout, and what stays editable after final approval.',
              'Document the lifecycle your users will see: what is editable in Draft, Submitted, Approved, Rejected and Recalled.',
              'Explain the ordering rule if two of your processes could both match, and which you place first.',
              'Design ONE record-triggered flow that supports the approval without duplicating its decision. Give the exact trigger and entry condition.',
              'State the submit and submission-limit rules, and what a user can still do after the third submission.',
              'List the email alerts and tasks you enabled, and the reason each exists.',
              'Write the anti-pattern warning: two things a flow must never do in relation to an approval process.'
            ],
            success: 'A written approval architecture: three processes fully specified, a locking policy, a lifecycle table, an ordering decision, one supporting flow with an exact entry condition, and the two anti-patterns. All declarative, no Apex.'
          },
          {
            t: 'case',
            title: 'Approval that also had to notify',
            org: 'Brightline Equipment',
            problem: 'Once a contract was approved, the customer contact had to be emailed automatically with the signed copy. The first attempt tried to do this inside the approval process field update, which could only update fields - it could not send anything.',
            solution: 'The approval process owns the decision and sets the status. A record-triggered flow starting on that status change owns the notification. Each tool does the one thing it is actually good at.',
            steps: [
              'Use the approval process for the decision and for updating the fields that record the outcome.',
              'Use a flow triggered by the resulting status change for notifications and follow-up tasks.',
              'Do not try to make an approval process send an email - it cannot.',
              'Keep the two separate so neither has to change when the other does.'
            ],
            gotcha: 'Trying to bolt side effects onto the approval process leads to a tangled design where the notification lives in a validation rule or a workflow rule nobody can find. The cleaner decomposition - approval decides, flow acts - is also what the exam expects when a scenario needs both a decision and an action.',
            exam: 'Field updates in an approval process change fields on the record. Anything that sends, creates or updates ANOTHER record needs a flow. That boundary is the whole question in scenarios like this one.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'What happens to the fields on an approval process\'s approval layout once the record is FINALLY approved?',
          opts: [
            'They stay editable, so the business can correct them later',
            'They are LOCKED, to preserve the values the approver certified',
            'They are hidden from all users',
            'They are deleted'
          ],
          a: 1,
          why: 'Once finally approved, the fields on the approval layout are **locked**. The approval certified those exact values, so changing them afterwards would invalidate the decision. Other fields not on that layout remain editable, and an admin with Manage Users permission can still make an audited override.'
        },
        {
          q: 'Which of these is NOT an option for specifying an approver?',
          opts: [
            'Specify users (a queue of named users)',
            'Let the submitter select the approver via a wizard',
            'Specify a user related to the record, such as the Owner',
            'Specify a field on the record that holds an email address to notify'
          ],
          a: 3,
          why: 'Approver types are: specify users, let the submitter select, specify a user related to the record, and use a manager or role hierarchy. An email address is not an approver — it is a notification. The approver must be a **user** who can act, and notifying someone who cannot act is not approval.'
        },
        {
          q: 'How many times can a record be submitted for approval before only recall or cancel remain?',
          opts: ['Once', 'Twice', 'Three', 'Unlimited'],
          a: 2,
          why: 'A record can be **submitted three times** in total. After that, the submitter can only recall the request (if nobody has decided yet) or cancel it. Rejected requests count toward this limit, so a record rejected twice can only be submitted once more.'
        },
        {
          q: 'A Quote_Request__c has two approval processes. Process A matches Amount <= 5000 and Process B matches Amount > 250000. A request for 4000 is submitted. What happens?',
          opts: [
            'Both processes run in parallel',
            'Only Process B runs, because it is more specific',
            'Process A runs first and completes; Process B is considered only afterward, but it no longer matches',
            'The system asks the user which to use'
          ],
          a: 2,
          why: 'Approval processes on one object run in order. The **first** process whose criteria match uses up the submission and runs to completion. Only once it is no longer pending is the next considered. Process B\'s criteria (Amount > 250000) do not match 4000, so it never applies — which is why ordering matters and overlapping criteria must be designed deliberately.'
        },
        {
          q: 'Which TWO statements about validation rules and approval processes are correct? (Choose all that apply.)',
          opts: [
            'Validation rules are evaluated when the record is submitted for approval',
            'Validation rules are evaluated when the record is finally approved',
            'A record that violates a validation rule cannot be submitted for approval',
            'Validation rules run on the approval layout rather than the record'
          ],
          a: [0, 2],
          why: 'Submitting a record for approval evaluates its **validation rules**, so a record that could never be saved cannot enter approval — that is why option 3 is a consequence of option 1 being true. Approval itself does **not** re-run validation rules, and validation rules evaluate the record\'s own fields, never "the approval layout".'
        },
        {
          q: 'A record is finally approved. Who can still edit the fields on the approval layout?',
          opts: [
            'Nobody at all, ever',
            'The original submitter and the record owner',
            'Only an administrator with Manage Users permission, and the change is audited',
            'Anyone who can edit the record, including via the API'
          ],
          a: 2,
          why: 'Locked means locked for ordinary users, but a locked record is never permanently immutable: an **admin with Manage Users permission** can edit locked fields, and that change is logged in Setup. This is the deliberate escape hatch for correcting genuine mistakes, and understanding it prevents over-claiming that approval data is unchangeable.'
        }
      ]
    }
  },
  {
    id: 'workflow',
    n: 11,
    title: 'Workflow Rules, Assignment & Auto-Response',
    icon: '🧭',
    color: '#8B5CF6',
    tagline: 'The legacy automation tool — deprecated for new builds, still fully examinable',
    exam: 'logic',
    guide: '11-Workflow-Rules-Assignment-Auto-Response.md',
    objectives: [
      'Name the workflow rule evaluation order and why it matters',
      'Configure a rule with criteria and actions, and pick the right action type',
      'Explain why workflow rules run after save and cannot stop a save',
      'Configure auto-response rules for leads and cases',
      'Use assignment rules, auto-response rules and queues together correctly',
      'Decide when to use workflow rules and when to use flow instead'
    ],
    art: [],
    lessons: [
      {
        title: 'How workflow rules work',
        mins: 7,
        blocks: [
          { t: 'p', x: 'Workflow rules are the **legacy** automation tool. Salesforce no longer lets you build new ones — they are deprecated — but every existing org is full of them and the exam still tests them thoroughly.' },
          { t: 'h', x: 'Anatomy' },
          {
            t: 'table',
            head: ['Part', 'What it is'],
            rows: [
              ['**Evaluation criteria**', 'When the rule runs: on create, on every edit, or **when a specific field is edited**'],
              ['**Criteria**', 'The formula that must be TRUE for the rule to act'],
              ['**Actions**', 'What happens when the criteria match']
            ]
          },
          { t: 'callout', kind: 'warn', x: '**Evaluation criteria and criteria are different things.** Evaluation criteria decides *when to check*; criteria decides *whether to act*. A rule set to "when a specific field is edited" only evaluates when that field changes — which is how you avoid a rule re-firing on every unrelated save.' },
          { t: 'h', x: 'Action types' },
          {
            t: 'table',
            head: ['Action', 'What it does'],
            rows: [
              ['**Field Update**', 'Sets a field value, possibly from a formula'],
              ['**Email Alert**', 'Sends an email to a recipient, optionally as a template (custom or text)'],
              ['**Task**', 'Creates a task with an assigned owner and a due date'],
              ['**Outbound Message**', 'Sends a Salesforce outbound message to an external endpoint'],
              ['**Update Record**', 'Updates a **related** record\'s field'],
              ['**Assign Owner**', 'Changes the record owner — to a user, a role, or a queue'],
              ['Notify on Submit/Approval', 'Not a workflow action — that belongs to approval processes']
            ]
          },
          { t: 'p', x: '**Field Update** is the one that matters most, and it has a setting people miss: *evaluate the rule criteria before updating* versus *re-evaluate the rule criteria after every update*. With after-update re-evaluation, changing a field in the formula re-runs the whole rule, which is how a workflow rule loops.' },
          { t: 'callout', kind: 'tip', x: 'Choosing "do not re-evaluate" is the single most effective way to prevent a workflow rule from looping on itself.' },
          { t: 'h', x: 'Evaluation order — the exam classic' },
          { t: 'num', items: ['**Validation rules** — reject the save outright.', '**Duplicate rules** — reject the save if it matches existing records.', '**Workflow rules and flows** — run after the save, in an undefined order between themselves.', '**Roll-up summaries** — recalculate.', '**Apex, commits, after-trigger automation.**'] },
          { t: 'callout', kind: 'warn', x: 'Workflow rules run **after save**, so they **cannot stop a save**. If a requirement says "prevent this save", the answer is a **validation rule** (Phase 7), not a workflow rule. This single distinction answers a large share of logic-domain questions.' },
          { t: 'p', x: 'Because workflow rules and flows run in an **undefined order relative to each other**, never make one depend on the other\'s output on the same save.' },
          { t: 'selfcheck', q: '"When an Opportunity moves to Closed Lost, stop the save and warn the rep." Which tool?', a: 'A **validation rule**. A workflow rule runs after the record is saved, so it cannot prevent anything — at best it could notify the rep after the damage. Same for a flow: only a *before-save* flow can reject a save, and a validation rule is the lighter, purpose-built tool.' },
          {
            t: 'ex',
            id: '11.1',
            title: 'Rules, criteria and actions',
            obj: 'Separate evaluation criteria from criteria, and pick the right action.',
            stars: 2,
            steps: [
              'For each requirement, write the evaluation criteria, the criteria formula, and the action(s).',
              'W1: When StageName becomes "Closed Lost", stamp Closed_Lost_Reason__c with "Lost on price".',
              'W2: When the Discount_Percent__c field is edited and the new value is over 20%, email the VP.',
              'W3: When a Discount_Request__c is submitted, create a task for the Opportunity owner due in 2 days.',
              'W4: When a Quote_Line__c is created, update its parent Quote_Request__c with the newest line date.',
              'For each, state which action type is used and name any other tool that would be better.',
              'For W2, explain why the evaluation criteria matters more than the criteria here.'
            ],
            verify: 'W1: evaluation = when a specific field is edited (StageName); criteria = StageName = "Closed Lost"; action = Field Update, Closed_Lost_Reason__c = "Lost on price". Field Update is the right action; a flow would also work but is heavier. W2: evaluation = when Discount_Percent__c is edited; criteria = Discount_Percent__c > 20; action = Email Alert to the VP. The evaluation criteria matters more because without it the rule re-evaluates on every save, so a rep editing a note while the discount stays at 25% triggers another email. W3: evaluation = when created; criteria = Request_Status__c = "Submitted"; action = Task with owner = Opportunity owner, due = TODAY() + 2. An approval process email/task would be better since it fires per approval step. W4: evaluation = when created; criteria = always true (blank); action = Update Record on the parent. This is the clearest case for a flow in modern Salesforce: a before-save flow on Quote_Line__c updating the parent, or better a roll-up on the parent (Phase 7) instead of copying a date at all.'
          },
          {
            t: 'case',
            title: 'The automation that kept re-running',
            org: 'Cardinal Bay Recruitment (specialist recruiter, 45 staff)',
            problem: 'A rule flagged a candidate as Rejected and stamped the date the moment the status became Rejected. It had no trigger scope set, so it fired on every subsequent save of that record, and the field update it performed caused another save. Candidates started opening with a concurrent-access error and consultants were copying details into a local spreadsheet to get work done, which is how a CV ended up with the wrong owner.',
            solution: 'The rule was scoped to run only when the status field is edited, which is what the business actually meant. The timestamp is now taken from the record\'s last modified date in a formula field, so it is always right without anything writing it.',
            steps: [
              'Decide the trigger scope first: on every edit, only when created, or only when a specific field is edited.',
              'Prefer a formula field for anything that is derived from the record, so nothing has to write it.',
              'Where a rule must write, scope it to the field that justifies the write.',
              'Test on a record that gets saved repeatedly before you let real candidates near it.'
            ],
            gotcha: 'A rule on every edit that performs a field update can loop. Salesforce applies recursion protection so it stops rather than running forever, but the symptom users see is a locked record and a concurrent-access error, not a friendly message about the loop.',
            exam: 'Workflow rules evaluate criteria then act. Trigger scope - every edit, on creation, or on a field edit - is a named part of the definition and choosing it wrongly is a common question.'
          }
        ]
      },
      {
        title: 'Auto-response, assignment rules and queues',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Three related tools that route incoming work: **assignment rules**, **auto-response rules**, and **queues**. They are configured in different places but they cooperate.' },
          { t: 'h', x: 'Assignment rules' },
          { t: 'p', x: 'An assignment rule sets the **owner** on a new record. It is the Lead-routing workhorse, and it is where record types (Phase 8) earn their keep.' },
          {
            t: 'table',
            head: ['Setting', 'Meaning'],
            rows: [
              ['**Rule order**', 'Evaluated top to bottom; the **first match wins** and stops evaluation'],
              ['**Entry criteria**', 'Whether the rule can be evaluated at all (often record type or country)'],
              ['**Criteria**', 'The matching formula'],
              ['**Assign owner**', 'To a user, a role, or a **queue**'],
              ['**Default assignment**', 'What happens if no rule matches — often an "Unassigned" queue'],
              ['**Enable for sandbox / production**', 'Each is enabled separately; forgetting production is a classic support ticket']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Order rules most specific first. A broad "everything goes to EMEA" rule placed above "Enterprise leads in France go to Jean" makes the second rule dead code — and nothing in the UI warns you.' },
          { t: 'h', x: 'Auto-response rules' },
          { t: 'p', x: 'An auto-response rule sends an **automatic email** when a record is created, or when a record is **assigned to a queue or user**, and it can optionally **create a task**. Two triggers to know: *when a lead is created* and *when a lead is assigned to a queue or user*.' },
          { t: 'list', items: ['Attach a **template**: an **email template** (classic, with merge fields) or a **Lightning email template** (the modern replacement).', 'The "assigned" trigger only fires when the **owner changes** — including when an assignment rule routes the lead.', 'Send on create **and** on assignment together? Expect two emails. Pick the one that matches the requirement.', 'Auto-response rules exist for **Lead** and **Case**. For other objects, a flow or workflow email alert does the job.'] },
          { t: 'h', x: 'Queues' },
          { t: 'p', x: 'A **queue** is a holding area owned by nobody in particular. Members are users or public groups, and any member can take (and own) a record.' },
          {
            t: 'table',
            head: ['Property', 'Detail'],
            rows: [
              ['Contains', 'Users and public groups'],
              ['Owner', 'Nobody — that is the point'],
              ['Take ownership', 'Any member can, from the record or a list view'],
              ['Purpose', 'Unrouted work, so nothing sits unowned and invisible'],
              ['Related to', 'Assignment rules (default), record owners, sharing rules']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'A queue is not a security boundary. Queue members need **record access** to see the records — which usually comes from a **sharing rule** on the queue (Phase 2). Creating a queue and assuming members can see the work is the most common routing mistake.' },
          { t: 'h', x: 'How they work together' },
          { t: 'num', items: ['New Lead arrives.', 'Assignment rules evaluate top to bottom; the first match assigns the owner.', 'If nothing matches, the lead goes to the default queue.', 'The auto-response rule on "assigned to a user or queue" fires and emails that owner.', 'An optional task is created so the lead is worked, not just emailed.', 'Queue members can **Take Ownership** from the record page or a queue list view.'] },
          { t: 'selfcheck', q: 'French Enterprise leads should go to a named rep, everyone else in EMEA to a queue, and everyone else to an "Unassigned" queue. What is the rule order?', a: '**1)** French Enterprise → the named rep. **2)** EMEA → EMEA queue. **3)** catch-all → Unassigned queue, set as the **default assignment**. Putting the broad EMEA rule first would swallow every French lead, and the narrowest rule must be first because the first match wins and stops evaluation.' },
          {
            t: 'ex',
            id: '11.2',
            title: 'Route leads to people, not nowhere',
            obj: 'Build a routing design and find the failure modes.',
            stars: 2,
            steps: [
              'Design the assignment rules for this scenario: order, entry criteria, criteria, and assign-to.',
              'L-A: French leads whose Country is France AND record type Enterprise → rep "Jean Moreau".',
              'L-B: All other EMEA leads (EMEA region) → the "EMEA Inbound" queue.',
              'L-C: Anything else → the "Unassigned" queue, as the default assignment.',
              'Configure an auto-response rule: email the owner on assignment, attach the right template type, create a 1-day task.',
              'For L-A, L-B and L-C, state what happens if a lead matches more than one and if the order is wrong.',
              'Name the one permission-related thing that must exist for queue members to actually see the leads.',
              'Explain the difference between the "on create" and "on assignment" auto-response triggers, and the risk of enabling both.'
            ],
            verify: 'Order: L-A (narrowest), L-B, L-C as the default assignment. L-A: entry criteria record type = Enterprise, criteria Country__c = "France", assign to the Jean Moreau user. L-B: entry criteria region = EMEA, criteria Country__c != "France" OR record type != Enterprise, assign to the EMEA Inbound queue. L-C: default assignment, Unassigned queue. First match wins: a French Enterprise lead matches L-A and stops. If the order is wrong — L-B before L-A — every French lead lands in the queue and L-A becomes dead code with no warning. The permission requirement: a sharing rule granting queue members read (or read/write) on Lead, scoped to records owned by the queue. Without it the members see an empty queue. Auto-response: use the "assigned to a queue or user" trigger because the requirement is to notify whoever ends up owning it; on-create fires for every lead regardless of routing. Enabling both sends two emails to the same person — choose the one that matches the business need, and note that on-create also fires when the owner has not been set at all.'
          },
          {
            t: 'case',
            title: 'Every enquiry owned by the same person',
            org: 'Halden Facilities Services (commercial cleaning and maintenance, 800 field staff)',
            problem: 'Assignment rules sent every website enquiry to the duty manager, whoever happened to be on that week. The person who had actually spoken to the customer was not the owner, so could not see the record, and the record sat with someone in a different building for two days. Response times got worse every quarter and the duty manager stopped opening the objects at all.',
            solution: 'Assignment rules keyed on postcode prefix, sending each enquiry to the regional team queue. A before-save flow then reassigns to a named individual inside that team when someone is on leave. Assignment decides the bucket, the flow refines it.',
            steps: [
              'Key assignment rules on a field the value actually carries, such as postcode prefix or region, not on who created the record.',
              'Assign to a queue rather than a person, so absence does not need a special case.',
              'Give every queue an owner, or nothing in it ever gets picked up.',
              'Use a before-save flow for the exceptions that assignment rules cannot express.'
            ],
            gotcha: 'Assignment rules evaluate on creation only. They will not re-route a record when the thing that would change the answer changes later, and a queue that has no owner is a place records go to be ignored rather than worked.',
            exam: 'Assignment rules route records on create, queues hold work that needs an owner, and auto-response rules send the email. Knowing which of the three a scenario is describing is the whole question.'
          }
        ]
      },
      {
        title: 'Workflow rules in the modern org',
        mins: 6,
        blocks: [
          { t: 'p', x: 'You still need to *manage* workflow rules, even though you can no longer create them. Here is how to decide what to do with each one you find.' },
          {
            t: 'table',
            head: ['Requirement', 'Build this'],
            rows: [
              ['Stop a save because a field is invalid', 'Validation rule'],
              ['Change a field value before save', 'Before-save flow, or a formula field'],
              ['Set a field, email, or task after save, one record', 'Record-triggered flow (preferred) or workflow rule (legacy)'],
              ['Update a **related** record after save', 'Record-triggered flow'],
              ['Change the owner by rules', 'Assignment rules (Lead) or a flow Update'],
              ['Notify on approval steps', 'Approval process email alert or task'],
              ['React at a time, or in bulk', 'Scheduled flow or scheduled path'],
              ['Anything cross-object with logic', 'Flow — and if flow truly cannot, Apex']
            ]
          },
          { t: 'h', x: 'Auditing what you already have' },
          { t: 'num', items: ['List active workflow rules per object, and their criteria.', 'Find rules using **after-update re-evaluation** — each is a potential loop. Check whether the Field Update touches a field in the criteria.', 'Find rules that email on **every save** because evaluation criteria is "when a record is created or edited" with a broad criteria.', 'Check whether any rule sets a field another rule reads — that is an order dependency on undefined ordering, i.e. a latent bug.', 'Decide per rule: **leave it** (it works), **migrate to flow** (behaviour matters), or **replace with a rule/formula** (the behaviour was always wrong).'] },
          { t: 'callout', kind: 'tip', x: 'Migrating a workflow rule to a flow is not a like-for-like translation. A workflow field update maps to a flow **Update Records** element, and "re-evaluate after update" maps to re-running the entry condition, which flows handle differently. Test the migrated flow against the rule\'s behaviour, not against the flow builder\'s preview.' },
          { t: 'selfcheck', q: 'A workflow rule sets \`Status__c = "Approved"\` when a checkbox is ticked. A second rule emails the owner when \`Status__c = "Approved"\`. Is this safe?', a: 'Usually, but it depends. Both fire after save in an **undefined order**, so if rule 2 ran before rule 1 on the same save it would not see the new status. Here the email rule only evaluates on a *later* save, so it works. But if the email rule were also set to run on every edit, it becomes a race. More importantly, this is exactly the pattern to collapse into one flow or into a roll-up-free validation plus an approval process.' },
          {
            t: 'proj',
            id: '11.3',
            title: 'Audit and replace Brightline\'s legacy automation',
            obj: 'A migration plan that leaves the org in a better state than you found it.',
            stars: 3,
            reqs: [
              'Scenario: Brightline\'s org has inherited workflow rules, an old lead-routing setup and some queues. Phases 7–10 built the modern declarative layer.',
              'Write a THREE-STEP audit plan: how you inventory active automation, how you spot the dangerous patterns, and how you prioritise what to change.',
              'Name FOUR dangerous workflow rule patterns, each with the symptom it produces and the modern replacement.',
              'Explain the workflow rule evaluation order, and which of its steps can reject a save.',
              'Design the lead routing for a 3-region company with 6 named reps and 2 queues: state the rule order, and where each rule falls.',
              'Configure the auto-response rule: trigger type, template type, and whether a task is created.',
              'Write the rule that grants queue members access, and why the queue alone is not enough.',
              'For THREE inherited workflow rules, decide: LEAVE, MIGRATE TO FLOW, or REPLACE, with the reason.',
              'Explain what breaks if you migrate a rule that had "re-evaluate after update" enabled, and how you test the migration.',
              'State the two things you will never build with a workflow rule today, and what you use instead.'
            ],
            success: 'An audit plan, four diagnosed legacy patterns with modern replacements, a full routing design with ordering rationale, an access rule, three migration decisions with reasons, and a migration testing note. Recognises that workflow rules are legacy: manage and audit them, but build new work in flows.'
          },
          {
            t: 'case',
            title: 'Two automations fighting over one field',
            org: 'Sunward Coastal Transport (coastal haulage, 120 staff)',
            problem: 'A legacy workflow rule and a newer flow both updated the delivery status. The rule fired on every edit, the flow fired on a status change, and on the saves where both matched, the value moved twice and the operations team watched status go backwards from Delivered to Out for Delivery. It took three days to trace, because each automation looked completely correct in its own history.',
            solution: 'One owner per field. The flow took the status and the notification; the workflow rule was migrated and deleted once its last use was confirmed gone. They added a line to the design notes naming the field owner, so the next person adding a third automation would meet it before writing any code.',
            steps: [
              'List every field that more than one automation writes to, before adding anything new.',
              'Give each field exactly one owner and say which one in writing.',
              'Migrate the legacy automation deliberately rather than leaving it running beside the replacement.',
              'Check the automation history on a record after each change instead of trusting the configuration screens.'
            ],
            gotcha: 'Two automations writing one field is the hardest class of bug to diagnose, because each history entry is individually correct and only the sequence is wrong. Audit field ownership before you build, not after it misbehaves.',
            exam: 'Workflow rules are legacy and cannot do what flows do. A scenario needing a loop, a related-record update or a scheduled path is a flow scenario, and the exam expects you to say so.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'Which evaluation order is correct?',
          opts: [
            'Workflow rules, then validation rules, then duplicate rules',
            'Validation rules, then duplicate rules, then workflow rules and flows, then roll-up summaries recalculate',
            'Duplicate rules, then validation rules, then workflow rules',
            'Workflow rules, then roll-up summaries, then validation rules'
          ],
          a: 1,
          why: '**Validation rules → duplicate rules → workflow rules and flows → roll-up recalculation → Apex and after-trigger automation.** The order matters most because only validation and duplicate rules can *reject* a save; workflow rules and flows run after the record is committed, which is why they cannot stop a save.'
        },
        {
          q: 'Can a workflow rule prevent a record from being saved?',
          opts: [
            'Yes, if the criteria is set to evaluate before save',
            'No — workflow rules run after the save, so a validation rule is required to reject a save',
            'Yes, if the action is a Field Update',
            'Yes, but only on Leads'
          ],
          a: 1,
          why: 'Workflow rules run **after** the record is saved. There is no before-save option for them, so they cannot reject anything — they can only email, task, update, or assign after the fact. To stop a save you need a **validation rule** (or a before-save flow with a Fault element).'
        },
        {
          q: 'What does "evaluation criteria" control on a workflow rule?',
          opts: [
            'Whether the criteria formula evaluates to TRUE',
            'WHEN the rule evaluates — on create, on every edit, or when a specific field is edited',
            'Which actions run',
            'Which user the record is assigned to'
          ],
          a: 1,
          why: '**Evaluation criteria** decides *when to check* (create / every edit / specific field edited). **Criteria** decides *whether to act*. Confusing the two is why people build rules that email on every save: they set evaluation to "created or edited" and criteria to a broad formula that stays true.'
        },
        {
          q: 'In an assignment rule set, what happens when two rules both match?',
          opts: [
            'Both run and the last one wins',
            'The FIRST rule in the order matches and evaluation stops there',
            'The user is asked to choose',
            'The record goes to the default queue'
          ],
          a: 1,
          why: 'Assignment rules evaluate **top to bottom and the first match wins**, stopping evaluation. That is why order matters so much: a broad rule placed above a narrow one makes the narrow rule unreachable, and nothing warns you. If *no* rule matches, the record goes to the **default assignment**, which is typically an Unassigned queue.'
        },
        {
          q: 'A queue contains six reps. What must exist besides the queue for reps to actually see records routed to it?',
          opts: [
            'Nothing — queue membership grants access automatically',
            'A sharing rule granting queue members access to records owned by the queue',
            'A duplicate rule on the queue',
            'The queue must be added to every profile'
          ],
          a: 1,
          why: 'A **queue is not a security boundary**. It is a holding area for records with no individual owner. Members still need record access, normally through a **sharing rule** scoped to records owned by that queue. Creating a queue and assuming members can see the work is the most common routing mistake.'
        },
        {
          q: 'Which THREE statements about auto-response rules are correct? (Choose all that apply.)',
          opts: [
            'They can fire when a record is created',
            'They can fire when a record is assigned to a user or a queue',
            'They can assign the record to a specific user',
            'They can optionally create a task'
          ],
          a: [0, 1, 3],
          why: 'Auto-response rules send an automatic email **when a record is created** or **when it is assigned to a user or queue**, and can optionally create a task. They do **not** route records — that is assignment rules. The "on assignment" trigger fires on an owner change, including one made by an assignment rule, which is how the two features cooperate.'
        }
      ]
    }
  },
  {
    id: 'appbuilder',
    n: 12,
    title: 'Lightning App Builder',
    icon: '🧱',
    color: '#EC4899',
    tagline: 'Pages, apps and navigation without a single line of code',
    exam: 'ui',
    guide: '12-Lightning-App-Builder.md',
    objectives: [
      'Build a Lightning page using App Builder components and configure properties',
      'Activate and deactivate pages, and understand the activation order',
      'Build an app and its navigation, including lightning page tabs and app pages',
      'Use utility bars, record pages and the Lightning App Builder record actions',
      'Configure a Lightning app for mobile, and explain what differs on mobile',
      'Secure and troubleshoot a Lightning page you have built'
    ],
    art: [],
    lessons: [
      {
        title: 'Pages, components and activation',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Lightning App Builder lets admins assemble a page from **components** and drag them into place. It builds **record pages, app pages and Lightning pages**, and it builds the **app navigation** itself.' },
          { t: 'h', x: 'The three page types' },
          {
            t: 'table',
            head: ['Page type', 'Used for', 'Key property'],
            rows: [
              ['**Record page**', 'Replaces the page shown when you open one record', 'Which record types it applies to'],
              ['**App page**', 'A tab of content with no record behind it — dashboards, trackers', 'Which app it appears in'],
              ['**Lightning page**', 'A custom tab that can hold components the built-in tabs cannot', 'What content it hosts']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'App Builder is the **only** way to customise a Lightning **record page**. Page Layout Editor (Phase 8) still governs the older "record detail page" used in Salesforce Classic, and the two coexist: App Builder wins wherever it is activated.' },
          { t: 'h', x: 'Components you must recognise' },
          {
            t: 'table',
            head: ['Component', 'What it renders'],
            rows: [
              ['**Record Highlights Panel**', 'The key fields at the top — a curated subset of the layout'],
              ['**Record Details**', 'The main field groups, configurable per section'],
              ['**Related Lists**', 'Related records, with filterable columns'],
              ['**Related List — Single**', 'One related list, with a filter bar'],
              ['**Accordion / Tab / Carousel**', 'Layout containers for other components'],
              ['**Rich Text**', 'Instructions, guidance, links'],
              ['**Chart**', 'A report chart inline'],
              ['**Report**', 'A full report inline'],
              ['**Dashboard**', 'A dashboard inline'],
              ['**Lightning Component**', 'A custom or packaged component'],
              ['**Flow**', 'Runs a flow inline — this is the "flow screen" that replaced Visualforce'],
              ['**Utility Bar (item)**', 'Adds an item to the utility bar'],
              ['**Record Action**', 'Adds a **Quick Action** or a custom action'],
              ['**Recommendations**', 'AI recommendations panel'],
              ['**Notes and Files**', 'The Notes/Files panel']
            ]
          },
          { t: 'h', x: 'Activation is the concept the exam tests most' },
          { t: 'p', x: 'A page is not live until you **activate** it. And a page can be activated against a **specific record type** or against the **default (dynamic) page** for an object.' },
          {
            t: 'table',
            head: ['Question', 'Answer'],
            rows: [
              ['Record page activated for one record type only', 'It applies to **that type only**. Other types keep the previous page.'],
              ['No page activated for a record type', 'The **default page** (or the previous page) applies.'],
              ['A Lightning **tab** page', 'Activated automatically on creation — nothing to activate.'],
              ['An **app page**', 'Activated automatically, and it appears in the app nav immediately.'],
              ['App page activation across orgs', 'App pages are activated **per app**, and once per org. App Builder is metadata, so it deploys like other metadata.']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'The classic trap: you build and activate a page for the Enterprise record type, then open an SMB record and see the old page. That is **correct behaviour**, not a bug. Activation is per record type.' },
          { t: 'selfcheck', q: 'A page built in App Builder does not appear when a user opens a record. What are the three things to check?', a: '1) Was the page **activated** (building is not activating). 2) Is it activated against the **record type the user is viewing**, and not a different one? 3) Is the user assigned the **app or the Lightning page tab** that surfaces it, and do they have the right object permissions? Also check the page is not deactivated in the target org.' },
          {
            t: 'ex',
            id: '12.1',
            title: 'Build a record page from scratch',
            obj: 'Specify the components, properties and activation for a real record page.',
            stars: 2,
            steps: [
              'Design the Brightline **Opportunity** record page. List the components top to bottom, in order, with the properties you set on each.',
              'The page must let a manager see value, next step and risk without scrolling.',
              'Name what goes in the Record Highlights Panel and why that component and not Record Details.',
              'Name the related lists and the filter you would put on the largest one.',
              'State the activation target: object, record type, and whether it replaces the default page.',
              'Name two actions you would add as Quick Actions and explain the placement.',
              'Add a Flow component running the Phase 9 credit-review flow, and explain why a Flow component rather than a Visualforce page.'
            ],
            verify: 'Components in order: Record Highlights Panel (Amount, StageName, CloseDate, Next Step, Account name) → Accordion with two Tabs → Tab 1 "Details" holds Record Details (fields grouped into Opportunity Details, Commercials, System) → Tab 2 "Activity" holds Related Lists and the Phase 9 Flow → Rich Text with the stage guidance → Utility Bar with Notes, Files and Tasks. Highlights Panel rather than Record Details because it pins the handful of fields that matter on every visit, above the fold, and stays visible while scrolling; Record Details is for the full field set in sections. Related lists: Opportunities on the Account (filtered to Open stage), Quote Requests, and Discount Requests. Activation: Opportunity, all record types, replace the default page — because managers need the same view regardless of New Business or Renewal. Quick Actions: "Submit for Approval" (launches the Phase 10 process) and "Log a Call" (Phase 11 task flow), both on the record page header. Flow component rather than Visualforce because it runs the declarative flow inline with no code, no iframe, no platform limits to manage, and it renders natively on mobile.'
          },
          {
            t: 'case',
            title: 'Two activations of the same page',
            org: 'Marlow & Finch Retail (garden centre chain, 14 stores, 400 staff)',
            problem: 'A Lightning page for the store record was activated once during testing and again after the changes were signed off. In production, staff opened a store record and sometimes saw the new layout and sometimes the old, depending on which activation their session happened to pick. Nobody could state with confidence which version was live, and two of them had been editing test copy against the wrong one for a fortnight.',
            solution: 'One active version at a time. The test activation was deactivated, the approved version stayed active, and the release note now names the version number so there is never a question about what is live.',
            steps: [
              'Build and test against a preview or a sandbox activation rather than activating in production to look at it.',
              'Activate once per release, after sign-off.',
              'Deactivate the previous version in the same sitting - they do not replace each other.',
              'Record the active version number in the release note.'
            ],
            gotcha: 'Activating a new version does not deactivate the old one. Both stay active, the org resolves between them unpredictably, and the only way out is to go and deactivate the one you did not want. This is the most common Lightning page defect there is.',
            exam: 'A Lightning page has to be activated before anyone sees it, and multiple active versions is a real failure mode. Know that activation is a step you perform, not something that happens on save.'
          }
        ]
      },
      {
        title: 'Apps, navigation and tabs',
        mins: 8,
        blocks: [
          { t: 'p', x: 'An **app** is a named set of navigation items with a profile and a branding treatment. App Builder creates the app and its items; it does not replace the App Manager that assigns apps to users.' },
          { t: 'h', x: 'The navigation item types' },
          {
            t: 'table',
            head: ['Item type', 'Hosts', 'Notes'],
            rows: [
              ['**Standard tab**', 'A standard object list', 'The classic "Accounts" tab'],
              ['**Web tab**', 'A URL', 'Named, URL, and optionally a web link'],
              ['**App page**', 'App Builder content', 'A dashboard or tracker with no object behind it'],
              ['**Lightning page tab**', 'A Lightning Page', 'Lets you build a tab the standard ones cannot express'],
              ['**Reports tab**', 'Reports and dashboards', 'A folder of reports'],
              ['**Utility bar items**', 'Actions on records and the app', 'Only on mobile and desktop, not in console']
            ]
          },
          { t: 'h', x: 'Building an app' },
          { t: 'num', items: ['Create the **app** with a name, developer name, description, and an image.', 'Set the **app profile**: internal, external, or custom.', 'Choose **navigation style**: standard navigation (tabs at the top) or **console** (Phase 14).', 'Add the **utility bar** items.', 'Add **navigation items** — the tabs and pages.', '**Activate** the app.', 'Then **assign** it to users, via a **permission set** or profile.'] },
          { t: 'callout', kind: 'warn', x: 'Building an app is not the same as making it available. Until the app is assigned through a permission set or profile, users cannot see it. On the exam, "I built the app and nobody can find it" is nearly always an assignment problem, not a build problem.' },
          { t: 'h', x: 'A Lightning page tab: when you actually need one' },
          { t: 'p', x: 'Most tabs are better served by an **app page**. A Lightning page tab earns its place when you need one of these:' },
          {
            t: 'list', items: ['A **custom object** used as a navigation destination.', '**Record** highlights or **utility bar** behaviour on a dedicated page.', 'A page that must host components **no standard tab can**, such as a Flow screen with parameters.', '**Separate activation** from an app page, with its own App Builder record actions.', 'A page for **one audience** — an admin page versus a working page — with its own navigation.']
          },
          { t: 'h', x: 'Mobile' },
          { t: 'p', x: 'The same App Builder page mostly works on mobile, and this is examinable:' },
          {
            t: 'table',
            head: ['Desktop', 'Mobile'],
            rows: [
              ['Columns of components', 'One column; components stack'],
              ['Utility bar docked at the bottom', 'Same, but fewer items fit'],
              ['Full side panel', 'Overlay panel'],
              ['Modals and popups', 'Native mobile equivalents'],
              ['Custom fonts and images', 'Simpler; some branding is dropped']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Design mobile-first for anything a field rep uses on a phone: a compact Highlights Panel and one key action beat forty fields. Always test on the mobile app, not a narrow browser window — the differences are not the same.' },
          { t: 'h', x: 'Troubleshooting' },
          { t: 'num', items: ['**Page not showing** — not activated, or activated for another record type.', '**Component blank** — the component has no records, or the user cannot see the underlying records (sharing).', '**Component error** — usually a permission set or object permission gap on the component itself.', '**Flow component silent** — the flow is inactive, the entry condition did not match, or the user lacks record access to the source.', '**Tab missing** — the app is not assigned, or the item was never added to the navigation.', '**Looks stale after a deploy** — App Builder metadata deployed but not activated in the target org.'] },
          { t: 'selfcheck', q: 'A related list component shows "No records found" for some users but not others. What is the cause?', a: 'Sharing, not App Builder. The component is a view onto related records, so each user sees only what their **sharing** allows (Phase 2). A manager with read access to the parent sees the list; a rep without access to those child records sees nothing. Check sharing rules, the object permissions in the permission set, and the sharing on the child object.' },
          {
            t: 'ex',
            id: '12.2',
            title: 'Design the Brightline app and navigation',
            obj: 'A complete app specification, buildable without touching code.',
            stars: 2,
            steps: [
              'Design TWO apps: "Brightline Sales" and "Brightline Service", and name the difference in audience.',
              'For each: navigation style, and the full list of navigation items with the item type of each.',
              'Name the app profile for each, and explain why that matters.',
              'Name the utility bar items for the Sales app and say which two are most important.',
              'Decide where the "Quote Pipeline" dashboard lives: app page or Lightning page tab? Give the reason.',
              'State exactly who assigns the apps to users, and which declarative tool does it.',
              'Write a five-step troubleshooting plan for "the user cannot see the new page".',
              'For the mobile experience, name two things you would design differently from desktop.'
            ],
            verify: 'Brightline Sales: standard navigation, app profile Internal. Items — standard tabs Accounts, Contacts, Leads, Opportunities; app page "Pipeline" hosting the Phase 3 dashboard; app page "My Day" with the Phase 9 task flows; Lightning page tab "Quote Builder" hosting the quote and line components; reports tab "Sales Reports". Brightline Service: standard navigation, app profile Internal, items restricted to Cases, Assets (custom object), Knowledge and a Service Reports tab — deliberately no Opportunities, so the sales pipeline is not visible to service users. The audience difference is focus: sales needs pipeline and quoting, service needs cases and assets. App profile controls the branding and the profile badge, and it determines whether the app is for internal staff or external (Experience Cloud) users. Utility bar: Log a Call, New Task, Notes and Files, plus the Approvals list. The two that matter most are Log a Call and Approvals — one is the daily action, the other is the daily queue. Quote Pipeline lives as an **app page**, because it is a dashboard-like destination with no record behind it; a Lightning page tab is only justified if it needs components no app page can host. Users are given the apps through **permission sets** — assign the permission set, never edit the profile, because profiles accumulate and permission sets are additive and reviewable. Troubleshooting: (1) is the page activated, and for which record type; (2) is the component\'s underlying object in the user\'s permission set; (3) can the user see the records the component queries, via sharing; (4) is the app assigned at all; (5) is the user in the right org and on the mobile app with a cache refresh. Mobile differences: a single column, so the Highlights Panel and one primary action must come first and everything else collapses into a section; and fewer utility bar items fit, so Log a Call and Approvals stay and Notes/Files move into the record panel.'
          },
          {
            t: 'case',
            title: 'The app that removed the tabs people needed',
            org: 'Fenwick Community Health Trust (community clinic network, 300 clinical and admin staff)',
            problem: 'A new app was built to give the intake team a clean workspace with only the objects they touch. Because an app only shows the tabs it contains, nobody on that team could see Patients at all. Managers arriving to check a record had to go through the app launcher every time, and the launchers search results were ordered differently, so they regularly opened the wrong record.',
            solution: 'An app per role rather than one app for everyone, with a small shared tab set that every clinical app includes, and navigation left with the app launcher enabled so nobody is ever trapped inside an app.',
            steps: [
              'Decide who the app is for. One app for everybody ends up being a compromise that suits nobody.',
              'List the tabs each role genuinely needs on day one, and resist adding the rest speculatively.',
              'Keep the app launcher available so a user can always leave the app.',
              'Keep a shared minimum tab set across the clinical apps so moving between roles does not lose anything.'
            ],
            gotcha: 'An app controls whether a tab is reachable at all. Remove a tab from the app navigation and it is not de-emphasised for users who stay in the app, it is gone - and the fix is in the app configuration, not the tab.',
            exam: 'App, tab and navigation are one mechanism: a tab that is not in the app navigation cannot be reached from inside that app. That single relationship answers most questions on this topic.'
          }
        ]
      },
      {
        title: 'Actions, utility bar and the finer details',
        mins: 7,
        blocks: [
          { t: 'p', x: 'App Builder also changes how users *act* on a record, which is where the good design lives.' },
          { t: 'h', x: 'Record actions' },
          {
            t: 'table',
            head: ['Action type', 'What it launches'],
            rows: [
              ['**Quick Action**', 'A pre-filled record create or update — no screen, one click'],
              ['**Custom Lightning action**', 'A screen flow, a modal, or an Apex action'],
              ['**Update record action**', 'Pre-populated edit of the current record'],
              ['**Global action**', 'Available from anywhere in the app, not just one record type']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'A **Quick Action** beats a screen flow when the user is only changing one or two fields: no modal, fewer clicks, and it works offline on mobile. Reach for a flow only when there is real logic or a subflow.' },
          { t: 'h', x: 'Screen flows versus Visualforce' },
          { t: 'p', x: 'App Builder replaced most Visualforce page and component use with the **Flow** component. That matters for the exam in one specific way: the Flow component runs a flow **inline, natively**, with no Visualforce limits, and it is fully supported in Lightning and mobile. Visualforce remains available for genuinely custom UI that App Builder cannot express — but "custom" must be justified, because every Visualforce page is a maintenance liability.' },
          { t: 'h', x: 'Property settings worth knowing' },
          {
            t: 'list', items: ['**Record Highlights**: pin up to five fields; the rest stay in Details.', '**Related Lists**: choose which, set the number per row, and add a **filter** so a manager sees Open deals, not Closed Lost ones.', '**Accordion and Tab**: pure containers; set them to single or multi column, and make each section collapsible to shorten the page.', '**Flow**: choose the flow and which record it runs for — the record context is what makes it show the right data.', '**Chart and Report**: pin the source report and the filter, so the numbers cannot drift from the report definition.']
          },
          { t: 'callout', kind: 'warn', x: 'Every component that queries records respects the user\'s sharing. A beautiful page full of blank components is nearly always a permissions problem, and the fix is a permission set or a sharing rule, not a page rebuild.' },
          { t: 'h', x: 'Design principles that survive a review' },
          { t: 'num', items: ['Put the **five fields that drive the next decision** in Highlights, not the twenty that exist.', 'Every page needs **one obvious primary action**, in the same place on every record type.', 'Collapse long pages with accordion sections rather than making users scroll.', 'Test with **no data**: empty components are the usual first impression on a fresh install.', 'Mobile is a different layout, not a shrunk one.'] },
          { t: 'selfcheck', q: 'A rep needs to log a call in one tap from any Opportunity. Quick Action or flow?', a: '**Quick Action.** One field and no logic: create a Task with a Call task type, related to the Opportunity, due now, assigned to the rep. A screen flow adds a modal and a decision for no benefit. If the requirement later becomes "log the call and if the opportunity is more than 30 days old, also create a follow-up opportunity", that is the point to move to a screen flow.' },
          {
            t: 'proj',
            id: '12.3',
            title: 'Design Brightline\'s complete UI layer',
            obj: 'Every page, app and action the platform app builder would produce.',
            stars: 3,
            reqs: [
              'Scenario: Brightline Equipment. Phases 3–11 built reports, security, objects, relationships, rules, roll-ups, flows, approvals and routing.',
              'Design FOUR Lightning pages. For each: page type, object, target record types, every component in order, and the properties you set.',
              'At least one must be a record page, one an app page, and one a Lightning page tab page.',
              'For every related list, name the filter and say who is affected by it.',
              'Specify the activation for each page and state which one replaces the default page.',
              'Add THREE Quick Actions and ONE screen flow as actions on the Opportunity record page, and justify each choice.',
              'Design the "Quote Builder" Lightning page tab: why a Lightning page tab rather than an app page here?',
              'Write the permission set that makes all of this available, naming the objects, tabs and app permissions required.',
              'Write a MOBILE plan: what moves, what collapses, and what you deliberately drop.',
              'Write a troubleshooting decision tree with at least FIVE branches, for "the page looks wrong or empty for one user".'
            ],
            success: 'A complete App Builder specification: four pages with components and activation, three Quick Actions and one screen flow, the permission set, a mobile plan, and a troubleshooting tree. Everything achievable without code.'
          },
          {
            t: 'case',
            title: 'The action nobody could see',
            org: 'Kestrel Facilities Maintenance (commercial maintenance, 250 field engineers)',
            problem: 'An action for logging job completion was placed on the Lightning record page and worked perfectly for the two admins who tested it. Field engineers opened the same record and had no button at all. They kept the paper timesheet, the office keyed it in on Fridays, and two of the completed jobs were never logged because the sheet was lost.',
            solution: 'The action was already on the page layout - what was missing was the permission set that makes an action visible. Once that was assigned, and dynamic visibility was set so the action only appeared while the job was In Progress, the button appeared for exactly the people who needed it.',
            steps: [
              'Confirm the action is placed on the page layout for the relevant record type.',
              'Confirm the users hold the permission set the action is bound to - this is the usual reason a button is missing.',
              'Use dynamic visibility so the action shows only when the action makes sense for the current status.',
              'Check it on a phone as well, because engineers rarely open a laptop.'
            ],
            gotcha: 'Placing an action on a Lightning page layout does not make it appear. It is only visible to users holding the permission set it is bound to, and admins testing in their own profile will always see it whether or not it is bound to anything.',
            exam: 'Three separate switches - page layout placement, permission set assignment, dynamic visibility. A question describing a button that does not appear is almost always about the permission set.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'A Lightning page has been built for the Opportunity object but users still see the old page. What is the most likely cause?',
          opts: [
            'The page was not ACTIVATED, or was activated for a different record type',
            'The components were saved as drafts',
            'The page must be assigned to a permission set before it can be activated',
            'App Builder pages only work in sandbox orgs'
          ],
          a: 0,
          why: 'Building and activating are separate. A record page must be **activated**, and activation is **per record type** — a page activated only for Enterprise leaves SMB records on the previous page, which is correct behaviour rather than a bug. Note the third option is the reversal of the truth: activation comes first, assignment to users comes later.'
        },
        {
          q: 'Which statement about App Builder record pages is TRUE?',
          opts: [
            'They replace the Page Layout Editor used in Salesforce Classic, which is now retired',
            'App Builder is the way to customise a Lightning record page; the Page Layout Editor still exists for the Classic record detail page, and App Builder wins where it is activated',
            'Record pages can only contain Related Lists and Charts',
            'A record page must be activated for every record type separately or it does not work at all'
          ],
          a: 1,
          why: 'App Builder is the only way to customise a **Lightning** record page, and it coexists with the Page Layout Editor used by the older Classic-style record detail page. Where App Builder is activated for a record type, it takes precedence. Activation for one record type is perfectly valid — it simply leaves the other types unchanged.'
        },
        {
          q: 'A related list component is empty for one user but populated for another. What should you check FIRST?',
          opts: [
            'The component is set to single column',
            'Record-level sharing — the component shows only records the user can access',
            'The page is not activated for the default record type',
            'The related list needs a filter'
          ],
          a: 1,
          why: 'Every component that queries records respects the user\'s sharing. One user seeing the list and another seeing nothing is a **permissions** difference, not a page design difference. Check sharing rules and object permissions. Filters affect which records are shown but not whether a user can see any at all.'
        },
        {
          q: 'What is the correct order to make a new app available to users?',
          opts: [
            'Assign the app to a profile, then build it in App Builder, then add navigation items',
            'Build the app in App Builder, add navigation items, activate it, then ASSIGN it via a permission set',
            'Build it, assign it, then activate the navigation items',
            'Create the permission set first, then build the app'
          ],
          a: 1,
          why: 'The order is **build → activate → assign**. Assignment is a separate step and is done with a **permission set** rather than a profile, because permission sets are additive and reviewable while profiles accumulate. "I built the app and nobody can find it" is almost always a missing assignment.'
        },
        {
          q: 'Which of these needs a Lightning page tab rather than an app page? (Choose the best answer.)',
          opts: [
            'A dashboard of pipeline charts with no record behind it',
            'A custom quote-building experience hosting Flow components with parameters, which no standard tab or app page can host',
            'A list view of Accounts with a saved filter',
            'A related list of Opportunities on the Account page'
          ],
          a: 1,
          why: 'Dashboards and simple content belong in an **app page**; list views belong in standard tabs; related lists belong on a record page. A **Lightning page tab** earns its place when the destination needs components the others cannot host, or needs its own separate activation and app-builder actions — for example a multi-step quoting surface driven by Flow components with parameters.'
        },
        {
          q: 'A rep needs to log a call in one tap from any Opportunity, creating a Task. Which action type is the best fit?',
          opts: [
            'A Quick Action',
            'A screen flow with a decision element',
            'A Lightning record action that runs Apex',
            'A global action, because it is a record-level task'
          ],
          a: 0,
          why: 'A **Quick Action** is the right tool for creating a pre-filled record with no logic: one field, no decisions, no modal. A screen flow adds a modal for no benefit, Apex is unnecessary, and a **global action** is for creating records from anywhere rather than acting on the current one. Move to a screen flow only when there is real logic, such as a conditional follow-up.'
        }
      ]
    }
  },
  {
    id: 'dynamicforms',
    n: 13,
    title: 'Dynamic Forms & Lightning Pages',
    icon: '🧩',
    color: '#14B8A6',
    tagline: 'Record types with fields, layouts and guidance — served to the right user',
    exam: 'ui',
    guide: '13-Dynamic-Forms-Lightning-Pages.md',
    objectives: [
      'Describe what a dynamic form does and when it beats a record type layout',
      'Configure dynamic form sections, including rules and field visibility',
      'Add guidance text and instructional text to a dynamic form',
      'Explain how dynamic forms interact with record types and permissions',
      'Build a Lightning page that hosts a form, flow and related records together',
      'Choose between a dynamic form, a page layout, a screen flow and a Lightning page'
    ],
    art: [],
    lessons: [
      {
        title: 'What a dynamic form actually does',
        mins: 7,
        blocks: [
          { t: 'p', x: 'A **dynamic form** is a set of sections, each with its own visibility rules, that sits inside a Lightning page (Phase 12). Instead of one flat layout with everything visible, the form shows only the sections that apply to *this* record, in *this* state.' },
          { t: 'h', x: 'The value' },
          {
            t: 'table',
            head: ['Problem without dynamic forms', 'How a dynamic form solves it'],
            rows: [
              ['Every user sees every field', 'Sections appear only when their rules match'],
              ['Guidance is buried in a field description', '**Guidance text** sits in the section, next to the fields it explains'],
              ['Different roles need different fields on the same record type', 'Rules can key off the **current user** and their permissions'],
              ['Fields appear after a state change, in a fixed order', 'Rules key off **record values**, so the form reshapes as the record moves'],
              ['Long forms force scrolling and hunting', 'Short, conditional sections with clear titles']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Dynamic forms do **not** control **requiredness**. A field marked required on the object is required on every dynamic form. If a field must be required for some records and optional for others, that is a **validation rule** (Phase 7), not a dynamic form.' },
          { t: 'h', x: 'Dynamic form vs the alternatives — the exam question' },
          {
            t: 'table',
            head: ['If the need is…', 'Use', 'Why'],
            rows: [
              ['Fields differ by **record type**', '**Record type** + its page layout (Phase 8)', 'The difference is structural: different types, different layouts. Dynamic forms add nothing here.'],
              ['Fields appear based on **field values** or **record state**', '**Dynamic form** section rules', 'This is exactly what rules are for. A layout cannot hide a field based on another field\'s value.'],
              ['Fields differ by **user** or **permission**', '**Dynamic form** rules', 'Rule on the current user or their permissions. Layouts cannot see the user.'],
              ['A field is **required** in some situations only', '**Validation rule** (Phase 7)', 'Dynamic forms cannot make a field conditionally required.'],
              ['Stop a save on a condition', '**Validation rule**', 'A dynamic form is presentation only; it never blocks a save.'],
              ['Gather data with logic, or multi-step', '**Screen flow** (Phase 9)', 'A dynamic form has no branching, no calculations, no record creation.'],
              ['Embed the form with related records and components', '**Lightning page** (Phase 12)', 'A dynamic form is a component *inside* a page.'],
              ['Change the record type itself', 'A **record type field** or a screen flow', 'Dynamic forms are for sections, not for switching type.']
            ]
          },
          { t: 'selfcheck', q: 'Sales reps should not see the "Cost Margin" fields on Opportunities, but their managers should. Both use the same record type. What do you build?', a: 'A **dynamic form section** whose rule checks the current user\'s profile or permission. Record types cannot help — both use the same type. A page layout cannot either, because layouts are not user-aware. This is the single most common real-world reason to reach for dynamic forms.' },
          {
            t: 'ex',
            id: '13.1',
            title: 'Pick the right tool for each requirement',
            obj: 'Stop reaching for dynamic forms when a layout, rule or flow is the honest answer.',
            stars: 2,
            steps: [
              'For each, choose: RECORD TYPE + LAYOUT, DYNAMIC FORM, VALIDATION RULE, SCREEN FLOW, or LIGHTNING PAGE. One sentence of reasoning.',
              'R1: Enterprise Accounts get a "Contract Terms" section; SMB Accounts do not.',
              'R2: The "Discount Authority" section only appears once the discount exceeds 15%.',
              'R3: A discount over 15% cannot be saved without a manager\'s name in the notes field.',
              'R4: Sales reps see quote details, but Finance also sees the margin block.',
              'R5: A three-step form that collects Account, then Products, then delivery details, and creates the record at the end.',
              'R6: A page hosting the form at the top, the approval history in the middle, and a Flow button at the bottom.',
              'For R3, name the exact tool and say why a dynamic form cannot do it.'
            ],
            verify: 'R1 RECORD TYPE + LAYOUT — the difference is structural by category, which is what record types are for; adding dynamic forms on top of per-type layouts is duplicate work. R2 DYNAMIC FORM — the condition is a field value on the record itself, which a layout cannot evaluate. R3 VALIDATION RULE — it must block a save, and a dynamic form is presentation only with no conditional requiredness. R4 DYNAMIC FORM — the condition is the current user and their permissions, invisible to a page layout. R5 SCREEN FLOW — multi-step with branching and record creation; a dynamic form has no wizard behaviour. R6 LIGHTNING PAGE — a dynamic form is a component inside a page, so hosting it with other components needs the page itself.'
          },
          {
            t: 'case',
            title: 'The form that asked for everything every time',
            org: 'Halcyon Motor Insurance (broker, 180 staff)',
            problem: 'Motor claims intake asked for a policy number, an incident date, a description, a fault determination, an excess waiver decision and three photographs on every claim, including straightforward glass replacements where four of those six questions are irrelevant. Handlers were spending most of a claim\'s handling time dismissing questions that should not have been there.',
            solution: 'A dynamic form with a section per claim type. Selecting Glass reveals two sections and hides four; selecting Accident reveals all of them. Each section carries its own field visibility and its own required rules, so the validation is right for the path the user actually took.',
            steps: [
              'List the fields the intake team currently asks for, then mark each as always needed, sometimes needed, or never needed.',
              'Find the one or two fields that decide the shape of the claim, and make those the branching fields.',
              'Put each combination of answers into its own section rather than trying to reuse one section with conditions on every field.',
              'Set required rules inside the sections rather than at the form level.'
            ],
            gotcha: 'A dynamic form reacts to values already on the record. If the field that drives the branching is empty, or sits in a later section the user has not reached, the form shows nothing and looks broken rather than dynamic.',
            exam: 'Dynamic forms change what is visible and what is required, based on data on the record. They add no fields and no records, and that boundary is what the questions test.'
          }
        ]
      },
      {
        title: 'Sections, rules and guidance',
        mins: 8,
        blocks: [
          { t: 'p', x: 'A dynamic form is a **list of sections**. Each section has a title, a set of fields, optional **guidance text**, and a **visibility rule**.' },
          { t: 'h', x: 'Section rules' },
          {
            t: 'table',
            head: ['Rule on', 'Example', 'Use for'],
            rows: [
              ['**A field value**', 'Section shows when \`Discount_Percent__c > 15\`', 'Fields relevant to the record state'],
              ['**The record type**', 'Shows for record type "Enterprise"', 'Usually better as a separate layout'],
              ['**The current user**', 'Shows for the "Sales Manager" profile', 'Role-based field visibility'],
              ['**User permissions**', 'Shows when the user can edit \`Credit_Terms__c\`', 'Permission-aware forms'],
              ['**A picklist value**', 'Shows when status is "Closed Lost"', 'Stage-specific guidance'],
              ['**Blank / not blank**', 'Shows when \`Account__c\` is blank', 'Capture steps before a record is linked']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'Rules are evaluated per section, and each rule is combined with the others in the section\'s configured logic. Getting the combination wrong is the usual cause of "the section shows when it should not" — check whether the rules are ANDed (all must match) or ORed (any may match).' },
          { t: 'h', x: 'Guidance text vs field description vs instructional text' },
          {
            t: 'table',
            head: ['Feature', 'Where it appears', 'Best for'],
            rows: [
              ['**Guidance text**', 'Inside the section, above the fields', 'Explaining what the *section* is for'],
              ['**Instructional text**', 'A section-level block, no fields', 'Warnings and the rules that apply'],
              ['**Field description** / help text', 'Under a single field on the layout', 'One field\'s meaning or format'],
              ['**Rich text component**', 'Anywhere on the page', 'Static guidance unrelated to the form']
            ]
          },
          { t: 'callout', kind: 'tip', x: '**Guidance text on a section beats a help text on every field.** Twenty field descriptions is twenty places to look; one paragraph above the section explains all of them and is read once.' },
          { t: 'h', x: 'Interaction with record types and permissions' },
          {
            t: 'table',
            head: ['Layer', 'Controls', 'Does NOT control'],
            rows: [
              ['Record type', 'Which layout and business process', 'Which fields a user sees'],
              ['Page layout', 'Which fields are on the page', 'Requiredness, or field-vs-field conditions'],
              ['**Dynamic form**', 'Which sections show, per record and user', 'Requiredness, validation, saving'],
              ['**Validation rule**', 'What is valid, and can reject a save', 'Anything visual'],
              ['**FLS / object permissions**', 'Which fields a user can read or edit at all', 'The order fields appear in']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'A dynamic form section can show a field the user is not allowed to **edit**, and it can even try to show a field the user cannot **read** — which errors. Always align the form with a permission set (Phase 2), not with the assumption that "everyone in sales can edit everything".' },
          { t: 'selfcheck', q: 'A section is set to show when `Discount_Percent__c > 15`, but it appears on every Opportunity. What is wrong?', a: 'Almost certainly the rule\'s field reference or its combination logic — check whether the section is also **ANDed** with an always-true rule, or the field is blank and the rule is effectively passing. A second common cause: the dynamic form is not actually the component on the page, so the page is still showing the plain **Record Details** layout underneath it.' },
          {
            t: 'ex',
            id: '13.2',
            title: 'Build a dynamic form section by section',
            obj: 'A real form specification with rules, guidance and the permission alignment.',
            stars: 2,
            steps: [
              'Design the Opportunity form as FIVE sections. For each: title, fields, guidance text, and the visibility rule.',
              'S1 Opportunity Details — always visible, no rule.',
              'S2 Commercials — only when the record type is "Enterprise" OR the amount is over 100000.',
              'S3 Discount Authority — only when the discount exceeds 15 percent, with guidance explaining the policy.',
              'S4 Margin — only for users with the "Finance" permission set.',
              'S5 Next Steps — only when the stage is not Closed Won and not Closed Lost.',
              'State the combination logic for S2 and explain the choice.',
              'Name the permission set the whole form depends on, and the one field that would error if it were missing.',
              'Explain how you would add the instructional text about the 15 percent discount policy.'
            ],
            verify: 'S1 "Opportunity Details": Name, StageName, Type, CloseDate, Next Step, Account. Always visible, no rule — no rule means no maintenance. S2 "Commercials": Amount, Discount_Percent__c, Credit_Terms__c, Pricebook2. Rule: OR(ISCHANGED-free, Record Type = "Enterprise", Amount > 100000) — ORed, because either condition alone is a legitimate reason to see commercial terms. S3 "Discount Authority": Approver__c, Authority_Notes__c. Rule: Discount_Percent__c > 15. Guidance text: "Discounts over 15% require Finance sign-off. Record the approver and the business reason before submitting." S4 "Margin": Cost_Margin__c, Margin_Percent__c. Rule on the current user\'s Finance permission set. S5 "Next Steps": Next_Step__c, Next_Step_Date__c. Rule: NOT(OR(StageName = "Closed Won", StageName = "Closed Lost")). Combination logic for S2 is OR because a big deal on an SMB account and a small deal on an enterprise account both need commercial terms; AND would hide them in both cases. Permissions: Brightline_Sales_User plus Brightline_Finance_User, with the Finance set gating S4. The field that errors without them is Cost_Margin__c — a finance-only field with no field-level security, which surfaces as a component error rather than a clean hide. Instructional text goes above S3 as a section-level block: "Policy: discounts above 15% are approved by Finance. Below 15% is your decision." It is instructional rather than guidance because it is a warning about the whole form, not an explanation of one section.'
          },
          {
            t: 'case',
            title: 'Required in a section nobody could reach',
            org: 'Ashgrove Care Homes (12 residential homes, 700 staff)',
            problem: 'A dependency-of-care form for new residents had "Primary Contact Relationship" marked required at the top, above the section that decides whether the resident has a family contact or a nominated individual. Staff filled in everything else, could not submit, and phoned the office to be told which answer was expected. The form had been live for six weeks before anyone moved the field.',
            solution: 'The decision field was moved up into a section of its own, above everything that depends on it. The rest was split into three sections - family contact, nominated individual, court appointed - and each was given guidance text saying what evidence the office needed and where to send it.',
            steps: [
              'Put every field that other fields depend on in a section above the sections that use it.',
              'Give each section a name that says which case it is for, so the user can tell which one they are in.',
              'Add guidance text stating what evidence is needed and who to send it to.',
              'Test the submit button on every path, not only on the default one.'
            ],
            gotcha: 'A required field that is not visible cannot be filled in, and the form will refuse to submit. Required-ness is not scoped to a section automatically - a field marked required at the form level still blocks the save even when the section holding it is hidden.',
            exam: 'Sections and their rules control visibility and requiredness, and a required field inside a hidden section still blocks the save. That is the trap most questions in this area are built on.'
          }
        ]
      },
      {
        title: 'Lightning pages that host forms',
        mins: 7,
        blocks: [
          { t: 'p', x: 'Phase 12 gave you the page components. Now the design question: when the page must hold a **form**, what goes on it?' },
          {
            t: 'table',
            head: ['Requirement', 'Component'],
            rows: [
              ['Fields with conditional sections and guidance', '**Dynamic Form**'],
              ['A flat field group', '**Record Details**'],
              ['A key-fields summary at the top', '**Record Highlights Panel**'],
              ['Step-by-step data capture with logic', '**Screen Flow** (a Flow component)'],
              ['One-click record creation', '**Quick Action** (Phase 12)'],
              ['A one-question form, e.g. a rating', '**Flow** in **Feedback Layout** mode'],
              ['Related records with filters', '**Related List — Single**']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'A screen flow placed as a Flow component **replaces the form view** — the user sees the wizard, not the record page. That is right for a guided process and wrong for "edit these five fields". Choosing wrongly is the most common page design mistake.' },
          { t: 'h', x: 'Layout order, and why it matters' },
          { t: 'num', items: ['**Record Highlights Panel** — the five fields that identify the record.', '**Dynamic Form** — the main work area, in the centre of the page.', '**Related Lists — Single** — context the user needs while filling the form.', '**Flow** — actions and secondary logic, below the fold.', '**Rich Text** — guidance at the bottom, not the top, so it does not push the form down.'] },
          { t: 'h', x: 'Activation and review' },
          {
            t: 'table',
            head: ['Step', 'Detail'],
            rows: [
              ['Activate the page', 'Per record type, as in Phase 12'],
              ['Test with **no data**', 'A section whose rule references a blank field may behave unexpectedly'],
              ['Test as each persona', 'Rep, manager, finance, read-only user'],
              ['Test on mobile', 'The form stacks to one column; section order changes'],
              ['Check the validation rules', 'A hidden field can still be required by a rule, which is the most common "the form will not save" report']
            ]
          },
          { t: 'callout', kind: 'tip', x: '**The classic dynamic-form bug:** a section hides "Approval Notes", but a validation rule (Phase 7) still requires Approval Notes when the discount is over 15%. The user cannot see the field, so they cannot satisfy the rule. Any conditional-required field must stay visible in the section that applies.' },
          { t: 'selfcheck', q: 'A user reports "I cannot save the form, but I cannot see what is missing." What are the two likely causes?', a: '1) A **validation rule** requires a field that a dynamic form section has **hidden** — the rule fires, but the field is not on the page. 2) The field **is** visible but required by the object\'s Required flag, while the user\'s field-level security makes it read-only. Both produce a save failure with an error the user cannot act on.' },
          {
            t: 'proj',
            id: '13.3',
            title: 'Design Brightline\'s dynamic-form UI',
            obj: 'A complete form and page design, buildable without code.',
            stars: 3,
            reqs: [
              'Scenario: Opportunity with record types (Phase 8), roll-ups and rules (Phase 7), approvals (Phase 10), and the Phase 12 record page.',
              'Design FIVE dynamic form sections for the Opportunity page. For each: title, every field, guidance text, and the exact visibility rule.',
              'At least one section must be rule-based on the **current user**, and one on a **picklist value**.',
              'Write the instructional text for the page and say why it is instructional rather than guidance text.',
              'Draw the component order of the whole record page, and justify the position of each component.',
              'Name the TWO permission sets this page depends on, and state which field errors without them.',
              'List every validation rule from Phase 7 that applies to Opportunity, and check each one: can the user see every field it needs?',
              'Decide where the "Submit for Approval" action lives, and why it is not inside the dynamic form.',
              'Write a test plan covering at least FIVE personas and scenarios.',
              'Explain the two failure modes you designed against, and what each produces for the user.'
            ],
            success: 'A five-section form with rules and guidance, a component layout with justified order, named permission sets, a Phase 7 rule-by-rule visibility audit, an action placement decision, a five-persona test plan, and the two failure modes named. All declarative.'
          },
          {
            t: 'case',
            title: 'The form on the page that was never saved',
            org: 'Cawdor Freight Services (haulage, 70 staff)',
            problem: 'A podamage report was built as a form embedded in the delivery record Lightning page. Drivers filled it in on depot wi-fi, the connection dropped, and closing the tab lost everything. Seven reports were re-entered from memory a week later and two were wrong - one of which sent an invoice to the wrong customer.',
            solution: 'The report moved to its own screen flow launched from the record, with a confirmation screen and an explicit save and finish. Each submission is its own transaction, so a dropped connection loses one answer rather than a whole form, and the flow was laid out to work on a phone.',
            steps: [
              'Move the form into a screen flow rather than embedding it in a record page.',
              'Give the flow a confirmation screen so the driver knows it committed.',
              'Keep the submission short enough to finish in one go on a phone.',
              'Launch it from the record so the driver never has to find it, but do not embed it.'
            ],
            gotcha: 'A form embedded in a record page lives inside that page\'s transaction. Nothing commits until the record itself is saved, so a dropped connection loses the whole form. A screen flow is a separate transaction with its own commit.',
            exam: 'Screen flows are the modern home for forms. Knowing when a record-page form is the wrong choice is the point of the lesson, and the answer is always about the transaction.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'A field must be REQUIRED only when the discount exceeds 15%, and optional otherwise. Which tool?',
          opts: ['A dynamic form section rule', 'A page layout field marked Required', 'A validation rule with an ISBLANK check', 'A duplicate rule on the field'],
          a: 2,
          why: 'A **validation rule** can reject a save when \`AND(Discount_Percent__c > 15, ISBLANK(Authority_Notes__c))\`. Dynamic forms control **visibility only** — they cannot make a field conditionally required. Marking it Required on the layout makes it required for everyone, and a duplicate rule is unrelated.'
        },
        {
          q: 'Sales reps must not see Margin fields on Opportunities, but Finance managers must. Same record type. What do you use?',
          opts: [
            'A second record type for Finance users',
            'A dynamic form section with a rule on the current user or their permissions',
            'Two page layouts, one per role',
            'Field-level security on the Margin fields'
          ],
          a: 1,
          why: 'The differentiator is **who the user is**, and a dynamic form rule can test the current user or their permissions. A record type changes the *record* category, not the user. Two layouts cannot be assigned by role. Field-level security would work to hide the data, but the requirement here is a *section* on a shared page, which is the dynamic form\'s purpose.'
        },
        {
          q: 'A user cannot save the Opportunity form, but no obvious field is missing. What is the most likely cause?',
          opts: [
            'The dynamic form is not activated',
            'A validation rule requires a field that a hidden dynamic form section would have shown',
            'The record type is inactive',
            'Too many components on the page'
          ],
          a: 1,
          why: 'A validation rule fires on the **record\'s values**, and a dynamic form section only changes what is **visible**. If the rule requires a field whose section is hidden, the user gets a save error with no field on screen to satisfy it. This is the classic dynamic-form failure mode and the fix is to keep conditionally-required fields visible in the section that applies.'
        },
        {
          q: 'Where does guidance text belong?',
          opts: [
            'In the field description of every field in the section',
            'Inside the section, above the fields it explains',
            'In a Rich Text component at the bottom of the page',
            'In the page title'
          ],
          a: 1,
          why: '**Guidance text** is a section-level feature that sits above the fields and explains what the section is for. Field descriptions scatter the same explanation across twenty places. A Rich Text component is static page content unrelated to the form. Guidance text is read once and applies to the whole section.'
        },
        {
          q: 'Which TWO statements about dynamic forms are TRUE? (Choose all that apply.)',
          opts: [
            'They can control which sections are visible based on field values',
            'They can make a field required only in certain circumstances',
            'They can show different sections to different users based on permissions',
            'They can reject a save when a condition is not met'
          ],
          a: [0, 2],
          why: 'Dynamic forms control **visibility**, and they can do it on **field values** and on **the current user\'s permissions**. They cannot make a field **conditionally required**, and they cannot **reject a save** — a dynamic form is presentation only. Both of those belong to a validation rule, which is why a hidden field that a rule still requires is the classic dynamic-form bug.'
        },
        {
          q: 'You place a screen flow as a Flow component on a Lightning record page. What does the user see when they open the record?',
          opts: [
            'The record page with the flow available as a button',
            'The flow wizard, because the Flow component replaces the page view',
            'Both side by side on desktop',
            'The dynamic form with the flow running on save'
          ],
          a: 1,
          why: 'A **screen flow** placed as a Flow component **replaces the form view** — the user sees the wizard rather than the record page. That is correct for a guided process and wrong for "edit these five fields". If you want a button on the record page, use a Quick Action or a Lightning action instead.'
        }
      ]
    }
  },
  {
    id: 'console',
    n: 14,
    title: 'Lightning Console & Experience Sites',
    icon: '🗂️',
    color: '#0EA5E9',
    tagline: 'Side-by-side working, pinned context, and a brand users recognise',
    exam: 'ui',
    guide: '14-Lightning-Console-Experience-Sites.md',
    objectives: [
      'Describe what a console app does that a standard app cannot',
      'Distinguish primary tabs, secondary tabs, panes and subtabs',
      'Build a console tab set with a sensible primary and secondary structure',
      'Choose which navigation items belong in the app and which belong in the utility bar',
      'Explain what a theme controls and what it does not',
      'Explain the difference between a theme, a branding set and My Domain'
    ],
    art: [],
    lessons: [
      {
        title: 'What a console app actually adds',
        mins: 7,
        blocks: [
          { t: 'p', x: 'A standard Lightning app shows **one record at a time**. You open an Opportunity, decide you need the Account, click through, and the Account replaces the Opportunity. Then you click back. A **console app** shows **several records at once**, in panes, and keeps them all live while the user moves between them.' },
          { t: 'h', x: 'The panes' },
          {
            t: 'table',
            head: ['Element', 'What it is', 'Behaviour'],
            rows: [
              ['**Primary tab bar**', 'The main navigation row at the top of a console', 'Clicking one **replaces** the content in the single main pane'],
              ['**Main pane**', 'The one big area under the primary tabs', 'Holds exactly one primary tab at a time'],
              ['**Secondary tabs**', 'A row inside a primary tab', 'Opens a **split pane** or a **three-pane** layout — parent on the left, child on the right'],
              ['**Subtabs**', 'Related lists and high-signal sections on a record', 'Swap content **within** a pane, never across panes']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'The exam test: **primary tabs replace; secondary tabs sit beside.** If a design says "keep the Account visible while I work the Opportunity", that is a secondary tab. If it says "go to Accounts instead", that is a primary tab.' },
          { t: 'h', x: 'Why a console changes the work' },
          { t: 'list', items: ['**No navigating back.** Nothing is replaced, so nothing needs restoring.', '**Context is visible.** The user can see whether the Account is an Enterprise deal before approving anything.', '**Fewer records to reopen.** A support rep working a queue of Cases does not lose their place between two records.', '**Cost.** More components, more queries, more data in one page. A console on a phone is cramped, and it is a desktop-first pattern.'] },
          { t: 'callout', kind: 'warn', x: 'Console apps are a **Lightning Experience** feature. A Lightning console app cannot be rendered in Salesforce Classic, and the classic console is a different, older feature. Do not conflate them.' },
          { t: 'h', x: 'The console tab set' },
          { t: 'p', x: 'The structure lives in a **console tab set**: which primary tabs exist, which secondary tabs each one opens, and whether each secondary tab opens in a **split pane** or a **three-pane** layout. The console tab set is then added to an app as a navigation item, so one structure can be reused across apps.' },
          { t: 'h', x: 'Pinning and defaults' },
          { t: 'p', x: 'Users can **pin** console tabs to keep them permanently available, and the app can define which tabs are pinned **by default**. Pinning is a convenience, not a security control — it changes nothing about who can see a record.' },
          { t: 'selfcheck', q: 'A rep must keep the Opportunity visible while checking its Account and its Quote Requests at the same time. Which structure?', a: '**Secondary tabs** in a split pane or three-pane layout, inside a console app. The Opportunity is the parent; the Account and Quote Requests sit beside it. Primary tabs would replace the Opportunity each time, which is exactly the problem being solved.' },
          {
            t: 'ex',
            id: '14.1',
            title: 'Design a console tab set',
            obj: 'A tab structure where every tab earns its place.',
            stars: 2,
            steps: [
              'Design a console tab set for Brightline Sales with THREE primary tabs.',
              'Choose the objects and explain why those three, not the other standard objects.',
              'For the Opportunity primary tab, list its secondary tabs. Name which open in a SPLIT pane and which in a THREE-PANE layout, and justify each choice.',
              'Say what you will pin by default.',
              'Explain why a Case, an Opportunity and an Account cannot all be secondary tabs of one primary tab.'
            ],
            verify: 'Three primary tabs, e.g. Leads, Opportunities, Quotes. For Opportunity: Account (split pane — parent and account are read together, one level of context), Quote Requests (three pane — parent left, quote list centre, selected quote right), Contacts (split pane). Subtabs inside the Account pane for related lists rather than another pane, because they are context rather than a parallel record to work. Pin Quotes by default, since that is where the queue is. Leads / Opportunities / Quotes cannot all be secondary tabs of one primary tab because a secondary tab set has a single parent record — a Lead and an Opportunity have no common parent, so there is nothing to sit beside.'
          },
          {
            t: 'case',
            title: 'Two panes and no way back',
            org: 'Verity Claims Services (motor claims, 220 staff)',
            problem: 'The claims team moved to a console app to get a queue and a record side by side, and handling time went up rather than down. Every record component they clicked opened in the primary pane and replaced the queue, so they lost their place, scrolled back to find where they were, and started work again.',
            solution: 'A console navigation that declares the record pages as sub-pane components, so the queue stays on the left and the record opens beside it. Each pane got a back button, and the tab that was being used as a primary pane was moved into the console navigation.',
            steps: [
              'Decide what the handler is working from - usually a queue - and make that a console navigation item.',
              'Declare the record pages as sub-pane components so they open beside the queue instead of replacing it.',
              'Give every pane a way back, so a handler is never stranded one record deep.',
              'Move the tabs that were opening in the primary pane into the console navigation.'
            ],
            gotcha: 'In a console app a tab that is not part of the console navigation still opens in the primary pane and replaces whatever was there. Which components are in the console navigation is the entire design, not a detail.',
            exam: 'A console app needs the app, a console navigation and at least one sub-pane component. Anything outside the navigation behaves exactly as it would in any other app.'
          }
        ]
      },
      {
        title: 'Navigation, and deciding where a component belongs',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Phase 12 built the pages. This phase decides **where they live**, and the exam tests that judgement more than the clicking.' },
          { t: 'h', x: 'The navigation item types' },
          {
            t: 'table',
            head: ['Item type', 'Hosts', 'Use when'],
            rows: [
              ['**Standard object tab**', 'The built-in list view and record pages', 'The object needs its own top-level space'],
              ['**Web tab**', 'A URL', 'An external system genuinely belongs in the nav'],
              ['**App page**', 'App Builder content with no record behind it', 'Dashboards, trackers, a pipeline overview'],
              ['**Lightning page tab**', 'A Lightning page from App Builder', 'A custom tab built from components'],
              ['**Console tab**', 'A console tab set of primary and secondary tabs', 'Work needs records side by side'],
              ['**Report tab**', 'A folder of reports and dashboards', 'Users need the reports as a destination'],
              ['**Utility bar items**', 'Actions and tools available everywhere', 'Always-available actions, not navigation']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'The mistake to avoid is **duplicating** the same destination in two places. A Lightning page tab *and* a standard tab for Opportunities gives two places to look and two sets of confusion. Pick one, and give the other up.' },
          { t: 'h', x: 'What goes in the app and what goes in the utility bar' },
          {
            t: 'table',
            head: ['Belongs in the app', 'Belongs in the utility bar'],
            rows: [
              ['A destination the user visits', 'An action the user performs'],
              ['Pipeline, Quotes, My Day, Reports', 'Log a Call, New Task, Notes and Files'],
              ['Something with a record or list behind it', 'Something that works on whatever record is open'],
              ['Changes as the user moves between jobs of work', 'Stays put while the record underneath changes']
            ]
          },
          { t: 'p', x: 'A utility bar item is available **across the app** and appears in the same position wherever the user is. That makes it right for a recurring action and wrong for a place to navigate to.' },
          { t: 'h', x: 'Other navigation worth naming' },
          { t: 'list', items: ['The **app launcher** (the nine-dot grid) switches between apps, and its contents are profile-filtered.', '**App navigation** is the left rail of items and **workspace** folders beneath it.', '**Lightning pages** can be added as tabs to a console app as well as a standard app — they are not console-only or app-page-only.', 'The **utility bar** can hold items, and its own settings control what appears on mobile versus desktop.'] },
          { t: 'h', x: 'Organising with workspace folders' },
          { t: 'p', x: 'Too many tabs is the failure mode of a growing app. **Workspace folders** group navigation items under a collapsible label, so a rep sees "Sell", "Quote", "Deliver" instead of fourteen undifferentiated tabs. This is presentation, not permission — grouping does not restrict who sees what.' },
          { t: 'selfcheck', q: 'A team adds a Lightning page tab for Opportunities while the standard Opportunities tab already exists in the app. What is the problem and what fixes it?', a: 'Two navigation items lead to the same object, so users get two sets of list views and pages, and support cannot say which one is canonical. Fix: keep **one** — either the standard tab or the Lightning page tab — and remove or repurpose the other. If the Lightning page replaces the record page, the standard tab can still exist for its list views, but then it must not carry a second activation path.' },
          {
            t: 'ex',
            id: '14.2',
            title: 'Place the Brightline navigation',
            obj: 'Every destination in the app and every action in the utility bar, each with a reason.',
            stars: 2,
            steps: [
              'List every navigation item for the Brightline Sales app. For each one, give the item type and say what it hosts.',
              'Move anything that belongs in the utility bar out of the list, and say why it moved.',
              'Group the remaining navigation items into workspace folders.',
              'Name one item you deliberately left OUT, and say what would justify adding it.'
            ],
            verify: 'Pipeline (app page, no record behind it), My Day (app page), Quote Builder (Lightning page tab from Phase 12), Opportunities and Accounts and Contacts (standard object tabs), Sales Reports (report tab). Utility bar takes Log a Call, New Task, Notes and Files — actions, not destinations, and each must work on whatever record is open. Workspace folders: SELL (Leads, Accounts, Contacts, Opportunities), QUOTE (Quote Builder, My Day), REPORT (Sales Reports). Left out: Cases, because Brightline has a separate Service app (Phase 12) — duplicating it here would give reps a tab they cannot use, and it would only be justified if reps genuinely triaged Cases, in which case it belongs in the Service app instead.'
          },
          {
            t: 'case',
            title: 'Four components on one screen',
            org: 'Cassidy & Roe Supermarkets (12 stores, 600 staff)',
            problem: 'One page carried the store record, twelve months of till reconciliation history, an approval action and a customer complaints list. On the thirteen-inch screen in the back office it was unusable, and the complaints list made the page take long enough to load that users reported it as "the page is broken" and started keeping their own notes.',
            solution: 'Split by frequency of use. Record highlights and the approval action stayed on the page. Reconciliation history became a related list with a filter. Complaints moved to their own tab with its own layout, and the page load dropped to something usable on the back-office hardware.',
            steps: [
              'List every component on the page and mark how often each is actually used.',
              'Keep the frequently used ones on the page and move the rest to related lists or their own tabs.',
              'Check the page on the oldest screen the team actually uses, not on a new laptop.',
              'Look at what each component costs to load before deciding it earns its place.'
            ],
            gotcha: 'Components on a page are not free. Each one is a separate request, and four heavy components make a page slow enough that users blame the record rather than the layout - which is how a design problem gets reported as a performance bug.',
            exam: 'Page layout decides where components sit; Lightning App Builder decides what is on the page and which app it belongs to. A question about a crowded page is usually testing the split between the two.'
          }
        ]
      },
      {
        title: 'Themes, branding sets and My Domain',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Branding is the least functional and most frequently asked-about area. The words get confused: a **theme** styles pages, a **branding set** styles apps and the login experience, and **My Domain** is the org\'s web address. None of them grants permission or changes data.' },
          { t: 'h', x: 'What a theme controls' },
          {
            t: 'table',
            head: ['Theme setting', 'What it affects'],
            rows: [
              ['**Logo and name**', 'The logo in the header and on the login page'],
              ['**Color palette**', 'Header background, link and accent colors, highlight colors'],
              ['**Font**', 'The typeface used across the app'],
              ['**Text treatments**', 'Field-type colors — for example how a lookup, a URL or an encrypted field renders'],
              ['**Lookup field color**', 'Distinguishes a lookup from ordinary text at a glance']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Text treatments are the quiet feature. A theme can make every encrypted custom field render in a distinct color, so a rep spots a stored card number without reading it. That is worth knowing on the exam because nobody expects it from "themes".' },
          { t: 'h', x: 'The two ways a theme can be applied' },
          { t: 'list', items: ['**Theme by record type** — one theme per record type. Useful when Enterprise records should look visibly different from SMB records.', '**Theme by app, tab and app page** — the default pattern. A theme applies to an app, and can be narrowed to a single tab or app page.'] },
          { t: 'h', x: 'Branding sets' },
          { t: 'p', x: 'A **branding set** is broader than a theme. It carries the logo, images and colors used by the **app frame, the login experience and the mobile app**, and it can be set as the org-wide default or assigned to a specific app. So a theme changes pages *inside* an app; a branding set changes what the app looks like *from the outside*.' },
          {
            t: 'table',
            head: ['Layer', 'Question it answers'],
            rows: [
              ['**Theme**', 'What do the pages inside this app look like?'],
              ['**Branding set**', 'What does this app look like in the launcher, the login page and on mobile?'],
              ['**My Domain**', 'What is the org called in a URL and an email signature?']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'Plan the palette before activating. A theme that is active is not freely editable afterwards, and switching it changes colours on every page at once — which is how a production org ends up with unreadable buttons and a trail of support tickets.' },
          { t: 'h', x: 'My Domain and custom domains' },
          { t: 'p', x: '**My Domain** is the single custom address for the org — for example `brightline.my.salesforce.com`. It appears in the URL, in email templates, and in links users share. There is **one My Domain per org**. Additional **domains** can be registered for specific purposes such as a branded site or a custom login address, and those are separate from My Domain.' },
          { t: 'h', x: 'Experience Sites, in awareness terms' },
          { t: 'p', x: 'An **Experience Site** (formerly Community or Partner Central) is an externally facing, branded site with its own URL, its own navigation, a **guest user** running the site, and its own sharing. Brightline\'s partner portal is the example: partners log in without being Salesforce users and see only their own deals. The design overlap with console and themes is the branding; the difference is that the site runs as a guest and needs **sharing** to decide what the guest can reach.' },
          { t: 'selfcheck', q: 'Brightline wants its mobile app, login page and app launcher to carry the new logo and colours, and every page inside the app to match. Which two configurations are involved?', a: 'A **branding set** for the login page, launcher and mobile app, and a **theme** for the pages inside the app. Branding set covers the outer layer — it can be the org-wide default or assigned to the Brightline apps. The theme covers logo, palette, font and text treatments on the pages themselves. My Domain is neither: it is the URL and org name, and changing it does not restyle anything.' },
          {
            t: 'proj',
            id: '14.3',
            title: 'Design the Brightline Experience layer',
            obj: 'A console app, navigation and branding spec — buildable with configuration only.',
            stars: 3,
            reqs: [
              'Scenario: Brightline is rolling out Salesforce to a 40-person sales org. Reps work Opportunities and Quotes; managers also need pipeline visibility.',
              'Design the **console tab set**: primary tabs, secondary tabs, and pane choice for each, with a justification per secondary tab.',
              'Say which tabs are **pinned by default**, and explain what pinning does and does not change.',
              'Produce the full **navigation plan** for the Brightline Sales app: every item, its type, and its workspace folder.',
              'Write the **utility bar** specification: every item, and why each is an action rather than a destination.',
              'Name **one destination you deliberately excluded**, and what would justify adding it back.',
              'Define a **theme**: logo, palette, font, and two **text treatments** worth setting, with the reasoning.',
              'Define a **branding set** and say where it applies. State whether it is org-wide or per-app.',
              'Explain the difference between the theme, the branding set and **My Domain** in three sentences a new admin could act on.',
              'Write a **staged rollout plan**: what goes to a sandbox first, what is verified, and what would make you stop.',
              'Explain what happens to the Salesforce Classic users during this rollout, and how you keep them working.'
            ],
            success: 'A console tab set with justified primary and secondary tabs and pane choices, a pinned-tab decision, a full navigation and workspace-folder plan, a utility bar specification, a named exclusion with its re-entry condition, a theme with two reasoned text treatments, a branding set with its scope, a clear three-layer explanation of theme / branding set / My Domain, a staged rollout with a stop condition, and a Classic continuity plan. All declarative, no code.'
          },
          {
            t: 'case',
            title: 'The logo that vanished after every deploy',
            org: 'Harbourlight Hospice (charity, 60 staff)',
            problem: 'The charity set its logo and colours directly in Setup, which looked right immediately. Then they started deploying their configuration from a repository, and every deploy put the branding back to the Salesforce default. The service desk logged the same ticket three times in a month, each time from a different person, each time phrased as "has the site been hacked".',
            solution: 'The branding was rebuilt as a branding set with a Lightning theme that references it, because both are metadata and travel with a deployment. My Domain was configured once with the charity\'s own domain name, and the settings were deployed rather than set by hand.',
            steps: [
              'Put branding into a branding set rather than changing it in Setup.',
              'Reference that branding set from a Lightning theme so the two travel together.',
              'Configure My Domain once and set the custom domain in the domain settings, not per org.',
              'Deploy the theme and branding set to a sandbox and confirm the logo survives before promoting.'
            ],
            gotcha: 'Branding set and theme are metadata. Branding changed directly in Setup is org configuration that a deploy overwrites - which is exactly why it disappears, and why the first instinct is always to suspect something worse.',
            exam: 'Know which branding configuration travels with a deployment and which does not. The exam expects theme, branding set and My Domain to be treated as one deployment-aware problem.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'In a Lightning console app, what is the difference between a primary tab and a secondary tab?',
          opts: [
            'Primary tabs sit beside each other; secondary tabs replace each other',
            'Primary tabs replace the content in the main pane; secondary tabs open beside it in a split or three-pane layout',
            'Primary tabs are for standard objects; secondary tabs are for custom objects',
            'There is no difference in Lightning, only in Salesforce Classic'
          ],
          a: 1,
          why: 'The **primary tab bar** is top-level navigation: clicking one **replaces** what is in the single main pane. **Secondary tabs** open inside a primary tab and render beside the parent record in a **split pane** or **three-pane** layout. That is what lets a user keep an Opportunity visible while reading its Account. Pane behaviour, not object type, is the distinction.'
        },
        {
          q: 'Where should a "Log a Call" action that must be available on every record live?',
          opts: [
            'As a Lightning page tab, so it appears in the navigation',
            'As a utility bar item',
            'As a secondary console tab, so it sits beside the record',
            'As an app page, so it is always loaded'
          ],
          a: 1,
          why: 'The **utility bar** stays in the same position across the app and works on whatever record is currently open, which is exactly what a recurring action needs. A **navigation item** is a destination the user visits, not an action they perform. A secondary tab is for showing *related records* beside the current one, not for hosting a button.'
        },
        {
          q: 'What is the difference between a theme and a branding set?',
          opts: [
            'A theme styles pages inside an app; a branding set styles the app frame, login page and mobile app',
            'A theme is for Lightning; a branding set is for Salesforce Classic',
            'A theme applies org-wide; a branding set applies per record type',
            'They are two names for the same metadata type'
          ],
          a: 0,
          why: 'A **theme** controls logo, colour palette, font and text treatments on the pages inside an app, applied by record type or by app/tab/app page. A **branding set** covers the outer layer: the app frame, the login experience and the mobile app, set org-wide or assigned to a specific app. My Domain is a third, separate thing — the org URL and name.'
        },
        {
          q: 'How many My Domain addresses can a Salesforce org have?',
          opts: [
            'One per environment, so one in production and one in sandbox',
            'One per business unit',
            'One — additional custom domains are registered separately',
            'Unlimited, one per app'
          ],
          a: 2,
          why: 'An org has **one My Domain**, created with the org, and it appears in URLs, email templates and shared links. Additional **domains** can be registered for particular purposes — a branded site, a custom login address — and those are separate registrations rather than more My Domains.'
        },
        {
          q: 'A console app is not rendering for a group of users. What is the most likely cause?',
          opts: [
            'The users are on mobile, where consoles are unsupported',
            'The console tab set has not been added as a navigation item to the app, or the app itself has not been assigned',
            'The theme is not active',
            'The users lack Modify All Data'
          ],
          a: 1,
          why: 'Building a **console tab set** does not put it in an app. The tab set must be added as a navigation item to the app, and the app must be assigned to the users through a profile or permission set. Mobile is not the issue — console layouts are simply cramped on a phone, but the app still exists there. Theme and Modify All Data have nothing to do with whether a console renders.'
        },
        {
          q: 'Which TWO are true about Lightning Experience navigation? (Choose all that apply.)',
          opts: [
            'Workspace folders group navigation items for display, but do not change who can see them',
            'A Lightning page tab can be added to a console app as well as a standard app',
            'Adding the same object as both a standard tab and a Lightning page tab is good practice, so users have two routes',
            'The app launcher contents are profile-filtered'
          ],
          a: [0, 1],
          why: '**Workspace folders** are presentation: they group items under a label and change nothing about access. A **Lightning page tab** is not tied to one page type and can be a navigation item in a console app as well. **Having both a standard tab and a Lightning page tab for the same object is duplication**, not good practice — two destinations, two sets of confusion. The **app launcher** does filter its contents by profile.'
        }
      ]
    }
    },
  {
    id: 'packaging',
    n: 15,
    title: 'Packaging & Metadata Deployment',
    icon: '📦',
    color: '#6366F1',
    tagline: 'Move configuration safely from source to org without breaking dependencies',
    exam: 'deploy',
    guide: '15-Packaging-Metadata-Deployment.md',
    objectives: [
      'Define metadata and explain how it differs from org data',
      'Distinguish package types used in Salesforce (unmanaged, unlocked, managed 2GP)',
      'Describe the purpose of a package.xml manifest',
      'Compare source format and metadata format',
      'Explain deployment approaches and when destructive changes are required',
      'Identify common deployment errors and how to validate before deployment'
    ],
    art: [],
    lessons: [
      {
        title: 'Metadata fundamentals and packaging types',
        mins: 8,
        blocks: [
          { t: 'p', x: 'When you build declaratively, you are creating metadata — the configuration that defines your org. To move that configuration between environments, you need to package and deploy it in a controlled way.' },
          { t: 'h', x: 'Metadata vs data' },
          {
            t: 'table',
            head: ['Concept', 'What it is', 'Examples'],
            rows: [
              ['Metadata', 'Configuration that defines structure and behavior', 'Objects, fields, flows, page layouts, record types'],
              ['Data', 'Records stored in that structure', 'Accounts, Opportunities, Contacts']
            ]
          },
          { t: 'callout', kind: 'tip', x: 'Deployments move metadata, not data. Data loads require separate tools (Data Loader, etc.).' },
          { t: 'h', x: 'Package types' },
          {
            t: 'table',
            head: ['Type', 'Use case', 'Upgradeable', 'Notes'],
            rows: [
              ['Unmanaged', 'One-off distribution or moving config between orgs', 'No', 'Source is open; changes do not upgrade existing installations'],
              ['Unlocked', 'Internal modular packaging', 'Yes', 'Good for internal reuse; can be upgraded without locking IP'],
              ['Managed (2GP)', 'AppExchange/ISV distribution', 'Yes', 'IP protected, versioned, upgradeable']
            ]
          },
          { t: 'callout', kind: 'warn', x: 'For Platform App Builder work in internal orgs, unmanaged and unlocked packages are most common.' },
          {
            t: 'ex',
            id: '15.1',
            title: 'Choose the right package type',
            obj: 'Decide between unlocked and unmanaged for a set of realistic internal requirements.',
            stars: 2,
            steps: [
              'For each requirement below, name the package type you would use and justify it in one sentence. The justification matters more than the label.',
              'R1: A shared library of common objects and flows that three internal teams will keep extending over the next two years.',
              'R2: A one-off template org you are cloning so a new starter has a working sandbox in ten minutes.',
              'R3: Bundling your org\'s configuration to hand to an external consultancy that will adapt it for their own client.',
              'R4: You built a proof of concept, it works, and nobody is going to maintain it or push updates.',
              'Name the one word that decides it in every case: does this thing need to be UPDATED in place later?'
            ],
            verify: 'The deciding word is upgradeable. R1 = unlocked: several consumers, and it must receive updates without re-deploying over the top. R2 = unmanaged: it is a snapshot, copied once, never upgraded. R3 = unmanaged: a single hand-off, adapted downstream, no upgrade path. R4 = unmanaged: no consumer to upgrade, and an unlocked package you never maintain is pure overhead. Unmanaged is the default when in doubt; unlocked only earns its keep when you are the author AND a consumer of the same package.'
          },
          {
            t: 'case',
            title: 'The template that could not be upgraded',
            org: 'Vector Field Systems (field service software vendor, 30 staff)',
            problem: 'The vendor packaged their whole product as an unmanaged package and installed it into a customer org. Ten months later the customer asked for a feature. The vendor edited the source, rebuilt the package, and told the customer to uninstall first and reinstall. Uninstalling removed the customer\'s own configuration along with it, because an unmanaged install cannot tell author code from customer code. The relationship did not survive it.',
            solution: 'Rebuilt as an unlocked package with a namespace. The vendor now publishes versions, the customer upgrades in place, and the vendor\'s own metadata sits in a namespace the customer\'s administrator cannot edit by accident.',
            steps: [
              'Decide whether anything will ever need to be updated in the installed org.',
              'If yes, use an unlocked package for internal work or managed 2GP for distribution - both are upgradeable.',
              'Put the package in a namespace so author metadata is distinguishable from customer metadata.',
              'Publish versions rather than shipping a rebuilt archive.'
            ],
            gotcha: 'Unmanaged packages are not upgradeable in place. To ship any change you uninstall, and uninstalling deletes the installed components along with everything the customer built on top of them. That is not a deployment inconvenience, it is data loss.',
            exam: 'Managed 2GP and unlocked are upgradeable; unmanaged is not. Version numbering and namespace protection come with the upgradeable types, and that is the reasoning a question is asking for.'
          }
        ]
      },
      {
        title: 'Manifests and source format',
        mins: 8,
        blocks: [
          { t: 'p', x: 'The package.xml manifest tells Salesforce which metadata components to retrieve or deploy as part of a package operation.' },
          { t: 'h', x: 'package.xml structure' },
          { t: 'code', lang: 'xml', x: '<?xml version="1.0" encoding="UTF-8"?>\n<Package xmlns="http://soap.sforce.com/2006/04/metadata">\n  <types>\n    <members>Brightline_Sales_User</members>\n    <name>PermissionSet</name>\n  </types>\n  <version>58.0</version>\n</Package>' },
          { t: 'callout', kind: 'tip', x: 'Wildcard members (*) can be used to include all components of a type when appropriate.' },
          { t: 'h', x: 'Source format vs metadata format' },
          {
            t: 'table',
            head: ['Format', 'Structure', 'Version control', 'Typical use'],
            rows: [
              ['Source format', 'Decomposed files in directories (force-app/main/default)', 'Ideal for Git', 'Modern SFDX projects, scratch orgs'],
              ['Metadata format', 'Zipped .zip package', 'Less convenient', 'Legacy Ant, some retrieve/deploy workflows']
            ]
          },
          {
            t: 'ex',
            id: '15.2',
            title: 'Read a manifest like an admin',
            obj: 'Take a package.xml apart and state exactly what it will and will not do in the target org.',
            stars: 2,
            steps: [
              'Use this manifest, the same one shown above:',
              '<?xml version="1.0" encoding="UTF-8"?><Package xmlns="http://soap.sforce.com/2006/04/metadata"><types><members>Brightline_Sales_User</members><name>PermissionSet</name></types><version>58.0</version></Package>',
              'State the API version it targets, and the single metadata component it names.',
              'Say precisely what happens to every OTHER permission set in the target org when this deploys.',
              'Decide whether this manifest moves any data. Explain your answer by naming the metadata type.',
              'Rewrite the manifest to also retrieve the Brightline_Quote object and all of its fields. What would <types> look like now?'
            ],
            verify: 'API version 58.0; the component is the PermissionSet Brightline_Sales_User. Every other permission set is untouched — a manifest deploys only the members it lists, it does not wipe the type. It moves NO data: PermissionSet is configuration, and deploying it never brings Accounts or Opportunities with it. For the rewrite you need two <types> blocks, one <name>PermissionSet</name> and one <name>CustomObject</name> with <members>Brightline_Quote</members>; adding all fields means a second block with <name>CustomField</name> and <members>Brightline_Quote.*</members>, because fields are a separate metadata type from the object that holds them.'
          },
          {
            t: 'case',
            title: 'The deploy that took the permission sets with it',
            org: 'Saltmarsh Marine Services (boat yard, 140 staff)',
            problem: 'Deployments ran from a generated manifest that listed every permission set in the org. A consultant had spent two months building the app the yard managers used, and had edited two of those permission sets by hand because it was quicker than the builder. The next deploy overwrote both, removed the app, and nobody could work out why the configuration they had been looking at every morning had disappeared overnight.',
            solution: 'A checked-in manifest with named members only, so a deploy can only touch what somebody deliberately listed and reviewed. Source format in the repository, so the manifest appears in the pull request and a wildcard is visibly a decision rather than a default.',
            steps: [
              'Replace wildcard members with named members in the manifest you deploy from.',
              'Keep the manifest in source control so changes to it are reviewed like any other change.',
              'Work in source format so the manifest and the components it names can be read in the same pull request.',
              'Keep hand edits out of deployed components - anything edited outside the builder will be overwritten.'
            ],
            gotcha: 'A wildcard member deploys everything of that type. Wildcards are convenient in a sandbox and dangerous in production, where somebody has always edited something by hand and has no way of knowing it was about to be overwritten.',
            exam: 'The manifest names the components a deploy touches, and source format is the decomposed layout that makes version control practical. Know exactly what deploying a wildcard member does.'
          }
        ]
      },
      {
        title: 'Deployment, validation and destructive changes',
        mins: 8,
        blocks: [
          { t: 'p', x: 'Deploying safely means validating dependencies, understanding order, and knowing when to remove components (destructive changes).' },
          { t: 'h', x: 'Deployment approaches' },
          { t: 'num', items: [
            'Validate first: run validation-only deployments when supported',
            'Deploy incrementally to avoid large, risky changes',
            'Check dependencies (referenced objects, fields, flows)',
            'Consider profile/permission set handling carefully'
          ] },
          { t: 'h', x: 'Destructive changes' },
          { t: 'p', x: 'Removing metadata requires a destructiveChanges.xml (and sometimes package.xml) because a normal deploy only adds/updates components.' },
          { t: 'callout', kind: 'warn', x: 'Destructive changes are irreversible in most cases. Always validate in sandbox first.' },
          { t: 'h', x: 'Common deployment issues' },
          { t: 'list', items: [
            'Missing dependencies or renamed components',
            'Active flows blocking deployment',
            'Validation rules preventing deployment of test data scenarios',
            'Incorrect API version mismatches',
            'Profile permissions referencing components that don\'t exist yet'
          ] },
          {
            t: 'case',
            title: 'The delete that was never deployed',
            org: 'Eaglewood School Trust (multi-academy trust, 2,000 pupils)',
            problem: 'The pilot team deleted their pilot field from the sandbox, saw it disappear, and assumed the deletion would travel with everything else. It did not, because the deployment had been run from a manifest listing only the components being added. The field was still in production four months after the cutover, still on the page layout, still in three reports, and still assigned in a permission set - so the trust could not tell which data was real and which was pilot residue.',
            solution: 'A destructive changes manifest naming the field by its full API name, deployed alongside a regular manifest that updates the layout and the reports which referenced it. It was validated in a full-copy sandbox first, then deployed in a window with a rollback plan written before the window opened.',
            steps: [
              'Decide, change by change, whether it makes something disappear or only adds or changes behaviour.',
              'Put everything that disappears in the destructive changes manifest, using full API names.',
              'Put everything that is added or updated in the regular manifest, including the layout and report edits that referenced the removed component.',
              'Validate in a full-copy sandbox, because that is the only place a deploy can be rehearsed honestly.'
            ],
            gotcha: 'Deleting something in a sandbox does not delete it in production. Removal needs its own manifest, and if anything still references the component the deploy fails - which is the deploy doing you a favour, because it has just told you what to clean up first.',
            exam: 'Normal deployments add and update. Destructive changes remove. The two are separate files, both are needed for a clean cutover, and the rule for deciding which is which is whether the change makes something disappear from the org.'
          }
        ]
      },
      {
        title: 'Practice & validation mindset',
        mins: 5,
        blocks: [
          { t: 'p', x: 'For App Builders, the key is to think in terms of metadata dependencies and safe promotion. Validate early and often.' },
          { t: 'selfcheck', q: 'True or false: Deployments move both metadata and data records.', a: 'False' },
          { t: 'selfcheck', q: 'Which package type is upgradeable and typically used for internal modular development?', a: 'Unlocked packages' },
          { t: 'selfcheck', q: 'What file defines which metadata components are included in a retrieve/deploy?', a: 'package.xml (manifest)' },
          {
            t: 'proj',
            id: '15.3',
            title: 'Plan a release that deletes things',
            obj: 'Classify a real change set into normal deploys and destructive changes, and produce the two manifests to match.',
            stars: 3,
            reqs: [
              'Scenario: Brightline is cutting over from the pilot configuration to the production one, and part of that means REMOVING metadata that the pilot created. You own the deployment.',
              'Classify each change below as NORMAL deploy or DESTRUCTIVE. For every destructive one, name the full API name you would put in destructiveChanges.xml.',
              'C1: Add a new field Warranty_Months__c to Contract.',
              'C2: Delete the Pilot_Flag__c field that the pilot team added to Opportunity.',
              'C3: Change the label of Account.AccountNumber from "Account Number" to "Customer Number".',
              'C4: Remove Pilot_Flag__c from the Opportunity page layout, but keep the field.',
              'C5: Deploy version 4 of the Quote_Approval flow over version 3.',
              'C6: Retire the old Quote_Request__c object now that orders are captured directly on Opportunity.',
              'Write the two manifests: what belongs in package.xml and what belongs in destructiveChanges.xml for the whole change set.',
              'State the order you would run them in, and the one thing you must verify in a sandbox before any of it touches production.'
            ],
            success: 'Six changes classified with a reason each, a destructiveChanges.xml naming Pilot_Flag__c and Quote_Request__c by full API name, a package.xml carrying only the additive and update components, and an explicit sandbox-first validation step. Remember the rule you are applying: if the change makes something DISAPPEAR from the org it is destructive; if it only adds something or changes how existing things behave, it is a normal deploy.'
          },
          {
            t: 'case',
            title: 'The sandbox that was not like production',
            org: 'Pinewood Montessori Trust (nursery group, 9 settings, 140 staff)',
            problem: 'Deployments validated cleanly in the developer sandbox every single time, and then failed in production. The difference was a validation rule on Contact that the sandbox did not have - added by an admin two years earlier by hand, never written down, and referenced by a profile the deployment touched. It failed on the profile, not on the rule, so the error message pointed at the wrong thing entirely.',
            solution: 'A full-copy sandbox refreshed from production on a schedule, with everything changed from that point onwards made declaratively so it exists in the repository. The release checklist now requires a validation-only run to be green in the full copy before anything is scheduled for production, and the admin hand edits were written down and brought under management.',
            steps: [
              'Refresh a full-copy sandbox from production regularly rather than relying on a small developer sandbox.',
              'Record every hand-made change so it can be recreated, and then bring it under management.',
              'Run a validation-only deployment first and read the whole result, not just the first error.',
              'Only schedule the real deployment once validation is green in an environment that matches production.'
            ],
            gotcha: 'A small sandbox is not a rehearsal for production. Anything set up by hand in production - rules, permission sets, flows - is invisible until the deploy reaches it, and the failure surfaces on whatever component referenced the hand-made piece rather than on the piece itself.',
            exam: 'Validate first, deploy incrementally, check dependencies, and handle profiles and permission sets deliberately. Knowing that a validation-only deployment exists and belongs at the start is most of the marks.'
          }
        ]
      }
    ],
    quiz: {
      questions: [
        {
          q: 'Metadata differs from data in that metadata represents...',
          opts: [
            'The records in your org',
            'The configuration and structure of your org',
            'Only user-generated content',
            'Only attachments'
          ],
          a: 1,
          why: 'Metadata is configuration (objects, fields, flows, layouts) — not the record data stored in them.'
        },
        {
          q: 'Which package type is IP-protected and upgradeable for AppExchange distribution?',
          opts: [
            'Unmanaged',
            'Unlocked',
            'Managed (2GP)',
            'Org package'
          ],
          a: 2,
          why: 'Managed 2GP packages are upgradeable and protect IP, making them suitable for AppExchange.'
        },
        {
          q: 'The package.xml file is best described as a(n)...',
          opts: [
            'Data export file',
            'Manifest specifying which metadata components to retrieve/deploy',
            'Test execution log',
            'Profile assignment list'
          ],
          a: 1,
          why: 'package.xml defines the components included in a metadata retrieve/deploy operation.'
        },
        {
          q: 'Source format is preferred in modern SFDX projects because it is...',
          opts: [
            'Zipped and binary',
            'Decomposed and easy to version control in Git',
            'Only usable in production',
            'Stored as a single large XML'
          ],
          a: 1,
          why: 'Source format breaks metadata into decomposed files, making diffs and version control practical.'
        },
        {
          q: 'When would you typically need destructive changes?',
          opts: [
            'Adding a new field',
            'Creating a new record type',
            'Removing a metadata component from the org',
            'Updating a field label'
          ],
          a: 2,
          why: 'Normal deployments add/update; removing components requires a destructiveChanges manifest.'
        },
        {
          q: 'Which of the following is TRUE about deployments?',
          opts: [
            'They automatically include all record data',
            'They move configuration (metadata), not data',
            'They can only run in production',
            'They bypass all validation rules'
          ],
          a: 1,
          why: 'Deployments transfer metadata configuration; data requires separate data load tools.'
        }
      ]
    }
  }
];

