import { put } from "@vercel/blob";

export async function uploadProductImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const filename = `produtos/${crypto.randomUUID()}.${extension}`;
  const { url } = await put(filename, file, { access: "public" });
  return url;
}

export async function uploadProductVideo(file: File): Promise<string> {
  const extension = file.name.split(".").pop() ?? "mp4";
  const filename = `produtos/video-${crypto.randomUUID()}.${extension}`;
  const { url } = await put(filename, file, { access: "public" });
  return url;
}
