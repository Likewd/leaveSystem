import { Department } from "../models/department.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"





const createDepartment = asyncHandler(async (req, res, next) => {
    const { name, hod } = req.body;
    // Validate department name
    if (!name) {
        return next(new ApiError('Department name is required.', 400));
    }
    // If HOD is provided, check if HOD exists
    if (hod) {
        const existingHod = await User.findById(hod);
        if (!existingHod) {
            return next(new ApiError('HOD user not found.', 404));
        }
    }
    // Check if department already exists
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
    const { newHodId } = req.body;
    const { departmentId } = req.params;

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

const updateDepartmentName = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const { NewName } = req.body;

    if (!_id || !NewName) {
        return next(new ApiError('Both departmentId and Name are required.', 400));
    }

    // Check if a department with the new name already exists
    const findName = await Department.findOne({ name: NewName });
    if (findName) {
        return next(new ApiError('Department with this name already exists.', 400));
    }

    // Update the department name
    const updatedDepartment = await Department.findByIdAndUpdate(
        _id,
        { name: NewName },
        { new: true }
    );

    if (!updatedDepartment) {
        return next(new ApiError('Department not found.', 404));
    }

    return res.status(200).json(new ApiResponse(
        "Department name updated successfully",
        200,
        updatedDepartment
    ));
});


// const updateDepartmentName = asyncHandler(async (req, res, next) => {
//     const { _id } = req.params;
//     const { NewName } = req.body;
//     if (!_id || !NewName) {
//         return next(new ApiError('Both departmentId and Name are required.', 400));
//     }

//     const findName = await Department.findOne({ NewName })
//     if (!findName) {
//         return next(new ApiError('Department with this name already exists.', 400));

//     }
//     const updatedDepartment = await Department.findByIdAndUpdate(_id,
//         { name: NewName },
//         { new: true }
//     )
//     if (!updatedDepartment) {
//         return next(new ApiError('Department not found.', 404));
//     }

//     return res.status(200).
//         json(new ApiResponse("Department name updated successfully", 200, updatedDepartment));


// })
const deleteDepartment = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    // Check if department ID is provided
    if (!_id) {
        throw new ApiError(
            "Department is not select",
            400,
        )
    }

    // Find department by ID
    const department = await Department.findOne({ _id })
    if (!department) {
        return next(new ApiError('Department not found.', 404));
    }

    await User.updateMany({ department: _id }, { $set: { department: null } });

    //Little confusion have before deleting the Department we have to assign new department who are associted with this department
    const deletedDepartment = await department.deleteOne();
    if (!deletedDepartment) {
        return next(new ApiError('Failed to delete department.', 500));
    }
    return res.status(200).json(
        new ApiResponse(
            "Department Deleted Successfully"
            , 200,
            deletedDepartment,
        )
    )

})
const allDepartment = asyncHandler(async (req, res, next) => {
    // Get all departments
    const allDepartments = await Department.find({})
    if (allDepartments.length === 0) {
        throw new ApiError("No Role Found!")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            "Department fetched successfully",
            200,
            allDepartments
        ))
})

//create function to get all department
export {
    createDepartment,
    deleteDepartment,
    updateDepartmentHOD,
    updateDepartmentName,
    allDepartment
}

