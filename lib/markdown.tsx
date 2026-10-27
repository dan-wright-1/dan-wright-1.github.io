import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Repo, rawUrl } from "./github";

/** Resolve a relative link/image found in a repo file at `dir` into a site or raw URL. */
function resolve(href: string, dir: string): string {
  const parts = (dir ? dir.split("/") : []).concat(href.split("/"));
  const out: string[] = [];
  for (const p of parts) {
    if (p === "..") out.pop();
    else if (p !== "." && p !== "") out.push(p);
  }
  return out.join("/");
}

const isExternal = (s: string) => /^([a-z]+:|#|\/\/)/i.test(s);

export function Markdown({ source, repo, dir = "" }: { source: string; repo: Repo; dir?: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a({ href = "", children }) {
          if (isExternal(href)) return <a href={href}>{children}</a>;
          const [file, hash] = href.split("#");
          const path = resolve(file, dir);
          if (/\.md$/i.test(path)) {
            const isReadme = /^readme\.md$/i.test(path);
            const target = isReadme ? `/repos/${repo.name}/` : `/repos/${repo.name}/${path}/`;
            return <a href={target + (hash ? `#${hash}` : "")}>{children}</a>;
          }
          return <a href={`${repo.html_url}/blob/${repo.default_branch}/${path}`}>{children}</a>;
        },
        img({ src: rawSrc = "", alt }) {
          const src = typeof rawSrc === "string" ? rawSrc : "";
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={isExternal(src) ? src : rawUrl(repo, resolve(src, dir))} alt={alt ?? ""} style={{ maxWidth: "100%" }} />;
        },
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
