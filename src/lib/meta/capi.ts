import "server-only";

import { prisma } from "@/lib/db";
import {
  buildLeadEventBody,
  buildManualEventBody,
  eventsEndpoint,
  type CapiEventType,
  type LeadWithSession,
} from "./capi-payload";

const DEFAULT_COUNTRY_CODE = "91"; // India

/**
 * Sends a server-side "Lead" event for a newly created Lead row.
 *
 * A CAPI failure must NEVER fail the lead submission — the visitor's form
 * succeeded, and an ad-reporting problem is not their problem. Callers invoke
 * this fire-and-forget; every failure path records itself on the row instead.
 */
export async function sendLeadConversionEvent(lead: LeadWithSession) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  try {
    const body = buildLeadEventBody(lead, accessToken, {
      defaultCountryCode: DEFAULT_COUNTRY_CODE,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    });

    const res = await fetch(eventsEndpoint(pixelId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      await prisma.lead.update({
        where: { id: lead.id },
        data: { metaCapiError: `HTTP ${res.status}: ${text.slice(0, 500)}` },
      });
      return;
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: { metaCapiSentAt: new Date(), metaCapiError: null },
    });
  } catch (error) {
    await prisma.lead
      .update({
        where: { id: lead.id },
        data: { metaCapiError: error instanceof Error ? error.message : "Unknown CAPI error" },
      })
      .catch(() => {});
  }
}

export type ManualCapiOptions = {
  eventType: CapiEventType;
  value?: number;
  currency?: string;
  eventId?: string;
};

export type ManualCapiResult =
  | { ok: true; eventId: string; fbtraceId?: string; eventsReceived?: number; preview?: boolean }
  | { ok: false; error: string };

/** Manual/admin-triggered send — used by the leads table's "Resend" action. */
export async function sendManualConversionEvent(
  leadId: string,
  options: ManualCapiOptions
): Promise<ManualCapiResult> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      createdAt: true,
      fullName: true,
      email: true,
      mobileNumber: true,
      source: true,
      session: {
        select: {
          startedAt: true,
          fbclid: true,
          fbc: true,
          fbp: true,
          ipAddress: true,
          userAgent: true,
          entryPath: true,
        },
      },
      visitor: { select: { city: true, region: true, country: true } },
    },
  });
  if (!lead) return { ok: false, error: "Lead not found" };

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if ((!pixelId || !accessToken) && process.env.NODE_ENV !== "production") {
    // Lets the send UI be reviewed before real Meta credentials exist. Never
    // touches metaCapiSentAt/metaCapiError, and never runs in production.
    return { ok: true, eventId: `evt_preview_${Date.now()}`, preview: true };
  }

  if (!pixelId || !accessToken) {
    return { ok: false, error: "Meta CAPI is not configured (META_PIXEL_ID / META_CAPI_ACCESS_TOKEN)." };
  }

  const eventId = options.eventId?.trim() || lead.id;

  try {
    const body = buildManualEventBody(lead, accessToken, {
      defaultCountryCode: DEFAULT_COUNTRY_CODE,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      eventType: options.eventType,
      value: options.value,
      currency: options.currency,
      eventId,
    });

    const res = await fetch(eventsEndpoint(pixelId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => null)) as
      | { events_received?: number; fbtrace_id?: string; error?: { message?: string } }
      | null;

    if (!res.ok) {
      const message = json?.error?.message ?? `HTTP ${res.status}`;
      await prisma.lead.update({ where: { id: leadId }, data: { metaCapiError: message.slice(0, 500) } });
      return { ok: false, error: message };
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { metaCapiSentAt: new Date(), metaCapiError: null },
    });

    return {
      ok: true,
      eventId,
      fbtraceId: json?.fbtrace_id,
      eventsReceived: json?.events_received,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CAPI error";
    await prisma.lead.update({ where: { id: leadId }, data: { metaCapiError: message } }).catch(() => {});
    return { ok: false, error: message };
  }
}
