// `npm run snapshot`: saves the repo list the build reads from GitHub into
// content/github-snapshot.json. lib/github.ts falls back to this copy when a
// GitHub request fails during a build, so an outage or rate limit doesn't stop
// the deploy. Re-run and commit it now and then to keep the fallback recent.
//
// Set GITHUB_TOKEN (e.g. GITHUB_TOKEN=$(gh auth token)) to avoid GitHub's
// anonymous rate limit.

import fs from "node:fs/promises";
import path from "node:path";

const USER = "dan-wright-1";
const API = "https://api.github.com";
const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "content", "github-snapshot.json");

const headers = { Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function gh(p) {
  const res = await fetch(`${API}${p}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${p}`);
  return res.json();
}

const KEEP = ["name", "description", "html_url", "homepage", "language", "topics", "stargazers_count", "pushed_at", "default_branch", "fork"];
const pick = (r) => Object.fromEntries(KEEP.map((k) => [k, r[k] ?? null]));

const all = await gh(`/users/${USER}/repos?per_page=100&sort=pushed`);
const repos = all.filter((r) => !r.fork && r.name !== USER).map(pick);
const snapshot = { savedAt: new Date().toISOString(), repos };
await fs.writeFile(out, JSON.stringify(snapshot, null, 1) + "\n");
console.log(`[snapshot] saved ${repos.length} repos, ${Math.round(JSON.stringify(snapshot).length / 1024)} KB`);
