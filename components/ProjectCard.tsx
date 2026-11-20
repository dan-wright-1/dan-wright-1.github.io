import Link from "next/link";
import type { CSSProperties } from "react";
import FlipCard from "./FlipCard";
import type { Project } from "@/content/projects";
import { GITHUB_USER } from "@/lib/github";

export default function ProjectCard({ index, project: p }: { index: number; project: Project }) {
  const num = String(index + 1).padStart(2, "0");
  const href = `/work/${p.slug}/`;
  return (
    <article className="project">
      <FlipCard
        width={330}
        height={440}
        radius={6}
        background="#f6f2e8"
        color="#15120f"
        shadowOpacity={0.28}
        glareOpacity={0.14}
        tiltMax={8}
        href={href}
        flipCorner={60}
        ariaLabel={`${p.title}: open the project page. Press Space to flip the card for a summary.`}
        front={
          <div className="pc-face pc-front">
            <div className="pc-top">
              <span className="pc-num" style={{ background: p.bg, color: p.fg }}>
                {num}
              </span>
              <span className="pc-kicker">{p.kicker}</span>
            </div>
            <h3 className="pc-title">{p.title}</h3>
            <div className="pc-bottom pc-bottom--stack">
              <ul className="pc-chips">
                {p.placeholder ? (
                  <li>Coming soon</li>
                ) : (
                  p.stack.slice(0, 3).map((s) => <li key={s}>{s}</li>)
                )}
              </ul>
              <span className="pc-hint" style={{ "--hint-bg": p.bg, "--hint-fg": p.fg } as CSSProperties}>
                Case study <span className="pc-arrow" aria-hidden="true">→</span>
              </span>
            </div>
            <Ear id={`${p.slug}-front`} flap={p.bg} ink={p.fg} />
          </div>
        }
        back={
          <div className="pc-face pc-back" style={{ background: p.bg, color: p.fg }}>
            <p className="pc-blurb">{p.blurb}</p>
            <div>
              <div className="pc-stat">{p.stat.value}</div>
              <p className="pc-statlabel">{p.stat.label}</p>
            </div>
            <ul className="pc-stack">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <Ear id={`${p.slug}-back`} flap="#f6f2e8" ink="#15120f" />
          </div>
        }
      />
      <div className="project-links">
        <Link href={href} className="project-open">View project →</Link>
        {p.repo && <a href={`https://github.com/${GITHUB_USER}/${p.repo}`}>GitHub ↗</a>}
        {p.live && <a href={p.live}>Live ↗</a>}
      </div>
    </article>
  );
}

/** Dog-eared bottom-right corner. The folded flap shows the colour of the other side. */
export function Ear({ id, flap, ink }: { id: string; flap: string; ink: string }) {
  return (
    <span className="pc-ear" title="Flip card" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`ear-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.5" stopColor="#000" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <polygon points="0,0 100,0 0,100" fill={flap} />
        <polygon points="0,0 100,0 0,100" fill={`url(#ear-${id})`} />
        <text x="34" y="34" transform="rotate(-45 34 34)" textAnchor="middle" dominantBaseline="central" fill={ink} className="pc-ear-label">
          Flip
        </text>
        <polygon points="0,0 100,0 0,100" fill="none" stroke="#15120f" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
