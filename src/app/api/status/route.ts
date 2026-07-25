import { NextResponse } from "next/server";
import { getPublicStatus } from "@/lib/status-cache";

export async function GET() {
  const status = await getPublicStatus();
  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=120",
    },
  });
}

