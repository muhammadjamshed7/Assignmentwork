import { NextResponse } from "next/server";

import { getCurrentUserProfile, getCurrentUserProfileFromAccessToken } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

export const dynamic = "force-dynamic";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  return scheme.toLowerCase() === "bearer" && token ? token : "";
}

export async function GET(request: Request) {
  try {
    const bearerToken = getBearerToken(request);
    const user = bearerToken
      ? await getCurrentUserProfileFromAccessToken(bearerToken)
      : await getCurrentUserProfile();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
