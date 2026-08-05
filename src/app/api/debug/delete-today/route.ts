import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await requireUser();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const deleted = await prisma.marcacion.deleteMany({
      where: {
        userId: user.id,
        fechaLaboral: hoy,
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Deleted ${deleted.count} marcaciones for today`,
      count: deleted.count,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
