import { put, del } from "@vercel/blob";

export async function uploadPhoto(file: File, filename: string) {
  const blob = await put(filename, file, {
    access: "public",
  });
  return blob;
}

export async function deletePhoto(blobUrl: string) {
  await del(blobUrl);
}
