import { supabase } from "@/integrations/supabase/client";

export type MediaBucket = "laptops" | "testimonials" | "articles" | "instagram";

// 10 years in seconds. Long-lived signed URL works on private buckets without
// requiring workspace "Allow public buckets" to be enabled.
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;

/**
 * Resize the image to fit within MAX_DIMENSION on its longest edge and
 * re-encode it as WebP. Returns the original file unchanged if the browser
 * can't decode it (SVG, HEIC on unsupported browsers, etc.) or if the
 * optimized blob would actually be larger.
 */
async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  if (typeof document === "undefined" || typeof createImageBitmap === "undefined") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close?.();

    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/webp", WEBP_QUALITY)
    );
    if (!blob) return file;
    if (blob.size >= file.size && scale === 1) return file;

    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

/**
 * Upload an image to a private Storage bucket and return a long-lived signed URL
 * that can be stored in a DB column and rendered as a normal <img src>.
 * The image is resized (max 1600px on the longest edge) and re-encoded as
 * WebP before upload to keep page weight down.
 */
export async function uploadImage(bucket: MediaBucket, file: File): Promise<string> {
  const optimized = await optimizeImage(file);
  const ext = (optimized.name.split(".").pop() || "webp").toLowerCase();
  const safeExt = ext.replace(/[^a-z0-9]/g, "").slice(0, 5) || "webp";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, optimized, {
    cacheControl: "31536000",
    upsert: false,
    contentType: optimized.type || `image/${safeExt}`,
  });
  if (upErr) throw upErr;

  const { data, error: signErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, TEN_YEARS);
  if (signErr || !data?.signedUrl) {
    throw signErr ?? new Error("Could not create signed URL");
  }
  return data.signedUrl;
}
