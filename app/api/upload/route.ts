import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { uploadPhoto } from "@/lib/blob";
import { prisma } from "@/lib/db";
import exifr from "exifr";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const galleryId = formData.get("galleryId") as string | null;
    const isPublic = formData.get("isPublic") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract EXIF data
    let exifData: any = {};
    try {
      exifData = await exifr.parse(buffer, {
        pick: ["Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO", "DateTimeOriginal"],
      });
    } catch (e) {
      console.log("Could not parse EXIF data", e);
    }

    // 2. Format EXIF data safely
    const focalLength = exifData?.FocalLength ? `${Math.round(exifData.FocalLength)}mm` : null;
    const aperture = exifData?.FNumber ? `${exifData.FNumber}` : null;
    let shutterSpeed = null;
    if (exifData?.ExposureTime) {
      if (exifData.ExposureTime >= 1) {
        shutterSpeed = `${exifData.ExposureTime}`;
      } else {
        shutterSpeed = `1/${Math.round(1 / exifData.ExposureTime)}`;
      }
    }
    const iso = exifData?.ISO ? `${exifData.ISO}` : null;
    const camera = exifData?.Model || null;
    const lens = exifData?.LensModel || null;
    const dateTaken = exifData?.DateTimeOriginal || null;

    // 3. Process image with sharp (get dimensions & blur placeholder)
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Generate base64 blur placeholder (20px wide)
    const blurBuffer = await image
      .resize(20, null, { fit: "inside" })
      .blur(1.5)
      .toBuffer({ resolveWithObject: true });
    
    const blurDataUrl = `data:${blurBuffer.info.format === "jpeg" ? "image/jpeg" : "image/png"};base64,${blurBuffer.data.toString("base64")}`;

    // 4. Upload original file to Vercel Blob
    // Ensure filename is safe and unique
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const blob = await uploadPhoto(file, uniqueFilename);

    // 5. Save to database
    const photo = await prisma.photo.create({
      data: {
        title: file.name,
        blobUrl: blob.url,
        blurDataUrl,
        width: metadata.width || 0,
        height: metadata.height || 0,
        camera,
        lens,
        focalLength,
        aperture,
        shutterSpeed,
        iso,
        dateTaken,
        isPublic,
        ...(galleryId ? { galleryId } : {}),
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || String(error) || "Internal server error" },
      { status: 500 }
    );
  }
}
