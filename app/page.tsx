import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import Ticker from "@/components/Ticker";
import { featured, hidden } from "@/content/featured";
import { education, experience, profile, skills, tickerExtras } from "@/content/profile";
import { getRepos } from "@/lib/github";

export default async function Home() {
  const repos = await getRepos();
  const picks = Object.keys(featured)
    .map((name) => repos.find((r) => r.name === name))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const more = repos.filter((r) => !featured[r.name] && !hidden.has(r.name));
  const stack = [...new Set([...tickerExtras, ...Object.values(featured).flatMap((f) => f.stack)])];

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">{profile.role}</p>
        <h1 className="hero-name">
          <Reveal text={profile.name} />
        </h1>
        <div className="hero-row">
          <p className="hero-intro">{profile.intro}</p>
          <div className="hero-cta">
            <a className="btn btn-solid" href="#work">See the work ↓</a>
            <a className="btn" href={profile.links.linkedin}>LinkedIn ↗</a>
            <a className="btn" href={profile.links.github}>GitHub ↗</a>
          </div>
        </div>
        <p className="hero-school">{profile.school}</p>
      </section>

      <Ticker items={stack} />

      <section id="work" className="section">
        <div className="section-head">
          <h2>Selected work</h2>
          <p className="mono-note">{String(picks.length).padStart(2, "0")} projects · click or drag a card to flip it</p>
        </div>
        <div className="grid">
          {picks.map((repo, i) => (
            <ProjectCard key={repo.name} index={i} repo={repo} meta={featured[repo.name]} />
          ))}
        </div>
      </section>

      <section id="experience" className="section">
        <div className="section-head">
          <h2>Experience</h2>
          <p className="mono-note">consulting · operations · research</p>
        </div>
        <ol className="xp">
          {experience.map((job) => (
            <li key={job.role} className="xp-item">
              <p className="xp-dates">{job.dates}</p>
              <div>
                <h3 className="xp-role">{job.role}</h3>
                <p className="xp-org">{job.org}</p>
                <ul className="xp-points">
                  {job.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="skills" className="section">
        <div className="section-head">
          <h2>Skills &amp; certifications</h2>
        </div>
        <div className="skills">
          {skills.map((s) => (
            <div key={s.group}>
              <h3 className="skills-group">{s.group}</h3>
              <ul className="chips">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {more.length > 0 && (
        <section id="more" className="section">
          <div className="section-head">
            <h2>More from GitHub</h2>
            <p className="mono-note">coursework and experiments</p>
          </div>
          <ul className="rows">
            {more.map((r) => (
              <li key={r.name}>
                <Link href={`/repos/${r.name}/`} className="row">
                  <span className="row-name">{r.name}</span>
                  <span className="row-desc">{r.description ?? "—"}</span>
                  <span className="row-meta">{r.language ?? ""}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="about" className="section about">
        <h2>About</h2>
        <p>{profile.about}</p>
        <div className="edu">
          <h3>{education.degree}</h3>
          <p className="edu-school">{education.school}</p>
          <ul>
            {education.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
