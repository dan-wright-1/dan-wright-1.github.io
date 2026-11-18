// Runs before every build (npm "prebuild"), and by hand with `npm run certs`.
// Reads the certifications on a public Trailhead profile and saves them to
// content/certs.json, with each badge logo downloaded into public/certs/ so
// visitors load it from this site.
//
// It never fails the build. If the slug is empty, the profile is private,
// Trailhead is unreachable or changes shape, or the new data fails the sanity
// checks below, the saved content/certs.json and logos are left untouched and a
// warning is raised (a yellow annotation on GitHub Actions).
//
// The endpoint is the one Trailhead's own profile pages use. It is not an
// official, documented API, so treat any change in it as expected.

import fs from "node:fs/promises";
import path from "node:path";
import { logger, savedOn } from "./warn.mjs";

const root = path.resolve(import.meta.dirname, "..");
const outJson = path.join(root, "content", "certs.json");
const logoDir = path.join(root, "public", "certs");
const ENDPOINT = "https://profile.api.trailhead.com/graphql";
const { info, warn } = logger("certs");

/** Accept a drop of at most this many active certifications in one fetch (one can expire). */
const MAX_DROP = 1;
/** Smallest believable badge image, in bytes. */
const MIN_LOGO_BYTES = 1024;

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

const fileSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/svg+xml": "svg", "image/webp": "webp" };

/** Downloads a logo into memory and checks it is a real image. Nothing is written yet. */
async function downloadLogo(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXT[type];
  // downloadLogoUrl serves a zip of logo variants, so accept real images only.
  if (!ext) throw new Error(`not an image (${type || "no content type"})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length < MIN_LOGO_BYTES) throw new Error(`image is only ${bytes.length} bytes`);
  return { ext, bytes };
}

/** Trailhead sends dates like "2026-2-1"; pad them so they sort and parse reliably. */
function isoDate(d) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(d ?? "");
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null;
}

async function main() {
  const { slug } = JSON.parse(await fs.readFile(path.join(root, "content", "trailhead.json"), "utf8"));
  if (!slug) return info("no Trailhead slug set in content/trailhead.json; keeping the saved list");

  const saved = JSON.parse(await fs.readFile(outJson, "utf8"));
  const keep = `keeping the saved list (last changed ${savedOn(saved.fetchedAt)})`;

  let body;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { slug, hasSlug: true } }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return warn(`Trailhead returned HTTP ${res.status}; ${keep}`);
    body = await res.json();
  } catch (e) {
    return warn(`could not reach Trailhead (${e.message}); ${keep}`);
  }

  const profile = body?.data?.profile;
  if (!profile) return warn(`no Trailhead profile "${slug}" (${body?.errors?.[0]?.message ?? "empty response"}); ${keep}`);
  if (profile.__typename !== "PublicProfile") return warn(`Trailhead profile "${slug}" is private; ${keep}`);
  const list = profile.credential?.certifications;
  if (!Array.isArray(list)) return warn(`Trailhead's response has changed shape (no certification list); ${keep}`);

  // ---- sanity checks on the list itself ----
  const valid = list.filter((c) => typeof c?.title === "string" && c.title.trim());
  if (valid.length !== list.length) return warn(`${list.length - valid.length} certification(s) came back without a title; ${keep}`);
  const activeBefore = saved.certifications.filter((c) => !c.expired).length;
  const activeNow = valid.filter((c) => !c.status?.expired).length;
  if (activeNow === 0) return warn(`Trailhead returned no active certifications (saved list has ${activeBefore}); ${keep}`);
  if (activeBefore - activeNow > MAX_DROP) {
    return warn(`active certifications dropped from ${activeBefore} to ${activeNow} in one fetch, which looks wrong; ${keep}. If it's real, run "npm run certs" after raising MAX_DROP in scripts/fetch-certs.mjs.`);
  }
  if (activeNow < activeBefore) {
    const now = new Set(valid.filter((c) => !c.status?.expired).map((c) => c.title));
    const gone = saved.certifications.filter((c) => !c.expired && !now.has(c.title)).map((c) => c.title);
    warn(`no longer active on Trailhead: ${gone.join(", ") || "(renamed)"}. Accepting the change.`);
  }

  // ---- logos: download everything into memory first ----
  const logos = new Map(); // title -> { name, bytes }
  const certifications = [];
  for (const c of valid) {
    const previous = saved.certifications.find((s) => s.title === c.title)?.logo ?? null;
    let logo = previous;
    let error = "no logo URL";
    for (const src of [c.logoUrl, c.downloadLogoUrl].filter(Boolean)) {
      try {
        const { ext, bytes } = await downloadLogo(src);
        const name = `${fileSlug(c.title)}.${ext}`;
        logos.set(c.title, { name, bytes });
        logo = `/certs/${name}`;
        error = null;
        break;
      } catch (e) {
        error = e.message;
      }
    }
    if (error) warn(`badge for "${c.title}" failed (${error}); ${previous ? "keeping the saved image" : "showing a lettered placeholder"}`);
    certifications.push({
      title: c.title,
      product: c.product ?? null,
      dateCompleted: isoDate(c.dateCompleted),
      expired: Boolean(c.status?.expired),
      logo,
      infoUrl: c.infoUrl ?? null,
    });
  }
  certifications.sort((a, b) => (b.dateCompleted ?? "").localeCompare(a.dateCompleted ?? ""));

  // ---- everything passed: write logos, then the list ----
  await fs.mkdir(logoDir, { recursive: true });
  for (const { name, bytes } of logos.values()) {
    const file = path.join(logoDir, name);
    const old = await fs.readFile(file).catch(() => null);
    if (!old || !old.equals(bytes)) await fs.writeFile(file, bytes);
  }

  const profileUrl = `https://trailhead.salesforce.com/profile/${slug}`;
  if (saved.source === "trailhead" && saved.profileUrl === profileUrl && JSON.stringify(saved.certifications) === JSON.stringify(certifications)) {
    return info(`${certifications.length} certifications, unchanged since ${savedOn(saved.fetchedAt)}`);
  }
  const out = { source: "trailhead", fetchedAt: new Date().toISOString(), profileUrl, certifications };
  await fs.writeFile(outJson, JSON.stringify(out, null, 2) + "\n");
  info(`saved ${certifications.length} certifications from Trailhead`);
}

main().catch((e) => warn(`unexpected error (${e.message}); keeping the saved list`));
