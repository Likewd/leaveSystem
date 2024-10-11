import { Role } from "../models/role.model.js";
import { ApiError } from "../utils/ApiError.js";

const authorizeRolesAndPermissions = (requiredPermission) => {
    return async (req, _, next) => {
        try {
            // Check if user is logged in and has roles assigned
            if (!req.user || !req.user.roles) {
                return next(new ApiError('Unauthorized access: No roles assigned to user!', 403));
            }

            // Find the user's role and populate permissions
            const userRole = await Role.findById(req.user.roles).populate('permissions');
            if (!userRole) {
                return next(new ApiError('User role not found!', 404));
            }

            // Check if the user's role contains the required permission
            const hasPermission = userRole.permissions.some(permission => permission.name === requiredPermission);
            if (!hasPermission) {
                return next(new ApiError('Permission denied: You do not have access to this resource!', 403));
            }

            // If permission is found, proceed to the next middleware
            next();

        } catch (error) {
            // Handle any unexpected errors that occur during authorization
            console.error('Error authorizing user:', error);
            
            // Pass the error to the global error handler
            return next(new ApiError('Internal server error during authorization!', 500));
        }
    };
};

export { authorizeRolesAndPermissions };
