'use client';

// The AdventureWorks architecture diagram (same layout as
// public/images/adventureworks-pipeline.svg). Every arrow carries a continuous
// stream: dark dots for single rows, orange blocks for batches. The counts under
// the columns and the status line come from the shared simulation. With reduced
// motion the streams stand still.

import type { ReactNode } from 'react';
import { useSim } from './PipelineSim';
import { SPEED } from './usePipelineSim';

const INK = '#15120f';

/** Arrows that carry individual rows; every other arrow carries batches (files or tables). */
const ROW_ARROWS = new Set(['gen-pg', 'gen-mongo', 'pg-proc', 'mongo-proc']);

export default function AdventureWorksDiagram() {
  const sim = useSim();

  return (
    <>
      <svg className="awd" viewBox="0 0 1240 560" role="img" aria-labelledby="awd-t awd-d">
        <title id="awd-t">AdventureWorks real-time sales pipeline, animated</title>
        <desc id="awd-d">
          A data generator writes orders to PostgreSQL and chat logs to MongoDB. A Python processor polls both every 10
          seconds and uploads CSV or JSON batches to three Snowflake stages. Snowflake tasks copy the stages into raw
          tables every minute and clear them. dbt rebuilds new orders into the nested historical shape, unions them with
          historical orders, cleans chat logs, and feeds a 30-day sales by country dashboard model. Rows and batches
          stream continuously along the arrows.
        </desc>
        <defs>
          <marker id="aw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={INK} />
          </marker>
        </defs>

        <rect width="1240" height="560" fill="#ece7da" />

        {/* step pills */}
        <Pill x={150} w={140} n={1} label="EXTRACT" />
        <Pill x={472} w={126} n={2} label="STAGE" />
        <Pill x={652} w={118} n={3} label="LOAD" />
        <Pill x={852} w={160} n={4} label="TRANSFORM" />
        <Pill x={1050} w={134} n={5} label="REPORT" />

        {/* ===== Docker Compose ===== */}
        <rect className="aw-zone" x="20" y="60" width="400" height="480" rx="4" />
        <text className="aw-zlabel" x="36" y="84">DOCKER COMPOSE · LOCAL</text>

        <g>
          <rect className="aw-box" x="130" y="100" width="180" height="64" rx="3" />
          <text className="aw-title" x="146" y="126">Data generator</text>
          <text className="aw-sub" x="146" y="148">50 orders every 10 s</text>
        </g>

        <g>
          <path className="aw-box" d="M40 222 a85 10 0 0 1 170 0 v92 a85 10 0 0 1 -170 0 z" />
          <path d="M40 222 a85 10 0 0 0 170 0" fill="none" stroke={INK} strokeWidth="2" />
          <text className="aw-title" x="56" y="256">PostgreSQL</text>
          <text className="aw-sub" x="56" y="276">orders, order_details</text>
          <text className="aw-small" x="56" y="298">+ processor_metadata</text>
          <text className="aw-small" x="56" y="312">(the watermarks)</text>
        </g>

        <g>
          <path className="aw-box" d="M230 222 a85 10 0 0 1 170 0 v92 a85 10 0 0 1 -170 0 z" />
          <path d="M230 222 a85 10 0 0 0 170 0" fill="none" stroke={INK} strokeWidth="2" />
          <text className="aw-title" x="246" y="256">MongoDB</text>
          <text className="aw-sub" x="246" y="276">support chat logs</text>
          <text className="aw-small" x="246" y="298">JSON documents</text>
        </g>

        <Flow id="gen-pg" d="M180 164 L140 210" />
        <Flow id="gen-mongo" d="M260 164 L300 210" />

        <g>
          <rect className="aw-box" x="40" y="372" width="360" height="148" rx="3" />
          <text className="aw-title" x="56" y="400">Python processor</text>
          <text className="aw-sub" x="56" y="424">Every 10 seconds, for each of the 3 sources:</text>
          <text className="aw-sub" x="56" y="446">1. read rows newer than its watermark</text>
          <text className="aw-sub" x="56" y="466">2. write them as one CSV or JSON batch</text>
          <text className="aw-sub" x="56" y="486">3. PUT the file to a Snowflake stage</text>
          <text className="aw-sub" x="56" y="506">4. move the watermark forward</text>
        </g>

        <Flow id="pg-proc" d="M125 326 L125 368" />
        <Flow id="mongo-proc" d="M315 326 L315 368" />
        <Flow d="M95 368 L95 330" dashed />

        {/* ===== Snowflake ===== */}
        <rect className="aw-zone" x="440" y="60" width="780" height="480" rx="4" />
        <text className="aw-zlabel" x="456" y="84">SNOWFLAKE · KOALA_DB</text>

        <Table id="s1" x={460} y={104} name="@orders_stage" sub="CSV batches" />
        <Table id="s2" x={460} y={194} name="@order_details_stage" sub="CSV batches" />
        <Table id="s3" x={460} y={284} name="@chat_stage" sub="JSON lines" />

        <Flow id="proc-s1" d="M400 420 C 430 420, 425 136, 456 136" />
        <Flow id="proc-s2" d="M400 438 C 434 438, 428 226, 456 226" />
        <Flow id="proc-s3" d="M400 456 C 438 456, 432 316, 456 316" />

        <Table id="r1" x={650} y={104} name="orders_raw" sub="RAW_EXT table" />
        <Table id="r2" x={650} y={194} name="order_details_raw" sub="RAW_EXT table" />
        <Table id="r3" x={650} y={284} name="chat_logs_raw" sub="one VARIANT column" />

        <Flow id="s1-r1" d="M610 136 L646 136" />
        <Flow id="s2-r2" d="M610 226 L646 226" />
        <Flow id="s3-r3" d="M610 316 L646 316" />

        {/* live counts under the stage and raw columns */}
        <text className="aw-live" x="535" y="370" textAnchor="middle">
          {sim.filesInStages} {sim.filesInStages === 1 ? 'file' : 'files'} waiting
        </text>
        <text className="aw-live" x="725" y="370" textAnchor="middle">
          {sim.rowsLoaded.toLocaleString()} rows loaded
        </text>

        <g>
          <rect className="aw-note" x="460" y="384" width="340" height="98" rx="3" />
          <text className="aw-title" x="476" y="410">Snowflake tasks, every minute</text>
          <text className="aw-sub" x="476" y="432">COPY INTO each raw table, then a child task</text>
          <text className="aw-sub" x="476" y="452">(chained with AFTER) REMOVEs the stage files,</text>
          <text className="aw-small" x="476" y="472">so no file is loaded twice</text>
        </g>

        {/* dbt */}
        <rect className="aw-zone" x="820" y="96" width="384" height="430" rx="4" style={{ strokeDasharray: '2 4' }} />
        <text className="aw-zlabel" x="836" y="118">DBT MODELS</text>

        <g>
          <rect className="aw-hot" x="836" y="132" width="184" height="104" rx="3" />
          <text className="aw-title" x="850" y="158">Rebuild orders</text>
          <text className="aw-sub" x="850" y="180">nest each order&apos;s line items,</text>
          <text className="aw-sub" x="850" y="198">matching the old format</text>
          <text className="aw-small" x="850" y="222">ARRAY_AGG(OBJECT_CONSTRUCT)</text>
        </g>

        <Flow id="r1-rebuild" d="M800 136 C 818 136, 812 168, 832 168" />
        <Flow id="r2-rebuild" d="M800 226 C 818 226, 812 200, 832 200" />

        <g>
          <rect className="aw-box" x="836" y="284" width="184" height="64" rx="3" />
          <text className="aw-title" x="850" y="310">Clean chat logs</text>
          <text className="aw-sub" x="850" y="332">parse JSON, tidy text fields</text>
        </g>
        <Flow id="r3-clean" d="M800 316 L832 316" />

        <g>
          <rect className="aw-box" x="836" y="412" width="184" height="96" rx="3" style={{ strokeDasharray: '5 3' }} />
          <text className="aw-title" x="850" y="438">Historical orders</text>
          <text className="aw-sub" x="850" y="460">old e-commerce export,</text>
          <text className="aw-sub" x="850" y="478">already in Snowflake</text>
          <text className="aw-small" x="850" y="498">nested JSON</text>
        </g>

        <g>
          <rect className="aw-hot" x="1040" y="190" width="152" height="142" rx="3" />
          <text className="aw-title" x="1054" y="216">Unified sales</text>
          <text className="aw-title" x="1054" y="236">orders</text>
          <text className="aw-sub" x="1054" y="258">old + new orders,</text>
          <text className="aw-sub" x="1054" y="276">same tests and</text>
          <text className="aw-sub" x="1054" y="294">reports as before</text>
          <text className="aw-small" x="1054" y="320">UNION ALL</text>
          <text className="aw-live" x="1184" y="320" textAnchor="end">+{sim.unifiedOrders.toLocaleString()}</text>
        </g>

        <Flow id="rebuild-unified" d="M1020 200 C 1030 200, 1028 240, 1036 240" />
        <Flow id="hist-unified" d="M1020 460 C 1032 460, 1026 290, 1036 290" />

        <g>
          <rect className="aw-box" x="1040" y="396" width="152" height="96" rx="3" />
          <text className="aw-title" x="1054" y="422">30-day sales</text>
          <text className="aw-title" x="1054" y="442">by country</text>
          <text className="aw-sub" x="1054" y="466">dashboard model</text>
        </g>
        <Flow id="unified-dash" d="M1116 332 L1116 392" />

      </svg>
      <p className="awd-status">
        <span className="pf-dot" aria-hidden="true" /> Simulated at {SPEED}× the real cadence · {sim.ordersGenerated.toLocaleString()} orders
        generated in {sim.elapsed}s of simulated time
      </p>
    </>
  );
}

/** An arrow; arrows with an id also carry a continuous stream of rows or batches. */
function Flow({ id, d, dashed }: { id?: string; d: string; dashed?: boolean }) {
  const kind = id ? (ROW_ARROWS.has(id) ? 'row' : 'batch') : null;
  return (
    <>
      <path className="aw-flow" d={d} strokeDasharray={dashed ? '4 3' : undefined} />
      {kind && <path className={`aw-stream aw-stream--${kind}`} d={d} />}
    </>
  );
}

function Pill({ x, w, n, label }: { x: number; w: number; n: number; label: string }) {
  return (
    <g>
      <rect className="aw-pill" x={x} y={16} width={w} height={28} rx={14} />
      <circle className="aw-pillnum" cx={x + 16} cy={30} r={9} />
      <text className="aw-pilltext" x={x + 12} y={34}>{n}</text>
      <text className="aw-pilltext" x={x + 32} y={34}>{label}</text>
    </g>
  );
}

function Table({ id, x, y, name, sub }: { id: string; x: number; y: number; name: string; sub: ReactNode }) {
  return (
    <g data-node={id}>
      <rect className="aw-box" x={x} y={y} width={150} height={64} rx={3} />
      <text className="aw-mono" x={x + 12} y={y + 26}>{name}</text>
      <text className="aw-sub" x={x + 12} y={y + 48}>{sub}</text>
    </g>
  );
}
