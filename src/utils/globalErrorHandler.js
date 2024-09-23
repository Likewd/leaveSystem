//Global Error Handler

import { ApiError } from "./ApiError.js";

const castErrorHandler = (err) => {
    console.log("wroking");

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
const handleExpiredJWT = (err) => {
    return new ApiError("JWT has Expired. please Login again!", 401);
}
const handleJWTError = (err) => {
    return new ApiError("Invalid Token. please Try agian later!", 401);
}
const prodError = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        res.status(500).json({
            status: "error",
            message: "something went very wrong!",
        });
    }
};


const devError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        devError(err, res);
    } else if (process.env.NODE_ENV === "production") {
        console.log("production mode");

        if (err.name === "CastError") err = castErrorHandler(err);
        if (err.code === 11000) err = duplicateErrorHandler(err);
        if (err.name === "ValidationError") err = validationErrorHandler(err);
        if (err.name === "TokenExpiredError") err = handleExpiredJWT(err);
        if (err.name === "JsonWebTokenError") err = handleJWTError(err);
        prodError(err, res);
    }
};
export default globalErrorHandler;