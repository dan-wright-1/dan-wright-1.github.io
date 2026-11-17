// The "Selected work" grid and the /work/<slug>/ pages are both built from this list.
// Order here is the order on the home page (most important first).
//
// `repo` is optional: set it only for public GitHub repos. It adds the GitHub and
// "full README" links and keeps that repo out of the "More from GitHub" list.

export type Step = { title: string; detail: string };

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  /** Card back + page intro. */
  blurb: string;
  stack: string[];
  stat: { value: string; label: string };
  bg: string;
  fg: string;
  repo?: string;
  live?: string;
  /** Shown as a badge, e.g. "In progress". */
  status?: string;
  /** True while the write-up is still placeholder copy. */
  placeholder?: boolean;

  // ---- detail page ----
  tagline: string;
  facts: { label: string; value: string }[];
  metrics: { value: string; label: string }[];
  problem: string[];
  flowTitle: string;
  flow: Step[];
  highlights: Step[];
  comparison?: { caption: string; headers: [string, string, string]; rows: [string, string, string][] };
  scenarios?: { name: string; answer: string; why: string }[];
  next?: string[];
  related?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "snowflake-ify",
    title: "How I Snowflake-ified the NorthStar AI Platform",
    kicker: "Cloud architecture",
    status: "Snowflake build in progress",
    blurb:
      "A retail AI platform built on AWS (Terraform, Glue, Feature Store, an XGBoost churn model and a policy-bound agent), now being rebuilt natively on Snowflake to compare the two architectures on the same outcomes.",
    stack: ["AWS", "Snowflake", "Terraform", "Glue", "SageMaker", "MLflow", "Bedrock"],
    stat: { value: "2 stacks", label: "same business outcomes, each built the native way" },
    bg: "#2b3cff",
    fg: "#ffffff",
    repo: "NorthStar-Platform",
    tagline:
      "NorthStar Retail already keeps its data in Snowflake. The course had me build its AI platform on AWS. This project asks the question an architect would get on day one: why not build it where the data already lives?",
    facts: [
      { label: "Context", value: "CS 401R, BYU (AWS build) + independent Snowflake track" },
      { label: "Role", value: "Sole builder: infrastructure, data, models, agent, evaluation" },
      { label: "Status", value: "AWS Labs 1–3 complete · Snowflake rebuild underway" },
    ],
    metrics: [
      { value: "0.783", label: "test AUC for the churn model" },
      { value: "0.74", label: "precision in the top-10% churn list" },
      { value: "+0.059", label: "AUC over a recency-only baseline (95% CI excludes 0)" },
      { value: "33 / 0", label: "evidence checks passed / failed on the final run" },
    ],
    problem: [
      "NorthStar is a fictional retailer whose point-of-sale, e-commerce, CRM and loyalty data land in a Snowflake warehouse every night. The course puts that integration out of scope and builds the AI platform on AWS: a governed data lake, features, a weekly churn list for marketing, and a customer-service agent that has to follow refund and credit policy.",
      "I built that AWS platform first, lab by lab. The Snowflake track rebuilds the same outcomes the way Snowflake would do them, rather than copying the AWS design. A faithful copy would make Snowflake look worse than it is and say nothing useful. Where the native approach differs, that difference is the comparison.",
    ],
    flowTitle: "The AWS build",
    flow: [
      { title: "Infrastructure as code", detail: "Terraform modules for VPC, S3, IAM, SageMaker, Glue and Feature Store, with remote state and a LocalStack environment for testing without a bill." },
      { title: "Governed storage", detail: "S3 zones for raw, processed and features, with lifecycle rules per prefix and least-privilege roles for data engineering, ML and monitoring." },
      { title: "Glue ETL", detail: "A crawler catalogs about 163k raw transactions. One job cleans, casts, imputes and deduplicates them; a second builds 11 RFM features per customer." },
      { title: "Feature Store", detail: "One row per customer (16 feature definitions) with an online and an offline store. Labels come only from a 90-day window after the cutoff, so nothing leaks." },
      { title: "Churn model", detail: "XGBoost trained from the Feature Store, tracked in MLflow, compared against logistic regression and an MLP, and registered as pending manual approval." },
      { title: "Policy-bound agent", detail: "A customer-service agent on Bedrock AgentCore, with tools behind a gateway and a Cedar policy engine capping refunds and credits." },
    ],
    comparison: {
      caption: "Where the two platforms differ",
      headers: ["", "AWS (built)", "Snowflake (in progress)"],
      rows: [
        ["Shape", "Assemble separate services (S3, Glue, IAM, VPC, SageMaker) and wire them together", "One platform; create objects inside it (databases, warehouses, roles, tasks, models)"],
        ["Security boundary", "Network topology (VPC, subnets, security groups) plus IAM JSON", "Identity and role grants; there is no network layer to design"],
        ["Data movement", "Copy the warehouse into S3 and keep a second pipeline running", "None: the data is already there"],
        ["Governance", "IAM and CloudWatch; column masking would need Lake Formation", "Grants, masking policies and data metric functions in one model"],
        ["Credit cap on the agent", "Cedar checks each call on its own, so two $40 credits both pass", "A procedure checks the running total in a ledger and writes in the same transaction"],
        ["Weekly churn list", "Endpoint or batch transform, then copy the scores back", "A scheduled task writes a table marketing already reads"],
        ["Model approval", "Registry has a built-in pending-approval state", "Weak spot: needs an approver-only alias, still to be tested"],
        ["Billing", "Per service: instance-hours, DPU-hours, GB-months, tokens", "Credits: compute starts and stops per second"],
      ],
    },
    scenarios: [
      { name: "NorthStar as written", answer: "Build on Snowflake", why: "No data copying, one governance model, and the team already runs it." },
      { name: "Greenfield", answer: "Depends on the workload", why: "Snowflake for SQL-first, tabular ML with low ops; AWS for custom models and real-time systems." },
      { name: "AWS-mature org", answer: "Stay on AWS", why: "Switching costs land first and benefits later; a shared Iceberg layer may beat a full move." },
    ],
    highlights: [
      { title: "Outcome parity, not feature parity", detail: "Both builds must pass the same tests: the role boundary holds, the feature set hashes identically across 9,999 customers, and model metrics land within tolerance." },
      { title: "Honest evaluation", detail: "Paired bootstrap confidence intervals, a per-tier breakdown that names the weakest segment, and a note where a tier is too small to conclude anything." },
      { title: "Leakage-free features", detail: "A fixed cutoff date separates the observation window from the outcome window, so the model never sees the future it predicts." },
      { title: "Cost discipline", detail: "Teardown scripts remove what Terraform can't see (the NAT Gateway bills hourly), and a scanner checks the whole git history for committed credentials." },
    ],
    next: [
      "Rebuild Labs 1–3 on Snowflake against the same acceptance tests.",
      "Add metered cost at NorthStar scale to the comparison.",
      "Write the recommendation to NorthStar's CDO and CFO.",
    ],
  },
  {
    slug: "agentbuild",
    title: "My Agentic WebApp",
    kicker: "Applied AI",
    blurb:
      "A streaming chat agent with a calculator, web search, RAG over a local knowledge base, and Wikipedia. The UI shows which tools answered each question.",
    stack: ["TypeScript", "Next.js", "LangGraph", "Claude", "Vitest"],
    stat: { value: "4 tools", label: "with conversation memory and structured logging" },
    bg: "#2f6b3a",
    fg: "#ffffff",
    repo: "AgentBuild",
    tagline:
      "A multi-tool agent that decides for itself whether a question needs math, the web, an internal knowledge base or an encyclopedia, and shows its work.",
    facts: [
      { label: "Context", value: "Individual project, BYU (multi-tool agent assignment)" },
      { label: "Role", value: "Sole developer: PRD, architecture, build, tests" },
      { label: "Model", value: "Claude Sonnet 4.6 through LangChain.js" },
    ],
    metrics: [
      { value: "4", label: "tools the agent can choose between" },
      { value: "16", label: "Vitest tests across the tool layer" },
      { value: "SSE", label: "tokens stream to the UI as they are generated" },
    ],
    problem: [
      "A plain chatbot answers everything from memory, including arithmetic it gets wrong and facts that have changed. The goal was an agent that picks the right tool for each part of a question, cites where an answer came from, and leaves a log that makes its choices easy to debug.",
    ],
    flowTitle: "How a question is answered",
    flow: [
      { title: "Chat UI", detail: "React sends the message and the conversation history to a Next.js API route." },
      { title: "ReAct loop", detail: "A LangGraph agent reasons, picks a tool, observes the result and repeats until it can answer." },
      { title: "Tools", detail: "Calculator (mathjs), web search (Tavily), RAG over local documents with source filenames, and Wikipedia summaries. Each tool validates its input with Zod." },
      { title: "Stream back", detail: "The route pipes the agent's output as server-sent events; the UI appends tokens live and adds a badge for each tool used." },
      { title: "Log", detail: "Every tool call writes a JSON line with the tool name, arguments, result and duration." },
    ],
    highlights: [
      { title: "Tool badges", detail: "Each answer shows which tools produced it, so a user can tell a looked-up fact from a model guess." },
      { title: "Conversation memory", detail: "The client owns the history and sends it each turn, so follow-ups work without server-side session state." },
      { title: "Source attribution", detail: "RAG answers return the matching chunks along with the files they came from, and the knowledge base persists across restarts." },
      { title: "Docs first", detail: "A PRD, roadmap, architecture document and plan were written before the code and kept current in the repo." },
    ],
  },
  {
    slug: "adventureworks-pipeline",
    title: "AdventureWorks: A Real-Time Sales Data Pipeline",
    kicker: "Data engineering",
    blurb:
      "Moves live orders and support chats from PostgreSQL and MongoDB into Snowflake, then merges them with historical sales in dbt so old reports keep working.",
    stack: ["Python", "Docker", "PostgreSQL", "MongoDB", "Snowflake", "dbt"],
    stat: { value: "10s", label: "source polling, incremental and restart-safe" },
    bg: "#ff4d1c",
    fg: "#15120f",
    repo: "multi-source-data-pipeline-adventureworks",
    tagline:
      "Adventure Works analysts could only see last year's sales. This pipeline brings new orders and support chats into the warehouse every few minutes, in the same shape as the old data.",
    facts: [
      { label: "Context", value: "IS 566: Data Engineering, BYU (final project)" },
      { label: "Role", value: "Sole developer" },
      { label: "Run it", value: "One docker compose up, plus a Snowflake account" },
    ],
    metrics: [
      { value: "10s", label: "between extracts from PostgreSQL and MongoDB" },
      { value: "1 min", label: "between scheduled Snowflake loads" },
      { value: "0", label: "downstream models rewritten to support the new data" },
    ],
    problem: [
      "The fictional retailer Adventure Works had historical orders in Snowflake as nested JSON, while new orders were landing in PostgreSQL and customer-support chats in MongoDB. Analysts could only see the historical data.",
      "The pipeline had to bring new activity in continuously, convert it to the historical format, and merge the two so that existing models, tests and dashboards kept working without changes.",
    ],
    flowTitle: "Pipeline",
    flow: [
      { title: "Extract", detail: "A Dockerized Python service polls PostgreSQL and MongoDB every 10 seconds and pulls only rows added or changed since its last run." },
      { title: "Stage", detail: "Each batch is written to CSV or JSON and uploaded to a Snowflake stage." },
      { title: "Load", detail: "Scheduled Snowflake tasks, chained with AFTER, copy staged files into raw tables every minute and then clear the stage." },
      { title: "Transform", detail: "dbt rebuilds each order's line items as a nested array that matches the historical format, then unions old and new orders." },
      { title: "Report", detail: "One sales table covers both, with a 30-day sales-by-country dashboard on top." },
    ],
    highlights: [
      { title: "Restart-safe extraction", detail: "Each source records its last exported row in a metadata table, so a restart never re-sends old data." },
      { title: "Matching the old shape", detail: "ARRAY_AGG(OBJECT_CONSTRUCT(...)) rebuilds new orders into the nested structure the historical data uses." },
      { title: "Semi-structured data", detail: "Chat logs land as raw VARIANT JSON and are parsed and standardized in dbt." },
      { title: "Tested layers", detail: "Sources feed base, staging and intermediate models, with data tests on keys, relationships and business rules." },
    ],
  },
  {
    slug: "canvas-to-tasks",
    title: "Automating My College Tasks Lists",
    kicker: "Automation",
    blurb:
      "A self-hosted n8n workflow that runs every morning, pulls every Canvas assignment, and creates one Google Task per assignment in a list per course, without ever duplicating.",
    stack: ["n8n", "Docker", "Canvas API", "Google Tasks API", "Google Sheets API", "JavaScript"],
    stat: { value: "18 nodes", label: "daily sync with a verified Sheets side-branch" },
    bg: "#15120f",
    fg: "#f6f2e8",
    tagline:
      "I designed it as a product mock-up first, then built it for real. Each morning it puts every new assignment into the right list, so I never have to go looking for it.",
    facts: [
      { label: "Context", value: "Personal tool, runs daily" },
      { label: "Role", value: "Designer and builder" },
      { label: "Runs on", value: "n8n in Docker on my own machine; no cloud service" },
    ],
    metrics: [
      { value: "28", label: "tasks created on the first run" },
      { value: "10am", label: "every day, plus on demand" },
      { value: "25", label: "gotchas found and documented in the handoff notes" },
    ],
    problem: [
      "Canvas lists assignments per course, while I plan my week in Google Tasks. Copying them by hand meant missed due dates and duplicate entries. The design mock-up set out the value claim; the workflow is the working version.",
    ],
    flowTitle: "Workflow",
    flow: [
      { title: "Trigger", detail: "A daily 10am schedule or a manual run." },
      { title: "Canvas", detail: "List current-term courses, then every assignment in each one, paginated." },
      { title: "Normalize", detail: "Drop submitted, undated and participation items and anything outside the date window; build an all-day task with points, type, link and description." },
      { title: "Resolve lists", detail: "Match each course to its Google Tasks list. If one is missing, stop and name it rather than guess." },
      { title: "Dedupe and create", detail: "A hidden marker in each task's notes identifies its assignment, so re-runs only create what is new." },
      { title: "Planner sheet", detail: "A parallel branch upserts every assignment into a Google Sheet, re-reads it to confirm each row landed, and fails the run if one didn't." },
    ],
    highlights: [
      { title: "Idempotent by design", detail: "Dedup lives in the data (a marker in the notes), not in n8n state, so any run can be repeated safely." },
      { title: "Fails loudly", detail: "Missing lists, a changed sheet header or a dropped row all stop the run with a message that says what to fix." },
      { title: "Plain HTTP over built-in nodes", detail: "The built-in Sheets node silently dropped new rows, so the branch uses direct API calls with a write check." },
      { title: "Shared columns", detail: "The workflow owns six sheet columns; the planning columns next to them are never written, so estimates survive every rerun." },
    ],
    next: ["Move a task when its Canvas due date changes (v1 creates only)."],
    related: [
      { label: "Design mock-up (live)", href: "https://dan-wright-1.github.io/canvas-to-tasks/" },
      { label: "Mock-up write-up", href: "/repos/canvas-to-tasks/" },
    ],
  },
  {
    slug: "rpm-planner",
    title: "Tony Robbins Inspired RPM Planner WebApp",
    kicker: "Product",
    placeholder: true,
    blurb: "Placeholder: a one-paragraph summary of the RPM planner app goes here.",
    stack: ["TBD"],
    stat: { value: "—", label: "headline result to be added" },
    bg: "#f2b705",
    fg: "#15120f",
    tagline: "Placeholder: one or two sentences on who the planner is for and what it changes for them.",
    facts: [
      { label: "Context", value: "TBD" },
      { label: "Role", value: "TBD" },
      { label: "Status", value: "Write-up coming soon" },
    ],
    metrics: [],
    problem: ["Placeholder: the problem the app solves and why existing planners fall short."],
    flowTitle: "How it works",
    flow: [
      { title: "Step 1", detail: "Placeholder." },
      { title: "Step 2", detail: "Placeholder." },
      { title: "Step 3", detail: "Placeholder." },
    ],
    highlights: [],
  },
];

export const projectRepos = new Set(projects.flatMap((p) => (p.repo ? [p.repo] : [])));

// Repos that never appear on the home page.
export const hidden = new Set(["cs401r-dwrigh63"]);
