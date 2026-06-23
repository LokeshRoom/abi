import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession, authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Google OAuth environment variables are not configured." },
      { status: 500 }
    );
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",   // request refresh_token
    prompt: "consent",        // force re-consent to always get refresh_token
    scope: ["https://www.googleapis.com/auth/drive"],
  });

  return NextResponse.redirect(authUrl);
}
