import Link from "next/link";
import FlipCard from "./FlipCard";
import type { Featured } from "@/content/featured";
import type { Repo } from "@/lib/github";

export default function ProjectCard({ index, repo, meta }: { index: number; repo: Repo; meta: Featured }) {
  const num = String(index + 1).padStart(2, "0");
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
        ariaLabel={`${meta.title}. Flip to read the summary.`}
        front={
          <div className="pc-face pc-front">
            <div className="pc-top">
              <span className="pc-num" style={{ background: meta.bg, color: meta.fg }}>
                {num}
              </span>
              <span className="pc-kicker">{meta.kicker}</span>
            </div>
            <h3 className="pc-title">{meta.title}</h3>
            <div className="pc-bottom">
              <ul className="pc-chips">
                {meta.stack.slice(0, 3).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <span className="pc-hint">Flip ↻</span>
            </div>
          </div>
        }
        back={
          <div className="pc-face pc-back" style={{ background: meta.bg, color: meta.fg }}>
            <p className="pc-blurb">{meta.blurb}</p>
            <div>
              <div className="pc-stat">{meta.stat.value}</div>
              <p className="pc-statlabel">{meta.stat.label}</p>
            </div>
            <ul className="pc-stack">
              {meta.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        }
      />
      <div className="project-links">
        <Link href={`/repos/${repo.name}/`}>Case study →</Link>
        <a href={repo.html_url}>GitHub ↗</a>
        {meta.live && <a href={meta.live}>Live ↗</a>}
      </div>
    </article>
  );
}
