// Shared logging for the prebuild fetch scripts.
//
// On GitHub Actions, warn() also prints a workflow command so the run shows a
// yellow warning annotation naming the problem, instead of hiding it in the log.

const inActions = process.env.GITHUB_ACTIONS === "true";

/** One-line escape for workflow command values. */
const esc = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

export function logger(source) {
  return {
    info: (msg) => console.log(`[${source}] ${msg}`),
    warn: (msg) => {
      console.log(`[${source}] WARNING: ${msg}`);
      if (inActions) console.log(`::warning title=${esc(source)}::${esc(msg)}`);
    },
  };
}

/** "Nov 17, 2026" from an ISO timestamp, or "an unknown date". */
export function savedOn(iso) {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : "an unknown date";
}
