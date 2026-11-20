// The /about/ team-intro page: who I am to work with, and the design lines I hold.
// Drawn from my Personal Code of Ethics, my Lived Code of Ethics report and my
// CliftonStrengths results; written for a public page, so family and faith details
// from the code stay out. **Phrases** are highlighted on the page.

export type IntroItem = { icon: IconName; label: string; text: string };
export type IconName = "ask" | "team" | "spark" | "chat" | "shield" | "stop" | "heart";

export const about = {
  greeting: "Hi team, I’m Danny.",
  /** Square headshot in public/; the page falls back to initials if this is removed. */
  photo: "/images/danny-headshot.jpg" as string | null,
  role: "Business Systems Analyst · Salesforce · Data Engineering",
  chips: ["Salesforce", "Data pipelines", "AI agents", "Automation"],
  working: [
    {
      icon: "ask",
      label: "Ask me about",
      text: "**Aligning tech with business strategy**, Salesforce configuration, moving data between systems with Snowflake and dbt, and building **AI agents that stay inside their guardrails**.",
    },
    {
      icon: "team",
      label: "On a team, I usually",
      text: "**Roadmap our team to success**, set up the meeting when a deadline is coming, and turn a fuzzy request into something specified, tested and documented.",
    },
    {
      icon: "spark",
      label: "What motivates me",
      text: "Learning something new and **getting it working end to end**, creating clear standards for what “done” means.",
    },
    {
      icon: "chat",
      label: "Reach me",
      text: "On any platform, **I’m good at responding**. If you’re blocked, your problem goes ahead of mine.",
    },
  ] satisfies IntroItem[],
  values: {
    champion: [
      {
        icon: "shield",
        label: "Naming the risk early",
        text: "If a design carries an ethical or data risk, **I say so before it ships**, not after.",
      },
      {
        icon: "shield",
        label: "Systems that tell the truth",
        text: "My AI agent **labels which tool produced each answer**, so users can tell a checked fact from a guess.",
      },
      {
        icon: "shield",
        label: "Only the access the job needs",
        text: "People’s data belongs **behind the right permissions**, separated by how sensitive it is.",
      },
    ] satisfies IntroItem[],
    pushBack: [
      {
        icon: "stop",
        label: "Rationalized shortcuts",
        text: "“Users won’t notice” or “everyone does it” **isn’t a reason**.",
      },
      {
        icon: "stop",
        label: "Rushing past a red flag",
        text: "**I’d rather pause a launch** than ship something that harms the people it was built for.",
      },
      {
        icon: "stop",
        label: "Design that works against the user",
        text: "Dark patterns, and **collecting more data than the job needs**.",
      },
    ] satisfies IntroItem[],
  },
};
