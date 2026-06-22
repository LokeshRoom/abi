import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(request.nextUrl.pathname), request.url)
      );
    }
    const role = user.user_metadata?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect /gallery routes (proofing)
  if (request.nextUrl.pathname.startsWith("/gallery")) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/login?callbackUrl=" + encodeURIComponent(request.nextUrl.pathname), request.url)
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/gallery/:path*"],
};
