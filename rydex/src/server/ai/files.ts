import type { RemoteFilePart } from "./types";

export async function fetchImagePartFromUrl(imageUrl: string): Promise<RemoteFilePart | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const mimeType = response.headers.get("content-type") || "image/jpeg";
    if (!mimeType.startsWith("image/")) return null;

    const arrayBuffer = await response.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(arrayBuffer).toString("base64"),
        mimeType,
      },
    };
  } catch {
    return null;
  }
}
