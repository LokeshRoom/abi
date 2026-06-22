import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({ name, value, ...options })
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({ name, value, ...options })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const redirectResponse = NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(request.nextUrl.pathname), request.url)
      );
      // Copy over refreshed cookies to the redirect response to prevent session loss
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
    const role = user.user_metadata?.role;
    if (role !== "ADMIN") {
      const redirectResponse = NextResponse.redirect(new URL("/", request.url));
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  // Protect /gallery routes (proofing)
  if (request.nextUrl.pathname.startsWith("/gallery")) {
    if (!user) {
      const redirectResponse = NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(request.nextUrl.pathname), request.url)
      );
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/gallery/:path*"],
};
