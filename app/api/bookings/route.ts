import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, phone, eventType, eventDate, location, message } = await req.json();

    if (!name || !email || !eventType || !eventDate) {
      return NextResponse.json(
        { error: "Name, email, event type, and event date are required fields" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        phone: phone || null,
        eventType,
        eventDate: new Date(eventDate),
        location: location || null,
        message: message || null,
      },
    });

    return NextResponse.json(
      { message: "Booking request submitted successfully", data: booking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in bookings API:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
