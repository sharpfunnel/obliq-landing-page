import "server-only";

import { prisma } from "@/lib/db";

export type ReportRange = { from: Date; to: Date; label: string };

/** Parses `?range=7d|30d|90d|custom&from=...&to=...` into concrete dates. */
export function resolveReportRange(searchParams: URLSearchParams): ReportRange {
  const range = searchParams.get("range") ?? "30d";
  const to = new Date();

  if (range === "custom") {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const from = fromParam ? new Date(fromParam) : new Date(to.getTime() - 30 * 86400_000);
    // A date-only "to" param parses to that day's midnight — extend to end-of-day so the
    // picked day is actually included, not just its first instant.
    const parsedTo = toParam ? new Date(`${toParam}T23:59:59.999`) : to;
    return { from, to: parsedTo, label: `${from.toISOString().slice(0, 10)}_to_${parsedTo.toISOString().slice(0, 10)}` };
  }

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const from = new Date(to.getTime() - days * 86400_000);
  return { from, to, label: `last_${days}_days` };
}

/** Stats bounded to the exact [from, to] window — unlike getOverviewStats(days), which is
 *  always anchored to "now", this is correct for an arbitrary historical range. */
export async function getReportOverview(range: ReportRange) {
  const { from, to } = range;

  const [visitors, sessions, leads, scrolledHalf, ctaClicks, durationAgg] = await Promise.all([
    prisma.visitor.count({ where: { firstSeenAt: { gte: from, lte: to } } }),
    prisma.session.count({ where: { startedAt: { gte: from, lte: to } } }),
    prisma.lead.count({ where: { createdAt: { gte: from, lte: to } } }),
    prisma.scrollEvent.groupBy({
      by: ["sessionId"],
      where: { depth: { gte: 50 }, createdAt: { gte: from, lte: to } },
    }),
    prisma.ctaEvent.count({ where: { action: "clicked", createdAt: { gte: from, lte: to } } }),
    prisma.session.aggregate({
      where: { startedAt: { gte: from, lte: to }, totalDuration: { not: null } },
      _avg: { totalDuration: true },
    }),
  ]);

  return {
    visitors,
    sessions,
    leads,
    conversionRate: sessions > 0 ? Math.round((leads / sessions) * 1000) / 10 : 0,
    scrolledHalf: scrolledHalf.length,
    ctaClicks,
    avgDurationSeconds: Math.round(durationAgg._avg.totalDuration ?? 0),
  };
}
