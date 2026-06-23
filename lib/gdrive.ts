import { google } from "googleapis";
import { Readable } from "stream";
import { prisma } from "./db";

/**
 * Builds an authenticated OAuth2 Drive client by loading stored credentials
 * from the database. Automatically persists refreshed access tokens.
 */
export async function getDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI) are not configured."
    );
  }

  const config = await prisma.gDriveConfig.findUnique({ where: { id: "default" } });

  if (!config) {
    throw new Error(
      "Google Drive is not connected. Please connect via Admin Settings → Google Drive."
    );
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  oAuth2Client.setCredentials({
    access_token: config.accessToken,
    refresh_token: config.refreshToken,
    expiry_date: Number(config.expiryDate),
  });

  // When the access token is silently refreshed, persist the new tokens to DB
  oAuth2Client.on("tokens", async (tokens) => {
    try {
      await prisma.gDriveConfig.update({
        where: { id: "default" },
        data: {
          ...(tokens.access_token && { accessToken: tokens.access_token }),
          ...(tokens.expiry_date && { expiryDate: BigInt(tokens.expiry_date) }),
        },
      });
    } catch (e) {
      console.error("Failed to persist refreshed Google Drive tokens:", e);
    }
  });

  return google.drive({ version: "v3", auth: oAuth2Client });
}

/**
 * Resolves a gallery's Google Drive folder ID, or creates a new folder under
 * the parent if one doesn't exist yet.
 */
export async function getOrCreateGalleryFolder(
  galleryId: string,
  galleryTitle: string
): Promise<string> {
  // 1. Check database for existing folder ID
  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    select: { gdriveFolderId: true },
  });

  if (gallery?.gdriveFolderId) {
    return gallery.gdriveFolderId;
  }

  // 2. Create the folder on Google Drive
  const drive = await getDriveClient();
  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  const folder = await drive.files.create({
    requestBody: {
      name: `Gallery - ${galleryTitle}`,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentFolderId ? [parentFolderId] : undefined,
    },
    fields: "id",
  });

  const folderId = folder.data.id;
  if (!folderId) {
    throw new Error(
      `Failed to create Google Drive folder for gallery "${galleryTitle}"`
    );
  }

  // 3. Persist the folder ID in the database
  await prisma.gallery.update({
    where: { id: galleryId },
    data: { gdriveFolderId: folderId },
  });

  return folderId;
}

/**
 * Uploads a file buffer to Google Drive inside the specified folder.
 */
export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId?: string
): Promise<{ id: string; webViewLink?: string | null }> {
  const drive = await getDriveClient();

  const parentId = folderId || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  // Convert buffer to a Node.js Readable stream
  const bufferStream = new Readable();
  bufferStream.push(buffer);
  bufferStream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: parentId ? [parentId] : undefined,
    },
    media: {
      mimeType,
      body: bufferStream,
    },
    fields: "id, webViewLink",
  });

  if (!response.data.id) {
    throw new Error(`Failed to upload file "${filename}" to Google Drive`);
  }

  return {
    id: response.data.id,
    webViewLink: response.data.webViewLink,
  };
}

/**
 * Deletes a file from Google Drive by its file ID.
 */
export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId });
}

/**
 * Downloads a file stream from Google Drive, supporting HTTP Range requests
 * for efficient video streaming.
 */
export async function downloadFromDrive(
  fileId: string,
  rangeHeader?: string
): Promise<{ stream: Readable; headers: any; status: number }> {
  const drive = await getDriveClient();

  const requestHeaders: Record<string, string> = {};
  if (rangeHeader) {
    requestHeaders.Range = rangeHeader;
  }

  const response = await drive.files.get(
    { fileId, alt: "media" },
    {
      responseType: "stream",
      headers: requestHeaders,
    }
  );

  return {
    stream: response.data as Readable,
    headers: response.headers,
    status: response.status,
  };
}
