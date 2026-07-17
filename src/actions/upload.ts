"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadTaskFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { error: "No file provided" };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<{ url?: string; error?: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "tasks", resource_type: "auto" },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            resolve({ error: "Upload failed" });
          } else {
            resolve({ url: result.secure_url });
          }
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error("Error in uploadTaskFile:", error);
    return { error: String(error) };
  }
}
