import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadFormSchema } from "@/lib/validation";
import { upsertVisitorAndSession } from "@/lib/tracking/server";
import { sendLeadConversionEvent } from "@/lib/meta/capi";
import { notifyTelegramNewLead } from "@/lib/telegram";
import { runBackground } from "@/lib/runtime/background";
import type { TrackInitPayload } from "@/lib/tracking/types";

export async function POST(request: NextRequest) {
  let body: { init?: TrackInitPayload; source?: string; formId?: string } & Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = leadFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  // Session/visitor linking is best-effort — a tracking hiccup must never cost a lead.
  // (See docs/lead-submission-fix.md: an unhandled exception here previously dropped
  // otherwise-valid leads submitted from Meta's in-app browser.)
  let visitorId: string | undefined;
  let sessionId: string | undefined;
  if (body.init?.visitorId && body.init?.sessionId) {
    try {
      const { visitor, session } = await upsertVisitorAndSession(request, body.init);
      visitorId = visitor.id;
      sessionId = session.id;
    } catch (error) {
      console.error("Failed to upsert visitor/session for lead:", error);
    }
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        fullName: parsed.data.fullName,
        mobileNumber: parsed.data.mobileNumber,
        interestedIn: parsed.data.interestedIn,
        visitorId,
        sessionId,
        formId: typeof body.formId === "string" ? body.formId : undefined,
        source: typeof body.source === "string" ? body.source : undefined,
      },
      include: {
        session: {
          select: {
            startedAt: true,
            fbclid: true,
            fbc: true,
            fbp: true,
            ipAddress: true,
            userAgent: true,
            entryPath: true,
            utmSource: true,
            utmCampaign: true,
          },
        },
        visitor: { select: { city: true, region: true, country: true } },
      },
    });

    runBackground(sendLeadConversionEvent(lead));
    runBackground(
      notifyTelegramNewLead({
        fullName: lead.fullName,
        mobileNumber: lead.mobileNumber,
        source: lead.source,
        interestedIn: lead.interestedIn,
        configuration: lead.configuration,
        budget: lead.budget,
        message: lead.message,
        city: lead.visitor?.city,
        country: lead.visitor?.country,
        utmSource: lead.session?.utmSource,
        utmCampaign: lead.session?.utmCampaign,
      })
    );

    return NextResponse.json({ leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
