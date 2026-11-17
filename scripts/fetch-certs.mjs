// Runs before every build (npm "prebuild"). Reads the certifications on a public
// Trailhead profile and saves them to content/certs.json, with each badge logo
// downloaded into public/certs/ so visitors load it from this site.
//
// It never fails the build: if the slug is empty, the profile is private, or
// Trailhead is unreachable or changes shape, the saved content/certs.json and
// logos from the last good run are left as they are.
//
// The endpoint is the one Trailhead's own profile pages use. It is not an
// official, documented API, so treat any change in it as expected.

import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outJson = path.join(root, "content", "certs.json");
const logoDir = path.join(root, "public", "certs");
const ENDPOINT = "https://profile.api.trailhead.com/graphql";

const QUERY = `query GetUserCertifications($slug: String, $hasSlug: Boolean!) {
  profile(slug: $slug) @include(if: $hasSlug) {
    __typename
    ... on PublicProfile {
      credential {
        certifications {
          title
          product
          dateCompleted
          logoUrl
          downloadLogoUrl
          infoUrl
          status { expired }
        }
      }
    }
  }
}`;

const log = (msg) => console.log(`[certs] ${msg}`);

function fileSlug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/svg+xml": "svg", "image/webp": "webp" };

async function download(url, base) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXT[type] ?? path.extname(new URL(url).pathname).slice(1) ?? "png";
  const name = `${base}.${ext || "png"}`;
  await fs.writeFile(path.join(logoDir, name), Buffer.from(await res.arrayBuffer()));
  return `/certs/${name}`;
}

async function main() {
  const { slug } = JSON.parse(await fs.readFile(path.join(root, "content", "trailhead.json"), "utf8"));
  if (!slug) return log("no Trailhead slug set in content/trailhead.json; keeping the saved list");

  const saved = JSON.parse(await fs.readFile(outJson, "utf8"));
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { slug, hasSlug: true } }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return log(`Trailhead returned HTTP ${res.status}; keeping the saved list`);
  const body = await res.json();
  const profile = body?.data?.profile;
  if (!profile) return log(`no profile for "${slug}" (${JSON.stringify(body?.errors ?? "")}); keeping the saved list`);
  if (profile.__typename !== "PublicProfile") return log(`profile "${slug}" is private; keeping the saved list`);
  const list = profile.credential?.certifications;
  if (!Array.isArray(list) || list.length === 0) return log("no certifications returned; keeping the saved list");

  await fs.mkdir(logoDir, { recursive: true });
  const certifications = [];
  for (const c of list) {
    const base = fileSlug(c.title);
    const previous = saved.certifications.find((s) => s.title === c.title)?.logo ?? null;
    let logo = previous;
    const src = c.downloadLogoUrl || c.logoUrl;
    if (src) {
      try {
        logo = await download(src, base);
      } catch (e) {
        log(`logo for "${c.title}" failed (${e.message}); ${previous ? "keeping the saved one" : "using a placeholder"}`);
      }
    }
    certifications.push({
      title: c.title,
      product: c.product ?? null,
      dateCompleted: c.dateCompleted ?? null,
      expired: Boolean(c.status?.expired),
      logo,
      infoUrl: c.infoUrl ?? null,
    });
  }
  certifications.sort((a, b) => (b.dateCompleted ?? "").localeCompare(a.dateCompleted ?? ""));

  const out = {
    source: "trailhead",
    fetchedAt: new Date().toISOString(),
    profileUrl: `https://trailhead.salesforce.com/profile/${slug}`,
    certifications,
  };
  await fs.writeFile(outJson, JSON.stringify(out, null, 2) + "\n");
  log(`saved ${certifications.length} certifications from Trailhead`);
}

main().catch((e) => log(`fetch failed (${e.message}); keeping the saved list`));
