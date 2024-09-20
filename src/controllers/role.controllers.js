import { Permission } from "../models/permission.model.js";
import { Role } from "../models/role.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



//Crete Role

const createRole = asyncHandler(async (req, res) => {
    const { roleName, permissionIds } = req.body
    if (!roleName) {
        throw new ApiError(
            "Role are not defined",
            400,
        )
    }
    const RoleExist = await Role.findOne({ roleName })
    console.log(RoleExist.roleName);

    if (RoleExist) {
        throw new ApiError(
            "RoleExist Already exist",
            400,
        )
    }
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    console.log(permissions);

    if (permissions.length !== permissionIds.length) {
        throw new ApiError(
            'Some permissions not found',
            400,
        )
    }

    const newRole = new Role({
        roleName,
        permissions: permissions.map(permission => permission._id)  // Store permission IDs
    });

    await newRole.save();

    return res.status(201).json(
        new ApiResponse("Role Created Successfully", 201,
            newRole,
        )

    )
}


)

//get all Role

const getAllRole = asyncHandler(async (req, res) => {
    const allRole = await Role.find({})
    if (allRole.length === 0) {
        throw new ApiError("No Role Found!")
    }

    return res.
        status(200)
        .json(new ApiResponse(
            "Permissions fetched successfully",
            200,
            allRole
        ))
})

// delete Role

const deleteRole = asyncHandler(async (req, res) => {
    const { _id } = req.params
    if (!_id) {
        throw new ApiError(
            "Role is not select",
            400,
        )
    }

    const deleteRole = await Role.findByIdAndDelete(_id)
    if (!deleteRole) {
        throw new ApiError(
            "Role not Found",
            404
        )
    }
    return res.status(200).json(
        new ApiResponse(
            "Role Deleted Successfully"
            , 200,
            deleteRole,
        )
    )
})

export {
    createRole,
    getAllRole,
    deleteRole
}