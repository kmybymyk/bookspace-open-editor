export type ImageAsset = {
  readonly bytes: Uint8Array;
  readonly extension: string;
  readonly mediaType: string;
};

const MAX_COVER_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_BASE64_COVER_LENGTH = Math.ceil((MAX_COVER_IMAGE_BYTES * 4) / 3) + 4;

export function coverAssetFromDataUrl(dataUrl: string | undefined): ImageAsset | null {
  if (!dataUrl) return null;
  const match = /^data:([^;,]+)(;base64)?,(.*)$/u.exec(dataUrl);
  if (!match) return null;
  const mediaType = match[1] ?? "image/jpeg";
  if (mediaType !== "image/jpeg" && mediaType !== "image/png" && mediaType !== "image/webp") {
    return null;
  }
  const raw = match[3] ?? "";
  if (match[2] && raw.replaceAll(/\s/g, "").length > MAX_BASE64_COVER_LENGTH) {
    return null;
  }
  let binary = "";
  try {
    binary = match[2] ? atob(raw) : decodeURIComponent(raw);
  } catch (error) {
    if (error instanceof Error) {
      return null;
    }
    throw error;
  }
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  if (bytes.byteLength > MAX_COVER_IMAGE_BYTES) {
    return null;
  }
  const extension = mediaType.includes("png") ? "png" : mediaType.includes("webp") ? "webp" : "jpg";
  return { bytes, extension, mediaType };
}
