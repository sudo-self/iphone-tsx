import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a photo to the Supabase storage bucket named "iphone-tsx".
 *
 * @param file - The File object to upload
 * @param fileName - The name to use for the uploaded file
 * @returns The public URL of the uploaded photo or null on failure
 */
export async function uploadPhoto(file: File, fileName: string): Promise<string | null> {
  try {
    const { error } = await supabase.storage
      .from("iphone-tsx")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data, error: urlError } = supabase.storage
      .from("iphone-tsx")
      .getPublicUrl(fileName);

    if (urlError) {
      console.error("Error getting public URL:", urlError);
      return null;
    }

    return data?.publicUrl || null;
  } catch (err) {
    console.error("Exception uploading photo:", err);
    return null;
  }
}

/**
 * Fetches the list of uploaded photos with their public URLs and timestamps.
 *
 * @returns An array of photo objects with filename, URL, and updated timestamp
 */
export async function getPhotos(): Promise<
  Array<{ filename: string; url: string; created_at: string }>
> {
  try {
    const { data, error } = await supabase.storage.from("iphone-tsx").list("", {
      sortBy: { column: "name", order: "desc" },
    });

    if (error || !data) {
      console.error("Error listing photos:", error);
      return [];
    }

    return data.map((obj) => {
      const { data: urlData, error: urlError } = supabase.storage
        .from("iphone-tsx")
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
  } catch (err) {
    console.error("Error fetching photos:", err);
    return [];
  }
}


