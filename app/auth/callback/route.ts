import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Redirect to the Vite dashboard with session tokens in the URL hash.
      // The Vite app has detectSessionInUrl: true so it picks these up automatically
      // and stores the session — no extra login step needed.
      const hash = [
        `access_token=${data.session.access_token}`,
        `refresh_token=${data.session.refresh_token}`,
        `token_type=bearer`,
        `type=recovery`,
      ].join("&");

      return NextResponse.redirect(
        `https://ux-f4ux7fynz-ddeh5x.vercel.app/home#${hash}`
      );
    }
  }

  // Something went wrong — send back to login
  return NextResponse.redirect(new URL("/", request.url));
}
