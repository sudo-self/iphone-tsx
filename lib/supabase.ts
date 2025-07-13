import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadPhoto(file: File, fileName: string): Promise<string | null> {
  try {
    const { error } = await supabase.storage
      .from("photos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data, error: urlError } = supabase.storage.from("photos").getPublicUrl(fileName);
    if (urlError) {
      console.error("Error getting public URL:", urlError);
      return null;
    }

    return data.publicUrl || null;
  } catch (error) {
    console.error("Exception uploading photo:", error);
    return null;
  }
}

export async function getPhotos(): Promise<
  Array<{ filename: string; url: string; created_at: string }>
> {
  try {
    const { data, error } = await supabase.storage.from("photos").list("", {
      sortBy: { column: "name", order: "desc" },
    });

    if (error || !data) {
      console.error("Error listing photos:", error);
      return [];
    }

    return data.map((obj) => {
      const { data: urlData, error: urlError } = supabase.storage
        .from("photos")
        .getPublicUrl(obj.name);

      if (urlError) {
        console.error("Error getting public URL:", urlError);
      }

      return {
        filename: obj.name,
        url: urlData?.publicUrl || "/placeholder.svg",
        created_at: obj.updated_at || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}
