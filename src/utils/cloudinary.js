import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API - SECRET
});

const uploadOnCloudinary = async (localPath) => {
    try {
        if (!localPath) return null

        const response = await cloudinary.uploader
            .upload(
                localPath,
                {
                    resource_type: "auto"
                }
            )
        console.log("files has been uploaded successfully", response.url);
        fs.unlinkSync(localPath)  //remove files from the local server

        return response

    } catch (error) {

        fs.unlinkSync(localPath)  //remove files from the local server
        return null
    }



}

export { uploadOnCloudinary }
