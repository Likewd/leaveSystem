import { Permission } from "../models/permission.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPermission = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    console.log(name);

    if (!name) {
        throw new ApiError(400, "Permission Name required")
    }

    const existedPermission = await Permission.findOne({ name })
    if (existedPermission) {

        throw new ApiError(409, "permission already existed")

    }
    const permission = await Permission.create({ name, description })



    return res.status(201).json(
        new ApiResponse(200, permission, "permission registered Successfully")
    )
})

export {
    createPermission
}