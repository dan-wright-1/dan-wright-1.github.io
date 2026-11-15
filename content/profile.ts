// Edit this file to change the text on the home page.
export const profile = {
  name: "Danny Wright",
  role: "Business systems analyst · Salesforce · data engineering",
  school: "MS Information Systems, Brigham Young University · Dec 2026 · 3.7 GPA",
  intro:
    "Two years of delivering systems enhancements for enterprise clients in a consulting environment. I take ambiguous business requests and turn them into specified, tested, documented changes that ship to production.",
  about:
    "I drive the design and implementation of automated workflows and help teams make data-backed decisions. Outside of work: skiing, longboarding, strength training, rock climbing, pickleball and camping.",
  links: {
    github: "https://github.com/dan-wright-1",
    linkedin: "https://www.linkedin.com/in/daniel-jos-wright/",
  },
};

export const experience = [
  {
    dates: "Oct 2024 – Aug 2026",
    role: "Salesforce Consultant · Outsourced Admin Team (part-time)",
    org: "SOLVD.Cloud · Summit-tier Salesforce partner · Lehi, UT",
    points: [
      "Drove successful delivery of 2 ongoing client engagements by translating business requirements into solutions",
      "Maintained system reliability by administering automation, reporting, and objects with SOQL, Flow, and permission sets",
      "Multiplied delivery capacity by directing 600+ offshore development/QA hours through criteria-scoped Asana tasks",
      "Enabled KPI reporting across 75,000+ donor memberships and 3.2M+ gift records by redesigning the data model",
      "Prevented downtime across 3 client orgs by auditing and deploying 6 seasonal platform upgrades with zero incidents",
      "Automated sales governance protecting thousands of deal terms with CPQ quote-locks on approval",
    ],
  },
  {
    dates: "May 2024 – Aug 2024",
    role: "Information Systems Manager",
    org: "Purity International · Orem, UT",
    points: [
      "Increased call answer rates 30% at 3 stores by leading cross-department heads to deploy and iterate call-routing logic",
      "Reduced operations turnaround time 2x by automating data capture and print workflows, eliminating errors",
      "Analyzed inventory data, identified the root cause of inaccuracies, and redesigned processes to improve reliability by 25%",
    ],
  },
  {
    dates: "Jan 2024 – Apr 2024",
    role: "Technical Research Assistant · Computer Vision Team",
    org: "BYU Record Linking Lab · Provo, UT",
    points: [
      "Expanded training data for predictive models with a Python script that maps and merges census record datasets",
      "Accelerated data processing by 97% by integrating a parallelization package into the pipeline",
    ],
  },
];

export const education = {
  degree: "Master of Science, Information Systems · Dec 2026",
  school: "Brigham Young University, Marriott School of Business · STEM-designated · 3.7 GPA",
  notes: [
    "Academic Scholarship (2022–2023) and Marriott School Scholarship (2024–2025)",
    "Selected as one of 50+ officer applicants for VP of Event Logistics, Association for Information Systems at BYU",
    "Coursework: Database Systems, Data Engineering, Data Science for Orgs, Management Communication",
  ],
};

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Salesforce certifications",
    items: ["Administrator", "Data 360 Consultant", "Platform App Builder", "Tableau Data Analyst", "Agentforce Specialist"],
  },
  {
    group: "Data & analytics",
    items: ["Python (Pandas, NumPy, PySpark)", "R", "SQL / SOQL", "PostgreSQL", "Tableau", "Excel", "Snowflake", "dbt"],
  },
  { group: "Cloud & infrastructure", items: ["AWS (EC2, S3, VPC, IAM, Glue, SageMaker)", "Terraform", "Docker"] },
  { group: "AI", items: ["n8n workflows", "Data migration pipelines", "Websites built with Claude Code"] },
];

export const tickerExtras = ["Salesforce", "Flow", "SOQL", "CPQ", "Tableau", "Asana"];
