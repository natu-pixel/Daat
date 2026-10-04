import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address.").max(254),
  service: z.enum(["Not sure yet", "Brand identity", "Web development", "Motion design"]),
  message: z.string().trim().min(20, "Please share at least 20 characters about your project.").max(4000),
  website: z.string().max(0, "We couldn't accept this submission."),
  consent: z.literal(true, { error: "Please agree to the privacy notice." }),
});

export function previewPath(value: string | null) {
  if (value === "/" || value === "/work" || value === "/about" || value === "/services") return value;
  if (value && /^\/work\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return value;
  return null;
}

export async function readLimitedBody(request: Request, limit = 16_384): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}
