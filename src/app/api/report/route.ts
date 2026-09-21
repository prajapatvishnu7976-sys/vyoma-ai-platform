import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { queries } from "@/db/schema";
import { rowToRun, reportHtml } from "@/lib/serial";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing run id." }, { status: 400 });
  try {
    const rows = await db.select().from(queries).where(eq(queries.id, id)).limit(1);
    if (!rows.length) return NextResponse.json({ error: "Run not found." }, { status: 404 });
    const run = rowToRun(rows[0]);
    const html = reportHtml(run);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="vyoma-report-${run.code}.html"`,
      },
    });
  } catch (e) {
    console.error("[vyoma/report]", e);
    return NextResponse.json({ error: "Report build failed." }, { status: 500 });
  }
}
