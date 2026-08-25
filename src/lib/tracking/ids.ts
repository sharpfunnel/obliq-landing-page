import type { SessionEntryMeta } from "./types";

const VISITOR_KEY = "eb_vid";
const SESSION_KEY = "eb_sid";
const SESSION_META_KEY = "eb_smeta";

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // ignore storage failures (private browsing, quota, in-app webviews)
  }
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

/** Persistent across sessions (localStorage). Returns [id, isNew]. */
export function getOrCreateVisitorId(): [string, boolean] {
  const existing = safeGet(window.localStorage, VISITOR_KEY);
  if (existing) return [existing, false];
  const id = newId();
  safeSet(window.localStorage, VISITOR_KEY, id);
  return [id, true];
}

/** Per-tab (sessionStorage). Returns [id, isNew]. */
export function getOrCreateSessionId(): [string, boolean] {
  const existing = safeGet(window.sessionStorage, SESSION_KEY);
  if (existing) return [existing, false];
  const id = newId();
  safeSet(window.sessionStorage, SESSION_KEY, id);
  return [id, true];
}

/** Captures acquisition params once per session (first pageview only). */
export function getOrCreateSessionEntryMeta(): SessionEntryMeta {
  try {
    const existing = window.sessionStorage.getItem(SESSION_META_KEY);
    if (existing) return JSON.parse(existing) as SessionEntryMeta;
  } catch {
    // fall through and create fresh
  }

  const params = new URLSearchParams(window.location.search);
  const meta: SessionEntryMeta = {
    entryPath: window.location.pathname,
    referrer: document.referrer || "",
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content"),
    utmTerm: params.get("utm_term"),
    gclid: params.get("gclid"),
    fbclid: params.get("fbclid"),
    msclkid: params.get("msclkid"),
    placement: params.get("placement"),
    metaCampaignId: params.get("campaign_id"),
    metaAdsetId: params.get("adset_id"),
    metaAdId: params.get("ad_id"),
    rawParams: Object.fromEntries(params.entries()),
  };

  safeSet(window.sessionStorage, SESSION_META_KEY, JSON.stringify(meta));
  return meta;
}
