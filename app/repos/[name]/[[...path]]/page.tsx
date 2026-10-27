import Link from "next/link";
import { notFound } from "next/navigation";
import { getFile, getMarkdownPaths, getReadme, getRepo, getRepos } from "@/lib/github";
import { Markdown } from "@/lib/markdown";

export async function generateStaticParams() {
  const repos = await getRepos();
  const params: { name: string; path?: string[] }[] = [];
  for (const repo of repos) {
    params.push({ name: repo.name, path: [] });
    for (const p of await getMarkdownPaths(repo)) params.push({ name: repo.name, path: p.split("/") });
  }
  return params;
}

export default async function RepoPage({ params }: { params: Promise<{ name: string; path?: string[] }> }) {
  const { name, path } = await params;
  const repo = await getRepo(name);
  const filePath = path?.join("/");
  const source = filePath ? await getFile(name, repo.default_branch, filePath) : await getReadme(repo);
  if (source === null && filePath) notFound();
  const pages = filePath ? [] : await getMarkdownPaths(repo);
  const dir = filePath?.split("/").slice(0, -1).join("/") ?? "";

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <nav>
        <Link href="/">← All projects</Link>
        {filePath && <> · <Link href={`/repos/${name}/`}>{name}</Link></>}
        {" · "}
        <a href={repo.html_url}>View on GitHub</a>
      </nav>
      <h1>{name}</h1>
      {source ? <Markdown source={source} repo={repo} dir={dir} /> : <p><em>No README found.</em></p>}
      {pages.length > 0 && (
        <>
          <h2>More pages in this repo</h2>
          <ul>
            {pages.map((p) => (
              <li key={p}><Link href={`/repos/${name}/${p}/`}>{p}</Link></li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
