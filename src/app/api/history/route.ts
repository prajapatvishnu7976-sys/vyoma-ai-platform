import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { queries } from "@/db/schema";
import { rowToRun } from "@/lib/serial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  try {
    if (id) {
      const rows = await db.select().from(queries).where(eq(queries.id, id)).limit(1);
      if (!rows.length) return NextResponse.json({ error: "Run not found — it may have been purged." }, { status: 404 });
      return NextResponse.json(rowToRun(rows[0]));
    }
    const rows = await db
      .select({
        id: queries.id,
        code: queries.code,
        queryText: queries.queryText,
        intent: queries.intent,
        config: queries.config,
        confidence: queries.confidence,
        confLabel: queries.confLabel,
        createdAt: queries.createdAt,
      })
      .from(queries)
      .orderBy(desc(queries.createdAt))
      .limit(60);
    return NextResponse.json(rows);
  } catch (e) {
    console.error("[vyoma/history]", e);
    return NextResponse.json({ error: "Could not read the run ledger." }, { status: 500 });
  }
}
