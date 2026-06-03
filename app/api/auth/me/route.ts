import { NextResponse } from "next/server";

import { getCurrentUserProfile } from "@/lib/auth/server";
import { getErrorMessage } from "@/lib/data/client";

export async function GET() {
  try {
    const user = await getCurrentUserProfile();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
