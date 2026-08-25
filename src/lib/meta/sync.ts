import "server-only";

import { prisma } from "@/lib/db";
import {
  exchangeForLongLivedToken,
  getInsights,
  listAdSets,
  listAds,
  listCampaigns,
  type MetaInsightRaw,
} from "./client";

const TOKEN_REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function num(value: string | undefined): number | null {
  if (value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function extractLeadResults(insight: MetaInsightRaw): number | null {
  const leadAction = insight.actions?.find((a) => a.action_type === "lead");
  return leadAction ? num(leadAction.value) : null;
}

function extractLandingPageViews(insight: MetaInsightRaw): number | null {
  const action = insight.actions?.find((a) => a.action_type === "landing_page_view");
  return action ? num(action.value) : null;
}

async function upsertInsights(
  level: "campaign" | "adset" | "ad",
  entityId: string,
  accessToken: string,
  fk: { campaignId?: string; adSetId?: string; adId?: string }
) {
  const insights = await getInsights(entityId, accessToken);

  for (const insight of insights) {
    const spend = num(insight.spend);
    const results = extractLeadResults(insight);
    await prisma.metaInsight.upsert({
      where: { level_entityId_date: { level, entityId, date: new Date(insight.date_start) } },
      update: {
        spend: spend ?? undefined,
        impressions: num(insight.impressions) ?? undefined,
        reach: num(insight.reach) ?? undefined,
        clicks: num(insight.clicks) ?? undefined,
        linkClicks: num(insight.inline_link_clicks) ?? undefined,
        landingPageViews: extractLandingPageViews(insight) ?? undefined,
        ctr: num(insight.ctr) ?? undefined,
        cpc: num(insight.cpc) ?? undefined,
        cpm: num(insight.cpm) ?? undefined,
        frequency: num(insight.frequency) ?? undefined,
        results: results ?? undefined,
        costPerResult: spend && results ? spend / results : undefined,
      },
      create: {
        level,
        entityId,
        date: new Date(insight.date_start),
        campaignId: fk.campaignId,
        adSetId: fk.adSetId,
        adId: fk.adId,
        spend,
        impressions: num(insight.impressions),
        reach: num(insight.reach),
        clicks: num(insight.clicks),
        linkClicks: num(insight.inline_link_clicks),
        landingPageViews: extractLandingPageViews(insight),
        ctr: num(insight.ctr),
        cpc: num(insight.cpc),
        cpm: num(insight.cpm),
        frequency: num(insight.frequency),
        results,
        costPerResult: spend && results ? spend / results : null,
      },
    });
  }
}

async function syncAccount(account: { id: string; accountId: string; accessToken: string | null; tokenExpiresAt: Date | null }) {
  let accessToken = account.accessToken;
  if (!accessToken) throw new Error("Account has no access token (disconnected)");

  if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() - Date.now() < TOKEN_REFRESH_WINDOW_MS) {
    const refreshed = await exchangeForLongLivedToken(accessToken);
    accessToken = refreshed.access_token;
    await prisma.metaAdAccount.update({
      where: { id: account.id },
      data: {
        accessToken,
        tokenExpiresAt: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000) : null,
      },
    });
  }

  const campaigns = await listCampaigns(account.accountId, accessToken);

  for (const c of campaigns) {
    const campaign = await prisma.campaign.upsert({
      where: { metaId: c.id },
      update: {
        name: c.name,
        status: c.status,
        objective: c.objective,
        dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : undefined,
        lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : undefined,
        startTime: c.start_time ? new Date(c.start_time) : undefined,
        stopTime: c.stop_time ? new Date(c.stop_time) : undefined,
      },
      create: {
        adAccountId: account.id,
        metaId: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective,
        dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : null,
        lifetimeBudget: c.lifetime_budget ? Number(c.lifetime_budget) / 100 : null,
        startTime: c.start_time ? new Date(c.start_time) : null,
        stopTime: c.stop_time ? new Date(c.stop_time) : null,
      },
    });

    await upsertInsights("campaign", campaign.metaId, accessToken, { campaignId: campaign.id });

    const adSets = await listAdSets(c.id, accessToken);
    for (const as of adSets) {
      const adSet = await prisma.adSet.upsert({
        where: { metaId: as.id },
        update: {
          name: as.name,
          status: as.status,
          dailyBudget: as.daily_budget ? Number(as.daily_budget) / 100 : undefined,
          lifetimeBudget: as.lifetime_budget ? Number(as.lifetime_budget) / 100 : undefined,
          optimizationGoal: as.optimization_goal,
          billingEvent: as.billing_event,
          targeting: (as.targeting as object | undefined) ?? undefined,
        },
        create: {
          campaignId: campaign.id,
          metaId: as.id,
          name: as.name,
          status: as.status,
          dailyBudget: as.daily_budget ? Number(as.daily_budget) / 100 : null,
          lifetimeBudget: as.lifetime_budget ? Number(as.lifetime_budget) / 100 : null,
          optimizationGoal: as.optimization_goal,
          billingEvent: as.billing_event,
          targeting: (as.targeting as object | undefined) ?? undefined,
        },
      });

      await upsertInsights("adset", adSet.metaId, accessToken, { adSetId: adSet.id });

      const ads = await listAds(as.id, accessToken);
      for (const ad of ads) {
        const adRow = await prisma.ad.upsert({
          where: { metaId: ad.id },
          update: {
            name: ad.name,
            status: ad.status,
            creativeId: ad.creative?.id,
            headline: ad.creative?.title,
            bodyText: ad.creative?.body,
            thumbnailUrl: ad.creative?.thumbnail_url,
            linkUrl: ad.creative?.object_url,
          },
          create: {
            adSetId: adSet.id,
            metaId: ad.id,
            name: ad.name,
            status: ad.status,
            creativeId: ad.creative?.id,
            headline: ad.creative?.title,
            bodyText: ad.creative?.body,
            thumbnailUrl: ad.creative?.thumbnail_url,
            linkUrl: ad.creative?.object_url,
          },
        });

        await upsertInsights("ad", adRow.metaId, accessToken, { adId: adRow.id });
      }
    }
  }
}

export async function syncAllMetaAdAccounts() {
  const accounts = await prisma.metaAdAccount.findMany({ where: { accessToken: { not: null } } });

  const results = await Promise.all(
    accounts.map(async (account) => {
      try {
        await syncAccount(account);
        await prisma.metaAdAccount.update({
          where: { id: account.id },
          data: { lastSyncedAt: new Date(), lastSyncError: null },
        });
        return { accountId: account.accountId, ok: true as const };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown sync error";
        await prisma.metaAdAccount.update({
          where: { id: account.id },
          data: { lastSyncError: message },
        });
        return { accountId: account.accountId, ok: false as const, error: message };
      }
    })
  );

  return { synced: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, results };
}
