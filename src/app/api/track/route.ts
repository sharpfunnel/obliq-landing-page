import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { upsertVisitorAndSession } from "@/lib/tracking/server";
import type { TrackBatchPayload } from "@/lib/tracking/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: TrackBatchPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { init } = body;
  if (!init?.visitorId || !init?.sessionId) {
    return NextResponse.json({ error: "Missing init payload" }, { status: 400 });
  }

  let session;
  try {
    ({ session } = await upsertVisitorAndSession(request, init));
  } catch (error) {
    console.error("Failed to upsert visitor/session for /api/track:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const sessionId = session.id;

  const pageViews = body.pageViews ?? [];
  const scrollEvents = body.scrollEvents ?? [];
  const ctaEvents = body.ctaEvents ?? [];
  const formEvents = body.formEvents ?? [];
  const perfMetrics = body.perfMetrics ?? [];
  const errors = body.errors ?? [];
  const mouseEvents = body.mouseEvents ?? [];
  const events = body.events ?? [];

  await Promise.all([
    pageViews.length
      ? prisma.pageView.createMany({
          data: pageViews.map((p) => ({
            sessionId,
            path: p.path,
            title: p.title ?? undefined,
            enteredAt: new Date(p.enteredAt),
            timeOnPage: p.timeOnPage ?? undefined,
          })),
        })
      : null,
    scrollEvents.length
      ? prisma.scrollEvent.createMany({
          data: scrollEvents.map((s) => ({
            sessionId,
            path: s.path,
            depth: s.depth,
            timeToReach: s.timeToReach ?? undefined,
          })),
        })
      : null,
    ctaEvents.length
      ? prisma.ctaEvent.createMany({
          data: ctaEvents.map((c) => ({
            sessionId,
            ctaId: c.ctaId,
            action: c.action,
            timeBeforeClick: c.timeBeforeClick ?? undefined,
          })),
        })
      : null,
    formEvents.length
      ? prisma.formEvent.createMany({
          data: formEvents.map((f) => ({
            sessionId,
            formId: f.formId,
            action: f.action,
            fieldName: f.fieldName ?? undefined,
            errorMessage: f.errorMessage ?? undefined,
          })),
        })
      : null,
    perfMetrics.length
      ? prisma.performanceMetric.createMany({
          data: perfMetrics.map((p) => ({
            sessionId,
            path: p.path,
            metric: p.metric,
            value: p.value,
            rating: p.rating,
          })),
        })
      : null,
    errors.length
      ? prisma.errorEvent.createMany({
          data: errors.map((e) => ({
            sessionId,
            type: e.type,
            message: e.message.slice(0, 2000),
            stack: e.stack?.slice(0, 4000) ?? undefined,
            path: e.path,
          })),
        })
      : null,
    mouseEvents.length
      ? prisma.mouseEvent.createMany({
          data: mouseEvents.map((m) => ({
            sessionId,
            path: m.path,
            type: m.type,
            x: m.x,
            y: m.y,
            targetSelector: m.targetSelector ?? undefined,
            hoverDuration: m.hoverDuration ?? undefined,
          })),
        })
      : null,
    (() => {
      const heatmapPoints = events
        .filter((e) => e.name === "heatmap_click" && e.metadata)
        .map((e) => e.metadata as { path: string; xPct: number; yPct: number; viewportWidth: number });
      return heatmapPoints.length
        ? prisma.heatmapEvent.createMany({
            data: heatmapPoints.map((h) => ({
              sessionId,
              path: h.path,
              type: "click",
              xPct: h.xPct,
              yPct: h.yPct,
              viewportWidth: h.viewportWidth,
            })),
          })
        : null;
    })(),
    events.length
      ? prisma.event.createMany({
          data: events
            .filter((e) => e.name !== "heatmap_click")
            .map((e) => ({
              sessionId,
              name: e.name,
              metadata: (e.metadata as object | undefined) ?? undefined,
            })),
        })
      : null,
  ]);

  const hasEngagementSignal =
    scrollEvents.length > 0 || ctaEvents.length > 0 || formEvents.length > 0 || events.length > 0;
  const pagesViewedIncrement = pageViews.length;
  const newPagesViewed = session.pagesViewed + pagesViewedIncrement;
  const elapsedMs = Date.now() - session.startedAt.getTime();
  const isBounce = newPagesViewed <= 1 && elapsedMs < 10_000 && !hasEngagementSignal;

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      pagesViewed: newPagesViewed || session.pagesViewed,
      exitPath: body.exitPath ?? undefined,
      totalDuration: Math.round(elapsedMs / 1000),
      isBounce,
      endedAt: body.isFinal ? new Date() : undefined,
      viewportWidth: init.viewportWidth,
      viewportHeight: init.viewportHeight,
      mouseClickCount: { increment: body.mouseClicks ?? 0 },
      mouseMoveCount: { increment: body.mouseMoves ?? 0 },
    },
  });

  return NextResponse.json({ ok: true });
}
