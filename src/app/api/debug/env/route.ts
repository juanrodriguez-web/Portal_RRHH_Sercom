import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "✓ SET" : "✗ NOT SET",
    VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ? "✓ SET" : "✗ NOT SET",
    VAPID_SUBJECT: process.env.VAPID_SUBJECT || "default",
  });
}
