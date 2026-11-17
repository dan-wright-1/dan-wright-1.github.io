import Link from "next/link";
import FlipCard from "./FlipCard";
import CertBadge from "./CertBadge";
import { Ear } from "./ProjectCard";
import { certData, certs, shortName } from "@/lib/certs";

const BG = "#0176d3";
const FG = "#ffffff";

export default function CertCard({ index }: { index: number }) {
  const num = String(index + 1).padStart(2, "0");
  const href = "/certifications/";
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
        ariaLabel="Salesforce certifications: open the certifications page. Press Space to flip the card for a summary."
        front={
          <div className="pc-face pc-front">
            <div className="pc-top">
              <span className="pc-num" style={{ background: BG, color: FG }}>
                {num}
              </span>
              <span className="pc-kicker">Credentials</span>
            </div>
            <h3 className="pc-title">Salesforce Certifications</h3>
            <div className="pc-bottom">
              <ul className="cc-badges" aria-label="Certification badges">
                {certs.map((c) => (
                  <li key={c.title}>
                    <CertBadge cert={c} size={62} />
                  </li>
                ))}
              </ul>
            </div>
            <Ear id="certs-front" flap={BG} ink={FG} />
          </div>
        }
        back={
          <div className="pc-face pc-back" style={{ background: BG, color: FG }}>
            <p className="pc-blurb">
              Certified across Salesforce administration, app building, data, analytics and AI agents.
            </p>
            <div>
              <div className="pc-stat">{certs.length}</div>
              <p className="pc-statlabel">active certifications, verifiable on Trailhead</p>
            </div>
            <ul className="pc-stack">
              {certs.map((c) => (
                <li key={c.title}>{shortName(c.title)}</li>
              ))}
            </ul>
            <Ear id="certs-back" flap="#f6f2e8" ink="#15120f" />
          </div>
        }
      />
      <div className="project-links">
        <Link href={href} className="project-open">View certifications →</Link>
        {certData.profileUrl && <a href={certData.profileUrl}>Trailhead ↗</a>}
      </div>
    </article>
  );
}
