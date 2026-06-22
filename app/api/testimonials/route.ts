import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(testimonials, { status: 200 });
  } catch (error: any) {
    console.error("Error in testimonials API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
