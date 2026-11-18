'use client';

// One simulation shared by everything inside the provider (the event feed and the
// animated diagram), so they always show the same moment. It runs only while the
// wrapped area is on screen and the tab is visible.

import { createContext, useContext, type ReactNode } from 'react';
import { usePipelineSim, useOnScreen, type SimState } from './usePipelineSim';

const SimContext = createContext<SimState | null>(null);

export function PipelineSimProvider({ children }: { children: ReactNode }) {
  const [ref, active] = useOnScreen<HTMLDivElement>();
  const sim = usePipelineSim(active);
  return (
    <SimContext.Provider value={sim}>
      <div ref={ref}>{children}</div>
    </SimContext.Provider>
  );
}

export function useSim(): SimState {
  const sim = useContext(SimContext);
  if (!sim) throw new Error('useSim must be used inside <PipelineSimProvider>');
  return sim;
}
