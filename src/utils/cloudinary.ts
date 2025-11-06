import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

export async function uploadImage(imageUrl: string): Promise<string> {
    try {
      const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "groups_posters",
        resource_type: "auto",
        transformation: [
          { width: 1200, height: 730, crop: 'fit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      });
      return uploadResponse.secure_url;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Internal Server Error";
      return error
    }
  }

  export async function uploadVideo(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        const uploadResponse = await cloudinary.uploader.upload(dataUrl, {
            folder: "course_videos",
            resource_type: "video",
            chunk_size: 6000000, 
            eager: [
                { 
                    streaming_profile: "hd", 
                    format: "m3u8" 
                }
            ],
            eager_async: true,
        });

        return uploadResponse.secure_url;
    } catch (err) {
        const error = err instanceof Error ? err.message : "Video upload failed";
        throw new Error(error);
    }
}
export default cloudinary;