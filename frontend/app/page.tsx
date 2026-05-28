"use client";

import { useMemo, useState } from "react";

type TabId = "inputs" | "research" | "forecast";
type PageId = TabId | "review" | "submit";
type UserMark = "Important" | "Neutral" | "Irrelevant";
type Tone = "positive" | "negative" | "neutral";

type SalesEntry = {
  id: number;
  type: string;
  customer: string;
  summary: string;
  impact: number;
  probability: number;
  status: string;
  used: boolean;
  tone: Tone;
};

type Article = {
  id: number;
  source: string;
  date: string;
  headline: string;
  signal: string;
  impact: number;
  relevance: number;
  mark: UserMark;
};

const initialSalesEntries: SalesEntry[] = [
  {
    id: 1,
    type: "Customer likely to order",
    customer: "Vodafone UK",
    summary: "Investing in 5G test solutions for network modernization.",
    impact: 2.8,
    probability: 75,
    status: "Confirmed",
    used: true,
    tone: "positive",
  },
  {
    id: 2,
    type: "Renewal risk",
    customer: "National Grid",
    summary: "Current contract expiring; price sensitivity high.",
    impact: -1.6,
    probability: 40,
    status: "At risk",
    used: true,
    tone: "negative",
  },
  {
    id: 3,
    type: "Delayed tender",
    customer: "BT Group",
    summary: "Tender delayed to Q2 FY26/27 due to internal reorg.",
    impact: -0.8,
    probability: 60,
    status: "Monitoring",
    used: true,
    tone: "negative",
  },
  {
    id: 4,
    type: "New opportunity pipeline",
    customer: "Airbus Defence & Space",
    summary: "Open discussions for spectrum monitoring project.",
    impact: 1.2,
    probability: 50,
    status: "Pipeline",
    used: false,
    tone: "positive",
  },
  {
    id: 5,
    type: "Framework agreement",
    customer: "CAF",
    summary: "Three-year framework renewal likely.",
    impact: 0.7,
    probability: 70,
    status: "Confirmed",
    used: true,
    tone: "positive",
  },
];

const initialArticles: Article[] = [
  {
    id: 1,
    source: "Reuters",
    date: "19 May 2026",
    headline: "European operators boost 5G investment amid growing demand",
    signal: "Operators plan to increase CAPEX in 5G networks through 2026.",
    impact: 0.8,
    relevance: 90,
    mark: "Important",
  },
  {
    id: 2,
    source: "Financial Times",
    date: "18 May 2026",
    headline: "European defence readiness drive lifts technology spending",
    signal: "Secure communication and spectrum monitoring budgets rise.",
    impact: 0.4,
    relevance: 82,
    mark: "Important",
  },
  {
    id: 3,
    source: "Gartner",
    date: "17 May 2026",
    headline: "Enterprise IT spending to remain flat in 2026",
    signal: "Growth limited to security, compliance, and critical infrastructure.",
    impact: -0.6,
    relevance: 58,
    mark: "Neutral",
  },
  {
    id: 4,
    source: "Light Reading",
    date: "16 May 2026",
    headline: "5G standalone rollout delays persist in several markets",
    signal: "Delays in SA deployments reduce near-term equipment orders.",
    impact: -1.0,
    relevance: 72,
    mark: "Irrelevant",
  },
  {
    id: 5,
    source: "Bloomberg",
    date: "15 May 2026",
    headline: "Supply chain risks could pressure network equipment deliveries",
    signal: "Component shortages and logistics risks may delay fulfillment.",
    impact: -0.5,
    relevance: 60,
    mark: "Neutral",
  },
];

const workflow = [
  { id: "inputs", title: "Input", detail: "Sales intelligence" },
  { id: "research", title: "Research", detail: "Market & news" },
  { id: "forecast", title: "Forecast", detail: "AI reasoning" },
  { id: "review", title: "Review", detail: "Validate & refine" },
  { id: "submit", title: "Submit", detail: "Upload & confirm" },
] satisfies Array<{ id: PageId; title: string; detail: string }>;

const bookedOrderIntakeYtd = 18.6;
const recurringDemandForecast = 10.8;
const unidentifiedRunRate = 17.4;
const planningLow = 42;
const planningHigh = 55;

function money(value: number) {
  return `EUR ${value.toFixed(1)}M`;
}

function impact(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}EUR ${Math.abs(value).toFixed(1)}M`;
}

function compactImpact(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(1)}M`;
}

function toneFromValue(value: number): Tone {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

function statusTone(status: string): Tone {
  if (["At risk", "Monitoring"].includes(status)) return "negative";
  if (status === "Pipeline") return "neutral";
  return "positive";
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function Sparkline({ tone = "positive" }: { tone?: Tone }) {
  const stroke = tone === "negative" ? "#e64a19" : tone === "neutral" ? "#2563eb" : "#16833a";

  return (
    <svg className="sparkline" viewBox="0 0 120 36" aria-hidden="true">
      <path
        d="M2 25 C15 12 24 30 36 18 S55 10 66 20 S84 26 96 12 S110 19 118 6"
        fill="none"
        stroke={stroke}
        strokeWidth="2.4"
      />
      <circle cx="118" cy="6" r="2.8" fill={stroke} />
    </svg>
  );
}

function Gauge({ value }: { value: number }) {
  const degrees = Math.min(180, Math.max(0, value * 1.8));

  return (
    <div className="gauge" aria-label={`${value}% confidence`}>
      <div className="gaugeTrack" />
      <div className="gaugeNeedle" style={{ transform: `rotate(${degrees - 90}deg)` }} />
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  tone = "neutral",
  children,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: Tone;
  children?: React.ReactNode;
}) {
  return (
    <article className="statCard">
      <div>
        <p className="meta">{label}</p>
        <strong className={classNames("statValue", tone)}>{value}</strong>
        <span>{detail}</span>
      </div>
      {children}
    </article>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="sectionHeader">
      <h2>{title}</h2>
      {action}
    </div>
  );
}

function FlowFooter({
  nextLabel,
  onNext,
  secondary,
}: {
  nextLabel: string;
  onNext: () => void;
  secondary?: React.ReactNode;
}) {
  return (
    <section className="flowFooter">
      <div>
        <strong>Step handoff</strong>
        <p>Use this button to mark the current page complete and move to the next page.</p>
      </div>
      <div className="buttonRow">
        {secondary}
        <button className="primaryButton" onClick={onNext} type="button">
          {nextLabel}
        </button>
      </div>
    </section>
  );
}

function Sidebar({
  activePage,
  completedPages,
  onNavigate,
}: {
  activePage: PageId;
  completedPages: PageId[];
  onNavigate: (page: PageId) => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brandMark" aria-label="Rohde and Schwarz logo">
          <img alt="" src="/rohde-schwarz-logo.png" />
        </span>
        <span>AI Sales Assistant</span>
      </div>

      <div className="selectorGroup">
        <label>
          <span>Sales Office</span>
          <select defaultValue="RSGBR">
            <option value="RSGBR">RSGBR - London</option>
            <option value="RSDEU">RSDEU - Munich</option>
            <option value="RSFRA">RSFRA - Paris</option>
          </select>
        </label>
        <label>
          <span>Fiscal Year</span>
          <select defaultValue="FY2627">
            <option value="FY2627">FY26/27</option>
            <option value="FY2728">FY27/28</option>
          </select>
        </label>
      </div>

      <nav className="workflowNav" aria-label="Forecast workflow">
        {workflow.map((step, index) => {
          const isActive = activePage === step.id;
          const isDone = completedPages.includes(step.id);

          return (
            <button
              className={classNames("workflowItem", isActive && "active", isDone && "done")}
              onClick={() => onNavigate(step.id)}
              key={step.title}
              type="button"
            >
              <span className="workflowNumber">{isDone ? "OK" : String(index + 1)}</span>
              <span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </span>
            </button>
          );
        })}
      </nav>

      <section className="sidebarSummary">
        <h2>Summary</h2>
        <dl>
          <div>
            <dt>Division</dt>
            <dd>Test & Measurement</dd>
          </div>
          <div>
            <dt>Planning Corridor</dt>
            <dd>{money(planningLow)} - {money(planningHigh)}</dd>
          </div>
          <div>
            <dt>Booked YTD</dt>
            <dd>{money(bookedOrderIntakeYtd)}</dd>
          </div>
          <div>
            <dt>Last Updated</dt>
            <dd>20 May 2026, 10:42</dd>
          </div>
        </dl>
      </section>

      <button className="ghostButton sidebarCollapse" type="button">
        Collapse
      </button>
    </aside>
  );
}

function SalesInputsTab({
  entries,
  onAddEntry,
  onNext,
}: {
  entries: SalesEntry[];
  onAddEntry: (entry: Omit<SalesEntry, "id">) => void;
  onNext: () => void;
}) {
  const [sourceNote, setSourceNote] = useState(
    "Vodafone UK is moving ahead with private 5G across their UK manufacturing sites. They expect to place orders in H1 FY26/27. Budget is approved.",
  );

  return (
    <div className="workspaceContent">
      <section className="pageHeader">
        <div>
          <h1>Sales intelligence workspace</h1>
          <p>Capture local customer knowledge as structured forecast drivers.</p>
        </div>
      </section>

      <section className="statsGrid four">
        <StatCard label="Booked OI YTD" value={money(bookedOrderIntakeYtd)} detail="First 3 months closed">
          <Sparkline tone="neutral" />
        </StatCard>
        <StatCard label="Named opportunities" value="+EUR 3.5M" detail="Visible customer signals" tone="positive">
          <Sparkline tone="positive" />
        </StatCard>
        <StatCard label="Unidentified run-rate" value={money(unidentifiedRunRate)} detail="AI inferred from YTD momentum" tone="neutral">
          <div className="miniMeter"><span /></div>
        </StatCard>
        <StatCard label="Evidence coverage" value="68%" detail="Across active signals" tone="neutral">
          <div className="donut" style={{ "--value": "68%" } as React.CSSProperties} />
        </StatCard>
      </section>

      <div className="contentGrid inputsGrid">
        <section className="panel wide">
          <SectionHeader title="Add sales intelligence" />
          <form
            className="inputForm"
            onSubmit={(event) => {
              event.preventDefault();
              onAddEntry({
                type: "Customer likely to order",
                customer: "Vodafone UK",
                summary: "Private 5G rollout across manufacturing sites.",
                impact: 2.8,
                probability: 75,
                status: "Confirmed",
                used: true,
                tone: "positive",
              });
            }}
          >
            <label>
              Customer
              <select defaultValue="Vodafone UK">
                <option>Vodafone UK</option>
                <option>BT Group</option>
                <option>National Grid</option>
              </select>
            </label>
            <label>
              Division / Product
              <select defaultValue="Test & Measurement">
                <option>Test & Measurement</option>
                <option>Technology Systems</option>
                <option>Networks & Cybersecurity</option>
              </select>
            </label>
            <label>
              Impact type
              <select defaultValue="Customer likely to order">
                <option>Customer likely to order</option>
                <option>Renewal risk</option>
                <option>Delayed tender</option>
              </select>
            </label>
            <label>
              Expected OI impact
              <input defaultValue="+EUR 2.8M" />
            </label>
            <label>
              Probability
              <select defaultValue="75% - High">
                <option>75% - High</option>
                <option>50% - Medium</option>
                <option>30% - Low</option>
              </select>
            </label>
            <label>
              Timing
              <select defaultValue="Likely H1 FY26/27">
                <option>Likely H1 FY26/27</option>
                <option>Likely H2 FY26/27</option>
                <option>Unclear</option>
              </select>
            </label>
            <label>
              Confidence
              <select defaultValue="High">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="sourceNote">
              Source note
              <input
                onChange={(event) => setSourceNote(event.target.value)}
                value={sourceNote}
              />
            </label>
            <div className="formActions">
              <button className="ghostButton" type="reset">Clear</button>
              <button className="primaryButton" type="submit">Add to list</button>
            </div>
          </form>
        </section>

        <aside className="panel aiPanel">
          <SectionHeader title="AI extraction" />
          <div className="noteCard">
            <h3>Unstructured note</h3>
            <p>{sourceNote}</p>
            <small>Added by Sarah Johnson on 20 May 2026, 09:15</small>
          </div>
          <div className="structuredSignal">
            <div className="pill positive">High confidence</div>
            <dl>
              <div><dt>Type</dt><dd>Customer likely to order</dd></div>
              <div><dt>Customer</dt><dd>Vodafone UK</dd></div>
              <div><dt>Expected OI impact</dt><dd className="positiveText">+EUR 2.8M</dd></div>
              <div><dt>Probability</dt><dd>75% - High</dd></div>
              <div><dt>Timing</dt><dd>Likely H1 FY26/27</dd></div>
            </dl>
          </div>
          <button className="outlineButton fullWidth" type="button">Ask AI to structure note</button>
        </aside>
      </div>

      <div className="contentGrid lowerGrid">
        <section className="panel">
          <SectionHeader
            title={`Sales intelligence entries (${entries.length})`}
            action={<input className="searchInput" placeholder="Search..." />}
          />
          <SalesEntriesTable entries={entries} />
        </section>
        <section className="panel commentsPanel">
          <SectionHeader title="Comments (2)" />
          <div className="comment">
            <span>MP</span>
            <p><strong>Michael Patel</strong> Confirmed. Vodafone program is well funded.</p>
          </div>
          <div className="comment">
            <span>SJ</span>
            <p><strong>Sarah Johnson</strong> The spectrum monitoring need is separate from the 5G order.</p>
          </div>
        </section>
      </div>

      <section className="panel">
        <SectionHeader title="Audit trail" />
        <table className="dataTable">
          <thead>
            <tr>
              <th>Date & time</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>20 May 2026, 09:15</td>
              <td>Sarah Johnson</td>
              <td>Added</td>
              <td>Customer likely to order - Vodafone UK (+EUR 2.8M)</td>
            </tr>
            <tr>
              <td>20 May 2026, 09:02</td>
              <td>Michael Patel</td>
              <td>Updated</td>
              <td>Renewal risk - National Grid impact set to -EUR 1.6M</td>
            </tr>
            <tr>
              <td>19 May 2026, 16:45</td>
              <td>Sarah Johnson</td>
              <td>Added</td>
              <td>Delayed tender - BT Group (-EUR 0.8M)</td>
            </tr>
          </tbody>
        </table>
      </section>
      <FlowFooter nextLabel="Next: Market Research" onNext={onNext} />
    </div>
  );
}

function SalesEntriesTable({ entries }: { entries: SalesEntry[] }) {
  return (
    <div className="tableScroller">
      <table className="dataTable">
        <thead>
          <tr>
            <th>Type</th>
            <th>Customer</th>
            <th>Summary</th>
            <th>Impact (OI)</th>
            <th>Probability</th>
            <th>Status</th>
            <th>Used</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td><span className={classNames("rowIcon", entry.tone)}>{entry.tone === "negative" ? "!" : "+"}</span>{entry.type}</td>
              <td>{entry.customer}</td>
              <td>{entry.summary}</td>
              <td className={entry.impact >= 0 ? "positiveText" : "negativeText"}>{impact(entry.impact)}</td>
              <td>{entry.probability}%</td>
              <td><span className={classNames("pill", statusTone(entry.status))}>{entry.status}</span></td>
              <td><span className={classNames("usedState", entry.used && "used")}>{entry.used ? "Yes" : "No"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarketResearchTab({
  articles,
  onMarkArticle,
  onNext,
}: {
  articles: Article[];
  onMarkArticle: (articleId: number, mark: UserMark) => void;
  onNext: () => void;
}) {
  const importantCount = articles.filter((article) => article.mark === "Important").length;
  const ignoredCount = articles.filter((article) => article.mark === "Irrelevant").length;
  const importantImpact = articles
    .filter((article) => article.mark === "Important")
    .reduce((sum, article) => sum + article.impact, 0);

  return (
    <div className="workspaceContent">
      <section className="pageHeader">
        <div>
          <h1>Deep market research</h1>
          <p>Scan market signals, classify evidence, and send selected findings into the forecast.</p>
        </div>
      </section>

      <section className="statsGrid five">
        <StatCard label="Sources scanned" value="126" detail="News, reports, filings" />
        <StatCard label="Relevant signals" value="18" detail="After AI filtering" />
        <StatCard label="Important" value={String(importantCount)} detail="Marked by you" tone="positive" />
        <StatCard label="Ignored" value={String(ignoredCount)} detail="Marked by you" tone="negative" />
        <StatCard label="Last run" value="09:15" detail="20 May 2026" />
      </section>

      <section className="filterBar panel">
        {["Division: Test & Measurement", "Region: UK", "Topic: 5G infrastructure", "Topic: defence readiness", "Time horizon: FY26/27"].map((filter) => (
          <span className="filterChip" key={filter}>{filter}</span>
        ))}
        <button className="ghostButton" type="button">More filters</button>
      </section>

      <div className="contentGrid researchGrid">
        <section className="panel">
          <SectionHeader
            title="Research results (18)"
            action={<input className="searchInput" placeholder="Search in results..." />}
          />
          <div className="tableScroller">
            <table className="dataTable researchTable">
              <thead>
                <tr>
                  <th>Source / Date</th>
                  <th>Headline</th>
                  <th>Extracted signal</th>
                  <th>Impact on OI</th>
                  <th>Relevance</th>
                  <th>User mark</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <strong>{article.source}</strong>
                      <small>{article.date}</small>
                    </td>
                    <td>{article.headline}</td>
                    <td>{article.signal}</td>
                    <td className={article.impact >= 0 ? "positiveText" : "negativeText"}>
                      {compactImpact(article.impact)}
                    </td>
                    <td>
                      <div className="relevance">
                        <span style={{ width: `${article.relevance}%` }} />
                      </div>
                      <small>{article.relevance}%</small>
                    </td>
                    <td>
                      <select
                        className={classNames("markSelect", article.mark.toLowerCase())}
                        onChange={(event) => onMarkArticle(article.id, event.target.value as UserMark)}
                        value={article.mark}
                      >
                        <option>Important</option>
                        <option>Neutral</option>
                        <option>Irrelevant</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel researchBrief">
          <SectionHeader title="Research brief" />
          <p>AI synthesis of the latest market intelligence and implications for next-year Order Intake.</p>
          <div className="briefCard positive">
            <h3>Growth drivers</h3>
            <ul>
              <li>European operators increasing 5G network CAPEX through 2026.</li>
              <li>Defence readiness initiatives support secure communications demand.</li>
            </ul>
            <strong>{compactImpact(Math.max(0, importantImpact))} to +2.2M</strong>
          </div>
          <div className="briefCard negative">
            <h3>Downside risks</h3>
            <ul>
              <li>Standalone rollout delays may defer equipment orders.</li>
              <li>Supply chain constraints could affect delivery timing.</li>
            </ul>
            <strong>-1.2M to -1.8M</strong>
          </div>
          <div className="briefCard neutral">
            <h3>Evidence conflicts</h3>
            <ul>
              <li>Operators raise CAPEX while enterprise IT budgets remain flat.</li>
            </ul>
            <strong>Overall confidence 62%</strong>
          </div>
        </aside>
      </div>

      <div className="contentGrid lowerResearch">
        <section className="panel">
          <SectionHeader title="Research instructions" />
          <textarea defaultValue="Find public tender activity for UK spectrum monitoring and 5G test equipment." />
          <div className="buttonRow">
            <button className="primaryButton" type="button">Run deep research</button>
            <button className="outlineButton" type="button">Send selected evidence to forecast</button>
          </div>
        </section>
        <section className="panel">
          <SectionHeader title="Research status" />
          <div className="pipeline">
            {["Search", "Extract", "Deduplicate", "Score relevance", "Awaiting review"].map((stage, index) => (
              <div className={classNames("pipelineStep", index < 4 && "done", index === 4 && "active")} key={stage}>
                <span>{index < 4 ? "OK" : "5"}</span>
                <strong>{stage}</strong>
                <small>{index < 4 ? "Completed" : "18 items"}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
      <FlowFooter nextLabel="Next: Forecast" onNext={onNext} />
    </div>
  );
}

function getForecastSummary(entries: SalesEntry[], articles: Article[]) {
  const marketImpact = articles
    .filter((article) => article.mark === "Important")
    .reduce((sum, article) => sum + article.impact, 0);

  const namedOpportunities = entries
    .filter((entry) => entry.used && entry.impact > 0)
    .reduce((sum, entry) => sum + entry.impact, 0);

  const knownRisksAndOneOffs = entries
    .filter((entry) => entry.used && entry.impact < 0)
    .reduce((sum, entry) => sum + entry.impact, 0);

  const revisedForecast =
    bookedOrderIntakeYtd +
    namedOpportunities +
    recurringDemandForecast +
    unidentifiedRunRate +
    marketImpact +
    knownRisksAndOneOffs;

  return {
    knownRisksAndOneOffs,
    marketImpact,
    namedOpportunities,
    revisedForecast,
    remainingForecast: revisedForecast - bookedOrderIntakeYtd,
  };
}

function ForecastReasoningTab({
  entries,
  articles,
  onNext,
}: {
  entries: SalesEntry[];
  articles: Article[];
  onNext: () => void;
}) {
  const {
    knownRisksAndOneOffs,
    marketImpact,
    namedOpportunities,
    remainingForecast,
    revisedForecast,
  } = getForecastSummary(entries, articles);

  const drivers = [
    { label: "Booked OI YTD", value: bookedOrderIntakeYtd, type: "total" },
    { label: "Named opps.", value: namedOpportunities, type: "up" },
    { label: "Recurring demand", value: recurringDemandForecast, type: "up" },
    { label: "Run-rate demand", value: unidentifiedRunRate, type: "up" },
    { label: "Market adj.", value: marketImpact, type: marketImpact >= 0 ? "up" : "down" },
    { label: "Risks & one-offs", value: knownRisksAndOneOffs, type: "down" },
  ];
  const confidence = revisedForecast >= planningLow && revisedForecast <= planningHigh ? "High" : "Medium";

  return (
    <div className="workspaceContent">
      <section className="forecastHeader panel">
        <div>
          <p className="meta">Next-year Order Intake Forecast</p>
          <h1>{money(revisedForecast)}</h1>
        </div>
        <div className="forecastMetric">
          <span>Already booked</span>
          <strong className="positiveText">{money(bookedOrderIntakeYtd)}</strong>
          <small>First 3 months</small>
        </div>
        <div className="forecastMetric">
          <span>Remaining forecast</span>
          <strong>{money(remainingForecast)}</strong>
          <small>Named, recurring, run-rate, research</small>
        </div>
        <div className="forecastMetric">
          <span>Confidence</span>
          <strong className="positiveText">{confidence} 72%</strong>
          <Gauge value={72} />
        </div>
        <div className="corridor">
          <span>Planning Corridor (OI)</span>
          <div className="corridorLine">
            <span>{money(planningLow)}</span>
            <strong style={{ left: `${((revisedForecast - planningLow) / (planningHigh - planningLow)) * 100}%` }}>
              {revisedForecast.toFixed(1)}M
            </strong>
            <span>{money(planningHigh)}</span>
          </div>
          <p className="positiveText">Within corridor</p>
        </div>
      </section>

      <div className="contentGrid forecastGrid">
        <section className="panel">
          <SectionHeader title="Forecast Composition: Known, Expected, and Inferred OI" />
          <WaterfallChart drivers={drivers} revisedForecast={revisedForecast} />
        </section>
        <section className="panel">
          <SectionHeader title="AI reasoning" />
          <div className="reasonList">
            <ReasonRow
              evidence="Sales note"
              impact={namedOpportunities}
              title="Named customer opportunities"
              text="Visible customer signals include Vodafone UK and CAF framework renewal demand."
            />
            <ReasonRow
              evidence="Historical pattern"
              impact={recurringDemandForecast}
              title="Recurring demand kept separate"
              text="Repeat business is included only where historical buying patterns support it."
            />
            <ReasonRow
              evidence="YTD momentum"
              impact={unidentifiedRunRate}
              title="Unidentified demand inferred from run-rate"
              text="Higher first-quarter bookings support an inferred pipeline for orders not yet named."
            />
            <ReasonRow
              evidence="Important article"
              impact={marketImpact}
              title="Market research adjustment"
              text="Reviewed market evidence supports investment in 5G and secure communications."
            />
            <ReasonRow
              evidence="Sales note"
              impact={knownRisksAndOneOffs}
              title="Known risks and one-offs removed"
              text="Renewal risk, delayed tender timing, and non-recurring orders reduce the forecast."
            />
          </div>
        </section>
      </div>

      <div className="contentGrid forecastLower">
        <section className="panel">
          <SectionHeader title="Provided sales intelligence" />
          <SalesEntriesTable entries={entries.slice(0, 4)} />
        </section>
        <section className="panel">
          <SectionHeader title="Research evidence" />
          <div className="evidenceList">
            {articles.slice(0, 4).map((article) => (
              <article className="evidenceCard" key={article.id}>
                <div>
                  <strong>{article.source}</strong>
                  <small>{article.date}</small>
                </div>
                <p>{article.headline}</p>
                <span className={classNames("pill", article.mark === "Important" && "positive", article.mark === "Irrelevant" && "negative")}>
                  {article.mark}
                </span>
              </article>
            ))}
          </div>
        </section>
        <section className="panel refinePanel">
          <SectionHeader title="Refine forecast" />
          <div className="message userMessage">
            <strong>You</strong>
            <p>The unidentified run-rate feels conservative. The first three months are much stronger than last year. Can we increase the inferred demand for the remaining months?</p>
          </div>
          <div className="message aiMessage">
            <strong>AI Assistant</strong>
            <p>Increasing the unidentified run-rate by EUR 0.8M keeps the forecast within the planning corridor and documents the confidence assumption.</p>
          </div>
          <div className="proposalBox">
            <span>Proposed adjustment</span>
            <strong>Increase run-rate assumption</strong>
            <em>New forecast {money(revisedForecast + 0.8)}</em>
          </div>
          <div className="buttonRow">
            <button className="outlineButton" type="button">Request revision</button>
            <button className="disabledButton" disabled type="button">Upload forecast to database</button>
          </div>
        </section>
      </div>
      <FlowFooter
        nextLabel="Next: Review"
        onNext={onNext}
        secondary={<button className="outlineButton" type="button">Request revision</button>}
      />
    </div>
  );
}

function ReviewPage({
  entries,
  articles,
  onNext,
}: {
  entries: SalesEntry[];
  articles: Article[];
  onNext: () => void;
}) {
  const { remainingForecast, revisedForecast } = getForecastSummary(entries, articles);
  const importantArticles = articles.filter((article) => article.mark === "Important");
  const usedEntries = entries.filter((entry) => entry.used);

  return (
    <div className="workspaceContent">
      <section className="pageHeader">
        <div>
          <h1>Review forecast package</h1>
          <p>Check the forecast, evidence, and audit readiness before preparing the database upload.</p>
        </div>
      </section>

      <section className="statsGrid four">
        <StatCard label="Forecast to submit" value={money(revisedForecast)} detail={`${money(bookedOrderIntakeYtd)} booked YTD`} tone="positive" />
        <StatCard label="Remaining forecast" value={money(remainingForecast)} detail="Expected + inferred future OI" />
        <StatCard label="Sales inputs used" value={String(usedEntries.length)} detail="Structured signals" />
        <StatCard label="Important research" value={String(importantArticles.length)} detail="Evidence items" tone="positive" />
      </section>

      <div className="contentGrid reviewGrid">
        <section className="panel">
          <SectionHeader title="Review checklist" />
          <div className="checklist">
            {[
              "Forecast remains inside the FY26/27 planning corridor.",
              "Sales intelligence has source notes and probability estimates.",
              "One-off last-year orders are not treated as recurring demand.",
              "Unidentified run-rate is based on YTD momentum and seasonality assumptions.",
              "Market research evidence has been marked important or irrelevant.",
              "AI reasoning explains all material forecast changes.",
              "Database upload package includes audit trail metadata.",
            ].map((item) => (
              <label className="checkItem" key={item}>
                <input defaultChecked type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionHeader title="Final decision notes" />
          <textarea defaultValue="Sales office accepts the revised OI forecast. Main upside is Vodafone private 5G demand and stronger YTD momentum; main downside remains renewal timing at National Grid and BT tender delay. One-off orders are excluded from recurring demand." />
          <div className="reviewStamp">
            <span className="pill positive">Within corridor</span>
            <span className="pill positive">Evidence attached</span>
            <span className="pill neutral">Human reviewed</span>
          </div>
        </section>
      </div>

      <section className="panel">
        <SectionHeader title="Submission preview" />
        <table className="dataTable">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sales office</td>
              <td>RSGBR - London</td>
              <td>Workspace selection</td>
              <td><span className="pill positive">Ready</span></td>
            </tr>
            <tr>
              <td>Fiscal year</td>
              <td>FY26/27</td>
              <td>Workspace selection</td>
              <td><span className="pill positive">Ready</span></td>
            </tr>
            <tr>
              <td>Booked OI YTD</td>
              <td>{money(bookedOrderIntakeYtd)}</td>
              <td>Actual order intake</td>
              <td><span className="pill positive">Locked</span></td>
            </tr>
            <tr>
              <td>Remaining forecast</td>
              <td>{money(remainingForecast)}</td>
              <td>Named + recurring + run-rate + research</td>
              <td><span className="pill positive">Ready</span></td>
            </tr>
            <tr>
              <td>Order Intake forecast</td>
              <td>{money(revisedForecast)}</td>
              <td>AI reasoning package</td>
              <td><span className="pill positive">Ready</span></td>
            </tr>
            <tr>
              <td>Planning corridor</td>
              <td>{money(planningLow)} - {money(planningHigh)}</td>
              <td>BP corridor</td>
              <td><span className="pill positive">Within range</span></td>
            </tr>
          </tbody>
        </table>
      </section>

      <FlowFooter nextLabel="Next: Submit" onNext={onNext} />
    </div>
  );
}

function SubmitPage({
  entries,
  articles,
  isSubmitted,
  onSubmit,
}: {
  entries: SalesEntry[];
  articles: Article[];
  isSubmitted: boolean;
  onSubmit: () => void;
}) {
  const { remainingForecast, revisedForecast } = getForecastSummary(entries, articles);

  return (
    <div className="workspaceContent">
      <section className="pageHeader">
        <div>
          <h1>Submit forecast</h1>
          <p>Upload the reviewed forecast package once the sales office and AI assistant agree on the number.</p>
        </div>
      </section>

      <section className="submitHero panel">
        <div>
          <p className="meta">Ready-to-upload forecast</p>
          <h2>{money(revisedForecast)}</h2>
          <span className="pill positive">RSGBR - London / FY26/27</span>
        </div>
        <div className="submitStatus">
          <strong>{isSubmitted ? "Submitted" : "Awaiting upload"}</strong>
          <p>
            {isSubmitted
              ? "The local forecast package has been marked as uploaded in this prototype."
              : "Press upload to mark Submit complete. The step turns green only after that action."}
          </p>
        </div>
        <button
          className={isSubmitted ? "disabledButton" : "primaryButton"}
          disabled={isSubmitted}
          onClick={onSubmit}
          type="button"
        >
          {isSubmitted ? "Upload complete" : "Upload forecast to database"}
        </button>
      </section>

      <div className="contentGrid reviewGrid">
        <section className="panel">
          <SectionHeader title="Upload package" />
          <div className="packageList">
            <div><strong>Forecast value</strong><span>{money(revisedForecast)}</span></div>
            <div><strong>Booked OI YTD</strong><span>{money(bookedOrderIntakeYtd)}</span></div>
            <div><strong>Remaining forecast</strong><span>{money(remainingForecast)}</span></div>
            <div><strong>Sales signals</strong><span>{entries.filter((entry) => entry.used).length} attached</span></div>
            <div><strong>Research evidence</strong><span>{articles.filter((article) => article.mark === "Important").length} important articles</span></div>
            <div><strong>Audit trail</strong><span>Complete</span></div>
          </div>
        </section>

        <section className="panel">
          <SectionHeader title="Post-submit routing" />
          <div className="packageList">
            <div><strong>Destination</strong><span>Forecast database</span></div>
            <div><strong>Aggregation dashboard</strong><span>Handled by central planning team</span></div>
            <div><strong>Submission mode</strong><span>Prototype action only</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function WaterfallChart({
  drivers,
  revisedForecast,
}: {
  drivers: Array<{ label: string; value: number; type: string }>;
  revisedForecast: number;
}) {
  const max = Math.max(58, Math.ceil((revisedForecast + 5) / 10) * 10);
  const min = 0;
  const scale = (value: number) => ((value - min) / (max - min)) * 100;
  let running = drivers[0]?.value ?? 0;

  return (
    <div className="waterfall">
      <div className="chartAxis">
        {[max, max - 10, max - 20, max - 30, max - 40, max - 50, 0]
          .filter((tick, index, ticks) => tick >= 0 && ticks.indexOf(tick) === index)
          .map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <div className="bars">
        {drivers.map((driver, index) => {
          if (index === 0) {
            return (
              <div className="barColumn" key={driver.label}>
                <div className="bar total" style={{ height: `${scale(driver.value)}%` }} />
                <strong>{driver.value.toFixed(1)}</strong>
                <span>{driver.label}</span>
              </div>
            );
          }

          const previous = running;
          running += driver.value;
          const top = Math.max(previous, running);
          const height = Math.abs(scale(running) - scale(previous));

          return (
            <div className="barColumn" key={driver.label}>
              <div
                className={classNames("bar floating", driver.value >= 0 ? "up" : "down")}
                style={{ bottom: `${scale(Math.min(previous, running))}%`, height: `${Math.max(height, 4)}%` }}
              />
              <strong style={{ bottom: `${scale(top) + 3}%` }}>{compactImpact(driver.value)}</strong>
              <span>{driver.label}</span>
            </div>
          );
        })}
        <div className="barColumn">
          <div className="bar total revised" style={{ height: `${scale(revisedForecast)}%` }} />
          <strong>{revisedForecast.toFixed(1)}</strong>
          <span>Forecast to submit</span>
        </div>
      </div>
    </div>
  );
}

function ReasonRow({
  title,
  text,
  impact: rowImpact,
  evidence,
}: {
  title: string;
  text: string;
  impact: number;
  evidence: string;
}) {
  return (
    <article className="reasonRow">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <strong className={rowImpact >= 0 ? "positiveText" : "negativeText"}>
        {compactImpact(rowImpact)}
      </strong>
      <span className={classNames("pill", evidence.includes("article") || evidence.includes("Sales") ? "positive" : "neutral")}>
        {evidence}
      </span>
    </article>
  );
}

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>("inputs");
  const [completedPages, setCompletedPages] = useState<PageId[]>([]);
  const [entries, setEntries] = useState(initialSalesEntries);
  const [articles, setArticles] = useState(initialArticles);

  const completePage = (page: PageId) => {
    setCompletedPages((currentPages) =>
      currentPages.includes(page) ? currentPages : [...currentPages, page],
    );
  };

  const completeAndGoNext = (page: PageId) => {
    completePage(page);
    const currentIndex = workflow.findIndex((step) => step.id === page);
    const nextStep = workflow[currentIndex + 1];

    if (nextStep) {
      setActivePage(nextStep.id);
    }
  };

  const activeView = useMemo(() => {
    if (activePage === "inputs") {
      return (
        <SalesInputsTab
          entries={entries}
          onNext={() => completeAndGoNext("inputs")}
          onAddEntry={(entry) => {
            setEntries((currentEntries) => [
              { ...entry, id: currentEntries.length + 1 },
              ...currentEntries,
            ]);
          }}
        />
      );
    }

    if (activePage === "research") {
      return (
        <MarketResearchTab
          articles={articles}
          onNext={() => completeAndGoNext("research")}
          onMarkArticle={(articleId, mark) => {
            setArticles((currentArticles) =>
              currentArticles.map((article) =>
                article.id === articleId ? { ...article, mark } : article,
              ),
            );
          }}
        />
      );
    }

    if (activePage === "forecast") {
      return (
        <ForecastReasoningTab
          articles={articles}
          entries={entries}
          onNext={() => completeAndGoNext("forecast")}
        />
      );
    }

    if (activePage === "review") {
      return (
        <ReviewPage
          articles={articles}
          entries={entries}
          onNext={() => completeAndGoNext("review")}
        />
      );
    }

    return (
      <SubmitPage
        articles={articles}
        entries={entries}
        isSubmitted={completedPages.includes("submit")}
        onSubmit={() => completePage("submit")}
      />
    );
  }, [activePage, articles, completedPages, entries]);

  return (
    <main className="appShell">
      <Sidebar
        activePage={activePage}
        completedPages={completedPages}
        onNavigate={setActivePage}
      />
      <section className="mainSurface">
        {activeView}
      </section>
    </main>
  );
}
