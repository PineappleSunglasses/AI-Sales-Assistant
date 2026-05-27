# Case 1 — AI-Based Budget Planning: Full Solution Brief
**Group 5 · CDI AI Summer Challenge 2026 · Rohde & Schwarz**  
*Last updated: May 27, 2026*

---

## 1. Current State (As-Is)

### 1.1 Company Hierarchy

Rohde & Schwarz operates through a four-level organizational hierarchy for budget planning:

```
HOS — Head of Strategy (Corporate)
        │
        ├── ISO 1 (International Sales Office)
        │       ├── SO 1 (Sales Office)
        │       ├── SO 2
        │       └── SO 3
        │
        ├── ISO 2
        │       ├── SO 4
        │       └── SO 5
        │
        └── ... (72 ISOs total, 200 SOs total)
```

| Level | Role | Count | Responsibility |
|---|---|---|---|
| **HOS** | Head of Strategy | 1 | Sets targets, sends budget template, consolidates final plan |
| **ISO** | International Sales Office | 72 | Consolidates SOs in their region, submits one Excel per ISO |
| **SO** | Sales Office | 200 | Fills in the actual budget numbers for their market |

**Data flow (Budget V1):**
1. HOS sends email + blank Excel template to all 200 SOs
2. SOs fill in the template bottom-up
3. SOs return the Excel to their ISO
4. ISOs consolidate and forward to HOS
5. HOS receives 72 Excel files (one per ISO)

---

### 1.2 Matrix Organization

R&S is a matrix organization — the same business is viewed from multiple angles simultaneously, which creates structural complexity in the budget process.

```
                    │ Div 1      │ Div 8      │ Div 11
────────────────────┼────────────┼────────────┼────────────
ISO Central Europe  │ OI / Rev   │ OI / Rev   │ OI / Rev
ISO North America   │ OI / Rev   │ OI / Rev   │ OI / Rev
ISO Asia Pacific    │ OI / Rev   │ OI / Rev   │ OI / Rev
... (72 ISOs)       │            │            │
```

**The three divisions:**

| Division | Planning logic | Focus |
|---|---|---|
| **Div 1** — Test & Measurement | By **product** | Product families, instrument categories |
| **Div 8** — Technology Systems | By **segment** | Defense, aerospace, government |
| **Div 11** — Networks & Cybersecurity | By **segment** | Telco, enterprise, cyber |

**Why this creates problems:**  
- Div 1 reports OI by product → Div 8 reports the same customer by segment → no common key to validate them against each other
- Each ISO fills in up to **30 sub-dimensions** (product lines / segments per division)
- 72 ISOs × 30 dimensions = **2,160 individual data points** that must be manually cross-checked

**Functional Units (UBs) add another layer:**

| UB | Role in budget |
|---|---|
| Controlling | Owns the process, does the sync |
| HR | Headcount and salary planning |
| IT | Infrastructure cost planning |
| R&D | Investment planning |
| Operations | Production capacity |
| Service | After-sales revenue and cost |

UBs currently plan **disconnected** from the financial budget — integrated only at the very end.

---

### 1.3 Timeline in Planning

**Annual budget cycle (Wirtschaftsplan / WP):**

```
Feb / Mar     Corporate sets 5-year Business Plan (top-down, confidential)
              ↓
Apr           HOS sends email + blank Excel template to all 200 SOs
              ↓
May           Budget V1 — SOs fill in bottom-up, ISOs consolidate, 72 Excels returned
              ↓ ← BOTTLENECK (weeks of manual work)
May / Jun     Manual sync — Raphael's team checks 72 files × 30 dimensions by hand
              ↓
Jun           Budget V2 — corrected numbers re-submitted by ISOs
              ↓
Jul           Upload to SAP ERP (system 6CO2) → final budget locked
```

**Total cycle: ~4 months from kick-off to locked budget.**

**Key constraint:** Regions never see the 5-year Business Plan. They only receive the blank template and a short guidance email with parameters (e.g. salary increase assumptions, inflation rates). There is no top-down anchor for their planning.

---

## 2. Pain Points

| # | Pain Point | Root Cause | Impact |
|---|---|---|---|
| 1 | **Regions plan blind** | 5-year BP is confidential, not shared | Budget V1 is guesswork — no top-down anchor |
| 2 | **Budget V1 is pointless** | Regions have no reference → V1 is always wrong | One full planning round wasted; *"this deadline doesn't make any f\*\*\*ing sense"* — Raphael |
| 3 | **Manual sync at scale** | No automated consolidation tooling | 72 files × 30 dimensions = 2,160+ cells checked by hand, error-prone, weeks of work |
| 4 | **Matrix org creates conflicting views** | Div1 plans by product, Div8 by segment — no unified format | Same revenue counted differently across divisions; inconsistencies not visible until sync |
| 5 | **UBs integrated too late** | HR/IT/Ops plan independently from financial budget | Headcount plans don't match cost plans; misalignment discovered at the end |
| 6 | **Knowledge ≠ numbers** | Regions know their market but have no tool to translate insights into budget numbers | Rich qualitative knowledge never becomes a structured financial input |
| 7 | **Structural changes break comparisons** | New segments, merged entities, org changes every year | No automated validation — historical comparisons must be rebuilt manually each cycle |
| 8 | **No single source of truth** | Everything lives in Excel, PowerPoint, Signal, Teams | No real-time visibility; changes in one budget invisible to everyone else until next round |

---

## 3. Goal

### 3.1 What the Output Should Be

**Primary output:** A validated, consolidated budget overview that Raphael's team can act on directly — replacing the manual sync.

Concretely:

1. **Flagged inconsistencies** — a list of specific mismatches across the 72 ISO files, with the exact dimension, current value, expected range, and a suggested correction
2. **Consolidated dashboard** — visual overview of all 72 ISOs: OI, Revenue, GP per division, per region, with deviation from 5-year plan targets highlighted
3. **Correction proposals** — for each flagged mismatch, the AI suggests a concrete fix the ISO can approve or override
4. **Raphael's decision list** — not 2,160 cells, but the ~15 cases that genuinely need a human judgment call

**Secondary output (longer term):**
- Pre-filled Budget V1 templates based on historical data + top-down corridors → regions get a starting point, not a blank sheet
- Guided input interface: regions answer structured questions about their market → AI translates answers into budget numbers

---

### 3.2 Success KPIs

| KPI | Current state | Target |
|---|---|---|
| Manual sync time | Weeks (72 files × hand-checked) | Hours (AI flags, human decides) |
| Planning rounds | 2 rounds (V1 + V2) | Potentially 1 (V1 auto-generated or eliminated) |
| Inconsistencies caught | After V2 submission (late) | Before V2 submission (automated, in-cycle) |
| Cells requiring human review | 2,160+ | ~15 escalation cases |
| Time from kick-off to locked budget | ~4 months | Target: significantly shorter |

---

## 4. Where AI Helps — and Where It Sits in the Process

### 4.1 Position in the Process

```
Corporate sets targets (5-year BP)
        ↓
Email + blank Excel template sent to 72 ISOs
        ↓
Budget V1 — 200 SOs fill in, 72 ISOs consolidate and submit
        ↓
┌──────────────────────────────────────────────────┐
│              ← AI LAYER INTERVENES →             │
│                                                  │
│  INPUT: 72 Excels + 5-year BP + Rules            │
│  PROCESS: Analyze, map, flag, suggest            │
│  OUTPUT: Dashboard + flagged list + proposals    │
└──────────────────────────────────────────────────┘
        ↓
Budget V2 — corrected, re-submitted (faster, fewer rounds)
        ↓
Upload to SAP ERP
```

The AI replaces the manual sync step — or at minimum, reduces it from weeks of hand-checking to a short human review of AI-flagged exceptions.

---

### 4.2 Inputs

Three input types must be uploaded into the AI system:

| Input | Format | Who uploads | What it contains |
|---|---|---|---|
| **72 ISO Excel files** | `.xlsx` | Raphael's team / ISOs | Budget V1 numbers: OI, Revenue, GP per division per sub-segment |
| **5-year Business Plan** | `.xlsx` / `.pdf` | Raphael (confidential) | Top-down targets per division: OI, Revenue corridors (upper/lower bands) per year |
| **Rules & Parameters** | Structured config | Raphael's team | Min/max boundaries, structural changes (new segments, merged entities), planning assumptions (inflation, FX rates, salary increase %) |

**Why all three are needed:**
- Without the 5-year BP → no benchmark to validate V1 numbers against
- Without the Rules → no way to flag structural inconsistencies (e.g. a region still planning for a segment that was merged)
- Without the 72 Excels → nothing to analyze

---

### 4.3 What the AI Does

**Step 1 — Parse & Normalize**
- Read all 72 Excel files, extract relevant dimensions per division
- Map each ISO's data to the matrix org structure (ISO × Division × Sub-segment)
- Handle structural changes (renamed segments, merged entities) using the Rules input

**Step 2 — Validate against 5-year BP**
- Compare each ISO's V1 numbers against the top-down corridor from the BP
- Flag values outside the min/max bands per dimension
- Detect implausible growth rates (e.g. +200% OI with no new hire plan)

**Step 3 — Cross-check consistency**
- Validate cross-dimensional consistency: e.g. if headcount increases, do cost lines increase accordingly?
- Check for matrix conflicts: same revenue planned by two different divisions from the same customer/region
- Verify hosted resource entries match between the billing and receiving entities

**Step 4 — Generate proposals**
- For each flagged mismatch: propose a corrected value based on historical data and BP corridor
- Rank issues by severity (blocks budget vs. warning vs. advisory)
- Aggregate into a clean escalation list for Raphael

**Step 5 — Render dashboard**
- Visual overview: budget distribution across 72 ISOs, per division, per sub-segment
- Deviation heatmap: which ISOs are most out of range
- Drill-down: click on an ISO → see all flagged dimensions + proposals

---

### 4.4 Output

| Output | Format | For whom |
|---|---|---|
| **Flagged inconsistency list** | Table (Excel or in-app) | Raphael's team |
| **Correction proposals** | Inline suggestions per row | ISO managers (to approve/reject) |
| **Budget dashboard** | Web view / charts | Raphael, management |
| **Escalation list** | Short list (~15 items) | Raphael — human decisions only |
| **Validated Excel export** | `.xlsx` | Upload to SAP after approval |

---

## 5. Proposed Technical Approach

**Interface:** Streamlit web app (Python)
- Three upload areas: 72 Excels, 5-year BP, Rules config
- Single "Run Analysis" button
- Results: flagged table + dashboard + export

**Why Streamlit:**
- Fast to build (2–3 days for demo)
- No infrastructure needed — runs locally or on any server
- Native support for tables, charts, and file upload
- Can be ported to a proper web app or SAP integration in a later phase

**AI layer:** Claude API
- Structured extraction from uploaded Excel files
- Validation logic via tool use + rules engine
- Natural language proposals for each flagged mismatch

**Data flow:**
```
Upload → Parse (Python/pandas) → Validate (Rules engine) 
      → Analyze (Claude API) → Dashboard (Streamlit charts) 
      → Export (xlsx)
```

---

## 6. Key Quotes from Raphael Kiesel (May 26, 2026)

> *"The five-year plan is not our problem. Our problem is the one-year plan."*

> *"Budget V1 is more to start the discussion... it's not really needed."*

> *"This deadline doesn't make any f\*\*\*ing sense."*

> *"The time between V1 and V2 is really a handy-done plausibility check where I think an agent could save much time."*

> *"Can an intelligence help to translate your knowledge into numbers?"*

> *"Customers are not paying for 200 people aligning numbers."*

> *"For now it's great if it just helps me."*

---

*Document based on: Case 1 brief, Budget Parameters 26/27, E-Mail to Regions template, 1:1 with Raphael Kiesel (May 26, 2026)*
