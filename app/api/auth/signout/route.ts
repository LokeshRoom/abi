import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  const redirectUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return NextResponse.redirect(new URL("/login", redirectUrl), {
    status: 303, // See Other (standard redirect for POST requests)
  });
}
