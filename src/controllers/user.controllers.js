import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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


export { createUser }



