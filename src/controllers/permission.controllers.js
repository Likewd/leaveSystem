import { Permission } from "../models/permission.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPermission = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    console.log(name);

    if (!name) {
        throw new ApiError(
            "Permission Name required",
            400,
            )
    }

    const existedPermission = await Permission.findOne({ name })
    if (existedPermission) {

        throw new ApiError(
            "permission already existed",
            409, 
        )

    }
    const permission = await Permission.create({ name, description })



    return res.status(201).json(
        new ApiResponse("permission registered Successfully", 201,
            permission,
        )

    )
})

const getAllPermission = asyncHandler(async (req, res) => {
    const allPermission = await Permission.find({})
    if (allPermission.length === 0) {
        return res.status(200).json(new ApiResponse("No permissions found", 200, []));
    }
    return res.status(200).json(
        new ApiResponse("Permissions fetched successfully", 200,
            allPermission,
        )

    )

})

const deletePermission = asyncHandler(async (req, res) => {
    const { _id } = req.params
    if (!_id) {
        throw new ApiError(
           "Permission ID is required",
            400,
        )
    }

    const deletePermission = await
        Permission.findByIdAndDelete(_id)

    if (!deletePermission) {
        throw new ApiError(
            "Permission Not Found",
            404,
        )

    }
    return res.status(200).json(
        new ApiResponse("permission Delete Successfully", 200,
            deletePermission,
        )

    )

})
export {
    createPermission,
    deletePermission,
    getAllPermission

}