//Global Error Handler

import { ApiError } from "./ApiError.js";

const castErrorHandler = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new ApiError(message, 400);
};

const duplicateErrorHandler = (err) => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `field value:${value} aleady exist. please use another`;
    return new ApiError(message, 400);
};
const validationErrorHandler = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new ApiError(message, 400);
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        devError(err, res);
    } else if (process.env.NODE_ENV === "production") {
        if (err.name === "CastError") err = castErrorHandler(err);
        if (err.code === 11000) err = duplicateErrorHandler(err);
        if (err.name === "ValidationError") err = validationErrorHandler(err);
        prodError(err, res);
    }
};
export default globalErrorHandler;