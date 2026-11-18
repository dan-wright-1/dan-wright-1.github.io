'use client';

import { useEffect, useRef, useState } from 'react';

// A simulation of the AdventureWorks pipeline's real cadence, sped up.
// In the real system the generator writes 50 orders every 10 s, the processor
// polls every 10 s, and Snowflake tasks load the stages every minute.

export const SPEED = 4;
const TICK_MS = 10_000 / SPEED; // one processor cycle
const LOAD_EVERY = 6; // Snowflake tasks run every 6th processor cycle (1 minute)

export type Stage = 'generate' | 'extract' | 'load' | 'transform' | 'report';
export const STAGES: Stage[] = ['generate', 'extract', 'load', 'transform', 'report'];

export type SimEvent = { id: number; stage: Stage; title: string; detail: string; at: number };

export type SimState = {
  ordersGenerated: number;
  chatsGenerated: number;
  filesInStages: number;
  rowsInStages: number;
  rowsLoaded: number;
  unifiedOrders: number;
  stage: Stage;
  /** Increments every time a stage fires, so views can react even when the stage repeats. */
  pulse: number;
  events: SimEvent[];
  elapsed: number; // simulated seconds
};

const MAX_EVENTS = 40;

// The page starts one cycle in, so a first-time visitor already sees activity:
// the generator's first write and the processor's first upload. Fixed numbers
// (not random) so the server-rendered HTML matches what the browser hydrates.
const SEED_ORDERS = 50;
const SEED_CHATS = 3;
const SEED_LINES = 120;
const SEED_ROWS = SEED_ORDERS + SEED_LINES + SEED_CHATS;

const initial: SimState = {
  ordersGenerated: SEED_ORDERS,
  chatsGenerated: SEED_CHATS,
  filesInStages: 3,
  rowsInStages: SEED_ROWS,
  rowsLoaded: 0,
  unifiedOrders: 0,
  stage: 'extract',
  pulse: 2,
  events: [
    { id: 2, stage: 'extract', title: `3 batches uploaded (${SEED_ROWS} rows)`, detail: 'processor → @orders, @order_details, @chat stages', at: 10 },
    { id: 1, stage: 'generate', title: `${SEED_ORDERS} orders, ${SEED_CHATS} chats written`, detail: 'generator → PostgreSQL + MongoDB', at: 10 },
  ],
  elapsed: 10,
};

/** Runs only while `active` (e.g. on screen and the tab is visible). */
export function usePipelineSim(active: boolean): SimState {
  const [state, setState] = useState(initial);
  // Continue from the seeded first cycle.
  const tick = useRef(1);
  const nextId = useRef(3);
  const pendingOrders = useRef(SEED_ORDERS);
  const lastCycle = useRef(-Infinity);

  useEffect(() => {
    if (!active) return;
    const later = (ms: number, fn: () => void) => window.setTimeout(fn, ms);

    const fire = (stage: Stage, title: string, detail: string, change: (s: SimState) => Partial<SimState>) =>
      setState((s) => {
        const event: SimEvent = { id: nextId.current++, stage, title, detail, at: s.elapsed };
        return { ...s, ...change(s), stage, pulse: s.pulse + 1, events: [event, ...s.events].slice(0, MAX_EVENTS) };
      });

    const cycle = () => {
      lastCycle.current = performance.now();
      tick.current += 1;
      const n = tick.current;
      const orders = 50;
      const lines = 90 + Math.floor(Math.random() * 60);
      const chats = 2 + Math.floor(Math.random() * 5);

      setState((s) => ({ ...s, elapsed: s.elapsed + 10 }));
      fire('generate', `${orders} orders, ${chats} chats written`, 'generator → PostgreSQL + MongoDB', (s) => ({
        ordersGenerated: s.ordersGenerated + orders,
        chatsGenerated: s.chatsGenerated + chats,
      }));

      later(TICK_MS * 0.35, () => {
        pendingOrders.current += orders;
        fire('extract', `3 batches uploaded (${orders + lines + chats} rows)`, 'processor → @orders, @order_details, @chat stages', (s) => ({
          filesInStages: s.filesInStages + 3,
          rowsInStages: s.rowsInStages + orders + lines + chats,
        }));
      });

      if (n % LOAD_EVERY === 0) {
        later(TICK_MS * 0.6, () =>
          fire('load', 'COPY INTO raw tables, stages cleared', 'Snowflake tasks (every minute)', (s) => ({
            rowsLoaded: s.rowsLoaded + s.rowsInStages,
            rowsInStages: 0,
            filesInStages: 0,
          })),
        );
        later(TICK_MS * 0.75, () => {
          const merged = pendingOrders.current;
          pendingOrders.current = 0;
          fire('transform', `${merged} new orders merged`, 'dbt: nest line items, UNION ALL with history', (s) => ({
            unifiedOrders: s.unifiedOrders + merged,
          }));
        });
        later(TICK_MS * 0.9, () => fire('report', '30-day sales by country refreshed', 'dashboard model', () => ({})));
      }
    };

    // Resume on the beat: if a cycle ran recently, wait out the rest of its 10 s
    // instead of starting a second one on top of it.
    const wait = Math.max(0, TICK_MS - (performance.now() - lastCycle.current));
    let interval = 0;
    const start = window.setTimeout(() => {
      cycle();
      interval = window.setInterval(cycle, TICK_MS);
    }, wait);
    return () => {
      // Pausing (scrolled away, tab hidden) stops new cycles only. Steps already
      // scheduled in the current cycle still run, so no cycle is left half done.
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [active]);

  return state;
}

/** True while the element is on screen and the tab is visible. */
export function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return [ref, visible && tabVisible] as const;
}
