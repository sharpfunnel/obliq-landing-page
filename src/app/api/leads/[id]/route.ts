import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadDetailsSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = leadDetailsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { configuration, email, budget, message } = parsed.data;

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        configuration: configuration || undefined,
        email: email || undefined,
        budget: budget || undefined,
        message: message || undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
