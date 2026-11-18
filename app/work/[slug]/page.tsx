import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import AdventureWorksDiagram from "@/components/pipeline/AdventureWorksDiagram";
import PipelineFeed from "@/components/pipeline/PipelineFeed";
import { PipelineSimProvider } from "@/components/pipeline/PipelineSim";
import diagrams from "@/content/diagrams.json";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";
import { GITHUB_USER } from "@/lib/github";

export const dynamicParams = false;

// content/diagrams.json lists Lucid diagrams; scripts/fetch-diagrams.mjs turns each
// into public/diagrams/<slug>.svg before the build.
type Diagram = { title: string; alt: string; lucidUrl: string; width: number; height: number };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: `${p.title} — ${profile.name}`, description: p.blurb } : {};
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i === -1) notFound();
  const p = projects[i];
  // The certifications page sits between the last project and the first.
  const certsLink = { href: "/certifications/", title: "Salesforce Certifications" };
  const prev = i === 0 ? certsLink : { href: `/work/${projects[i - 1].slug}/`, title: projects[i - 1].title };
  const next = i === projects.length - 1 ? certsLink : { href: `/work/${projects[i + 1].slug}/`, title: projects[i + 1].title };
  const num = String(i + 1).padStart(2, "0");
  const theme = { "--p-bg": p.bg, "--p-fg": p.fg } as CSSProperties;
  // Only show the section if a diagram has actually been saved (the fetch can fail on a first run).
  const listed = (diagrams as Record<string, Diagram>)[p.slug];
  const lucid = listed && existsSync(path.join(process.cwd(), "public", "diagrams", `${p.slug}.svg`)) ? listed : null;
  const figure = lucid
    ? { src: `/diagrams/${p.slug}.svg`, alt: lucid.alt, caption: lucid.title, width: lucid.width, height: lucid.height, lucidUrl: lucid.lucidUrl }
    : p.figure
      ? { ...p.figure, lucidUrl: null }
      : null;
  // AdventureWorks gets the live view: an event feed under the problem and an animated diagram.
  const live = p.slug === "adventureworks-pipeline";

  const problem = (
    <section className="work-section">
      <h2>The problem</h2>
      <div className="work-prose">
        {p.problem.map((para) => (
          <p key={para.slice(0, 32)}>{para}</p>
        ))}
      </div>
      {live && <PipelineFeed />}
    </section>
  );

  const architecture = figure && (
    <section className="work-section">
      <h2>Architecture</h2>
      <figure className="work-diagram">
        {live ? (
          <div className="work-diagram-frame work-diagram-frame--live">
            <AdventureWorksDiagram />
          </div>
        ) : (
          <a href={figure.src} className="work-diagram-frame" aria-label="Open the full-size diagram">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} />
          </a>
        )}
        <figcaption>
          <span>{figure.caption}</span>
          <span className="work-diagram-links">
            <a href={figure.src}>{live ? "Static diagram ↗" : "Full size ↗"}</a>
            {figure.lucidUrl && <a href={figure.lucidUrl}>Open in Lucid ↗</a>}
          </span>
        </figcaption>
      </figure>
    </section>
  );

  return (
    <main className="work" style={theme}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/#work">← All projects</Link>
        {p.repo && <a href={`https://github.com/${GITHUB_USER}/${p.repo}`}>GitHub ↗</a>}
        {p.repo && <Link href={`/repos/${p.repo}/`}>Full README →</Link>}
        {p.live && <a href={p.live}>Live ↗</a>}
      </nav>

      <header className="work-hero">
        <div className="work-tags">
          <span className="work-num">{num}</span>
          <span className="work-kicker">{p.kicker}</span>
          {p.status && <span className="work-status">{p.status}</span>}
        </div>
        <h1 className="work-title">{p.title}</h1>
        <p className="work-tagline">{p.tagline}</p>
        {p.live && p.liveLabel && (
          <p className="work-cta">
            <a className="btn btn-solid" href={p.live}>{p.liveLabel} ↗</a>
            {p.liveNote && <span>{p.liveNote}</span>}
          </p>
        )}
        <dl className="work-facts">
          {p.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="chips work-stack" aria-label="Stack">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </header>

      {p.placeholder && (
        <p className="work-placeholder" role="note">
          This write-up is a placeholder. The full project page is coming soon.
        </p>
      )}

      {p.metrics.length > 0 && (
        <section className="work-metrics" aria-label="Results">
          {p.metrics.map((m) => (
            <div key={m.label}>
              <p className="work-metric-value">{m.value}</p>
              <p className="work-metric-label">{m.label}</p>
            </div>
          ))}
        </section>
      )}

      {live ? (
        // One simulation drives both the event feed and the animated diagram.
        <PipelineSimProvider>
          {problem}
          {architecture}
        </PipelineSimProvider>
      ) : (
        <>
          {problem}
          {architecture}
        </>
      )}

      <section className="work-section">
        <h2>{p.flowTitle}</h2>
        <ol className="work-flow">
          {p.flow.map((s, n) => (
            <li key={s.title}>
              <span className="work-flow-n">{String(n + 1).padStart(2, "0")}</span>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {p.comparison && (
        <section className="work-section">
          <h2>{p.comparison.caption}</h2>
          <div className="work-table-wrap">
            <table className="work-table">
              <thead>
                <tr>
                  {p.comparison.headers.map((h, n) => (
                    <th key={n} scope="col">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.comparison.rows.map(([label, a, b]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{a}</td>
                    <td>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {p.scenarios && (
        <section className="work-section">
          <h2>When the answer changes</h2>
          <ul className="work-scenarios">
            {p.scenarios.map((s) => (
              <li key={s.name}>
                <p className="work-scenario-name">{s.name}</p>
                <p className="work-scenario-answer">{s.answer}</p>
                <p>{s.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.highlights.length > 0 && (
        <section className="work-section">
          <h2>Technical highlights</h2>
          <ul className="work-highlights">
            {p.highlights.map((h) => (
              <li key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {p.next && (
        <section className="work-section">
          <h2>What&rsquo;s next</h2>
          <ul className="work-next">
            {p.next.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      {p.related && (
        <section className="work-section">
          <h2>Related</h2>
          <ul className="work-related">
            {p.related.map((r) => (
              <li key={r.href}>
                {r.href.startsWith("/") ? <Link href={r.href}>{r.label} →</Link> : <a href={r.href}>{r.label} ↗</a>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="work-pager" aria-label="More projects">
        <Link href={prev.href}>
          <span>← Previous</span>
          {prev.title}
        </Link>
        <Link href={next.href} className="work-pager-next">
          <span>Next →</span>
          {next.title}
        </Link>
      </nav>
    </main>
  );
}
