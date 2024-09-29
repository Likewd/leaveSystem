import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Token extraction helper function
const getTokenFromRequest = (req) => {
    return req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
};

const authUser = asyncHandler(async (req, _, next) => {
    const token = getTokenFromRequest(req);

    if (!token) {
        return next(new ApiError('Unauthorized access! Token is missing.', 401));
    }

    try {
        // Verify token and decode it
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch user by ID and exclude the password field
        const user = await User.findById(decodedToken?._id).select('-password');

        if (!user) {
            return next(new ApiError('Invalid access token! User not found.', 404));
        }

        // Attach user to req object for further access
        req.user = user;

        // Proceed to the next middleware
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError('Token has expired. Please log in again.', 401));
        } else if (error.name === 'JsonWebTokenError') {
            return next(new ApiError('Invalid token. Please log in again.', 401));
        } else {
            return next(new ApiError('Authentication failed!', 401));
        }
    }
});

export { authUser };
