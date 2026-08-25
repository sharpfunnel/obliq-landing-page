import "server-only";

import { geolocation, ipAddress } from "@vercel/functions";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { TrackInitPayload } from "./types";

const MAX_RAW_PARAMS = 50;
const MAX_RAW_PARAM_LENGTH = 500;

export function sanitizeRawParams(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string")
    .slice(0, MAX_RAW_PARAMS)
    .map(([key, val]) => [key.slice(0, MAX_RAW_PARAM_LENGTH), val.slice(0, MAX_RAW_PARAM_LENGTH)]);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function resolveClientContext(request: Request) {
  const ip = ipAddress(request) ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const geo = geolocation(request);
  const userAgent = request.headers.get("user-agent");
  return { ip, geo, userAgent };
}

export function readMetaCookies(request: Request): { fbp?: string; fbc?: string } {
  const header = request.headers.get("cookie") ?? "";
  const jar = Object.fromEntries(
    header
      .split(";")
      .filter(Boolean)
      .map((part) => {
        const [name, ...rest] = part.trim().split("=");
        return [name, decodeURIComponent(rest.join("="))];
      })
  );
  return { fbp: jar._fbp || undefined, fbc: jar._fbc || undefined };
}

/** Upserts the Visitor row, tolerating a concurrent insert of the same fingerprint. */
export async function upsertVisitor(request: Request, init: TrackInitPayload) {
  const { geo } = resolveClientContext(request);
  const { device } = init;

  try {
    return await prisma.visitor.upsert({
      where: { fingerprint: init.visitorId },
      update: {
        isReturning: true,
        country: geo.country ?? undefined,
        region: geo.countryRegion ?? undefined,
        city: geo.city ?? undefined,
      },
      create: {
        fingerprint: init.visitorId,
        isReturning: !init.isNewVisitor,
        country: geo.country ?? null,
        region: geo.countryRegion ?? null,
        city: geo.city ?? null,
        timezone: device.timezone,
        language: device.language,
        browser: device.browser,
        browserVersion: device.browserVersion,
        os: device.os,
        deviceType: device.deviceType,
        screenWidth: device.screenWidth,
        screenHeight: device.screenHeight,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await prisma.visitor.findUnique({ where: { fingerprint: init.visitorId } });
      if (existing) return existing;
    }
    throw error;
  }
}

/** Finds-or-creates the Session row, tolerating a concurrent insert of the same clientId. */
export async function upsertVisitorAndSession(request: Request, init: TrackInitPayload) {
  const visitor = await upsertVisitor(request, init);
  const { ip, userAgent } = resolveClientContext(request);
  const { fbp, fbc } = readMetaCookies(request);
  const rawParams = sanitizeRawParams(init.entryMeta.rawParams);

  const existing = await prisma.session.findUnique({ where: { clientId: init.sessionId } });
  if (existing) return { visitor, session: existing };

  try {
    const session = await prisma.session.create({
      data: {
        clientId: init.sessionId,
        visitorId: visitor.id,
        entryPath: init.entryMeta.entryPath,
        referrer: init.entryMeta.referrer || null,
        utmSource: init.entryMeta.utmSource,
        utmMedium: init.entryMeta.utmMedium,
        utmCampaign: init.entryMeta.utmCampaign,
        utmContent: init.entryMeta.utmContent,
        utmTerm: init.entryMeta.utmTerm,
        gclid: init.entryMeta.gclid,
        fbclid: init.entryMeta.fbclid,
        msclkid: init.entryMeta.msclkid,
        placement: init.entryMeta.placement,
        metaCampaignId: init.entryMeta.metaCampaignId,
        metaAdsetId: init.entryMeta.metaAdsetId,
        metaAdId: init.entryMeta.metaAdId,
        fbc: fbc ?? null,
        fbp: fbp ?? null,
        rawParams: rawParams as Prisma.InputJsonValue | undefined,
        ipAddress: ip,
        userAgent,
        viewportWidth: init.viewportWidth,
        viewportHeight: init.viewportHeight,
      },
    });
    return { visitor, session };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.session.findUnique({ where: { clientId: init.sessionId } });
      if (raced) return { visitor, session: raced };
    }
    throw error;
  }
}
