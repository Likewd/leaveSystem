import { ApiError } from "../utils/ApiError.js";

const authorizeUpdate = (req, res, next) => {
    const hrFields = ['designation', 'department', 'isActive', 'profileImage']; // Fields HR can update
    const userFields = ['name', 'email', 'phoneNumber']; // Fields User can update

    // Check if the role is HR or if it's the user updating their own data
    const isHR = req.user.roles.some(role => role.name === 'hr');
    const isUserSelf = req.user._id.toString() === req.params._id;

    // Check if there is something to update (either from req.body or req.file)
    if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
        return next(new ApiError('There is nothing to update!', 400));
    }

    // Dynamically capture fields to be updated (includes file fieldname if file exists)
    const fieldsToUpdate = [
        ...Object.keys(req.body || {}),  // capture fields from body
        ...(req.file ? [req.file.fieldname] : []) // include file fieldname if file exists
    ];


    // Combine HR and User allowed fields
    const allowedFields = [...hrFields, ...userFields];

    // Check if any field in the request is not allowed
    const invalidFields = fieldsToUpdate.filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
        // If invalid fields are found, throw an error
        return next(new ApiError(`The following fields are not allowed to be updated: ${invalidFields.join(', ')}`, 403));
    }
    // If HR is updating, prevent them from updating user-specific fields
    if (isHR) {
        const invalidUserFields = fieldsToUpdate.filter(field => userFields.includes(field));
        if (invalidUserFields.length > 0) {
            return next(new ApiError(`HR cannot update the following user-specific fields: ${invalidUserFields.join(', ')}`, 403));
        }
    }
    // If the user is updating their own data, prevent them from updating HR-specific fields
    else if (isUserSelf) {
        const invalidHRFields = fieldsToUpdate.filter(field => hrFields.includes(field));
        if (invalidHRFields.length > 0) {
            return next(new ApiError(`You cannot update the following HR-specific fields: ${invalidHRFields.join(', ')}`, 403));
        }
    }
    // If neither HR nor the user themselves, deny access
    else {
        return next(new ApiError('Unauthorized to update this user!', 403));
    }

    // Proceed to next middleware if checks pass
    next();
};

export { authorizeUpdate };
