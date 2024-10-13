import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { requiredFields } from "../utils/RequiredFiled.js";
import { Department } from "../models/department.model.js";

// const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
// const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;


// util to create a access token for user\

const generateAccessTokens = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        const accessToken = user.generateAccessToken();
        // user.refreshToken = refreshToken
        user.accessToken = accessToken;
        user.lastLogin = new Date(); // New field added to track the last login time
        user.markModified('lastLogin'); // Ensure Mongoose tracks changes to this field
        await user.save({ validateBeforeSave: false });
        return accessToken;
    } catch (error) {
        return next(new ApiError("Something went wrong while generating refresh and access token", 500));
    }
}

const validateRequiredFields = async (req, next) => {
    console.log(req.body['name']);
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return next(new ApiError(
                `Field ${field} is required and cannot be empty!`,
                400
            ));
        }
    }
    return Promise.resolve();
};



const createUser = asyncHandler(async (req, res, next) => {
    const {
        name,
        email,
        password,
        employNumber,
        gender,
        phoneNumber,
        passportNumber,
        designation,
        department,
        roles,
    } = req.body;

    await validateRequiredFields(req, next);
    let profileImagelocal = req?.file?.path;
    if (!profileImagelocal) {
        return next(new ApiError(
            `profileImage is required and cannot be empty!`,
            400
        ));
    }
    const profileImage = await uploadOnCloudinary(profileImagelocal);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new ApiError('Invalid email format.', 400));
    }

    const exitUser = await User.findOne({ employNumber });
    if (exitUser) {
        return next(new ApiError(
            `User with employNumber ${employNumber} already exist!`,
            400
        ));
    }
    const user = await User.create({
        name,
        email,
        password,
        employNumber,
        gender,
        phoneNumber,
        passportNumber,
        designation,
        department,
        roles,
        profileImage: profileImage.url || null
    });

    if (!user) {
        return next(new ApiError(
            `User with employNumber ${employNumber} cannot be created!`,
            400
        ));
    }


    return res.status(201).json(
        new ApiResponse("User created successfully", 201, user)
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
    const { employNumber, password } = req.body;
    console.log(employNumber, password);
    

    if (!employNumber || !password) {
        return next(new ApiError(
            'Please provide employNumber and password!',
            400
        ));
    }

    const user = await User.findOne({ employNumber }).select('+password');
    if (!user || !(await user.isPasswordCorrect(password))) {
        return next(new ApiError(
            'Invalid employNumber or password!',
            401
        ));
    }

    const accessToken = await generateAccessTokens(user._id);

    if (!accessToken) {
        return next(new ApiError(
            'Failed to generate access token!',
            500
        ));
    }

    user.accessToken = accessToken; // Add accessToken to user schema

    const options = {
        httpOnly: true,
        secure: true,
        // sameSite: 'Strict'
    };

    // Fetch the user's full details, populate the roles, permissions inside roles, and department fields
    const userLoggedIn = await User.findOne({ employNumber })
        .select('+\-password') // Ensure password is still selected
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions',
                select: '-_id name '  // Nested population of permissions inside roles
            }
        })
        .populate({
            path: 'department',
            select: '-_id name' // Nested population of department inside user
        }); // Populate department collection
    // console.log(userLoggedIn.roles[0].permissions[0].name);

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .json({
        message: 'Login successful',
        status: 200,
        userLoggedIn,   // directly include user data
        accessToken     // directly include access token
    });

});

const updatePassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword || newPassword)) {
        return next(new ApiError(
            'Please provide oldPassword, and newPassword!',
            400
        ));
    }

    const user = await User.findOne(req.user?._id);
    if (!user || !(await user.isPasswordCorrect(oldPassword))) {
        return next(new ApiError(
            'Invalid old password!',
            401
        ));
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse('Password updated successfully', {}, 200)
    );
});

const deleteUser = asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession(); // Start a new session
    session.startTransaction(); // Start transaction

    try {
        const { employNumber } = req.params;

        if (!employNumber) {
            return next(new ApiError('Please provide employNumber!', 400));
        }

        // If you have permission middleware, you don't need this role check
        // Authorization check (optional if handled via middleware)
        // if (!req.user || !['HR', 'Admin'].includes(req.user.role)) {
        //     return next(new ApiError('Unauthorized access! Only HR/Admin can delete users.', 403));
        // }

        // Find the user to delete
        const user = await User.findOne({ employNumber }).session(session);
        if (!user) {
            return next(new ApiError('User not found!', 404));
        }

        // Check if the user is HOD of any department
        const department = await Department.findOne({ headOfDepartment: user._id }).session(session);
        if (department) {
            return next(new ApiError('Cannot delete user as they are assigned as HOD!', 400));
        }

        // Soft delete user by setting isActive to false
        await User.findOneAndDelete({ employNumber }).session(session);


        // Log the deletion action for auditing
        // await AuditLog.create([{
        //     action: 'DELETE_USER',
        //     adminUser: req.user._id,
        //     targetUser: user._id,
        //     timestamp: new Date(),
        // }], { session });

        // Commit transaction if all operations succeed
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(new ApiResponse('User deleted successfully', {}, 200));

    } catch (error) {
        // Rollback transaction if any step fails
        await session.abortTransaction();
        session.endSession();
        return next(new ApiError('Failed to delete user. Transaction aborted!', 500));
    }
})

const updateUser = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    let profileImageLocalPath = req?.file?.path; // Path for uploaded image (if exists)

    const session = await mongoose.startSession(); // Start the session
    session.startTransaction(); // Begin the transaction

    // If there's a new profile image, delete the old one from Cloudinary and update the new one
    if (profileImageLocalPath) {
        const oldImageUrl = req.user.profileImage;  // Existing profile image URL
        const publicId = oldImageUrl.split('/').pop().split('.')[0]; // Extract Cloudinary public ID

        // Delete old image from Cloudinary
        await cloudinary.v2.uploader.destroy(publicId);

        // Upload the new image to Cloudinary and update `req.body` with new image URL
        const uploadedImage = await uploadOnCloudinary(profileImageLocalPath);
        req.body.profileImage = uploadedImage.url;
    }

    // Update user in the database
    const updatedUser = await User.findOneAndUpdate(
        { _id },
        { $set: req.body },  // Only update allowed fields from request body
        { new: true, runValidators: true, session } // Return updated user and run validators
    );

    // If user not found, abort the transaction and throw an error
    if (!updatedUser) {
        await session.abortTransaction();
        throw new ApiError('User not found!', 404);
    }

    // Commit transaction if successful
    await session.commitTransaction();

    // Return the updated user in the response
    return res.status(200).json(new ApiResponse('User updated successfully', 200, updatedUser));

})



const getAllUser = asyncHandler(async (req, res, next) => {
    const user = await User.find().populate('roles').populate('department');
    if (!user) {
        return next(new ApiError('No user found!', 404));
    }
    return res.status(200).json(new ApiResponse('All user', user, 200));
});

export { createUser, loginUser, updatePassword, deleteUser, updateUser, getAllUser };



