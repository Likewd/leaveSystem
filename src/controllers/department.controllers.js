import { Department } from "../models/department.model";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"





const createDepartment = asyncHandler(async (req, res) => {
    const { name, hod } = req.body;
    if (!name) {
        return next(new ApiError('Department name is required.', 400));
    }

    if (hod) {
        const existingHod = await User.findById(hod);
        if (!existingHod) {
            return next(new ApiError('HOD user not found.', 404));
        }
    }

    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {

        const error = new ApiError(
            "Department with this name already exists.",
            400
        )
        return next(error)
    }

    // Create new department
    const newDepartment = await Department.create({ name, hod: hod || null });
    if (!newDepartment) {

        const error = new ApiError(
            "Failed to create department",
            500
        )
        return next(error)
    }


    return res.status(201).json(
        new ApiResponse("Department created successfully", 201,
            newDepartment,
        )

    )
});

const updateDepartmentHOD = asyncHandler(async (req, res, next) => {
    const { departmentId, newHodId } = req.body;

    // Validate departmentId and newHodId
    if (!departmentId || !newHodId) {
        return next(new ApiError('Both departmentId and newHodId are required.', 400));
    }

    // Check if the new HOD is already HOD of another department
    const hodInAnotherDepartment = await Department.findOne({ hod: newHodId });
    if (hodInAnotherDepartment && hodInAnotherDepartment._id.toString() !== departmentId) {
        return next(new ApiError('This user is already the HOD of another department.', 400));
    }


    if (newHodId) {
        const existingHod = await User.findById(newHodId);
        if (!existingHod) {
            return next(new ApiError('New HOD user not found.', 404));
        }
    }
    //Check if the User already HOD of Other department


    // Find the department by ID
    const department = await Department.findByIdAndUpdate(
        departmentId,
        { $set: { hod: newHodId } },  // Update the HOD field with the new HOD ID
        { new: true }  // Return the updated department document
    )
    // const department = await Department.findById(departmentId);
    if (!department) {
        return next(new ApiError('Department not found.', 404));
    }

    // Update the HOD
    // department.hod = newHodId || null;
    // await department.save();

    return res.status(200).json(
        new ApiResponse("HOD updated successfully", 200, department)
    );
});

const deleteDepartment = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    if (!_id) {
        throw new ApiError(
            "Department is not select",
            400,
        )
    }
    const department = await Department.findOne({ _id })
    if (!department) {
        return next(new ApiError('Department not found.', 404));
    }

    await User.updateMany({ department: _id }, { $set: { department: null } });

    //Little confusion have before deleting the Department we have to assign new department who are associted with this department
    const deletedepartment = await department.remove();
    return res.status(200).json(
        new ApiResponse(
            "Department Deleted Successfully"
            , 200,
            deletedepartment,
        )
    )

})




export {
    createDepartment,
    deleteDepartment,
    updateDepartmentHOD,
   

}

