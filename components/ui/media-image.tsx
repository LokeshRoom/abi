"use client";

import { useState, useEffect, useRef } from "react";
import Image, { ImageProps } from "next/image";

/**
 * Drop-in replacement for next/image that detects when the source URL is
 * an internal authenticated route (e.g. /api/media/[id]) and automatically
 * sets `unoptimized={true}` so the browser fetches the image directly —
 * preserving the session cookie and avoiding the server-side optimization
 * pipeline that would strip auth headers.
 * 
 * Displays an aperture loader spinner overlay during loading and transitions 
 * the image opacity smoothly on load. Uses a React Fragment to guarantee 
 * zero interference with external/parent styles.
 */
export function MediaImage(props: ImageProps) {
  const { className, onLoad, onError, style, ...rest } = props;
  const src = typeof props.src === "string" ? props.src : "";
  const isMediaProxy = src.startsWith("/api/media/");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // If image is already complete (e.g. cached), resolve loading state
    if (imgRef.current && imgRef.current.complete) {
      setIsLoading(false);
    }
  }, [src]);

  const handleLoad = (e: any) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: any) => {
    setIsLoading(false);
    setIsError(true);
    if (onError) onError(e);
  };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            {/* ═══ Aperture-style loading animation ═══ */}
            <div className="relative h-10 w-10">
              {/* Rotating ring */}
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: "2px solid transparent",
                  borderTopColor: "#E8632B",
                  borderRightColor: "rgba(232, 99, 43, 0.3)",
                  animationDuration: "1.2s",
                }}
              />
              {/* Inner ring */}
              <div
                className="absolute inset-1 rounded-full animate-spin"
                style={{
                  border: "2px solid transparent",
                  borderBottomColor: "#A8D841",
                  borderLeftColor: "rgba(168, 216, 65, 0.3)",
                  animationDuration: "0.8s",
                  animationDirection: "reverse",
                }}
              />
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-1.5 w-1.5 rounded-full pulse-glow"
                  style={{ backgroundColor: "#E8632B" }}
                />
              </div>
            </div>
            <span className="font-technical text-[8px] tracking-[0.2em] text-[#FAFAFA]/70 animate-pulse select-none">
              LOADING
            </span>
          </div>
        </div>
      )}

      {isError ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 text-red-500 gap-2 p-4 text-center min-h-[150px]">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-[9px] font-technical tracking-wider uppercase text-red-400">
            Image Load Failed
          </span>
        </div>
      ) : null}

      {!isError && (
        <Image
          {...rest}
          ref={imgRef}
          className={`${className || ""} transition-opacity duration-500 ease-in-out ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          unoptimized={isMediaProxy || (props.unoptimized ?? false)}
          onLoad={handleLoad}
          onError={handleError}
          style={style}
        />
      )}
    </>
  );
}


