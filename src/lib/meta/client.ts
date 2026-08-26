import "server-only";

const GRAPH_BASE = "https://graph.facebook.com";

export function graphVersion() {
  return process.env.META_GRAPH_API_VERSION || "v21.0";
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set.`);
  return value;
}

export function buildOAuthDialogUrl(state: string): string {
  const appId = requireEnv("META_APP_ID");
  const redirectUri = requireEnv("META_REDIRECT_URI");
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: "ads_read,ads_management,business_management",
  });
  return `https://www.facebook.com/${graphVersion()}/dialog/oauth?${params.toString()}`;
}

async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH_BASE}/${graphVersion()}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Graph API request failed: ${res.status}`);
  }
  return json as T;
}

export async function exchangeCodeForToken(code: string): Promise<{ access_token: string; expires_in?: number }> {
  return graphGet("/oauth/access_token", {
    client_id: requireEnv("META_APP_ID"),
    client_secret: requireEnv("META_APP_SECRET"),
    redirect_uri: requireEnv("META_REDIRECT_URI"),
    code,
  });
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; expires_in?: number }> {
  return graphGet("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: requireEnv("META_APP_ID"),
    client_secret: requireEnv("META_APP_SECRET"),
    fb_exchange_token: shortLivedToken,
  });
}

export type MetaAdAccountSummary = { id: string; account_id: string; name: string; currency: string; timezone_name: string };

export async function listAdAccounts(accessToken: string): Promise<MetaAdAccountSummary[]> {
  const res = await graphGet<{ data: MetaAdAccountSummary[] }>("/me/adaccounts", {
    fields: "id,account_id,name,currency,timezone_name",
    access_token: accessToken,
  });
  return res.data;
}

export type MetaCampaignRaw = {
  id: string;
  name: string;
  status?: string;
  objective?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
};

export async function listCampaigns(adAccountId: string, accessToken: string): Promise<MetaCampaignRaw[]> {
  const res = await graphGet<{ data: MetaCampaignRaw[] }>(`/${adAccountId}/campaigns`, {
    fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
    limit: "200",
    access_token: accessToken,
  });
  return res.data;
}

export type MetaAdSetRaw = {
  id: string;
  name: string;
  status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
  billing_event?: string;
  targeting?: unknown;
};

export async function listAdSets(campaignId: string, accessToken: string): Promise<MetaAdSetRaw[]> {
  const res = await graphGet<{ data: MetaAdSetRaw[] }>(`/${campaignId}/adsets`, {
    fields: "id,name,status,daily_budget,lifetime_budget,optimization_goal,billing_event,targeting",
    limit: "200",
    access_token: accessToken,
  });
  return res.data;
}

export type MetaAdRaw = {
  id: string;
  name: string;
  status?: string;
  creative?: { id?: string; title?: string; body?: string; thumbnail_url?: string; object_url?: string };
};

export async function listAds(adSetId: string, accessToken: string): Promise<MetaAdRaw[]> {
  const res = await graphGet<{ data: MetaAdRaw[] }>(`/${adSetId}/ads`, {
    fields: "id,name,status,creative{id,title,body,thumbnail_url,object_url}",
    limit: "200",
    access_token: accessToken,
  });
  return res.data;
}

export type MetaInsightRaw = {
  date_start: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  inline_link_clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  frequency?: string;
  video_thruplay_watched_actions?: Array<{ value: string }>;
  actions?: Array<{ action_type: string; value: string }>;
};

export async function getInsights(
  entityId: string,
  accessToken: string,
  datePreset = "last_30d"
): Promise<MetaInsightRaw[]> {
  const res = await graphGet<{ data: MetaInsightRaw[] }>(`/${entityId}/insights`, {
    fields:
      "spend,impressions,reach,clicks,inline_link_clicks,ctr,cpc,cpm,frequency,actions,video_thruplay_watched_actions",
    date_preset: datePreset,
    time_increment: "1",
    limit: "31",
    access_token: accessToken,
  });
  return res.data;
}
