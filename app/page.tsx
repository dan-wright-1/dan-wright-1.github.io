import Link from "next/link";
import { getRepos, GITHUB_USER } from "@/lib/github";

export default async function Home() {
  const repos = await getRepos();
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1>{GITHUB_USER} — portfolio (validation build)</h1>
      <h2>Projects</h2>
      <ul>
        {repos.map((r) => (
          <li key={r.name} style={{ marginBottom: "1rem" }}>
            <Link href={`/repos/${r.name}/`}>{r.name}</Link>
            {r.language && <> · {r.language}</>}
            {r.topics.length > 0 && <> · {r.topics.join(", ")}</>}
            <br />
            {r.description ?? <em>no description</em>}
          </li>
        ))}
      </ul>
    </main>
  );
}
