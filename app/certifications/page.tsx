import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import CertBadge from "@/components/CertBadge";
import Highlight from "@/components/Highlight";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { certData, certs, formatDate, shortName } from "@/lib/certs";

export const metadata: Metadata = {
  title: `Salesforce Certifications — ${profile.name}`,
  description: `${certs.length} active Salesforce certifications.`,
};

/** "Six" rather than "6" at the start of a sentence; falls back to digits past ten. */
function countWord(n: number) {
  const words = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  return words[n] ?? String(n);
}

export default function CertificationsPage() {
  const num = String(projects.length + 1).padStart(2, "0");
  const theme = { "--p-bg": "#0176d3", "--p-fg": "#ffffff" } as CSSProperties;
  const latest = certs.map((c) => c.dateCompleted).filter(Boolean).sort().pop() ?? null;
  const last = projects[projects.length - 1];

  return (
    <main className="work" style={theme}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/#work">← All projects</Link>
        {certData.profileUrl && <a href={certData.profileUrl}>Trailhead profile ↗</a>}
      </nav>

      <header className="work-hero">
        <div className="work-tags">
          <span className="work-num">{num}</span>
          <span className="work-kicker">Credentials</span>
        </div>
        <h1 className="work-title">Salesforce Certifications</h1>
        <p className="work-tagline">
          <Highlight
            text={`**${countWord(certs.length)} Salesforce certifications** covering what a client needs **end to end**: running the platform, building on it, unifying its data, analysing it in Tableau, and putting AI agents to work.${
              certData.source === "trailhead" ? " Each one can be **verified on my public Trailhead profile**." : ""
            }`}
          />
        </p>
      </header>

      <section className="work-metrics" aria-label="Summary">
        <div>
          <p className="work-metric-value">{certs.length}</p>
          <p className="work-metric-label">active certifications</p>
        </div>
        {latest && (
          <div>
            <p className="work-metric-value">{formatDate(latest)}</p>
            <p className="work-metric-label">most recent</p>
          </div>
        )}
      </section>

      <section className="work-section">
        <h2>Certifications</h2>
        <ul className="cert-grid">
          {certs.map((c) => {
            const date = formatDate(c.dateCompleted);
            return (
              <li key={c.title}>
                <CertBadge cert={c} size={128} />
                <h3>{shortName(c.title)}</h3>
                <p className="cert-meta">
                  {[c.product, date && `Earned ${date}`].filter(Boolean).join(" · ")}
                </p>
                {c.infoUrl && <a href={c.infoUrl}>Details ↗</a>}
              </li>
            );
          })}
        </ul>
      </section>

      <nav className="work-pager" aria-label="More projects">
        <Link href={`/work/${last.slug}/`}>
          <span>← Previous</span>
          {last.title}
        </Link>
        <Link href={`/work/${projects[0].slug}/`} className="work-pager-next">
          <span>Next →</span>
          {projects[0].title}
        </Link>
      </nav>
    </main>
  );
}
