import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdmin = token?.role === "ADMIN";
    
    // Protect /admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(req.nextUrl.pathname), req.url));
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/gallery", req.url));
      }
    }

    // Protect /gallery routes (proofing)
    if (req.nextUrl.pathname.startsWith("/gallery")) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(req.nextUrl.pathname), req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle the logic
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/gallery/:path*"],
};
