"use client";

import Image, { ImageProps } from "next/image";

/**
 * Drop-in replacement for next/image that detects when the source URL is
 * an internal authenticated route (e.g. /api/media/[id]) and automatically
 * sets `unoptimized={true}` so the browser fetches the image directly —
 * preserving the session cookie and avoiding the server-side optimization
 * pipeline that would strip auth headers.
 */
export function MediaImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isMediaProxy = src.startsWith("/api/media/");

  return <Image {...props} unoptimized={isMediaProxy || (props.unoptimized ?? false)} />;
}
