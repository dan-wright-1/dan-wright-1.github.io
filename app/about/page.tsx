import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import Highlight from "@/components/Highlight";
import { about, type IconName, type IntroItem } from "@/content/about";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: `Working with ${profile.name}`,
  description: "A quick intro for teammates: how I work, how to reach me, and the design lines I hold.",
};

export default function AboutPage() {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <main className="about-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">← Portfolio</Link>
      </nav>

      <article className="about-sheet">
        <header className="about-id">
          {about.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="about-photo" src={about.photo} alt={`Headshot of ${profile.name}`} width={640} height={640} />
          ) : (
            <div className="about-monogram" aria-hidden="true">
              {initials}
            </div>
          )}
          <h1 className="about-hello">{about.greeting}</h1>
          <p className="about-name">{profile.name}</p>
          <p className="about-role">{about.role}</p>
          <ul className="about-chips" aria-label="Focus areas">
            {about.chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </header>

        <div className="about-body">
          <Group title="Working together" tone="work" items={about.working} />

          <section className="about-group" aria-labelledby="g-values">
            <h2 id="g-values" className="about-group-title">Design values</h2>
            <p className="about-sub">I champion</p>
            <Rows items={about.values.champion} tone="champion" />
            <p className="about-sub">I push back on</p>
            <Rows items={about.values.pushBack} tone="push" />
          </section>

          <p className="about-cta">
            <a className="btn btn-solid" href={profile.links.linkedin}>
              Say hi on LinkedIn ↗
            </a>
          </p>
        </div>
      </article>
    </main>
  );
}

function Group({ title, tone, items }: { title: string; tone: string; items: IntroItem[] }) {
  const id = `g-${tone}`;
  return (
    <section className="about-group" aria-labelledby={id}>
      <h2 id={id} className="about-group-title">
        {title}
      </h2>
      <Rows items={items} tone={tone} />
    </section>
  );
}

function Rows({ items, tone }: { items: IntroItem[]; tone: string }) {
  return (
    <ul className={`about-rows about-rows--${tone}`}>
      {items.map((it) => (
        <li key={it.label}>
          <Icon name={it.icon} />
          <div>
            <p className="about-label">{it.label}</p>
            <p className="about-text">
              <Highlight text={it.text} />
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Small line icons (Lucide-style paths), drawn inline so they inherit the row colour. */
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    ask: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>
    ),
    team: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    spark: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    stop: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m4.9 4.9 14.2 14.2" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    ),
  };
  return (
    <svg className="about-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
