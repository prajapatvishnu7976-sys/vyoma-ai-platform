"use client";

import { useRef, useState } from "react";
import type { Run } from "@/lib/agent";
import { ConfGauge, ConfigBadge, IntentBadge } from "./chrome";

/* ── before/after comparison slider ─────────────────────────── */
function BASlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const set = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(3, Math.min(97, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className="ba-handle relative aspect-square w-full cursor-ew-resize select-none overflow-hidden"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        set(e.clientX);
      }}
      onPointerMove={(e) => e.buttons === 1 && set(e.clientX)}
    >
      <img src={after} alt="T2" className="block h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="T1" className="block h-full w-full object-cover" draggable={false} />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="h-full w-0.5 -translate-x-1/2 bg-ion shadow-[0_0_12px_rgba(67,217,255,0.8)]" />
        <div className="absolute top-1/2 left-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ion bg-void/80 font-mono text-[10px] text-ion">
          ⇔
        </div>
      </div>
      <span className="absolute top-2 left-2 rounded-sm bg-void/75 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-ink">T1</span>
      <span className="absolute top-2 right-2 rounded-sm bg-void/75 px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] text-ink">T2</span>
    </div>
  );
}

/* ── bbox evidence overlay ──────────────────────────────────── */
function BboxOverlay({ run }: { run: Run }) {
  const o = run.overlay;
  if (!o) return null;
  const { x0, y0, x1, y1 } = o;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect
        x={x0 * 100}
        y={y0 * 100}
        width={(x1 - x0) * 100}
        height={(y1 - y0) * 100}
        fill="rgba(67,217,255,0.08)"
        stroke="#43d9ff"
        strokeWidth="0.5"
        strokeDasharray="2.4 1.6"
        className="bbox-pulse"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ── evidence panel ─────────────────────────────────────────── */
function Evidence({ run }: { run: Run }) {
  const [tab, setTab] = useState(0);
  const tabs: string[] =
    run.config === "bitemporal" && run.evidence.changeMap
      ? ["T1 ⇔ T2 slider", "Change map", "T1 raw", "T2 raw"]
      : run.config === "crossmodal" && run.evidence.fused
        ? ["Fused composite", "Optical", "SAR"]
        : ["Frame + grounding"];
  const img =
    run.config === "bitemporal" && run.evidence.changeMap
      ? [null, run.evidence.changeMap, run.evidence.t1, run.evidence.t2]
      : run.config === "crossmodal" && run.evidence.fused
        ? [run.evidence.fused, run.evidence.t1, run.evidence.t2]
        : [run.evidence.t1];
  return (
    <div className="rise" style={{ animationDelay: "120ms" }}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase transition-all ${
              tab === i ? "border-ion/60 bg-ion/15 text-ion" : "border-line text-dim hover:border-line2 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="evidence-shimmer relative overflow-hidden rounded-md border border-line bg-abyss">
        {tab === 0 && run.config === "bitemporal" && img[0] === null ? (
          <BASlider before={run.evidence.t1!} after={run.evidence.t2!} />
        ) : (
          <div className="relative">
            <img src={img[tab] ?? undefined} alt={tabs[tab]} className="block w-full" draggable={false} />
            {run.config !== "bitemporal" && tab === 0 && run.overlay && <BboxOverlay run={run} />}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <span className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-ion/60" />
              <span className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-ion/60" />
              <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-ion/60" />
              <span className="absolute right-0 bottom-0 h-5 w-5 border-r-2 border-b-2 border-ion/60" />
            </div>
          </div>
        )}
      </div>
      {run.config === "bitemporal" && tab === 1 && (
        <p className="mt-2 font-mono text-[10.5px] tracking-[0.1em] text-signal/90">
          ▮ RED OVERLAY = PIXELS WHERE |T2−T1| EXCEEDED OTSU τ · COMPUTED FROM YOUR UPLOADS
        </p>
      )}
      {run.config === "crossmodal" && tab === 0 && (
        <p className="mt-2 font-mono text-[10.5px] tracking-[0.1em] text-mint/90">
          ▮ LATE FUSION: SAR HIGH-FREQUENCY DETAIL INJECTED INTO OPTICAL LUMINANCE
        </p>
      )}
    </div>
  );
}

/* ── main result view ───────────────────────────────────────── */
export function ResultView({ run }: { run: Run }) {
  const [reporting, setReporting] = useState(false);
  const download = async () => {
    setReporting(true);
    try {
      const r = await fetch(`/api/report?id=${run.id}`);
      const b = await r.blob();
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = `vyoma-report-${run.code}.html`;
      a.click();
      URL.revokeObjectURL(u);
    } finally {
      setReporting(false);
    }
  };

  return (
    <section className="space-y-5">
      {/* run header */}
      <div className="rise flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-[12px] tracking-[0.18em] text-ion2">{run.code}</span>
        <ConfigBadge config={run.config} />
        <IntentBadge intent={run.intent} />
        <span className="font-mono text-[10.5px] text-faint">
          {new Date(run.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={download}
            disabled={reporting}
            className="rounded-sm border border-line2 bg-raise/50 px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.12em] text-dim uppercase transition-all hover:border-mint/50 hover:text-mint disabled:opacity-50"
          >
            {reporting ? "Building…" : "↓ Download report"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        {/* left column */}
        <div className="space-y-5">
          {/* answer */}
          <div className="rise rounded-md border border-line bg-panel p-5 md:p-6" style={{ animationDelay: "40ms" }}>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint blink" />
              <h3 className="font-display text-[12px] font-semibold tracking-[0.24em] text-dim uppercase">Answer · evidence-backed</h3>
            </div>
            <div className="space-y-3.5 text-[14.5px] leading-relaxed text-ink/90">
              {run.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {run.plain && (
              <div className="mt-4 border-l-2 border-mint/60 bg-mint/5 px-4 py-3 text-[13.5px] leading-relaxed text-mint/90">
                {run.plain}
              </div>
            )}
            <div className="mt-4 rounded-sm border border-line bg-abyss/70 px-4 py-3">
              <div className="font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">Auto-caption</div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim italic">{run.caption}</p>
            </div>
            {run.caveats.length > 0 && (
              <ul className="mt-4 space-y-2">
                {run.caveats.map((c, i) => (
                  <li key={i} className="flex gap-2.5 text-[12px] leading-relaxed text-amber/80">
                    <span className="font-mono shrink-0">⚠</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* metrics */}
          <div className="rise rounded-md border border-line bg-panel p-5" style={{ animationDelay: "160ms" }}>
            <h3 className="mb-4 font-display text-[12px] font-semibold tracking-[0.24em] text-dim uppercase">Computed from your pixels</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.values(run.metrics).map((m) => (
                <div key={m.label} className="rounded-sm border border-line bg-abyss/60 px-3 py-2.5 transition-colors hover:border-line2">
                  <div className="font-mono text-[9px] tracking-[0.16em] text-faint uppercase">{m.label}</div>
                  <div className="mt-1 font-display text-[16px] font-semibold text-ion2">{m.value}</div>
                  {m.hint && <div className="mt-0.5 truncate font-mono text-[9.5px] text-faint">{m.hint}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="space-y-5">
          <Evidence run={run} />
          {/* confidence */}
          <div className="rise flex items-center justify-center rounded-md border border-line bg-panel py-5" style={{ animationDelay: "200ms" }}>
            <ConfGauge value={run.confidence} label={run.confLabel} />
          </div>
        </div>
      </div>

      {/* trace */}
      <div className="rise rounded-md border border-line bg-panel" style={{ animationDelay: "260ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
          <h3 className="font-display text-[12px] font-semibold tracking-[0.24em] text-dim uppercase">Execution trace · auditable</h3>
          <span className="font-mono text-[10px] tracking-[0.14em] text-faint">
            {run.trace.length} STEPS · {run.trace.reduce((a, t) => a + t.ms, 0)} MS WALL
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line font-mono text-[9.5px] tracking-[0.18em] text-faint uppercase">
                <th className="px-5 py-2.5">Step</th>
                <th className="px-3 py-2.5">Tool</th>
                <th className="px-3 py-2.5">Component</th>
                <th className="px-3 py-2.5">Detail</th>
                <th className="px-3 py-2.5 text-right">Time</th>
                <th className="px-5 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {run.trace.map((t, i) => (
                <tr key={i} className="border-b border-line/50 transition-colors last:border-0 hover:bg-raise/30">
                  <td className="px-5 py-3 font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-3 py-3 font-mono text-[11.5px] text-ion2">{t.tool}</td>
                  <td className="px-3 py-3 text-[12px] text-dim">{t.label}</td>
                  <td className="px-3 py-3 font-mono text-[10.5px] leading-relaxed text-dim">{t.detail}</td>
                  <td className="px-3 py-3 text-right font-mono text-[11px] text-ink">{t.ms} ms</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] ${t.status === "warn" ? "text-amber" : "text-mint"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${t.status === "warn" ? "bg-amber" : "bg-mint"}`} />
                      {t.status === "warn" ? "WARN" : "OK"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
