import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/system/calendar?error=${encodeURIComponent(error ?? "missing_code")}`, url.origin)
    );
  }

  try {
    const redirectUri = `${url.origin}/api/calendar/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", url.origin));
    }

    const { error: dbError } = await supabase.from("calendar_connections").upsert(
      {
        user_id: user.id,
        refresh_token: tokens.refreshToken,
        access_token: tokens.accessToken,
        token_expiry: tokens.expiresAt,
      },
      { onConflict: "user_id" }
    );

    if (dbError) {
      return NextResponse.redirect(
        new URL(`/system/calendar?error=${encodeURIComponent(dbError.message)}`, url.origin)
      );
    }

    return NextResponse.redirect(new URL("/system/calendar", url.origin));
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(new URL(`/system/calendar?error=${encodeURIComponent(message)}`, url.origin));
  }
}
