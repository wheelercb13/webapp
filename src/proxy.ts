import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { FUNCTION_ROUTES } from "@/lib/access";

const publicPaths = ["/login"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user) {
    const pathname = request.nextUrl.pathname;
    const isAdmin = !!user.app_metadata?.is_admin;

    // /settings is otherwise admin-only, but the personal Page View screen
    // (and the hub that links to it) is carved out for every user.
    if (!isAdmin && matchesPrefix(pathname, "/settings")) {
      const allowedForAll =
        pathname === "/settings" || matchesPrefix(pathname, "/settings/page-view");
      if (!allowedForAll) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    const matchedPrefix = Object.keys(FUNCTION_ROUTES).find((prefix) =>
      matchesPrefix(pathname, prefix)
    );

    if (matchedPrefix) {
      const key = FUNCTION_ROUTES[matchedPrefix];

      if (!isAdmin) {
        const { data } = await supabase
          .from("functions")
          .select("access_level")
          .eq("key", key)
          .single();

        if (data?.access_level === "admin") {
          const url = request.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }

      // Page View is a personal preference, so it applies even to admins.
      const { data: pref } = await supabase
        .from("page_visibility")
        .select("visible")
        .eq("page_key", key)
        .maybeSingle();

      if (pref?.visible === false) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
