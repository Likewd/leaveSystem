import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
// const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;


// util to create a access token for user
const generateAccessToken = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        const accessToken = user.generateAccessToken();
        // user.refreshToken = refreshToken
        user.accessToken = accessToken;
        user.lastLogin = new Date(); // New field added to track the last login time
        await user.save({ validateBeforeSave: false });
        return accessToken;
    } catch (error) {
        return next(new ApiError("Something went wrong while generating refresh and access token", 500));
    }
}

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
    const requiredFields = [
        'name', 'email', 'password', 'employNumber', 'gender',
        'phoneNumber', 'passportNumber', 'designation', 'roles',
        'department'
    ];
    console.log(req.body['name']);
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return next(new ApiError(
                `Field ${field} is required and cannot be empty!`,
                400
            ));
        }
    }

    let profileImage = req?.file?.path;
    if (!profileImage) {
        return next(new ApiError(
            `profileImage is required and cannot be empty!`,
            400
        ));
    }

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
        profileImage
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

    const accessToken = await generateAccessToken(user._id);

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
        sameSite: 'Strict'
    };

    // const userLoggedIn = await User.findOne({ employNumber }).select('+password');
    // const userLoggedIn = await User.findOne({ employNumber })
    //     .select('+password') // Ensure password is still selected
    //     .populate('roles')   // Populate roles collection
    //     .populate('department'); // Populate department collection


    // Fetch the user's full details, populate the roles, permissions inside roles, and department fields
    const userLoggedIn = await User.findOne({ employNumber })
        .select('+password') // Ensure password is still selected
        .populate({
            path: 'roles',
            populate: {
                path: 'permissions'  // Nested population of permissions inside roles
            }
        })
        .populate('department'); // Populate department collection

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse('Login successful', 200, {
                userLoggedIn,
                accessToken
            })
        );
});

export { createUser, loginUser };



