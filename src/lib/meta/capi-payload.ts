import "server-only";
import { createHash } from "node:crypto";

export function graphVersion() {
  return process.env.META_GRAPH_API_VERSION || "v21.0";
}

export function eventsEndpoint(pixelId: string) {
  return `https://graph.facebook.com/${graphVersion()}/${pixelId}/events`;
}

/** Meta's rule: normalise first, then SHA-256 the result. */
export function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/** Lowercase, trim, strip all whitespace — for names, city, state, zip, country. */
function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * Normalises a phone number to E.164 digits, WITH country code and without '+'.
 * A 10-digit local number hashes to a value that can never match anything Meta
 * holds — the event is accepted but contributes nothing to match quality.
 */
export function normalizePhone(raw: string, defaultCountryCode: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length <= 10) {
    digits = `${defaultCountryCode}${digits}`;
  }

  return digits;
}

/**
 * Builds `fbc`. Prefer the real _fbc cookie — it carries the true click timestamp.
 * Only synthesise when the cookie is absent, anchored to the session start (never
 * "now", which would be wrong by however long the visitor took to convert).
 */
export function buildFbc(
  cookieFbc: string | null | undefined,
  fbclid: string | null | undefined,
  sessionStartedAt: Date | null | undefined
): string | undefined {
  if (cookieFbc) return cookieFbc;
  if (!fbclid) return undefined;
  return `fb.1.${(sessionStartedAt ?? new Date()).getTime()}.${fbclid}`;
}

export type LeadWithSession = {
  id: string;
  createdAt: Date;
  fullName: string;
  email: string | null;
  mobileNumber: string;
  source: string | null;
  session?: {
    startedAt: Date;
    fbclid: string | null;
    fbc: string | null;
    fbp: string | null;
    ipAddress: string | null;
    userAgent?: string | null;
    entryPath: string | null;
  } | null;
  visitor?: { city: string | null; region: string | null; country: string | null } | null;
};

export const CAPI_EVENT_TYPES = [
  "Lead",
  "Purchase",
  "Subscribe",
  "CompleteRegistration",
  "StartTrial",
] as const;
export type CapiEventType = (typeof CAPI_EVENT_TYPES)[number] | (string & {});

export function buildLeadUserData(lead: LeadWithSession, defaultCountryCode: string) {
  const userData: Record<string, unknown> = {};

  if (lead.email) userData.em = [sha256(lead.email)];

  const phone = normalizePhone(lead.mobileNumber, defaultCountryCode);
  if (phone) userData.ph = [sha256(phone)];

  const [firstName, ...rest] = lead.fullName.trim().split(/\s+/).filter(Boolean);
  if (firstName) userData.fn = [sha256(normalizeText(firstName))];
  if (rest.length) userData.ln = [sha256(normalizeText(rest.join(" ")))];

  if (lead.visitor?.city) userData.ct = [sha256(normalizeText(lead.visitor.city))];
  if (lead.visitor?.region) userData.st = [sha256(normalizeText(lead.visitor.region))];
  if (lead.visitor?.country) userData.country = [sha256(normalizeText(lead.visitor.country))];

  userData.external_id = [sha256(lead.id)];

  if (lead.session?.ipAddress) userData.client_ip_address = lead.session.ipAddress;
  if (lead.session?.userAgent) userData.client_user_agent = lead.session.userAgent;
  if (lead.session?.fbp) userData.fbp = lead.session.fbp;

  const fbc = buildFbc(lead.session?.fbc, lead.session?.fbclid, lead.session?.startedAt);
  if (fbc) userData.fbc = fbc;

  return userData;
}

export function buildLeadEventBody(
  lead: LeadWithSession,
  accessToken: string,
  opts: { defaultCountryCode: string; siteUrl?: string; testEventCode?: string | null }
) {
  const userData = buildLeadUserData(lead, opts.defaultCountryCode);

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(lead.createdAt.getTime() / 1000),
        action_source: "website",
        event_id: lead.id, // dedup key — must equal the browser's eventID
        event_source_url:
          opts.siteUrl && lead.session?.entryPath ? `${opts.siteUrl}${lead.session.entryPath}` : undefined,
        user_data: userData,
        custom_data: {
          value: 0,
          currency: "INR",
          lead_source: lead.source ?? undefined,
        },
      },
    ],
    access_token: accessToken,
  };

  if (opts.testEventCode) {
    body.test_event_code = opts.testEventCode;
  }

  return body;
}

export function buildManualEventBody(
  lead: LeadWithSession,
  accessToken: string,
  opts: {
    defaultCountryCode: string;
    siteUrl?: string;
    eventType: CapiEventType;
    value?: number;
    currency?: string;
    eventId?: string;
    testEventCode?: string | null;
  }
) {
  const userData = buildLeadUserData(lead, opts.defaultCountryCode);
  const eventId = opts.eventId?.trim() || lead.id;

  const customData: Record<string, unknown> = { lead_source: lead.source ?? undefined };
  if (opts.value !== undefined) customData.value = opts.value;
  if (opts.currency) customData.currency = opts.currency;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: opts.eventType,
        event_time: Math.floor(Date.now() / 1000), // manual sends fire "now", not at lead creation
        action_source: "website",
        event_id: eventId,
        event_source_url:
          opts.siteUrl && lead.session?.entryPath ? `${opts.siteUrl}${lead.session.entryPath}` : undefined,
        user_data: userData,
        custom_data: customData,
      },
    ],
    access_token: accessToken,
  };

  if (opts.testEventCode) {
    body.test_event_code = opts.testEventCode;
  }

  return body;
}
