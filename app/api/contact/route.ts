import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields" },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || null,
        message,
      },
    });

    return NextResponse.json(
      { message: "Message sent successfully", data: contactMessage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
