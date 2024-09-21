import { Permission } from "../models/permission.model.js";
import { Role } from "../models/role.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



//Crete Role

const createRole = asyncHandler(async (req, res) => {
    const { name, permissionIds } = req?.body

    console.log(name, permissionIds);

    if (!name) {
        throw new ApiError(
            "Role name is required",
            400,
        )
    }
    const RoleExist = await Role.findOne({ name })
    // console.log(RoleExist.roleName);

    if (RoleExist) {
        throw new ApiError(
            "RoleExist Already exist",
            400,
        )
    }
    // const permissions = await Permission.find({ _id: { $in: permissionIds } });
    // console.log(permissions);

    // if (permissions.length !== permissionIds.length) {
    //     throw new ApiError(
    //         'Some permissions not found',
    //         400,
    //     )
    // }

    // const newRole = new Role({
    //     roleName,
    //     permissions: permissions.map(permission => permission._id)  // Store permission IDs
    // });

    // await newRole.save();

    try {
        const createRole = await Role.create({
            name,
            permissions: permissionIds
        })
        return res.status(201).json(
            new ApiResponse("Role Created Successfully", 201,
                createRole,
            )

        )
    } catch (error) {
        console.log(error);

    }


}


)

//get Update Permission in Role

const updatePermission = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const { permissionIds } = req.body
    console.log(permissionIds);

    const role = await Role.findById(_id)

    if (!role) {
        throw new ApiError("Role Not Found", 404)
    }

    role.permissions = [...new Set([...role.permissions, ...permissionIds])]

    await role.save()
    return res.
        status(200)
        .json(new ApiResponse(
            "Permissions Added successfully",
            200,
            role
        ))

})
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

const deletePermissionsInRole = asyncHandler(async (req, res) => {
    const { roleId, permissionId } = req.params;
    // const role = await Role.findById(_id)
    // if (!_id) {
    //     throw new ApiError(
    //         "Role is not select",
    //         400,
    //     )
    // }

    // Find the role by ID and remove the specific permission using $pull
    console.log(roleId, "|||||||||||||||||||" + permissionId);


    const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        { $pull: { permissions: permissionId } },  // Remove the specific permission from the array
        { new: true }  // Return the updated document
    );
    if (!updatedRole) {
        throw new ApiError(
            "Role not Found",
            404
        )
    }
    return res.status(200).json(
        new ApiResponse(
            "Permission removed successfully"
            , 200,
            updatedRole,
        )
    )
})

export {
    createRole,
    getAllRole,
    deleteRole,
    updatePermission,
    deletePermissionsInRole
}