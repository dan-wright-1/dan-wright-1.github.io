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

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

export async function getRepos(): Promise<Repo[]> {
  const repos = await gh<Repo[]>(`/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
  // Skip forks and the profile repo (<user>/<user>)
  return repos.filter((r) => !r.fork && r.name !== GITHUB_USER);
}

export async function getRepo(name: string): Promise<Repo> {
  return gh<Repo>(`/repos/${GITHUB_USER}/${name}`);
}

/** Fetch a file as text from the default branch; null if it does not exist. */
export async function getFile(repo: string, branch: string, path: string): Promise<string | null> {
  const res = await fetch(`${RAW}/${GITHUB_USER}/${repo}/${branch}/${path}`);
  return res.ok ? res.text() : null;
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
  const tree = await gh<{ tree: { path: string; type: string }[] }>(
    `/repos/${GITHUB_USER}/${repo.name}/git/trees/${repo.default_branch}?recursive=1`,
  );
  return tree.tree
    .filter((n) => n.type === "blob" && /\.md$/i.test(n.path) && !/^readme\.md$/i.test(n.path))
    .map((n) => n.path);
}

export function rawUrl(repo: Repo, path: string) {
  return `${RAW}/${GITHUB_USER}/${repo.name}/${repo.default_branch}/${path}`;
}
