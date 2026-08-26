import "server-only";

import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

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

export async function getLiveVisitorCount(): Promise<number> {
  const since = new Date(Date.now() - 90_000);
  return prisma.session.count({ where: { endedAt: null, updatedAt: { gte: since } } });
}

export async function getVisitorsByCountry(days = 30) {
  const since = daysAgo(days);

  const [visitorRows, leadRows] = await Promise.all([
    prisma.visitor.groupBy({
      by: ["country"],
      where: { firstSeenAt: { gte: since } },
      _count: { country: true },
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      select: { visitor: { select: { country: true } } },
    }),
  ]);

  const leadCounts = new Map<string, number>();
  for (const lead of leadRows) {
    const code = lead.visitor?.country ?? "UNKNOWN";
    leadCounts.set(code, (leadCounts.get(code) ?? 0) + 1);
  }

  return visitorRows
    .map((row) => {
      const code = row.country ?? "UNKNOWN";
      return { code, visitors: row._count.country, leads: leadCounts.get(code) ?? 0 };
    })
    .sort((a, b) => b.visitors - a.visitors);
}

export async function getOverviewBreakdowns(days = 30) {
  const since = daysAgo(days);

  const [deviceRows, browserRows, pageRows] = await Promise.all([
    prisma.visitor.groupBy({
      by: ["deviceType"],
      where: { firstSeenAt: { gte: since }, deviceType: { not: null } },
      _count: { deviceType: true },
    }),
    prisma.visitor.groupBy({
      by: ["browser"],
      where: { firstSeenAt: { gte: since }, browser: { not: null } },
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
      take: 5,
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { enteredAt: { gte: since } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
  ]);

  return {
    devices: deviceRows.map((r) => ({ label: r.deviceType as string, count: r._count.deviceType })),
    browsers: browserRows.map((r) => ({ label: r.browser as string, count: r._count.browser })),
    pages: pageRows.map((r) => ({ label: r.path, count: r._count.path })),
  };
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

export async function getLeadFilterOptions() {
  const [sources, countries, devices] = await Promise.all([
    prisma.session.findMany({ where: { utmSource: { not: null } }, distinct: ["utmSource"], select: { utmSource: true } }),
    prisma.visitor.findMany({ where: { country: { not: null } }, distinct: ["country"], select: { country: true } }),
    prisma.visitor.findMany({ where: { deviceType: { not: null } }, distinct: ["deviceType"], select: { deviceType: true } }),
  ]);
  return {
    sources: sources.map((s) => s.utmSource as string).sort(),
    countries: countries.map((c) => c.country as string).sort(),
    devices: devices.map((d) => d.deviceType as string).sort(),
  };
}

export type LeadFilters = {
  status?: string;
  search?: string;
  source?: string;
  country?: string;
  device?: string;
};

export async function getLeads(filters: LeadFilters = {}) {
  const { status, search, source, country, device } = filters;

  const and: Prisma.LeadWhereInput[] = [];
  if (status && status !== "all") and.push({ status });
  if (search) {
    and.push({
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { mobileNumber: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (source && source !== "all") {
    and.push({ OR: [{ session: { utmSource: source } }, { AND: [{ session: null }, { source }] }] });
  }
  if (country && country !== "all") and.push({ visitor: { country } });
  if (device && device !== "all") and.push({ visitor: { deviceType: device } });

  return prisma.lead.findMany({
    where: and.length > 0 ? { AND: and } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      mobileNumber: true,
      email: true,
      interestedIn: true,
      configuration: true,
      budget: true,
      message: true,
      source: true,
      status: true,
      createdAt: true,
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

export type SessionFilters = {
  days?: number;
  status?: "all" | "bounced" | "engaged";
  source?: string;
  country?: string;
  device?: string;
};

export async function getSessionStats(days = 30) {
  const since = daysAgo(days);
  const [total, converted, bounced, durationAgg] = await Promise.all([
    prisma.session.count({ where: { startedAt: { gte: since } } }),
    prisma.session.count({ where: { startedAt: { gte: since }, leads: { some: {} } } }),
    prisma.session.count({ where: { startedAt: { gte: since }, isBounce: true } }),
    prisma.session.aggregate({
      where: { startedAt: { gte: since }, totalDuration: { not: null } },
      _avg: { totalDuration: true },
    }),
  ]);
  return { total, converted, bounced, avgDurationSeconds: Math.round(durationAgg._avg.totalDuration ?? 0) };
}

export async function getSessions(filters: SessionFilters & { limit?: number } = {}) {
  const { days = 30, status, source, country, device, limit = 100 } = filters;
  const since = daysAgo(days);

  const and: Prisma.SessionWhereInput[] = [{ startedAt: { gte: since } }];
  if (status === "bounced") and.push({ isBounce: true });
  if (status === "engaged") and.push({ isBounce: false });
  if (source && source !== "all") and.push({ utmSource: source });
  if (country && country !== "all") and.push({ visitor: { country } });
  if (device && device !== "all") and.push({ visitor: { deviceType: device } });

  const sessions = await prisma.session.findMany({
    where: { AND: and },
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
      utmContent: true,
      utmCampaign: true,
      placement: true,
      ipAddress: true,
      mouseClickCount: true,
      mouseMoveCount: true,
      visitor: {
        select: {
          id: true,
          fingerprint: true,
          isReturning: true,
          deviceType: true,
          browser: true,
          browserVersion: true,
          os: true,
          osVersion: true,
          screenWidth: true,
          screenHeight: true,
          language: true,
          timezone: true,
          connectionType: true,
          connectionDownlink: true,
          city: true,
          region: true,
          country: true,
        },
      },
      _count: { select: { replays: true } },
    },
  });

  const sessionIds = sessions.map((s) => s.id);
  if (sessionIds.length === 0) return sessions.map((s) => ({ ...s, ...emptySessionAggregate() }));

  const [scrollAgg, formStarted, formSubmitted, ctaClicked] = await Promise.all([
    prisma.scrollEvent.groupBy({
      by: ["sessionId"],
      where: { sessionId: { in: sessionIds } },
      _max: { depth: true },
      _avg: { depth: true },
    }),
    prisma.formEvent.groupBy({
      by: ["sessionId"],
      where: { sessionId: { in: sessionIds }, action: "started" },
      _count: { action: true },
    }),
    prisma.formEvent.groupBy({
      by: ["sessionId"],
      where: { sessionId: { in: sessionIds }, action: "submitted" },
      _count: { action: true },
    }),
    prisma.ctaEvent.groupBy({
      by: ["sessionId"],
      where: { sessionId: { in: sessionIds }, action: "clicked" },
      _count: { action: true },
    }),
  ]);

  const scrollMap = new Map(scrollAgg.map((r) => [r.sessionId, r]));
  const startedMap = new Map(formStarted.map((r) => [r.sessionId, r._count.action]));
  const submittedMap = new Map(formSubmitted.map((r) => [r.sessionId, r._count.action]));
  const ctaMap = new Map(ctaClicked.map((r) => [r.sessionId, r._count.action]));

  return sessions.map((s) => ({
    ...s,
    maxScrollPct: scrollMap.get(s.id)?._max.depth ?? 0,
    avgScrollPct: Math.round(scrollMap.get(s.id)?._avg.depth ?? 0),
    formStartedCount: startedMap.get(s.id) ?? 0,
    formSubmittedCount: submittedMap.get(s.id) ?? 0,
    ctaClickedCount: ctaMap.get(s.id) ?? 0,
  }));
}

function emptySessionAggregate() {
  return { maxScrollPct: 0, avgScrollPct: 0, formStartedCount: 0, formSubmittedCount: 0, ctaClickedCount: 0 };
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

export async function getSessionDetail(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
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
      ipAddress: true,
      userAgent: true,
      viewportWidth: true,
      viewportHeight: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmContent: true,
      utmTerm: true,
      placement: true,
      gclid: true,
      fbclid: true,
      metaAdId: true,
      visitor: {
        select: {
          id: true,
          fingerprint: true,
          isReturning: true,
          deviceType: true,
          browser: true,
          browserVersion: true,
          os: true,
          osVersion: true,
          screenWidth: true,
          screenHeight: true,
          language: true,
          timezone: true,
          connectionType: true,
          connectionDownlink: true,
          city: true,
          region: true,
          country: true,
        },
      },
      pageViews: { orderBy: { enteredAt: "asc" }, select: { path: true, enteredAt: true, timeOnPage: true } },
      _count: { select: { replays: true } },
    },
  });
  if (!session) return null;

  const [scrollAgg, mouseCount, ctaClicks, formStarted, formSubmitted] = await Promise.all([
    prisma.scrollEvent.aggregate({ where: { sessionId }, _max: { depth: true }, _avg: { depth: true } }),
    prisma.mouseEvent.count({ where: { sessionId } }),
    prisma.ctaEvent.count({ where: { sessionId, action: "clicked" } }),
    prisma.formEvent.count({ where: { sessionId, action: "started" } }),
    prisma.formEvent.count({ where: { sessionId, action: "submitted" } }),
  ]);

  return {
    session,
    maxScrollPct: scrollAgg._max.depth ?? 0,
    avgScrollPct: Math.round(scrollAgg._avg.depth ?? 0),
    mouseEventCount: mouseCount,
    ctaClicks,
    formStarted: formStarted > 0,
    formSubmitted: formSubmitted > 0,
  };
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
        { key: "adClicks", label: "Ad clicks", count: 0 },
        { key: "pageViews", label: "Page views", count: 0 },
        { key: "scrolled", label: "Scrolled 25%+", count: 0 },
        { key: "ctaClick", label: "CTA click", count: 0 },
        { key: "formStart", label: "Form start", count: 0 },
        { key: "leadSubmit", label: "Lead submit", count: 0 },
      ],
    };
  }

  const [pageViews, scrolled, ctaClick, formStart, leadSubmit] = await Promise.all([
    prisma.pageView.count({ where: { sessionId: { in: sessionIds } } }),
    prisma.scrollEvent.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds }, depth: { gte: 25 } } }),
    prisma.ctaEvent.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds }, action: "clicked" } }),
    prisma.formEvent.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds }, action: "started" } }),
    prisma.lead.groupBy({ by: ["sessionId"], where: { sessionId: { in: sessionIds } } }),
  ]);

  const stages = [
    { key: "adClicks", label: "Ad clicks", count: sessionIds.length },
    { key: "pageViews", label: "Page views", count: pageViews },
    { key: "scrolled", label: "Scrolled 25%+", count: scrolled.length },
    { key: "ctaClick", label: "CTA click", count: ctaClick.length },
    { key: "formStart", label: "Form start", count: formStart.length },
    { key: "leadSubmit", label: "Lead submit", count: leadSubmit.length },
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

function toSlices<T extends string>(rows: Array<{ label: T | null; count: number }>, limit = 8) {
  return rows
    .filter((r): r is { label: T; count: number } => Boolean(r.label))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTechStackStats(days = 30) {
  const since = daysAgo(days);
  const where = { firstSeenAt: { gte: since } };

  const [deviceRows, browserRows, osRows, browserVersionRows, osVersionRows, resolutionRows, languageRows, connectionRows, viewportRows] =
    await Promise.all([
      prisma.visitor.groupBy({ by: ["deviceType"], where, _count: { deviceType: true } }),
      prisma.visitor.groupBy({ by: ["browser"], where, _count: { browser: true } }),
      prisma.visitor.groupBy({ by: ["os"], where, _count: { os: true } }),
      prisma.visitor.groupBy({ by: ["browser", "browserVersion"], where, _count: { browserVersion: true } }),
      prisma.visitor.groupBy({ by: ["os", "osVersion"], where, _count: { osVersion: true } }),
      prisma.visitor.groupBy({ by: ["screenWidth", "screenHeight"], where, _count: { screenWidth: true } }),
      prisma.visitor.groupBy({ by: ["language"], where, _count: { language: true } }),
      prisma.visitor.groupBy({ by: ["connectionType"], where, _count: { connectionType: true } }),
      prisma.session.groupBy({
        by: ["viewportWidth", "viewportHeight"],
        where: { startedAt: { gte: since } },
        _count: { viewportWidth: true },
      }),
    ]);

  const [cohortSessions, cohortLeads] = await Promise.all([
    prisma.session.findMany({
      where: { startedAt: { gte: since } },
      select: { isBounce: true, visitor: { select: { browser: true, os: true } } },
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: since } },
      select: { visitor: { select: { browser: true, os: true } } },
    }),
  ]);

  function cohortBy(key: "browser" | "os") {
    const map = new Map<string, { label: string; sessions: number; bounced: number; leads: number }>();
    for (const s of cohortSessions) {
      const label = s.visitor[key];
      if (!label) continue;
      const entry = map.get(label) ?? { label, sessions: 0, bounced: 0, leads: 0 };
      entry.sessions += 1;
      if (s.isBounce) entry.bounced += 1;
      map.set(label, entry);
    }
    for (const l of cohortLeads) {
      const label = l.visitor?.[key];
      if (!label) continue;
      const entry = map.get(label);
      if (entry) entry.leads += 1;
    }
    return Array.from(map.values())
      .map((e) => ({
        ...e,
        bouncePct: e.sessions > 0 ? Math.round((e.bounced / e.sessions) * 1000) / 10 : 0,
        conversionPct: e.sessions > 0 ? Math.round((e.leads / e.sessions) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }

  return {
    totalSessions: cohortSessions.length,
    devices: toSlices(deviceRows.map((r) => ({ label: r.deviceType, count: r._count.deviceType }))),
    browsers: toSlices(browserRows.map((r) => ({ label: r.browser, count: r._count.browser }))),
    os: toSlices(osRows.map((r) => ({ label: r.os, count: r._count.os }))),
    browserVersions: toSlices(
      browserVersionRows.map((r) => ({
        label: r.browser && r.browserVersion ? `${r.browser} ${r.browserVersion}` : r.browser,
        count: r._count.browserVersion,
      }))
    ),
    osVersions: toSlices(
      osVersionRows.map((r) => ({
        label: r.os && r.osVersion ? `${r.os} ${r.osVersion}` : r.os,
        count: r._count.osVersion,
      }))
    ),
    resolutions: toSlices(
      resolutionRows.map((r) => ({
        label: r.screenWidth && r.screenHeight ? `${r.screenWidth}x${r.screenHeight}` : null,
        count: r._count.screenWidth,
      }))
    ),
    viewports: toSlices(
      viewportRows.map((r) => ({
        label: r.viewportWidth && r.viewportHeight ? `${r.viewportWidth}x${r.viewportHeight}` : null,
        count: r._count.viewportWidth,
      }))
    ),
    languages: toSlices(languageRows.map((r) => ({ label: r.language, count: r._count.language }))),
    connections: toSlices(connectionRows.map((r) => ({ label: r.connectionType, count: r._count.connectionType }))),
    cohortByBrowser: cohortBy("browser"),
    cohortByOs: cohortBy("os"),
  };
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
