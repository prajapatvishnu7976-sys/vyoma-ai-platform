import {
  pgTable,
  text,
  doublePrecision,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const queries = pgTable("vyoma_queries", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  queryText: text("query_text").notNull(),
  intent: text("intent").notNull(),
  config: text("config").notNull(),
  confidence: doublePrecision("confidence").notNull(),
  confLabel: text("conf_label").notNull(),
  answer: text("answer").notNull(),
  plain: text("plain").notNull(),
  caption: text("caption").notNull(),
  caveats: jsonb("caveats").$type<string[]>().notNull().default([]),
  metrics: jsonb("metrics").$type<Record<string, { label: string; value: string; hint?: string }>>().notNull().default({}),
  trace: jsonb("trace").$type<{ tool: string; label: string; detail: string; ms: number; status: "ok" | "warn" }[]>().notNull().default([]),
  overlay: jsonb("overlay").$type<{ kind: "bbox"; x0: number; y0: number; x1: number; y1: number; label: string } | null>().default(null),
  evidence: jsonb("evidence").$type<{ t1?: string; t2?: string; sar?: string; changeMap?: string; fused?: string }>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type QueryRow = typeof queries.$inferSelect;
