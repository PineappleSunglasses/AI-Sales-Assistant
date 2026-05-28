"use client";

import { useMemo, useState } from "react";

type TabId = "inputs" | "research" | "forecast";
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

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "inputs", label: "Sales Inputs" },
  { id: "research", label: "Market Research" },
  { id: "forecast", label: "Forecast Reasoning" },
];

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
  { id: "inputs", title: "Inputs", detail: "Sales intelligence" },
  { id: "research", title: "Research", detail: "Market & news" },
  { id: "forecast", title: "Forecast", detail: "AI reasoning" },
  { id: "review", title: "Review", detail: "Validate & refine" },
  { id: "submit", title: "Submit", detail: "Upload & confirm" },
];

const baselineForecast = 45;
const insiderImpact = 1.6;
const divisionAdjustment = 0.5;
const riskDiscount = -2.5;
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

function Sidebar({ activeTab }: { activeTab: TabId }) {
  const activeIndex = activeTab === "inputs" ? 0 : activeTab === "research" ? 1 : 2;

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brandMark">AI</span>
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
          const isActive = index === activeIndex;
          const isDone = index < activeIndex;

          return (
            <div
              className={classNames("workflowItem", isActive && "active", isDone && "done")}
              key={step.title}
            >
              <span className="workflowNumber">{isDone ? "OK" : String(index + 1)}</span>
              <span>
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </span>
            </div>
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
            <dt>Baseline (v0)</dt>
            <dd>{money(baselineForecast)}</dd>
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

function TopTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <header className="topbar">
      <div className="tabs" role="tablist" aria-label="AI Sales Assistant workspaces">
        {tabs.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={classNames("tab", activeTab === tab.id && "active")}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="topActions">
        <button className="iconButton" type="button" title="Help">
          ?
        </button>
        <button className="outlineButton" type="button">
          Filters
        </button>
      </div>
    </header>
  );
}

function SalesInputsTab({
  entries,
  onAddEntry,
}: {
  entries: SalesEntry[];
  onAddEntry: (entry: Omit<SalesEntry, "id">) => void;
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
        <StatCard label="Baseline OI (v0)" value={money(baselineForecast)} detail="As of 20 May 2026">
          <Sparkline tone="neutral" />
        </StatCard>
        <StatCard label="Draft uplift" value="+EUR 3.1M" detail="+6.9% vs baseline" tone="positive">
          <Sparkline tone="positive" />
        </StatCard>
        <StatCard label="Open items" value="4" detail="Require review" tone="neutral">
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
}: {
  articles: Article[];
  onMarkArticle: (articleId: number, mark: UserMark) => void;
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
    </div>
  );
}

function ForecastReasoningTab({
  entries,
  articles,
}: {
  entries: SalesEntry[];
  articles: Article[];
}) {
  const marketImpact = articles
    .filter((article) => article.mark === "Important")
    .reduce((sum, article) => sum + article.impact, 0);

  const customerIntent = entries
    .filter((entry) => entry.used && entry.type === "Customer likely to order")
    .reduce((sum, entry) => sum + entry.impact, 0);

  const drivers = [
    { label: "Baseline forecast (v0)", value: baselineForecast, type: "total" },
    { label: "Customer intent", value: customerIntent, type: "up" },
    { label: "Insider note", value: insiderImpact, type: "up" },
    { label: "Market news", value: marketImpact, type: marketImpact >= 0 ? "up" : "down" },
    { label: "Division adjustment", value: divisionAdjustment, type: "up" },
    { label: "Risk discount", value: riskDiscount, type: "down" },
  ];
  const revisedForecast = baselineForecast + customerIntent + insiderImpact + marketImpact + divisionAdjustment + riskDiscount;
  const totalChange = revisedForecast - baselineForecast;
  const confidence = revisedForecast >= planningLow && revisedForecast <= planningHigh ? "High" : "Medium";

  return (
    <div className="workspaceContent">
      <section className="forecastHeader panel">
        <div>
          <p className="meta">Next-year Order Intake Forecast</p>
          <h1>{money(revisedForecast)}</h1>
        </div>
        <div className="forecastMetric">
          <span>vs. Baseline (v0)</span>
          <strong className={totalChange >= 0 ? "positiveText" : "negativeText"}>
            {compactImpact(totalChange)} ({((totalChange / baselineForecast) * 100).toFixed(1)}%)
          </strong>
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
          <SectionHeader title="Forecast Bridge: Baseline to Revised Forecast" />
          <WaterfallChart drivers={drivers} revisedForecast={revisedForecast} />
        </section>
        <section className="panel">
          <SectionHeader title="AI reasoning" />
          <div className="reasonList">
            <ReasonRow
              evidence="Sales note"
              impact={customerIntent}
              title="Customer intent signals strong demand"
              text="Key customers indicate high likelihood to place orders in H1 FY26/27."
            />
            <ReasonRow
              evidence="Sales note"
              impact={insiderImpact}
              title="Insider note confirms budget availability"
              text="Internal update from procurement contact confirms funding approved."
            />
            <ReasonRow
              evidence="Important article"
              impact={marketImpact}
              title="Market news supports growth outlook"
              text="Reviewed market evidence supports investment in 5G and secure communications."
            />
            <ReasonRow
              evidence="BP corridor"
              impact={divisionAdjustment}
              title="Division adjustment applied"
              text="Strategic uplift for Test & Measurement division growth priority."
            />
            <ReasonRow
              evidence="Sales note"
              impact={riskDiscount}
              title="Risk discount for delays and renewals"
              text="Renewal risk and delayed tender timing increase downside risk."
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
            <p>The risk discount feels a bit high. BT is delayed, but we expect strong Q3 recovery. Can we reduce the risk impact?</p>
          </div>
          <div className="message aiMessage">
            <strong>AI Assistant</strong>
            <p>Reducing the risk discount by EUR 0.8M keeps the forecast within the planning corridor.</p>
          </div>
          <div className="proposalBox">
            <span>Proposed adjustment</span>
            <strong>Reduce risk discount</strong>
            <em>New forecast {money(revisedForecast + 0.8)}</em>
          </div>
          <div className="buttonRow">
            <button className="outlineButton" type="button">Request revision</button>
            <button className="disabledButton" disabled type="button">Upload forecast to database</button>
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
  const max = 58;
  const min = 0;
  const scale = (value: number) => ((value - min) / (max - min)) * 100;
  let running = baselineForecast;

  return (
    <div className="waterfall">
      <div className="chartAxis">
        {[60, 50, 40, 30, 20, 10, 0].map((tick) => (
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
          <span>Revised forecast (v1)</span>
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
  const [activeTab, setActiveTab] = useState<TabId>("forecast");
  const [entries, setEntries] = useState(initialSalesEntries);
  const [articles, setArticles] = useState(initialArticles);

  const activeView = useMemo(() => {
    if (activeTab === "inputs") {
      return (
        <SalesInputsTab
          entries={entries}
          onAddEntry={(entry) => {
            setEntries((currentEntries) => [
              { ...entry, id: currentEntries.length + 1 },
              ...currentEntries,
            ]);
          }}
        />
      );
    }

    if (activeTab === "research") {
      return (
        <MarketResearchTab
          articles={articles}
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

    return <ForecastReasoningTab articles={articles} entries={entries} />;
  }, [activeTab, articles, entries]);

  return (
    <main className="appShell">
      <Sidebar activeTab={activeTab} />
      <section className="mainSurface">
        <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {activeView}
      </section>
    </main>
  );
}
