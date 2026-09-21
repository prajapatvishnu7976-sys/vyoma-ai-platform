"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Nav, Footer, ConfigBadge, IntentBadge, Reveal } from "@/components/chrome";
import { ResultView } from "@/components/result-view";
import type { Run } from "@/lib/agent";

interface Row {
  id: string;
  code: string;
  queryText: string;
  intent: string;
  config: string;
  confidence: number;
  confLabel: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState<Run | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadList = useCallback(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((j) => setRows(j ?? []))
      .catch(() => setErr("Could not reach the run ledger."));
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const open = useCallback(async (id: string) => {
    setLoadingId(id);
    try {
      const r = await fetch(`/api/history?id=${id}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "not found");
      setSel(j as Run);
      setTimeout(() => document.getElementById("sel-run")?.scrollIntoView({ block: "start", behavior: "smooth" }), 60);
    } finally {
      setLoadingId(null);
    }
  }, []);

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-[1400px] px-5 pt-28 pb-24 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] tracking-[0.26em] text-ion uppercase">Postgres ledger · auditable</div>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
              Run history <span className="text-dim">/</span>{" "}
              <span className="text-ion2">{rows ? `${rows.length} runs on file` : "opening…"}</span>
            </h1>
            <p className="mt-2 max-w-lg text-[14px] text-dim">
              Every run is sealed here with its answer, evidence, confidence and execution trace. Click a row to reopen
              the full record — or pull the PDF-ready report from the console.
            </p>
          </div>
          <Link
            href="/console"
            className="rounded-sm border border-ion/50 bg-ion/10 px-5 py-2.5 font-display text-[12px] font-semibold tracking-[0.16em] text-ion uppercase transition-all hover:bg-ion hover:text-void"
          >
            + New run
          </Link>
        </div>

        {err && <div className="mb-6 rounded-md border border-signal/40 bg-signal/10 px-5 py-4 text-[13.5px] text-ink/85">{err}</div>}

        {rows && rows.length === 0 && (
          <Reveal>
            <div className="rounded-md border border-dashed border-line2 bg-panel/50 px-8 py-16 text-center">
              <div className="font-mono text-[13px] text-dim">The ledger is empty.</div>
              <p className="mx-auto mt-2 max-w-sm text-[13px] text-faint">
                Run your first analysis in the console — the controller seals every run here with its full trace.
              </p>
              <Link
                href="/console"
                className="mt-6 inline-block rounded-sm bg-ion px-6 py-3 font-display text-[12px] font-bold tracking-[0.16em] text-void uppercase transition-all hover:bg-ion2"
              >
                Open the console →
              </Link>
            </div>
          </Reveal>
        )}

        {rows && rows.length > 0 && (
          <div className="overflow-hidden rounded-md border border-line">
            {rows.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i, 6) * 50}>
                <button
                  onClick={() => void open(r.id)}
                  disabled={loadingId === r.id}
                  className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 border-t border-line px-5 py-4 text-left transition-colors first:border-t-0 hover:bg-panel md:grid-cols-[130px_1fr_auto_auto_auto] ${
                    sel?.id === r.id ? "bg-panel" : "bg-abyss/40"
                  } ${loadingId === r.id ? "opacity-60" : ""}`}
                >
                  <span className="font-mono text-[11.5px] text-ion2">{r.code}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] text-ink/90">“{r.queryText}”</span>
                    <span className="mt-0.5 block font-mono text-[9.5px] text-faint">
                      {new Date(r.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })} IST
                    </span>
                  </span>
                  <span className="hidden md:block"><ConfigBadge config={r.config} /></span>
                  <span className="hidden md:block"><IntentBadge intent={r.intent} /></span>
                  <span className="flex items-center gap-2 justify-self-end">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-void">
                      <span className="block h-full rounded-full bg-gradient-to-r from-mint to-ion" style={{ width: `${((r.confidence - 0.5) / 0.46) * 100}%` }} />
                    </span>
                    <span className="font-mono text-[11px] text-ink">{r.confidence.toFixed(2)}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        )}

        {sel && (
          <div id="sel-run" className="mt-12 scroll-mt-24">
            <div className="mb-4 font-mono text-[11px] tracking-[0.22em] text-dim uppercase">— reopened run —</div>
            <ResultView run={sel} />
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
