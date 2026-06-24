import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/db";
import { getServerSession, authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const settingsUrl = new URL("/admin/settings", process.env.NEXTAUTH_URL || "http://localhost:3000");

  // User denied access on the Google consent screen
  if (error) {
    settingsUrl.searchParams.set("gdrive", "error");
    settingsUrl.searchParams.set("reason", error);
    return NextResponse.redirect(settingsUrl.toString());
  }

  if (!code) {
    settingsUrl.searchParams.set("gdrive", "error");
    settingsUrl.searchParams.set("reason", "no_code");
    return NextResponse.redirect(settingsUrl.toString());
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    settingsUrl.searchParams.set("gdrive", "error");
    settingsUrl.searchParams.set("reason", "missing_env");
    return NextResponse.redirect(settingsUrl.toString());
  }

  try {
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Exchange the authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Incomplete token response from Google.");
    }

    // Persist tokens as a singleton in the database
    await prisma.gDriveConfig.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: BigInt(tokens.expiry_date ?? 0),
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: BigInt(tokens.expiry_date ?? 0),
      },
    });

    settingsUrl.searchParams.set("gdrive", "success");
    return NextResponse.redirect(settingsUrl.toString());
  } catch (err: any) {
    console.error("Google Drive OAuth callback error:", err);
    settingsUrl.searchParams.set("gdrive", "error");
    settingsUrl.searchParams.set("reason", err.message || "token_exchange_failed");
    return NextResponse.redirect(settingsUrl.toString());
  }
}
