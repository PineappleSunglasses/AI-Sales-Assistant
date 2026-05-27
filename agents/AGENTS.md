# Budget Planning Agents

These agents define the AI-assisted roles in the Case 1 budget-planning system.
Agents must return structured outputs and should never bypass deterministic
validation rules.

## IngestionAgent

Purpose: extract structured content from uploaded files.

Inputs:

- ISO budget Excel workbooks
- Business-plan Excel/PDF files
- Planning-parameter PDFs and DOCX emails
- Hosted-resources templates

Outputs:

- File inventory
- Extracted tables
- Workbook metadata
- Document snippets relevant to planning rules

## NormalizationAgent

Purpose: map extracted rows into canonical budget dimensions.

Responsibilities:

- Identify ISO, SO, region, company, division, product, segment, KPI, fiscal
  year, and amount fields
- Apply mapping tables for renamed or merged structures
- Flag unmapped dimensions for review

## ValidationAgent

Purpose: apply deterministic checks and produce validation findings.

Checks:

- Business-plan corridor deviations
- Implausible growth rates
- Missing required planning dimensions
- Product/segment mapping conflicts
- Hosted-resource mismatches
- Headcount and cost consistency checks

## ProposalAgent

Purpose: suggest correction proposals for validation findings.

Outputs:

- Proposed value or action
- Rationale
- Confidence
- Required human decision, if any

## ReviewAgent

Purpose: turn many findings into Raphael's decision list.

Responsibilities:

- Rank findings by severity and materiality
- Group related issues
- Separate blocker, warning, and advisory findings
- Produce the short list of human judgment calls

## ExportAgent

Purpose: prepare reviewed outputs.

Outputs:

- Validated Excel export
- Finding report
- Review audit log
- SAP-upload preparation notes
