// Runs before every build (npm "prebuild"). For each project in content/diagrams.json,
// downloads the diagram Lucid publishes as a single-page PDF and converts it to an SVG
// in public/diagrams/<slug>.svg, so edits in Lucid reach the site on the next build.
//
// It never fails the build: if Lucid is unreachable or the file isn't a PDF, the SVG
// committed from the last good run is left in place.

import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "diagrams");
const log = (msg) => console.log(`[diagrams] ${msg}`);

async function convert(mupdf, pdf) {
  const doc = mupdf.Document.openDocument(pdf, "application/pdf");
  const page = doc.loadPage(0);
  const buf = new mupdf.Buffer();
  // text=path draws every glyph as a shape, so the SVG doesn't depend on Lucid's fonts.
  const writer = new mupdf.DocumentWriter(buf, "svg", "text=path");
  const device = writer.beginPage(page.getBounds());
  page.run(device, mupdf.Matrix.identity);
  writer.endPage();
  writer.close();
  return buf.asUint8Array();
}

async function main() {
  const diagrams = JSON.parse(await fs.readFile(path.join(root, "content", "diagrams.json"), "utf8"));
  const entries = Object.entries(diagrams);
  if (entries.length === 0) return;
  const mupdf = await import("mupdf");
  await fs.mkdir(outDir, { recursive: true });

  for (const [slug, d] of entries) {
    try {
      const res = await fetch(d.publishedPdf, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const pdf = Buffer.from(await res.arrayBuffer());
      if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new Error("response is not a PDF");
      const svg = await convert(mupdf, pdf);
      await fs.writeFile(path.join(outDir, `${slug}.svg`), svg);
      log(`${slug}: saved ${Math.round(svg.length / 1024)} KB SVG from Lucid`);
    } catch (e) {
      log(`${slug}: ${e.message}; keeping the saved SVG`);
    }
  }
}

main().catch((e) => log(`failed (${e.message}); keeping the saved SVGs`));
