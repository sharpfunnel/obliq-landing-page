import { gzipSync } from "node:zlib";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { sessionId?: string; events?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId: clientId, events } = body;
  if (!clientId || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "Missing sessionId or events" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { clientId }, select: { id: true } });
  if (!session) {
    // The /api/track beacon hasn't created the Session row yet — ask the client to retry shortly.
    return NextResponse.json({ ok: true, retry: true });
  }

  const compressed = gzipSync(Buffer.from(JSON.stringify(events)));

  await prisma.sessionReplay.create({
    data: {
      sessionId: session.id,
      data: compressed,
      eventCount: events.length,
    },
  });

  return NextResponse.json({ ok: true });
}
