import "server-only";

import { prisma } from "@/lib/db";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function getMetaAdAccounts() {
  return prisma.metaAdAccount.findMany({ orderBy: { connectedAt: "desc" } });
}

function sum(values: Array<number | null>): number {
  return values.reduce((acc: number, v) => acc + (v ?? 0), 0);
}

export async function getMetaSummaryStats(days = 30) {
  const since = daysAgo(days);

  const insights = await prisma.metaInsight.findMany({
    where: { level: "campaign", date: { gte: since } },
    select: { spend: true, impressions: true, clicks: true, results: true },
  });

  const spend = sum(insights.map((i) => i.spend));
  const impressions = sum(insights.map((i) => i.impressions));
  const clicks = sum(insights.map((i) => i.clicks));
  const metaLeads = sum(insights.map((i) => i.results));

  const [onSiteSessions, onSiteLeads] = await Promise.all([
    prisma.session.count({
      where: { startedAt: { gte: since }, OR: [{ utmSource: "meta" }, { fbclid: { not: null } }] },
    }),
    prisma.lead.count({
      where: {
        createdAt: { gte: since },
        session: { OR: [{ utmSource: "meta" }, { fbclid: { not: null } }] },
      },
    }),
  ]);

  return {
    spend: Math.round(spend * 100) / 100,
    impressions,
    clicks,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
    cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0,
    metaLeads,
    onSiteSessions,
    onSiteLeads,
    trueCostPerLead: onSiteLeads > 0 ? Math.round((spend / onSiteLeads) * 100) / 100 : null,
  };
}

export async function getCampaignPerformance(days = 30) {
  const since = daysAgo(days);

  const campaigns = await prisma.campaign.findMany({
    include: {
      insights: { where: { date: { gte: since } } },
      adAccount: { select: { name: true, currency: true } },
    },
    orderBy: { name: "asc" },
  });

  return Promise.all(
    campaigns.map(async (c) => {
      const spend = sum(c.insights.map((i) => i.spend));
      const impressions = sum(c.insights.map((i) => i.impressions));
      const clicks = sum(c.insights.map((i) => i.clicks));
      const results = sum(c.insights.map((i) => i.results));

      const sessionMatch = {
        OR: [{ metaCampaignId: c.metaId }, ...(c.name ? [{ utmCampaign: c.name }] : [])],
      };

      const [onSiteSessions, onSiteLeads] = await Promise.all([
        prisma.session.count({ where: { ...sessionMatch, startedAt: { gte: since } } }),
        prisma.lead.count({ where: { session: sessionMatch, createdAt: { gte: since } } }),
      ]);

      return {
        id: c.id,
        name: c.name,
        status: c.status,
        accountName: c.adAccount.name,
        currency: c.adAccount.currency ?? "INR",
        spend: Math.round(spend * 100) / 100,
        impressions,
        clicks,
        metaResults: results,
        onSiteSessions,
        onSiteLeads,
        trueCostPerLead: onSiteLeads > 0 ? Math.round((spend / onSiteLeads) * 100) / 100 : null,
      };
    })
  );
}

export async function getCampaignDetail(campaignId: string, days = 30) {
  const since = daysAgo(days);

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      adAccount: { select: { name: true, currency: true } },
      insights: { where: { date: { gte: since } } },
      adSets: {
        include: {
          insights: { where: { date: { gte: since } } },
          ads: { include: { insights: { where: { date: { gte: since } } } } },
        },
      },
    },
  });
  if (!campaign) return null;

  const adSets = campaign.adSets.map((as) => ({
    id: as.id,
    name: as.name,
    status: as.status,
    spend: Math.round(sum(as.insights.map((i) => i.spend)) * 100) / 100,
    impressions: sum(as.insights.map((i) => i.impressions)),
    clicks: sum(as.insights.map((i) => i.clicks)),
    results: sum(as.insights.map((i) => i.results)),
    ads: as.ads.map((ad) => {
      const spend = sum(ad.insights.map((i) => i.spend));
      const clicks = sum(ad.insights.map((i) => i.clicks));
      const impressions = sum(ad.insights.map((i) => i.impressions));
      const results = sum(ad.insights.map((i) => i.results));
      return {
        id: ad.id,
        name: ad.name,
        status: ad.status,
        headline: ad.headline,
        thumbnailUrl: ad.thumbnailUrl,
        spend: Math.round(spend * 100) / 100,
        impressions,
        clicks,
        ctr: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
        cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0,
        cpm: impressions > 0 ? Math.round((spend / (impressions / 1000)) * 100) / 100 : 0,
        results,
      };
    }),
  }));

  return {
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    objective: campaign.objective,
    accountName: campaign.adAccount.name,
    currency: campaign.adAccount.currency ?? "INR",
    spend: Math.round(sum(campaign.insights.map((i) => i.spend)) * 100) / 100,
    adSets,
  };
}
