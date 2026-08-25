import "server-only";

import { prisma } from "@/lib/db";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function getOverviewStats(days = 30) {
  const since = daysAgo(days);
  const prevSince = daysAgo(days * 2);

  const [
    visitors,
    prevVisitors,
    sessions,
    prevSessions,
    leads,
    prevLeads,
    scrolledHalf,
    ctaClicks,
    durationAgg,
  ] = await Promise.all([
    prisma.visitor.count({ where: { firstSeenAt: { gte: since } } }),
    prisma.visitor.count({ where: { firstSeenAt: { gte: prevSince, lt: since } } }),
    prisma.session.count({ where: { startedAt: { gte: since } } }),
    prisma.session.count({ where: { startedAt: { gte: prevSince, lt: since } } }),
    prisma.lead.count({ where: { createdAt: { gte: since } } }),
    prisma.lead.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
    prisma.scrollEvent.groupBy({
      by: ["sessionId"],
      where: { depth: { gte: 50 }, createdAt: { gte: since } },
    }),
    prisma.ctaEvent.count({ where: { action: "clicked", createdAt: { gte: since } } }),
    prisma.session.aggregate({
      where: { startedAt: { gte: since }, totalDuration: { not: null } },
      _avg: { totalDuration: true },
    }),
  ]);

  const conversionRate = sessions > 0 ? Math.round((leads / sessions) * 1000) / 10 : 0;
  const prevConversionRate = prevSessions > 0 ? Math.round((prevLeads / prevSessions) * 1000) / 10 : 0;

  return {
    visitors,
    visitorsChange: pctChange(visitors, prevVisitors),
    sessions,
    sessionsChange: pctChange(sessions, prevSessions),
    leads,
    leadsChange: pctChange(leads, prevLeads),
    conversionRate,
    conversionRateChange: pctChange(conversionRate, prevConversionRate),
    scrolledHalf: scrolledHalf.length,
    ctaClicks,
    avgDurationSeconds: Math.round(durationAgg._avg.totalDuration ?? 0),
  };
}

export async function getDailyTimeSeries(days = 30) {
  const since = daysAgo(days);

  const [visitors, sessions, leads] = await Promise.all([
    prisma.visitor.findMany({ where: { firstSeenAt: { gte: since } }, select: { firstSeenAt: true } }),
    prisma.session.findMany({ where: { startedAt: { gte: since } }, select: { startedAt: true } }),
    prisma.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
  ]);

  const buckets = new Map<string, { date: string; visitors: number; sessions: number; leads: number }>();
  for (let i = 0; i < days; i++) {
    const d = daysAgo(days - 1 - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, visitors: 0, sessions: 0, leads: 0 });
  }

  const bump = (date: Date, field: "visitors" | "sessions" | "leads") => {
    const key = date.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) bucket[field] += 1;
  };

  visitors.forEach((v) => bump(v.firstSeenAt, "visitors"));
  sessions.forEach((s) => bump(s.startedAt, "sessions"));
  leads.forEach((l) => bump(l.createdAt, "leads"));

  return Array.from(buckets.values());
}

export async function getTrafficSources(days = 30) {
  const since = daysAgo(days);

  const sessions = await prisma.session.findMany({
    where: { startedAt: { gte: since } },
    select: { id: true, utmSource: true, utmMedium: true, utmCampaign: true, referrer: true },
  });

  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: since }, sessionId: { not: null } },
    select: { sessionId: true },
  });
  const leadSessionIds = new Set(leads.map((l) => l.sessionId));

  type Row = { source: string; medium: string; campaign: string; sessions: number; leads: number };
  const map = new Map<string, Row>();

  for (const s of sessions) {
    let source = s.utmSource;
    if (!source) {
      if (s.referrer) {
        try {
          source = new URL(s.referrer).hostname.replace(/^www\./, "");
        } catch {
          source = "referral";
        }
      } else {
        source = "direct";
      }
    }
    const medium = s.utmMedium ?? (s.utmSource ? "unknown" : s.referrer ? "referral" : "none");
    const campaign = s.utmCampaign ?? "—";
    const key = `${source}::${medium}::${campaign}`;

    const row = map.get(key) ?? { source, medium, campaign, sessions: 0, leads: 0 };
    row.sessions += 1;
    if (leadSessionIds.has(s.id)) row.leads += 1;
    map.set(key, row);
  }

  return Array.from(map.values()).sort((a, b) => b.sessions - a.sessions);
}

export async function getRecentLeads(limit = 5) {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      fullName: true,
      mobileNumber: true,
      status: true,
      source: true,
      createdAt: true,
      session: { select: { utmSource: true, utmMedium: true, utmCampaign: true } },
    },
  });
}

export async function getLeads(status?: string) {
  return prisma.lead.findMany({
    where: status && status !== "all" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      mobileNumber: true,
      email: true,
      configuration: true,
      budget: true,
      message: true,
      source: true,
      status: true,
      createdAt: true,
      metaCapiSentAt: true,
      metaCapiError: true,
      visitor: { select: { city: true, country: true, deviceType: true } },
      session: {
        select: {
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
          utmTerm: true,
          placement: true,
          metaAdId: true,
          rawParams: true,
        },
      },
    },
  });
}

export async function getSessions(limit = 100) {
  return prisma.session.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
    select: {
      id: true,
      clientId: true,
      startedAt: true,
      endedAt: true,
      totalDuration: true,
      isBounce: true,
      pagesViewed: true,
      entryPath: true,
      exitPath: true,
      referrer: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      ipAddress: true,
      visitor: {
        select: {
          fingerprint: true,
          isReturning: true,
          deviceType: true,
          browser: true,
          os: true,
          city: true,
          region: true,
          country: true,
        },
      },
      _count: { select: { replays: true } },
    },
  });
}

export async function getSessionReplayMeta(sessionId: string) {
  return prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      startedAt: true,
      entryPath: true,
      visitor: { select: { browser: true, os: true, deviceType: true, city: true, country: true } },
      replays: { orderBy: { seq: "asc" }, select: { data: true, eventCount: true } },
    },
  });
}

export async function getHeatmapPaths() {
  const rows = await prisma.heatmapEvent.groupBy({
    by: ["path"],
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
  });
  return rows.map((r) => ({ path: r.path, count: r._count.path }));
}

export async function getHeatmapPoints(path: string, type: "click" | "hover" = "click", limit = 3000) {
  return prisma.heatmapEvent.findMany({
    where: { path, type },
    select: { xPct: true, yPct: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFunnelStats(days = 30, source: "all" | "meta" = "all") {
  const since = daysAgo(days);
  const sessionFilter =
    source === "meta"
      ? { startedAt: { gte: since }, OR: [{ utmSource: "meta" }, { fbclid: { not: null } }] }
      : { startedAt: { gte: since } };

  const sessionIds = (
    await prisma.session.findMany({ where: sessionFilter, select: { id: true } })
  ).map((s) => s.id);

  if (sessionIds.length === 0) {
    return {
      stages: [
        { key: "sessions", label: "Sessions", count: 0 },
        { key: "scrolled", label: "Scrolled 25%+", count: 0 },
        { key: "ctaClick", label: "CTA Click", count: 0 },
        { key: "formStart", label: "Form Started", count: 0 },
        { key: "leadSubmit", label: "Lead Submitted", count: 0 },
      ],
    };
  }

  const [scrolled, ctaClick, formStart, leadSubmit] = await Promise.all([
    prisma.scrollEvent.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds }, depth: { gte: 25 } } }),
    prisma.ctaEvent.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds }, action: "clicked" } }),
    prisma.formEvent.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds }, action: "started" } }),
    prisma.lead.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds } } }),
  ]);

  const stages = [
    { key: "sessions", label: "Sessions", count: sessionIds.length },
    { key: "scrolled", label: "Scrolled 25%+", count: scrolled.length },
    { key: "ctaClick", label: "CTA Click", count: ctaClick.length },
    { key: "formStart", label: "Form Started", count: formStart.length },
    { key: "leadSubmit", label: "Lead Submitted", count: leadSubmit.length },
  ];

  return { stages };
}

export async function getCtaStats(days = 30) {
  const since = daysAgo(days);
  const rows = await prisma.ctaEvent.groupBy({
    by: ["ctaId", "action"],
    where: { createdAt: { gte: since } },
    _count: { action: true },
  });

  const map = new Map<string, { ctaId: string; viewed: number; hovered: number; clicked: number }>();
  for (const row of rows) {
    const entry = map.get(row.ctaId) ?? { ctaId: row.ctaId, viewed: 0, hovered: 0, clicked: 0 };
    if (row.action === "viewed") entry.viewed = row._count.action;
    if (row.action === "hovered") entry.hovered = row._count.action;
    if (row.action === "clicked") entry.clicked = row._count.action;
    map.set(row.ctaId, entry);
  }

  return Array.from(map.values())
    .map((r) => ({ ...r, ctr: r.viewed > 0 ? Math.round((r.clicked / r.viewed) * 1000) / 10 : 0 }))
    .sort((a, b) => b.clicked - a.clicked);
}

export async function getFormStats(days = 30) {
  const since = daysAgo(days);
  const rows = await prisma.formEvent.groupBy({
    by: ["formId", "action"],
    where: { createdAt: { gte: since } },
    _count: { action: true },
  });

  const map = new Map<
    string,
    { formId: string; viewed: number; started: number; submitted: number; abandoned: number; validationErrors: number }
  >();
  for (const row of rows) {
    const entry =
      map.get(row.formId) ?? {
        formId: row.formId,
        viewed: 0,
        started: 0,
        submitted: 0,
        abandoned: 0,
        validationErrors: 0,
      };
    if (row.action === "viewed") entry.viewed = row._count.action;
    if (row.action === "started") entry.started = row._count.action;
    if (row.action === "submitted") entry.submitted = row._count.action;
    if (row.action === "abandoned") entry.abandoned = row._count.action;
    if (row.action === "validation_error") entry.validationErrors = row._count.action;
    map.set(row.formId, entry);
  }

  return Array.from(map.values()).map((r) => ({
    ...r,
    completionRate: r.started > 0 ? Math.round((r.submitted / r.started) * 1000) / 10 : 0,
  }));
}

export async function getPerformanceStats(days = 30) {
  const since = daysAgo(days);
  const metrics = ["LCP", "INP", "CLS", "FCP", "TTFB"] as const;

  const results = await Promise.all(
    metrics.map(async (metric) => {
      const [agg, good, needsImprovement, poor] = await Promise.all([
        prisma.performanceMetric.aggregate({
          where: { metric, createdAt: { gte: since } },
          _avg: { value: true },
          _count: { value: true },
        }),
        prisma.performanceMetric.count({ where: { metric, rating: "good", createdAt: { gte: since } } }),
        prisma.performanceMetric.count({ where: { metric, rating: "needs-improvement", createdAt: { gte: since } } }),
        prisma.performanceMetric.count({ where: { metric, rating: "poor", createdAt: { gte: since } } }),
      ]);
      return {
        metric,
        avg: agg._avg.value ?? null,
        sampleCount: agg._count.value,
        good,
        needsImprovement,
        poor,
      };
    })
  );

  return results;
}

export async function getErrors(limit = 100) {
  return prisma.errorEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      message: true,
      stack: true,
      path: true,
      createdAt: true,
      sessionId: true,
    },
  });
}
