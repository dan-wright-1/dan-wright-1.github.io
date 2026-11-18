import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const GITHUB_USER = "dan-wright-1";

const API = "https://api.github.com";
const RAW = "https://raw.githubusercontent.com";

export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  pushed_at: string;
  default_branch: string;
  fork: boolean;
};

// ---- fallback: content/github-snapshot.json (written by `npm run snapshot`) ----
//
// Every GitHub read below tries the live API first. If that fails (outage, rate
// limit, network), it falls back to the saved snapshot and raises a warning, so
// the build still deploys. Only if the snapshot doesn't have the item either does
// the build fail, which leaves the previous live site in place.

type Snapshot = { savedAt: string; repos: Repo[]; trees: Record<string, string[]>; files: Record<string, string | null> };
let snapshot: Snapshot | null | undefined;

function loadSnapshot(): Snapshot | null {
  if (snapshot === undefined) {
    try {
      snapshot = JSON.parse(readFileSync(path.join(process.cwd(), "content", "github-snapshot.json"), "utf8")) as Snapshot;
    } catch {
      snapshot = null;
    }
  }
  return snapshot;
}

const warned = new Set<string>();
function warn(msg: string) {
  if (warned.has(msg)) return;
  warned.add(msg);
  // Next builds pages in several worker processes that share a parent; a marker file
  // created exclusively ("wx") lets only the first worker print a given warning.
  const key = msg.replace(/[^a-z0-9]+/gi, "-").slice(0, 80);
  try {
    writeFileSync(path.join(tmpdir(), `portfolio-warned-${process.ppid}-${key}`), "", { flag: "wx" });
  } catch {
    return;
  }
  console.log(`[github] WARNING: ${msg}`);
  if (process.env.GITHUB_ACTIONS === "true") console.log(`::warning title=github::${msg.replace(/%/g, "%25").replace(/\n/g, "%0A")}`);
}

function savedOn(s: Snapshot) {
  return new Date(s.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Runs the live request; on failure returns the snapshot value, or rethrows if there isn't one. */
async function withFallback<T>(what: string, live: () => Promise<T>, saved: (s: Snapshot) => T | undefined): Promise<T> {
  try {
    return await live();
  } catch (e) {
    const s = loadSnapshot();
    const value = s ? saved(s) : undefined;
    if (value === undefined) throw e;
    // One warning per kind of failure (e.g. "GitHub 401"), not one per file: GitHub shows only 10.
    console.log(`[github] fallback for ${what}: ${(e as Error).message}`);
    const reason = (e as Error).message.split(" for ")[0];
    warn(`GitHub requests are failing (${reason}); pages built from the saved snapshot from ${savedOn(s!)} wherever a request failed`);
    return value;
  }
}

// ---- live API ----

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function gh<T>(p: string): Promise<T> {
  const res = await fetch(`${API}${p}`, { headers: headers() });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${p}`);
  return res.json() as Promise<T>;
}

export async function getRepos(): Promise<Repo[]> {
  return withFallback(
    "the repo list",
    async () => {
      const repos = await gh<Repo[]>(`/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
      // Skip forks and the profile repo (<user>/<user>)
      return repos.filter((r) => !r.fork && r.name !== GITHUB_USER);
    },
    (s) => s.repos,
  );
}

export async function getRepo(name: string): Promise<Repo> {
  return withFallback(name, () => gh<Repo>(`/repos/${GITHUB_USER}/${name}`), (s) => s.repos.find((r) => r.name === name));
}

/** Fetch a file as text from the default branch; null if it does not exist. */
export async function getFile(repo: string, branch: string, filePath: string): Promise<string | null> {
  return withFallback(
    `${repo}/${filePath}`,
    async () => {
      const res = await fetch(`${RAW}/${GITHUB_USER}/${repo}/${branch}/${filePath}`);
      if (res.status === 404) return null; // genuinely missing, not a failure
      if (!res.ok) throw new Error(`GitHub raw ${res.status} for ${repo}/${filePath}`);
      return res.text();
    },
    // A repo the snapshot knows but a path it doesn't means the file didn't exist then.
    (s) => (`${repo}/${filePath}` in s.files ? s.files[`${repo}/${filePath}`] : repo in s.trees ? null : undefined),
  );
}

export async function getReadme(repo: Repo): Promise<string | null> {
  for (const f of ["README.md", "readme.md", "Readme.md"]) {
    const text = await getFile(repo.name, repo.default_branch, f);
    if (text !== null) return text;
  }
  return null;
}

/** Paths of all markdown files in the repo (README excluded). */
export async function getMarkdownPaths(repo: Repo): Promise<string[]> {
  return withFallback(
    `${repo.name}'s file list`,
    async () => {
      const tree = await gh<{ tree: { path: string; type: string }[] }>(
        `/repos/${GITHUB_USER}/${repo.name}/git/trees/${repo.default_branch}?recursive=1`,
      );
      return tree.tree
        .filter((n) => n.type === "blob" && /\.md$/i.test(n.path) && !/^readme\.md$/i.test(n.path))
        .map((n) => n.path);
    },
    (s) => s.trees[repo.name],
  );
}

export function rawUrl(repo: Repo, filePath: string) {
  return `${RAW}/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${filePath}`;
}
