// Runs before every build (npm "prebuild"), and by hand with `npm run diagrams`.
// For each project in content/diagrams.json, downloads the diagram Lucid publishes
// as a single-page PDF and converts it to an SVG in public/diagrams/<slug>.svg, so
// edits in Lucid reach the site on the next build.
//
// It never fails the build. If Lucid is unreachable, the file isn't a PDF, or the
// result fails the sanity checks below, the saved SVG is left untouched and a
// warning is raised (a yellow annotation on GitHub Actions).

import fs from "node:fs/promises";
import path from "node:path";
import { logger } from "./warn.mjs";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "public", "diagrams");
const { info, warn } = logger("diagrams");

/** A real diagram converts to far more than this; a blank page converts to much less. */
const MIN_SVG_BYTES = 20 * 1024;
/** Reject a new SVG smaller than this share of the saved one (a large diagram suddenly shrinking). */
const MIN_SIZE_RATIO = 0.3;
/** Smallest believable page size in PDF points. */
const MIN_PAGE_POINTS = 300;

function convert(mupdf, pdf) {
  const doc = mupdf.Document.openDocument(pdf, "application/pdf");
  if (doc.countPages() < 1) throw new Error("PDF has no pages");
  const page = doc.loadPage(0);
  const [x0, y0, x1, y1] = page.getBounds();
  if (x1 - x0 < MIN_PAGE_POINTS || y1 - y0 < MIN_PAGE_POINTS / 2) throw new Error(`page is only ${Math.round(x1 - x0)}×${Math.round(y1 - y0)} pt`);
  const buf = new mupdf.Buffer();
  // text=path draws every glyph as a shape, so the SVG doesn't depend on Lucid's fonts.
  const writer = new mupdf.DocumentWriter(buf, "svg", "text=path");
  const device = writer.beginPage(page.getBounds());
  page.run(device, mupdf.Matrix.identity);
  writer.endPage();
  writer.close();
  return Buffer.from(buf.asUint8Array());
}

async function main() {
  const diagrams = JSON.parse(await fs.readFile(path.join(root, "content", "diagrams.json"), "utf8"));
  const entries = Object.entries(diagrams);
  if (entries.length === 0) return;
  const mupdf = await import("mupdf");
  await fs.mkdir(outDir, { recursive: true });

  for (const [slug, d] of entries) {
    const file = path.join(outDir, `${slug}.svg`);
    const saved = await fs.readFile(file).catch(() => null);
    const keep = saved ? "keeping the saved diagram" : "no saved diagram exists, so the page shows none";
    try {
      const res = await fetch(d.publishedPdf, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`Lucid returned HTTP ${res.status} (was the diagram unpublished?)`);
      const pdf = Buffer.from(await res.arrayBuffer());
      if (pdf.subarray(0, 5).toString() !== "%PDF-") throw new Error("Lucid's response is not a PDF");
      const svg = convert(mupdf, pdf);
      if (svg.length < MIN_SVG_BYTES) throw new Error(`converted diagram is only ${Math.round(svg.length / 1024)} KB, which looks blank`);
      if (saved && svg.length < saved.length * MIN_SIZE_RATIO) {
        throw new Error(`converted diagram shrank from ${Math.round(saved.length / 1024)} KB to ${Math.round(svg.length / 1024)} KB. If that's intended, delete public/diagrams/${slug}.svg and run "npm run diagrams"`);
      }
      if (saved && saved.equals(svg)) {
        info(`${slug}: unchanged`);
      } else {
        await fs.writeFile(file, svg);
        info(`${slug}: saved ${Math.round(svg.length / 1024)} KB SVG from Lucid`);
      }
    } catch (e) {
      warn(`${slug}: ${e.message}; ${keep}`);
    }
  }
}

main().catch((e) => warn(`unexpected error (${e.message}); keeping the saved diagrams`));
