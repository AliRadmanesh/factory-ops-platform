# IPI Packers: Who They Are

- **Industry:** Specialty manufacturing — inflatable packer devices for mining, oil & gas, geotechnical.
- **Size:** Small-medium global manufacturer. Bayswater, Perth (Asia-Pacific HQ). Also USA, Chile, UAE, Bulgaria.
- **Key fact:** ~50% of products are custom-engineered per client — every work order is different.
- **2022:** Moved to bigger facility with more automated machinery. Growth phase; likely scaling internal processes too.
- **ISO 9001:** Quality-certified — they need documented, traceable workflows.

---

## What Their App Almost Certainly Does

Based on company type and insider context, the app covers:

| Module | Details |
| --- | --- |
| Operator Job Logging | Operator name, job/part number, start time, parts count, end time |
| Task Checklists | Per-section (rubber lab, vulcanization, assembly, QC, testing, shipping) |
| Production Tracking | Which work order is active, who's on it, current status |
| Inventory | Raw materials in/out, WIP, finished goods |
| Manager Dashboard | Web view — active jobs, daily output, operator activity |

> **Note:** The "list of tasks per section" = department-level checklists, likely daily startup/shutdown sequences + job-specific steps. Very common in ISO 9001 environments.

---

## Their Pain Points (with Power Apps)

Power Apps on iPad is notoriously slow. Any outsourced Power Apps build for a manufacturing floor has predictable problems:

- **Slow on iPad** — Power Apps canvas apps have heavy JS payloads, struggle with offline, lag on form-heavy screens
- **No real offline** — factory floors often have patchy WiFi near machinery
- **Rigid data model** — Power Apps' Dataverse/SharePoint backend makes custom queries painful
- **Poor UX for gloved hands** — Power Apps default touch targets are too small
- **Limited reporting** — managers can't easily get the views they want
- **Bug-prone updates** — outsourced code with no internal ownership — nobody knows the codebase

---

## Your App Strategy

**What to build:** A focused demo covering the 3 highest-value modules:

1. **Operator Job Log** — scan/select operator → pick work order → log parts + time → submit
2. **Section Task Board** — per-department checklist with completion tracking
3. **Manager Dashboard** — live production summary, daily output, task completion rates

**Tech stack** (optimized for their exact situation):

- **React Native + Expo** — single codebase, works on iPad, iPhone, web browser
- **Next.js** — manager web dashboard
- **Supabase** (Postgres + realtime) — fast, offline-capable with sync
- **Offline-first** — critical differentiator vs their current app

**Key selling point:** When you demo on an iPad and it's instant, that alone is the pitch. You don't need to say "your current app is slow."

---

## How to Approach Without Revealing Inside Knowledge

**Cover story:**

> "I specialize in operations apps for precision manufacturing shops — inventory, operator tracking, task management. I built a demo for this vertical and would love 20 minutes to show it."

**The natural angle:** ISO 9001 companies are an obvious market for this kind of app. You can cite the industry, not the specific company's pain. Anyone familiar with manufacturing apps knows Power Apps is common and commonly problematic.

**Entry points:**

- Connect with Howard Kenworthy (Commercial Director) or Francis Ford (MD Australia) on LinkedIn — frame as a local Perth dev building manufacturing tooling
- Or have your brother casually mention "I know a dev who built something like this" — doesn't reveal he leaked anything, just a natural referral
- Ask for a "feedback session" not a sales pitch — "I'm validating this for the market, would love your perspective as a manufacturing company"

**What not to say:** Don't mention Power Apps, bugs, iPad slowness, or anything that sounds like insider knowledge. Let them bring it up when they see the demo.

---

## What Would Impress Them Most

1. **iPad performance** — instant load, no lag
2. **Offline capability** — works on the floor even with bad WiFi
3. **Section-based task lists** — they'll immediately recognize the pattern
4. **Operator name + part count logging** — exact workflow match
5. **Clean manager web view** — something their managers actually want

Build the demo around their specific product types (packers, vulcanization, assembly) using publicly available terminology from their website. That level of domain specificity makes it feel purpose-built without revealing inside knowledge.

---

## Bottom Line

Build a 3-screen demo (job log + task board + manager dashboard), iPad-first, offline-capable. Reach out as a local Perth dev who builds manufacturing operations tooling.
