import { NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUserProfile();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
