/** Endless stack ticker. Pure CSS, paused for reduced-motion users. */
export default function Ticker({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul className="ticker-row" aria-hidden={hidden || undefined}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
  return (
    <div className="ticker" role="presentation">
      <div className="ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
