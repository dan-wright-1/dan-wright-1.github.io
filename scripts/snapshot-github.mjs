// `npm run snapshot`: saves everything the build reads from GitHub (the repo list,
// each repo's markdown file list, its README and other markdown files) into
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
const RAW = "https://raw.githubusercontent.com";
const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "content", "github-snapshot.json");

const headers = { Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function gh(p) {
  const res = await fetch(`${API}${p}`, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${p}`);
  return res.json();
}

async function raw(repo, branch, p) {
  const res = await fetch(`${RAW}/${USER}/${repo}/${branch}/${p}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub raw ${res.status} for ${repo}/${p}`);
  return res.text();
}

const KEEP = ["name", "description", "html_url", "homepage", "language", "topics", "stargazers_count", "pushed_at", "default_branch", "fork"];
const pick = (r) => Object.fromEntries(KEEP.map((k) => [k, r[k] ?? null]));

const all = await gh(`/users/${USER}/repos?per_page=100&sort=pushed`);
const repos = all.filter((r) => !r.fork && r.name !== USER).map(pick);
const trees = {};
const files = {};

for (const r of repos) {
  const tree = await gh(`/repos/${USER}/${r.name}/git/trees/${r.default_branch}?recursive=1`);
  const md = tree.tree.filter((n) => n.type === "blob" && /\.md$/i.test(n.path)).map((n) => n.path);
  trees[r.name] = md.filter((p) => !/^readme\.md$/i.test(p));
  for (const p of md) files[`${r.name}/${p}`] = await raw(r.name, r.default_branch, p);
  console.log(`[snapshot] ${r.name}: ${md.length} markdown file(s)`);
}

const snapshot = { savedAt: new Date().toISOString(), repos, trees, files };
await fs.writeFile(out, JSON.stringify(snapshot, null, 1) + "\n");
console.log(`[snapshot] saved ${repos.length} repos, ${Object.keys(files).length} files, ${Math.round(JSON.stringify(snapshot).length / 1024)} KB`);
