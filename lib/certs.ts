import data from "@/content/certs.json";

// content/certs.json is written by scripts/fetch-certs.mjs before each build
// (from the public Trailhead profile) and falls back to the last saved copy.
export type Cert = {
  title: string;
  product: string | null;
  dateCompleted: string | null;
  expired: boolean;
  logo: string | null;
  infoUrl: string | null;
};

export const certData = data as {
  source: "saved" | "trailhead";
  fetchedAt: string | null;
  profileUrl: string | null;
  certifications: Cert[];
};

export const certs = certData.certifications.filter((c) => !c.expired);

/** "Salesforce Certified Platform App Builder" -> "Platform App Builder" */
export function shortName(title: string) {
  return title.replace(/^(salesforce|tableau)\s+certified\s+/i, "").trim();
}

/** Initials for the placeholder badge when no logo has been fetched yet. */
export function monogram(title: string) {
  const words = shortName(title).split(/\s+/).filter(Boolean);
  return words.length === 1 ? words[0].slice(0, 2).toUpperCase() : words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
}

export function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
