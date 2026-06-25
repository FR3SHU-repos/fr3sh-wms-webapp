import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "");

export const WMS_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_WMS_BUCKET ?? "wms-uploads";

export async function uploadWMSFile(
  file: File,
  folder: string,
): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(WMS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    console.error("Supabase upload error:", error.message);
    return null;
  }
  const { data } = supabase.storage.from(WMS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
