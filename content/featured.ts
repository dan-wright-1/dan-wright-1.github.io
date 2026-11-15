// Curated cards. The key is the GitHub repo name; everything else about the repo
// (links, language, last push) is read live from GitHub at build time.
export type Featured = {
  title: string;
  kicker: string;
  blurb: string;
  stack: string[];
  stat: { value: string; label: string };
  bg: string;
  fg: string;
  live?: string;
};

export const featured: Record<string, Featured> = {
  "multi-source-data-pipeline-adventureworks": {
    title: "Real-Time Sales Pipeline",
    kicker: "Data engineering",
    blurb:
      "Moves live orders and support chats from PostgreSQL and MongoDB into Snowflake, then merges them with historical sales in dbt so old reports keep working.",
    stack: ["Python", "Docker", "PostgreSQL", "MongoDB", "Snowflake", "dbt"],
    stat: { value: "10s", label: "source polling, incremental and restart-safe" },
    bg: "#ff4d1c",
    fg: "#15120f",
  },
  "NorthStar-Platform": {
    title: "NorthStar AI Platform",
    kicker: "Cloud & MLOps",
    blurb:
      "A retail AI platform on AWS built across seven labs: Terraform infrastructure, Glue ETL, a feature store, churn models tracked in MLflow, and a policy-grounded agent.",
    stack: ["AWS", "Terraform", "Glue", "SageMaker", "MLflow", "XGBoost"],
    stat: { value: "7 labs", label: "each one extends the last instead of replacing it" },
    bg: "#2b3cff",
    fg: "#ffffff",
  },
  AgentBuild: {
    title: "AgentBuild",
    kicker: "Applied AI",
    blurb:
      "A streaming chat agent with a calculator, web search, RAG over a local knowledge base, and Wikipedia. The UI shows which tools answered each question.",
    stack: ["TypeScript", "Next.js", "LangGraph", "Claude", "Vitest"],
    stat: { value: "4 tools", label: "with conversation memory and structured logging" },
    bg: "#2f6b3a",
    fg: "#ffffff",
  },
  "Fraud-Detection-Case": {
    title: "Fraud Detection",
    kicker: "Machine learning",
    blurb:
      "Six model workflows (logistic regression and XGBoost across three preprocessing recipes) on a dataset where only 0.173% of transactions are fraud.",
    stack: ["R", "XGBoost", "Logistic regression", "Resampling"],
    stat: { value: "96%", label: "recall with XGBoost on a 0.173% fraud base rate" },
    bg: "#f2b705",
    fg: "#15120f",
  },
  "Home-Analysis-Data-Prep": {
    title: "Mobile Home Park Data Prep",
    kicker: "Data preparation",
    blurb:
      "Cleaned and joined a wide and a long dataset into one row per property so a stakeholder could score mobile home parks as investments.",
    stack: ["R", "Pivoting", "Joins", "Feature engineering"],
    stat: { value: "2 → 1", label: "datasets consolidated to one row per property" },
    bg: "#ff8fb1",
    fg: "#15120f",
  },
  "canvas-to-tasks": {
    title: "Canvas → Google Tasks",
    kicker: "Product design",
    blurb:
      "A three-screen mock-up that syncs Canvas assignments into Google Tasks, written up with a persona, a value claim, and a plan for testing it.",
    stack: ["Product design", "Prototype", "UX research"],
    stat: { value: "3 screens", label: "from landing to a confirmed sync" },
    bg: "#15120f",
    fg: "#f6f2e8",
    live: "https://dan-wright-1.github.io/canvas-to-tasks/",
  },
};

// Repos that never appear on the home page.
export const hidden = new Set(["cs401r-dwrigh63"]);
