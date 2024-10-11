import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { requiredFields } from "../utils/RequiredFiled.js";
import { Department } from "../models/department.model.js";
import cloudinary from "cloudinary";

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

    // const user = new User({
    //     name, email, password, role, employNumber, gender, phoneNumber, 
    //     passportNumber, designation, roles, department, profileImage
    // });

    // await user.save();

    return res.status(201).json(
        new ApiResponse("User created successfully", 201, user)
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
    const { employNumber, password } = req.body;

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
        .json(
            new ApiResponse('Login successful', 200, {
                userLoggedIn,
                accessToken
            })
        );
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
});

const updateUser = asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    let profileImagelocal = req?.file?.path;
    console.log("controller");
    console.log(req?.user?.profileImage);

    // Start the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        if (profileImagelocal) {
            const oldImageDelete = req.user.profileImage;
            const publicId = oldImageDelete.split('/').pop().split('.')[0];
            console.log(publicId);

            await cloudinary.v2.uploader.destroy(publicId, (error, result) => {
                if (error) {
                    return next(new ApiError('Failed to delete old profile image from Cloudinary', 500));
                }
                console.log('Old image deleted:', result);
            });

            // Upload the new image to Cloudinary
            const profileImage = await uploadOnCloudinary(profileImagelocal);
            console.log(profileImage);

            // Set the new image URL in the user's profileImage field
            req.body.profileImage = profileImage.url;


            console.log(req.body);


        }









        // Use findOneAndUpdate to directly update the user
        const updatedUser = await User.findOneAndUpdate(
            { _id },
            { $set: req.body },  // Only update allowed fields
            { new: true, runValidators: true, session }  // Return updated user and ensure validators run
        );

        if (!updatedUser) {
            await session.abortTransaction();  // Abort transaction if user not found
            return next(new ApiError('User not found!', 404));
        }

        // Commit transaction
        await session.commitTransaction();

        // Respond with success
        return res.status(200).json(new ApiResponse('User updated successfully', 200, updatedUser));

    } catch (error) {
        await session.abortTransaction();  // Rollback on error
        return next(new ApiError('Failed to update user', 500));
    } finally {
        session.endSession();  // Always end session
    }
});

const getAllUser = asyncHandler(async (req, res, next) => {
    const user = await User.find().populate('roles').populate('department');
    if (!user) {
        return next(new ApiError('No user found!', 404));
    }
    return res.status(200).json(new ApiResponse('All user', user, 200));
});

export { createUser, loginUser, updatePassword, deleteUser, updateUser, getAllUser };



