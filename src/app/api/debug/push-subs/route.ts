import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireUser();
    const suscripciones = await prisma.pushSubscription.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      ok: true,
      userId: user.id,
      count: suscripciones.length,
      subscriptions: suscripciones.map((s) => ({
        id: s.id,
        endpoint: s.endpoint.substring(0, 50) + "...",
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
