export type ImageAsset = {
  readonly bytes: Uint8Array;
  readonly extension: string;
  readonly mediaType: string;
};

export function coverAssetFromDataUrl(dataUrl: string | undefined): ImageAsset | null {
  if (!dataUrl) return null;
  const match = /^data:([^;,]+)(;base64)?,(.*)$/u.exec(dataUrl);
  if (!match) return null;
  const mediaType = match[1] ?? "image/jpeg";
  if (mediaType !== "image/jpeg" && mediaType !== "image/png" && mediaType !== "image/webp") {
    return null;
  }
  const raw = match[3] ?? "";
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
  const extension = mediaType.includes("png") ? "png" : mediaType.includes("webp") ? "webp" : "jpg";
  return { bytes, extension, mediaType };
}
