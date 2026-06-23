import { NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { downloadFromDrive } from "@/lib/gdrive";
import { Readable } from "stream";

// Helper to convert Node.js Readable stream to Web ReadableStream
function nodeReadableToWeb(readable: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      readable.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      readable.on("end", () => {
        controller.close();
      });
      readable.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      readable.destroy();
    }
  });
}

// Maps file extensions to standard MIME types
function getMimeType(filename: string | null | undefined): string {
  if (!filename) return "application/octet-stream";
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogg":
      return "video/ogg";
    case "mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch photo and its gallery access rules
    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        gallery: {
          include: {
            access: true,
          },
        },
      },
    });

    if (!photo) {
      return new Response("Media not found", { status: 404 });
    }

    if (!photo.gdriveId) {
      return new Response("Media has no associated Google Drive ID", { status: 400 });
    }

    // 2. Perform access control verification
    let isAuthorized = false;

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    if (isAdmin) {
      isAuthorized = true;
    } else if (photo.isPublic || (photo.gallery && photo.gallery.isPublic)) {
      // Allowed if public
      isAuthorized = true;
    } else if (session && photo.gallery) {
      // Allowed if explicit access is granted to this client user
      const hasAccess = photo.gallery.access.some(
        (acc) => acc.userId === session.user.id
      );
      if (hasAccess) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response("Unauthorized", { status: 403 });
    }

    // 3. Extract range request header if it exists
    const rangeHeader = req.headers.get("Range") || undefined;

    // 4. Request the file from Google Drive
    const { stream, headers: gdriveHeaders, status: gdriveStatus } = await downloadFromDrive(
      photo.gdriveId,
      rangeHeader
    );

    // 5. Construct the streamed response headers
    const mimeType = getMimeType(photo.title);
    const responseHeaders: Record<string, string> = {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    // Forward range and content-length related headers from Google Drive
    if (gdriveHeaders["content-length"]) {
      responseHeaders["Content-Length"] = String(gdriveHeaders["content-length"]);
    }
    if (gdriveHeaders["content-range"]) {
      responseHeaders["Content-Range"] = String(gdriveHeaders["content-range"]);
    }
    if (gdriveHeaders["accept-ranges"]) {
      responseHeaders["Accept-Ranges"] = String(gdriveHeaders["accept-ranges"]);
    }

    const webStream = nodeReadableToWeb(stream);
    return new NextResponse(webStream, {
      status: gdriveStatus || 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error proxying media from Google Drive:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
