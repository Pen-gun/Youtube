import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upLoadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log('Cloudinary upload result:', result.url);
        fs.unlinkSync(localFilePath); // delete local file after upload
        return result;


    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null;
    }
}

export { upLoadOnCloudinary };