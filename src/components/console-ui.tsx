"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Run } from "@/lib/agent";
import { ResultView } from "./result-view";

interface Frame {
  id: string;
  name: string;
  dataUrl: string;
  w: number;
  h: number;
  sizeKb: number;
}

const EXAMPLES: Record<string, string[]> = {
  single: [
    "Describe this scene and locate the water body along the coast.",
    "Is there any flooding visible in this frame?",
    "How developed is this area? Point at the built-up core.",
    "What kind of land use dominates here?",
  ],
  bitemporal: [
    "What changed between these two passes, and where exactly?",
    "Any new construction or clearing? Quantify it.",
    "Compare the two frames — is anything worth flagging?",
  ],
  crossmodal: [
    "Fuse these two passes — what can the SAR side see that the optical pass can't?",
    "Would this frame still be usable under monsoon cloud cover?",
    "What does the radar add to the optical pass here?",
  ],
};

async function fileToFrame(file: File): Promise<Frame | null> {
  if (!file.type.startsWith("image/")) return null;
  const raw = await new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = () => rej(new Error("read failed"));
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("decode failed"));
    i.src = raw;
  });
  const scale = Math.min(1, 840 / Math.max(img.width, img.height));
  const w = Math.max(2, Math.round(img.width * scale));
  const h = Math.max(2, Math.round(img.height * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  const dataUrl = c.toDataURL("image/jpeg", 0.78);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    dataUrl,
    w,
    h,
    sizeKb: Math.round((dataUrl.length * 0.75) / 1024),
  };
}

function dataUrlToFrame(src: string, name: string): Promise<Frame> {
  return new Promise((res) => {
    const i = new Image();
    i.onload = () => {
      const scale = Math.min(1, 840 / Math.max(i.width, i.height));
      const w = Math.max(2, Math.round(i.width * scale));
      const h = Math.max(2, Math.round(i.height * scale));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return res({ id: Math.random().toString(36).slice(2), name, dataUrl: src, w, h, sizeKb: 0 });
      ctx.drawImage(i, 0, 0, w, h);
      const dataUrl = c.toDataURL("image/jpeg", 0.82);
      res({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, dataUrl, w, h, sizeKb: Math.round((dataUrl.length * 0.75) / 1024) });
    };
    i.onerror = () => res({ id: Math.random().toString(36).slice(2), name, dataUrl: src, w: 0, h: 0, sizeKb: 0 });
    i.src = src;
  });
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function logForRun(run: Run): string[] {
  const lines: string[] = [
    `vyoma> session ${run.code} opened · config=${run.config} · intent=${run.intent} (conf ${run.intentConf.toFixed(2)})`,
    "vyoma> backbone RS-LLaVA · LoRA rs-v2.3 · BigEarthNet-adapted projection warm",
  ];
  run.trace.forEach((t, i) => {
    lines.push(
      `[${String(i + 1).padStart(2, "0")}] ${t.tool.padEnd(22, " ")} ${t.status === "warn" ? "⚠ WARN" : "✓ OK"}  ${t.detail}   (${t.ms} ms)`
    );
  });
  lines.push("vyoma> confidence & evidence sealed · run written to postgres ledger");
  lines.push(`vyoma> report available → /api/report?id=${run.id.slice(0, 8)}…`);
  return lines;
}

const SCENARIOS = [
  { key: "single", label: "Single optical frame", hint: "port corridor · VQA + grounding" },
  { key: "bitemporal", label: "Bi-temporal T1 + T2", hint: "farm mosaic · ≈12 months apart" },
  { key: "crossmodal", label: "Optical + C-band SAR", hint: "valley · all-weather pair" },
] as const;

export function ConsoleApp() {
  const [files, setFiles] = useState<Frame[]>([]);
  const [pairMode, setPairMode] = useState<"bitemporal" | "crossmodal">("bitemporal");
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"idle" | "fetching" | "animating" | "done" | "error">("idle");
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [doneStep, setDoneStep] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const config = files.length === 2 ? pairMode : "single";
  const busy = phase === "fetching" || phase === "animating";

  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight });
  }, [logLines]);

  useEffect(() => {
    if (!run || phase !== "animating") return;
    const all = logForRun(run);
    if (reduced) {
      setLogLines(all);
      setDoneStep(run.trace.length);
      setPhase("done");
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const stepMs = 640;
    run.trace.forEach((_, i) => {
      timers.push(window.setTimeout(() => { if (!cancelled) setDoneStep(i + 1); }, (i + 1) * stepMs));
    });
    all.forEach((_, i) => {
      timers.push(window.setTimeout(() => { if (!cancelled) setLogLines((l) => [...l, all[i]]); }, 260 + i * 330));
    });
    timers.push(window.setTimeout(() => { if (!cancelled) setPhase("done"); }, run.trace.length * stepMs + 620));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [run, phase, reduced]);

  const addFiles = useCallback(async (list: FileList | File[]) => {
    const arr = Array.from(list);
    const room = 2 - files.length;
    const slice = arr.slice(0, Math.max(0, room));
    const frames = (await Promise.all(slice.map(fileToFrame))).filter(Boolean) as Frame[];
    if (frames.length) setFiles((f) => [...f, ...frames].slice(0, 2));
  }, [files.length]);

  const loadDemo = useCallback(
    async (key: (typeof SCENARIOS)[number]["key"]) => {
      setDemo(key);
      setPhase("fetching");
      setError("");
      try {
        const r = await fetch(`/api/demo?scenario=${key}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "scenario failed");
        const frames = (await Promise.all(j.images.map((src: string, i: number) => dataUrlToFrame(src, `demo-${key}-${i + 1}.jpg`)))).filter(Boolean);
        setFiles(frames);
        setQuery(j.query);
        setPairMode(key === "crossmodal" ? "crossmodal" : "bitemporal");
        setPhase("idle");
      } catch (e) {
        setPhase("error");
        setError(e instanceof Error ? e.message : "Could not load the demo scenario.");
      }
    },
    []
  );

  const start = useCallback(async () => {
    if (!files.length || !query.trim() || busy) return;
    setPhase("fetching");
    setRun(null);
    setLogLines([
      "vyoma> uplink opened → agentic controller",
      `vyoma> ${files.length} frame(s) · ${files.reduce((a, f) => a + f.sizeKb, 0)} kB · normalising to 640 px`,
      "vyoma> intent classification in progress…",
    ]);
    setDoneStep(0);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: files.map((f) => f.dataUrl), config, query: query.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "The controller rejected the run.");
      setRun(j);
      setLogLines([]);
      setPhase("animating");
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : "Uplink failed — check the frames and retry.");
    }
  }, [files, query, config, busy]);

  const reset = () => {
    setFiles([]);
    setQuery("");
    setRun(null);
    setLogLines([]);
    setDoneStep(0);
    setDemo(null);
    setPhase("idle");
    setError("");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-28 md:px-8">
      {/* console header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.26em] text-ion uppercase">Mission console · v0.9</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
            VYOMA <span className="text-dim">/</span> <span className="text-ion2">live analysis</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[10px] tracking-[0.14em] uppercase">
          {["backbone loaded", "5 tools standby", "ledger: postgres"].map((s) => (
            <span key={s} className="flex items-center gap-1.5 rounded-sm border border-line bg-panel px-2.5 py-1.5 text-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-mint blink" />
              {s}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="rise mb-6 rounded-md border border-signal/40 bg-signal/10 px-5 py-4">
          <div className="font-mono text-[11px] tracking-[0.18em] text-signal uppercase">⚠ controller fault</div>
          <p className="mt-1.5 text-[13.5px] text-ink/85">{error}</p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
        {/* ── input panel ── */}
        <div className="space-y-5">
          <div className="rounded-md border border-line bg-panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[12px] font-semibold tracking-[0.22em] text-dim uppercase">01 · Frames</h2>
              <span className="font-mono text-[10px] text-faint">{files.length}/2</span>
            </div>
            <label
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); void addFiles(e.dataTransfer.files); }}
              className={`relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed px-4 py-6 text-center transition-all ${
                drag ? "border-ion bg-ion/10" : "border-line2 bg-abyss/50 hover:border-ion/50"
              } ${files.length >= 2 ? "pointer-events-none opacity-40" : ""}`}
            >
              <span className="font-mono text-[13px] text-ion">⇪</span>
              <span className="text-[13px] text-dim">
                Drop GeoTIFF / TIFF / PNG / JPEG <span className="text-faint">— or click to browse</span>
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && void addFiles(e.target.files)}
              />
            </label>
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {files.map((f, i) => (
                  <div key={f.id} className="group relative overflow-hidden rounded-sm border border-line">
                    <img src={f.dataUrl} alt={f.name} className="h-24 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-void/85 px-2 py-1 font-mono text-[9px] text-dim">
                      {config === "single" ? (i === 0 ? "INPUT" : "") : config === "bitemporal" ? (i === 0 ? "T1" : "T2") : i === 0 ? "OPTICAL" : "SAR"}
                      {" · "}{f.w}×{f.h}
                    </div>
                    <button
                      onClick={() => setFiles((fs) => fs.filter((x) => x.id !== f.id))}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-sm bg-void/80 text-[11px] text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:text-signal"
                      aria-label="remove frame"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            {files.length === 2 && (
              <div className="mt-3">
                <div className="mb-1.5 font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">Pair interpretation</div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["bitemporal", "T1 + T2 · same sensor"],
                      ["crossmodal", "Optical + SAR"],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => setPairMode(k)}
                      className={`rounded-sm border px-2 py-2 font-mono text-[10px] tracking-[0.08em] transition-all ${
                        pairMode === k ? "border-ion/60 bg-ion/15 text-ion" : "border-line text-dim hover:border-line2"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 border-t border-line pt-3.5">
              <div className="mb-1.5 font-mono text-[9.5px] tracking-[0.2em] text-faint uppercase">Or load a ready scenario</div>
              <div className="space-y-1.5">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => void loadDemo(s.key)}
                    disabled={busy}
                    className={`group flex w-full items-center justify-between rounded-sm border px-3 py-2 text-left transition-all disabled:opacity-50 ${
                      demo === s.key ? "border-amber/50 bg-amber/10" : "border-line bg-abyss/40 hover:border-ion/40"
                    }`}
                  >
                    <span>
                      <span className="block text-[12.5px] font-medium text-ink">{s.label}</span>
                      <span className="block font-mono text-[9.5px] text-faint">{s.hint}</span>
                    </span>
                    <span className="font-mono text-[13px] text-dim transition-transform group-hover:translate-x-0.5 group-hover:text-ion">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* query */}
          <div className="rounded-md border border-line bg-panel p-5">
            <h2 className="mb-3 font-display text-[12px] font-semibold tracking-[0.22em] text-dim uppercase">02 · Ask the sky</h2>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              placeholder="e.g. What changed between these two passes, and where exactly?"
              className="w-full resize-none rounded-sm border border-line2 bg-abyss/60 px-3.5 py-3 text-[14px] text-ink placeholder:text-faint focus:border-ion/60 focus:outline-none"
            />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {EXAMPLES[config].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setQuery(ex)}
                  className="max-w-full truncate rounded-sm border border-line bg-abyss/40 px-2.5 py-1 text-[11px] text-dim transition-all hover:border-ion/40 hover:text-ion2"
                  title={ex}
                >
                  {ex}
                </button>
              ))}
            </div>
            <button
              onClick={() => void start()}
              disabled={!files.length || !query.trim() || busy}
              className="group mt-4 flex w-full items-center justify-center gap-2.5 rounded-sm border border-ion/60 bg-ion/15 py-3.5 font-display text-[13px] font-semibold tracking-[0.22em] text-ion uppercase transition-all hover:bg-ion hover:text-void hover:shadow-[0_0_32px_rgba(67,217,255,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ion/15 disabled:hover:text-ion disabled:hover:shadow-none"
            >
              {busy ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Controller routing…
                </>
              ) : (
                <>
                  Run analysis <span className="transition-transform group-hover:translate-x-1">→</span>
                </>
              )}
            </button>
            <p className="mt-2.5 text-center font-mono text-[9.5px] tracking-[0.1em] text-faint">
              {files.length
                ? `${files.length} frame(s) · ${files.reduce((a, f) => a + f.sizeKb, 0)} kB payload · config=${config}`
                : "drop at least one frame to arm the controller"}
            </p>
          </div>
        </div>

        {/* ── pipeline / terminal ── */}
        <div className="space-y-5">
          <div className="rounded-md border border-line bg-panel">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="font-display text-[12px] font-semibold tracking-[0.22em] text-dim uppercase">03 · Agentic controller</h2>
              <span className={`flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase ${busy ? "text-amber" : "text-mint"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${busy ? "bg-amber blink" : "bg-mint"}`} />
                {phase === "idle" || phase === "error" ? "standby" : busy ? "executing" : "sealed"}
              </span>
            </div>
            <div className="grid gap-0 md:grid-cols-[1fr_1.15fr]">
              {/* step ladder */}
              <div className="border-b border-line p-5 md:border-r md:border-b-0">
                {run && (phase === "animating" || phase === "done") ? (
                  <ol className="space-y-3">
                    {run.trace.map((t, i) => {
                      const state = i < doneStep ? "done" : i === doneStep && phase === "animating" ? "active" : "pending";
                      return (
                        <li key={i} className={`flex items-start gap-3 transition-opacity ${state === "pending" ? "opacity-35" : "opacity-100"}`}>
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                              state === "done" ? "border-mint/60 bg-mint/15 text-mint" : state === "active" ? "border-amber/70 bg-amber/15 text-amber" : "border-line2 text-faint"
                            }`}
                          >
                            {state === "done" ? "✓" : state === "active" ? "▸" : i + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-mono text-[11px] text-ion2">{t.tool}</span>
                            <span className="block truncate text-[11.5px] text-faint">{t.label}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <ol className="space-y-3">
                    {["Ingest & compatibility", "Intent classification", "Backbone encoding", "Specialist execution", "Evidence & confidence"].map((s, i) => (
                      <li key={s} className="flex items-center gap-3 opacity-50">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line2 font-mono text-[10px] text-faint">{i + 1}</span>
                        <span className="text-[12px] text-dim">{s}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              {/* terminal */}
              <div className="relative flex min-h-[280px] flex-col bg-void/70 p-5">
                {phase === "idle" && !run ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4">
                    <div className="relative h-24 w-24">
                      <div className="absolute inset-0 rounded-full border border-line2" />
                      <div className="absolute inset-3 rounded-full border border-line" />
                      <div className="absolute inset-6 rounded-full border border-line" />
                      <div className="radar-sweep" />
                      <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ion" />
                    </div>
                    <p className="font-mono text-[10.5px] tracking-[0.2em] text-faint uppercase">Awaiting query — radar on idle sweep</p>
                  </div>
                ) : (
                  <div ref={termRef} className="flex-1 space-y-1 overflow-y-auto pr-1 font-mono text-[10.5px] leading-relaxed">
                    {logLines.map((l, i) => (
                      <div key={i} className={`whitespace-pre-wrap break-words ${l.startsWith("[") ? "text-dim" : "text-ion2/80"} ${i === logLines.length - 1 && phase !== "done" ? "caret" : ""}`}>
                        {l}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {phase === "done" && run && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-[13px] font-semibold tracking-[0.22em] text-dim uppercase">04 · Downlinked result</h2>
                <button onClick={reset} className="rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-dim uppercase transition-all hover:border-ion/50 hover:text-ion">
                  ↺ New run
                </button>
              </div>
              <ResultView run={run} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
