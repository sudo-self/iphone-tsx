import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Upload photo to Supabase Storage bucket "photos"
export async function uploadPhoto(file: File, fileName: string) {
  try {
    const { data, error } = await supabase.storage
      .from("photos")
      .upload(fileName, file, { cacheControl: "3600", upsert: false })

    if (error) {
      console.error("Upload error:", error)
      return null
    }

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName)
    return urlData?.publicUrl ?? null
  } catch (error) {
    console.error("Error uploading photo:", error)
    return null
  }
}

// Fetch list of photos with public URLs
export async function getPhotos() {
  try {
    const { data, error } = await supabase.storage.from("photos").list("", {
      sortBy: { column: "name", order: "desc" },
    })

    if (error) {
      console.error("Error listing photos:", error)
      return []
    }

    return (
      data?.map((obj) => {
        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(obj.name)
        return {
          filename: obj.name,
          url: urlData?.publicUrl ?? "/placeholder.svg",
          created_at: obj.updated_at ?? new Date().toISOString(),
        }
      }) ?? []
    )
  } catch (error) {
    console.error("Error fetching photos:", error)
    return []
  }
}
