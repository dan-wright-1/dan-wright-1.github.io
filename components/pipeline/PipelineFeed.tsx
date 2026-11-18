'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useSim } from './PipelineSim';
import { SPEED } from './usePipelineSim';

/** How many rows the feed shows; the oldest drops off the bottom as a new one arrives. */
const ROWS = 4;

/**
 * A running log of what the simulated pipeline just did, newest first. Each new
 * event drops in at the top and the rows below slide down to make room.
 */
export default function PipelineFeed() {
  const sim = useSim();
  const reduced = useReducedMotion();
  const rows = sim.events.slice(0, ROWS);
  const slide = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 160, damping: 24 };

  return (
    <div className="pf">
      <p className="pf-label">
        <span className="pf-dot" aria-hidden="true" /> What the pipeline is doing, simulated at {SPEED}× speed
      </p>
      {rows.length === 0 ? (
        <p className="pf-empty">Waiting for the first batch…</p>
      ) : (
        <ul className="pf-list" aria-live="off">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((e) => (
              <motion.li
                key={e.id}
                layout="position"
                className="pf-row"
                initial={reduced ? false : { opacity: 0, y: -28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.2 } }}
                transition={{ layout: slide, y: slide, opacity: { duration: reduced ? 0 : 0.25 } }}
              >
                <div>
                  <p className="pf-title">{e.title}</p>
                  <p className="pf-detail">{e.detail}</p>
                </div>
                <span className="pf-meta">{e.at}s</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
