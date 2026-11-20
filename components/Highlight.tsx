import { Fragment } from "react";

/**
 * Renders text with **double-asterisk** phrases highlighted, so content files can
 * mark the key words of a subtitle without any HTML.
 */
export default function Highlight({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="hl">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
