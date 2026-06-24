import { NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { uploadToDrive, getOrCreateGalleryFolder } from "@/lib/gdrive";
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

    // Security Hardening: Enforce file size limit (15MB) and type safety
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 15MB limit" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only JPEG, PNG, WEBP, and SVG are allowed." },
        { status: 400 }
      );
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

    // 4. Upload original file to Google Drive
    // Ensure filename is safe and unique
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    
    let gdriveFolderId: string | undefined = undefined;
    if (galleryId) {
      const gallery = await prisma.gallery.findUnique({
        where: { id: galleryId },
        select: { title: true },
      });
      if (gallery) {
        gdriveFolderId = await getOrCreateGalleryFolder(galleryId, gallery.title);
      }
    }

    const gdriveResult = await uploadToDrive(buffer, uniqueFilename, file.type, gdriveFolderId);

    // 5. Save to database with a temp blobUrl
    const photo = await prisma.photo.create({
      data: {
        title: file.name,
        blobUrl: "TEMP",
        gdriveId: gdriveResult.id,
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

    // Update the photo with its self-contained proxy URL
    const updatedPhoto = await prisma.photo.update({
      where: { id: photo.id },
      data: {
        blobUrl: `/api/media/${photo.id}`,
      },
    });

    return NextResponse.json({ success: true, photo: updatedPhoto });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || String(error) || "Internal server error" },
      { status: 500 }
    );
  }
}
