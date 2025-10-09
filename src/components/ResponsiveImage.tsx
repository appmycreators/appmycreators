import React, { useEffect, useRef } from "react";

export type ResponsiveImageProps = {
  src: string;
  alt: string;
  widths: number[]; // e.g. [320, 480, 640]
  sizes: string; // e.g. "(min-width: 640px) 672px, 100vw"
  height?: number; // when provided, will crop to this height (resize=cover)
  className?: string;
  style?: React.CSSProperties;
  loading?: "eager" | "lazy";
  decoding?: "async" | "auto" | "sync";
  crop?: "cover" | "contain"; // default cover when height provided
  fetchPriority?: "high" | "low" | "auto";
};

// Detect if we can transform via Supabase Storage Image Transformation
function canTransformWithSupabase(url: string): boolean {
  return (
    url.includes("/storage/v1/object/") ||
    url.includes("/storage/v1/object/public/") ||
    url.includes("/storage/v1/object/cache/")
  );
}

// Convert /storage/v1/object/... to /storage/v1/render/image/...
function toRenderBase(url: string): string | null {
  if (!url.includes("/storage/v1/object/")) return null;
  const base = url.replace("/storage/v1/object/", "/storage/v1/render/image/");
  return base.split("?")[0];
}

function buildTransformedUrl(
  base: string,
  format: "avif" | "webp" | "jpeg" | "origin",
  width: number,
  height?: number,
  crop: "cover" | "contain" = "cover"
) {
  const u = new URL(base);
  const q = u.searchParams;
  q.set("format", format);
  q.set("width", String(width));
  if (height) {
    q.set("height", String(height));
    q.set("resize", crop);
  }
  if (format === "jpeg") q.set("quality", "72");
  if (format === "webp") q.set("quality", "60");
  if (format === "avif") q.set("quality", "50");
  u.search = q.toString();
  return u.toString();
}

export default function ResponsiveImage({
  src,
  alt,
  widths,
  sizes,
  height,
  className,
  style,
  loading = "lazy",
  decoding = "async",
  crop = "cover",
  fetchPriority,
}: ResponsiveImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && fetchPriority) {
      imgRef.current.setAttribute("fetchpriority", fetchPriority);
    }
  }, [fetchPriority]);

  const isSupabase = canTransformWithSupabase(src);
  const isGif = src.split("?")[0].toLowerCase().endsWith(".gif");

  if (!isSupabase || !toRenderBase(src)) {
    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
      />
    );
  }

  const renderBase = toRenderBase(src)!;

  // GIF handling
  if (isGif) {
    const gifSrcSet = widths
      .map((w) => `${buildTransformedUrl(renderBase, "origin", w, height, crop)} ${w}w`)
      .join(", ");
    const gifFallback = buildTransformedUrl(renderBase, "origin", widths[widths.length - 1], height, crop);
    return (
      <img
        ref={imgRef}
        src={gifFallback}
        srcSet={gifSrcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
        onError={(e) => {
          try {
            e.currentTarget.src = src;
            e.currentTarget.srcset = "";
            e.currentTarget.removeAttribute("sizes");
          } catch {}
        }}
      />
    );
  }

  const avifSrcSet = widths
    .map((w) => `${buildTransformedUrl(renderBase, "avif", w, height, crop)} ${w}w`)
    .join(", ");
  const webpSrcSet = widths
    .map((w) => `${buildTransformedUrl(renderBase, "webp", w, height, crop)} ${w}w`)
    .join(", ");
  const jpegSrcSet = widths
    .map((w) => `${buildTransformedUrl(renderBase, "jpeg", w, height, crop)} ${w}w`)
    .join(", ");
  const fallbackSrc = buildTransformedUrl(renderBase, "jpeg", widths[widths.length - 1], height, crop);

  return (
    <picture>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        ref={imgRef}
        src={fallbackSrc}
        srcSet={jpegSrcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        decoding={decoding}
        onError={(e) => {
          try {
            e.currentTarget.src = src;
            e.currentTarget.srcset = "";
            e.currentTarget.removeAttribute("sizes");
          } catch {}
        }}
      />
    </picture>
  );
}
