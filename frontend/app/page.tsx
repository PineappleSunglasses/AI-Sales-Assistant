const workflowSteps = [
  "Upload ISO budget files",
  "Normalize planning data",
  "Run validation checks",
  "Review AI proposals",
  "Export approved budget",
];

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Rohde & Schwarz Case 1</p>
        <h1>Budget Planning Assistant</h1>
        <p className="summary">
          A workspace for ingesting regional budget files, validating them
          against planning corridors, and focusing human review on the few
          decisions that matter.
        </p>
      </section>

      <section className="workflow" aria-label="MVP workflow">
        {workflowSteps.map((step, index) => (
          <div className="workflowStep" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{step}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
