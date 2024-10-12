import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (localPath) => {
    try {
        if (!localPath) return null

        const response = await cloudinary.uploader.upload(
            localPath,
            {
                resource_type: "auto"
            }
        )
        console.log("files has been uploaded successfully", response.url);

        // Check if the file exists before attempting to delete it
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);  // remove files from the local server
        }

        return response

    } catch (error) {
        console.error("Error uploading file:", error);

        // Check if the file exists before attempting to delete it
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);  // remove files from the local server
        }

        return null
    }



}


// Helper function to delete image from Cloudinary
const deleteImageFromCloudinary = async (publicId, next) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Old image deleted:', result);
    } catch (error) {
        console.error('Failed to delete old profile image:', error);
        return next(new ApiError('Failed to delete old profile image from Cloudinary', 500));
    }
}

export { uploadOnCloudinary, deleteImageFromCloudinary }
